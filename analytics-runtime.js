(() => {
 if(location.protocol!=='https:'||new URLSearchParams(location.search).has('artmug-verify')||location.hostname.includes('--'))return;
 const geometry=window.HanxinAnalyticsGeometry,embedded=parent!==window;
 let visitor;try{visitor=sessionStorage.getItem('artmug-visitor');if(!visitor){visitor=crypto.randomUUID();sessionStorage.setItem('artmug-visitor',visitor);}}catch{visitor=crypto.randomUUID();}
 const id=crypto.randomUUID();let ticket,started=false,busy=false,nextEntry=0,entryAt=0,parentURL='',copied=false,activeSeconds=document.hidden?0:performance.now()/1000,lastTick=performance.now(),wasVisible=!document.hidden,maxScrollDepth=0,scrollMeasured=false,pendingFlush=false;
 const sections=new Set(),portfolio=new Map(),items=new Map(),hashes=new Map(),pendingItems=new Set();
 const status=(state,error)=>{window.artmugAnalyticsStatus={state,error:error||null};};
 const post=async body=>(await window.hanxinAnalytics).send({...body,id});
 const hash=value=>{if(!hashes.has(value))hashes.set(value,crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)).then(b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,16)));return hashes.get(value);};
 const getParent=()=>{try{const u=new URL(window.artmugContext?.url||document.referrer);return /(^|\.)artmug\.kr$/.test(u.hostname)?u:null;}catch{return null;}};
 const device=()=>{const u=getParent();if(u?.pathname.startsWith('/m/'))return 'mobile';if(u&&window.artmugContext)return 'pc';return navigator.userAgentData?.mobile||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)?'mobile':'pc';};
 async function entry(){if(started||busy||performance.now()<nextEntry)return;busy=true;try{const u=getParent();parentURL=u?.href||'';const r=await post({type:'entry',sourceKnown:!!window.artmugContext||u?.searchParams.has('uid')===true,board:window.artmugContext?.boardEntry===true||u?.searchParams.get('no_vcnt')==='1'});ticket=r.ticket;entryAt=performance.now();status('waiting');}catch(e){nextEntry=performance.now()+10000;status('error',e.message);}finally{busy=false;}}
 function clock(){const now=performance.now();if(wasVisible)activeSeconds+=Math.max(0,now-lastTick)/1000;lastTick=now;wasVisible=!document.hidden;}
 const elementVisible=(el,v)=>{if(!el.getClientRects().length||getComputedStyle(el).visibility==='hidden')return false;let clip={...v};for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const css=getComputedStyle(p);if(/hidden|clip|auto|scroll/.test(css.overflowY)){const r=p.getBoundingClientRect();clip.top=Math.max(clip.top,r.top);clip.bottom=Math.min(clip.bottom,r.bottom);}}return geometry.seen(el.getBoundingClientRect(),clip,innerWidth);};
 async function impression(el){const identity=el.dataset.portfolioIdentity;if(!identity||pendingItems.has(identity))return;pendingItems.add(identity);try{const key=await hash(identity);if(items.has(key))return;const section=el.closest('.pf-type-section'),container=el.closest('[data-kind]');if(!section||!container)return;items.set(key,{key,kind:container.dataset.kind,title:(section.dataset.category+' · '+el.dataset.portfolioLabel).slice(0,100)});}catch{pendingItems.delete(identity);}}
 // Native observation is a fallback for exposure, never for parent scroll percentages.
 const observed=new WeakSet(),fallbackSeen=new Set();
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&e.intersectionRatio>=.5)fallbackSeen.add(e.target);else fallbackSeen.delete(e.target);}},{threshold:[0,.5]}):null;
 function scan(){if(document.hidden)return;const v=geometry.viewport(innerHeight,window.artmugViewport,embedded);
  for(const el of document.querySelectorAll('[data-portfolio-identity],#hero,#section-calendar,#section-notice,#section-about,#section-portfolio,#section-request')){if(observer&&!observed.has(el)){observer.observe(el);observed.add(el);}if(el.matches('.slider-slide:not(.active),.img-slide:not(.active)'))continue;
   if(!(v?elementVisible(el,v):fallbackSeen.has(el)&&el.getClientRects().length>0))continue;
   if(el.dataset.portfolioIdentity)impression(el);else sections.add(el.id==='hero'?'hero':el.id.replace('section-',''));
  }
  for(const el of fallbackSeen)if(!el.isConnected){fallbackSeen.delete(el);observer?.unobserve(el);}
  const depth=geometry.depth(scrollY,document.documentElement.scrollHeight,v);if(depth!==null){scrollMeasured=true;maxScrollDepth=Math.max(maxScrollDepth,depth);}
 }
 async function flush(){if(!started)return;if(busy){pendingFlush=true;return;}busy=true;pendingFlush=false;clock();scan();try{const values=[...items.values()];for(let offset=0;offset<Math.max(1,values.length);offset+=40)await post({type:'update',ticket,activeSeconds,copied,sections:[...sections],portfolio:[...portfolio.values()].slice(0,100),portfolioItems:values.slice(offset,offset+40),maxScrollDepth,scrollMeasured});status('saved');}catch(e){status('error',e.message);console.warn('[Artmug analytics] 행동 기록 전송 실패:',e.message);}finally{busy=false;if(pendingFlush){pendingFlush=false;setTimeout(flush,250);}}}
 document.addEventListener('portfolio-view',async e=>{const section=e.target.closest('.pf-type-section'),container=e.target.closest('[data-kind]');if(!section||!container)return;const kind=container.dataset.kind,title=section.dataset.category;const key=await hash(kind+'|'+section.dataset.categoryKey);const row=portfolio.get(key)||{key,kind,title,count:0};row.count++;portfolio.set(key,row);scan();flush();});
 document.addEventListener('application-copied',()=>{copied=true;flush();});
 window.addEventListener('artmug-context',()=>{if(!started&&(getParent()?.href||'')!==parentURL)entry();});window.addEventListener('artmug-viewport',scan);window.addEventListener('scroll',scan,{passive:true});
 setInterval(async()=>{clock();scan();if(started)return;if(!ticket){await entry();return;}if(performance.now()-entryAt<5100||busy)return;busy=true;try{const nav=performance.getEntriesByType('navigation')[0];await post({type:'start',ticket,device:device(),arrivalAgeMs:performance.now(),loadMs:nav?.loadEventEnd||nav?.domContentLoadedEventEnd||0});started=true;status('started');}catch(e){status('error',e.message);}finally{busy=false;}if(started)flush();},1000);
 setInterval(flush,5000);document.addEventListener('visibilitychange',()=>{clock();if(document.hidden)flush();else scan();});window.addEventListener('pagehide',()=>{clock();flush();wasVisible=false;});window.addEventListener('pageshow',e=>{if(e.persisted){lastTick=performance.now();wasVisible=!document.hidden;}});entry();
})();
