export async function startPortfolioSync() {
  if (new URLSearchParams(location.search).has('artmug-verify')) return;
  const viewer = ArtmugPortfolioView.create(document.getElementById('acc-body-portfolio'));
  try {
    const [{ initializeApp }, { getDatabase, ref, onValue, runTransaction, serverTimestamp }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js')
    ]);
    const db = getDatabase(initializeApp(firebaseConfig));
    // 각각 구독하므로 main-page 쓰기 오류가 포트폴리오 읽기를 막지 않습니다.
    const unsubscribe = [
      onValue(ref(db, 'callendar-setting'), snapshot => {const values=snapshot.val()?.dates || {};Object.keys(specialDates).forEach(k=>delete specialDates[k]);for(const [key,type] of Object.entries(values)){if(['available','deadline','holiday'].includes(type))specialDates[key]={type,label:{available:'작업가능',deadline:'마감임박',holiday:'휴일'}[type]};}renderCalendar(calYear,calMonth);},error=>console.warn('일정 연결 실패',error.code)),
      ...viewer.subscribe(db, ref, onValue)
    ];
    window.addEventListener('pagehide', event => {
      if (!event.persisted) unsubscribe.forEach(stop => stop());
    }, { once: true });
    // 프리뷰/로컬 테스트가 실제 페이지 주소를 먼저 등록하지 않도록 HTTPS에서 등록합니다.
    if (location.protocol === 'https:' && !location.hostname.includes('--')) {
      await runTransaction(ref(db, 'main-page'), current => {
        if (current !== null) return; // 기존 이름/주소를 방문 시마다 덮어쓰지 않음
        return {
          schemaVersion: 1,
          name: mainPageConfig.name,
          title: document.title,
          url: location.origin + location.pathname,
          artmugUrl: mainPageConfig.artmugUrl,
          projectId: firebaseConfig.projectId,
          createdAt: serverTimestamp()
        };
      }, { applyLocally: false });
    }
  } catch (error) {
    console.error('Firebase 연결 또는 main-page 등록 실패:', error);
    viewer.showInitialError();
  }
}

startPortfolioSync();
