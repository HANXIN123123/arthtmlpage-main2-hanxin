// All credentials here are public Firebase web configuration. No server key is used.
window.hanxinAnalytics = (async () => {
  if (typeof location !== 'undefined' && (location.protocol !== 'https:' || new URLSearchParams(location.search).has('artmug-verify'))) return {send:async()=>({})};
  const [appSDK, authSDK, dbSDK] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js')
  ]);
  const app = appSDK.getApps().find(a => a.name === 'hanxin-analytics') || appSDK.initializeApp(firebaseConfig, 'hanxin-analytics');
  const auth = authSDK.getAuth(app), db = dbSDK.getDatabase(app);
  await auth.authStateReady();
  if (!auth.currentUser) await authSDK.signInAnonymously(auth);
  const uid = auth.currentUser.uid, ref = path => dbSDK.ref(db, path || undefined), DAY = 86400000, TTL = 30 * DAY;
  let offset = 0;
  dbSDK.onValue(ref('.info/serverTimeOffset'), s => offset = Number(s.val()) || 0);
  const now = () => Date.now() + offset;
  const root = 'analytics';
  const markerKey = 'hanxin-board:' + firebaseConfig.projectId;
  let source = 'unknown', initial = null;
  const get = async path => (await dbSDK.get(ref(path))).val();
  async function cleanExpired(cutoff) {
    // Only expired index entries can be read by guests; detailed records stay private.
    for (;;) {
      const q = dbSDK.query(ref(root + '/expiry'), dbSDK.orderByChild('expiresAt'), dbSDK.endAt(cutoff), dbSDK.limitToFirst(100));
      const rows = (await dbSDK.get(q)).val() || {};
      if (!Object.keys(rows).length) break;
      let deleted = 0;
      for (const [key, row] of Object.entries(rows)) {
        const paths = {[root + '/expiry/' + key]: null};
        paths[root + '/' + (row.kind === 'visitor' ? 'visitors/' + row.uid : 'sessions/' + key)] = null;
        try { await dbSDK.update(ref(''), paths); deleted++; }
        catch (error) { if (error.code !== 'PERMISSION_DENIED') throw error; } // A concurrent visit may have renewed the visitor.
      }
      if (!deleted || Object.keys(rows).length < 100) break;
    }
  }
  function entry(body) {
    const time = now();
    let previous;
    try { previous = JSON.parse(sessionStorage.getItem(markerKey) || 'null'); } catch {}
    if (body.board || (previous?.board && time - previous.at <= 15000)) {
      source = 'board';
      try { sessionStorage.setItem(markerKey, JSON.stringify({board:true,at:body.board?time:previous.at})); } catch {}
    } else {
      source = body.sourceKnown ? 'direct' : 'unknown';
      try { sessionStorage.removeItem(markerKey); } catch {}
    }
    return {ticket:true};
  }
  async function start(body) {
    const path = root + '/sessions/' + body.id;
    const existing = await get(path);
    if (existing) { initial = existing; return {}; }
    const time = now();
    const visitor = await dbSDK.runTransaction(ref(root + '/visitors/' + uid), old => {
      if (!old || old.expiresAt <= time) return {firstSession:body.id,firstSeen:time,lastSeen:time,expiresAt:time+TTL};
      return {...old,lastSeen:time,expiresAt:time+TTL};
    }, {applyLocally:false});
    const value = visitor.snapshot.val();
    initial = {owner:uid,browserId:uid,startedAt:time-Math.min(120000,Math.max(0,body.arrivalAgeMs||0)),recordedAt:time,expiresAt:time+TTL,
      device:body.device,source,newVisitor:value.firstSession===body.id,seconds:0,loadMs:Math.min(120000,Math.max(0,body.loadMs||0)),copied:false,maxScrollDepth:0,scrollMeasured:false};
    const day = new Date(time).toISOString().slice(0,10);
    const changes = {
      [path]:initial,
      [root+'/expiry/'+body.id]:{uid,kind:'session',expiresAt:initial.expiresAt},
      [root+'/expiry/v_'+uid]:{uid,kind:'visitor',expiresAt:value.expiresAt},
      [root+'/counters/'+day+'/pageViews']:dbSDK.increment(1)
    };
    if (initial.newVisitor) changes[root+'/counters/'+day+'/visitors'] = dbSDK.increment(1);
    await dbSDK.update(ref(''), changes);
    cleanExpired(value.lastSeen-1000).catch(error => console.warn('만료된 분석 기록 정리 실패:', error.code || error.message));
    return {};
  }
  async function update(body) {
    if (!initial) throw Error('VISIT_NOT_STARTED');
    const base = root + '/sessions/' + body.id + '/';
    const values = {
      [base+'seconds']:Math.min(Math.max(0,Math.floor(body.activeSeconds||0)),Math.ceil((now()-initial.startedAt)/1000)),
      [base+'copied']:!!body.copied,
      [base+'maxScrollDepth']:Math.min(100,Math.max(0,Math.round(body.maxScrollDepth||0))),
      [base+'scrollMeasured']:!!body.scrollMeasured
    };
    for (const section of body.sections || []) if (['hero','calendar','notice','about','portfolio','request'].includes(section)) values[base+'sections/'+section]=true;
    for (const [field,rows] of [['portfolio',body.portfolio],['portfolioItems',body.portfolioItems]]) for (const row of rows || []) {
      if (!/^[a-f0-9]{16}$/.test(row.key)) continue;
      values[base+field+'/'+row.key]={kind:row.kind,title:String(row.title||'').slice(0,100),count:field==='portfolioItems'?1:Math.min(10000,Math.max(1,row.count||1))};
    }
    // REST keepalive also delivers the final update when an iframe navigates away.
    const token = await auth.currentUser.getIdToken();
    const relative = Object.fromEntries(Object.entries(values).map(([key,value])=>[key.slice(base.length),value]));
    const response = await fetch(firebaseConfig.databaseURL.replace(/\/$/,'')+'/'+root+'/sessions/'+body.id+'.json?auth='+encodeURIComponent(token), {
      method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(relative),keepalive:true
    });
    if (!response.ok) throw Error('ANALYTICS_WRITE_'+response.status);
    return {};
  }
  return {send:body=>body.type==='entry'?entry(body):body.type==='start'?start(body):update(body)};
})();
