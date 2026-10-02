// 아트머그 부모 문서에서 실행합니다. iframe과 동일한 배포에 함께 게시됩니다.
(() => {
  const script = document.currentScript;
  if (!script?.src) return;
  const siteBase = new URL(".", script.src);
  const siteOrigin = siteBase.origin;
  // 편집기가 감싼 문단이 있어도 스크립트 앞의 같은 사이트 iframe을 찾습니다.
  const frame = Array.from(document.querySelectorAll('iframe')).reverse().find(candidate => {
    if (!(script.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING)) return false;
    try { const url = new URL(candidate.src); return url.origin === siteOrigin && url.pathname.startsWith(siteBase.pathname); } catch (_) { return false; }
  });
  const attached = Symbol.for('artmug.embed.bridge');
  if (!frame || frame[attached]) return;
  frame[attached] = true;
  const origin = new URL(frame.src).origin;
  const channel = 'artmug-embed-v1';
  // 자식 페이지가 아직 로드되지 않았어도 PC→모바일 이동의 표식을 이어갑니다.
  let boardEntry=false;
  try{const u=new URL(location.href),uid=u.searchParams.get('uid');if(uid&&/(^|\.)artmug\.kr$/.test(u.hostname)){const key='artmug-board:'+uid,old=JSON.parse(sessionStorage.getItem(key)||'null');sessionStorage.removeItem(key);if(u.searchParams.get('no_vcnt')==='1'){sessionStorage.setItem(key,JSON.stringify({at:Date.now()}));boardEntry=true;}else if(old&&Date.now()-old.at<=15000){sessionStorage.setItem(key,JSON.stringify(old));boardEntry=true;}}}catch{boardEntry=new URL(location.href).searchParams.get('no_vcnt')==='1';}

  let inquiryLoader;
  function loadInquiry(){
    if(window.HanxinInquiry)return Promise.resolve();
    if(!inquiryLoader)inquiryLoader=new Promise((resolve,reject)=>{
      const el=document.createElement('script');el.src=new URL('./inquiry-ui.js',script.src).href;
      el.onload=()=>window.HanxinInquiry?resolve():reject(new Error('문의 UI 로드 실패'));
      el.onerror=reject;document.head.append(el);
    }).catch(error=>{inquiryLoader=null;throw error;});
    return inquiryLoader;
  }
  let scheduled = false, overlay = null, oldOverflow = '', previousFocus = null;
  function post(type, data = {}) {
    frame.contentWindow?.postMessage({channel, type, ...data}, origin);
  }
  function report() {
    scheduled = false;
    const height = Math.max(320, Math.min(900, window.innerHeight - 24));
    frame.style.height = height + 'px';
    frame.style.minHeight = '0';
    const rect = frame.getBoundingClientRect();
    post('context',{url:location.href,boardEntry});
    post('viewport', {
      frameTop:rect.top,
      top: Math.max(0, -rect.top),
      visibleHeight: Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(0, rect.top))
    });
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(report); }
  }
  function closeOverlay() {
    if (!overlay) return;
    overlay.remove(); overlay = null;
    document.documentElement.style.overflow = oldOverflow;
    previousFocus?.focus?.({preventScroll:true});
    post('lightbox-closed');
  }
  function openOverlay(src, alt) {
    let url;
    try { url = new URL(src); if (url.protocol !== 'https:') return; } catch (_) { return; }
    closeOverlay();
    previousFocus = document.activeElement;
    oldOverflow = document.documentElement.style.overflow;
    overlay = document.createElement('div');
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label', '포트폴리오 이미지 확대');
    overlay.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483647!important;background:rgba(0,0,0,.94)!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:24px!important;box-sizing:border-box!important;';
    const image = document.createElement('img');
    image.src = url.href; image.alt = String(alt || '포트폴리오');
    image.style.cssText = 'display:block!important;max-width:94vw!important;max-height:90dvh!important;width:auto!important;height:auto!important;object-fit:contain!important;';
    const close = document.createElement('button');
    close.type = 'button'; close.textContent = '✕'; close.setAttribute('aria-label','이미지 닫기');
    close.style.cssText = 'position:absolute!important;top:16px!important;right:20px!important;width:44px!important;height:44px!important;border:0!important;border-radius:50%!important;background:#7c3aed!important;color:white!important;font:24px sans-serif!important;cursor:pointer!important;';
    close.onclick = closeOverlay;
    overlay.onclick = event => { if (event.target === overlay) closeOverlay(); };
    overlay.addEventListener('keydown',event=>{
      if(event.key === 'Tab') {event.preventDefault();close.focus();}
    });
    
    let zoom=1;
    const zoomHint=document.createElement('p');zoomHint.textContent='마우스 스크롤로 이미지 크기를 조절할 수 있습니다';
    zoomHint.style.cssText='position:absolute;top:16px;left:50%;transform:translateX(-50%);color:white;font:13px sans-serif;text-align:center;z-index:3;pointer-events:none';
    if(matchMedia('(hover:hover) and (pointer:fine)').matches)overlay.append(zoomHint);
    overlay.addEventListener('wheel',event=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;event.preventDefault();zoom=Math.max(.5,Math.min(4,zoom*Math.exp(-event.deltaY*.0015)));image.style.transform='scale('+zoom+')';},{passive:false});
overlay.append(image,close); document.body.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';
    close.focus({preventScroll:true});
  }
  window.addEventListener('message',event=>{
    if(event.source !== frame.contentWindow || event.origin !== origin || event.data?.channel !== channel) return;
    if(event.data.type === 'ready') schedule();
    if(event.data.type === 'video-open' && /^[\w-]{11}$/.test(event.data.id || '')){
      const play=()=>window.openVideoDialog(event.data.id);
      if(window.openVideoDialog)play();else{const el=document.createElement('script');el.src=new URL('./video-dialog.js',script.src).href;el.onload=play;document.head.append(el);}
    }
    if(event.data.type === 'lightbox-open') openOverlay(event.data.src,event.data.alt);
    if(event.data.type === 'lightbox-close') closeOverlay();
    if(event.data.type === 'inquiry-open' && typeof event.data.text==='string' && event.data.text.length<=50000){
      const data=event.data;
      loadInquiry().then(()=>{post('inquiry-accepted');window.HanxinInquiry.prompt(data.text,data.copied===true,()=>window.HanxinInquiry.openOnArtmug(data.text));}).catch(()=>{});
    }
    if(event.data.type === 'align') {
      const rect = frame.getBoundingClientRect();
      if(rect.top < 0 || rect.top > window.innerHeight / 2) {
        window.scrollTo({top:window.scrollY + rect.top - 8,behavior:'smooth'});
      }
    }
  });
  document.addEventListener('keydown',event=>{if(event.key === 'Escape')closeOverlay();});
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  frame.addEventListener('load',schedule);
  new ResizeObserver(schedule).observe(frame);
  frame.scrolling = 'auto';
  schedule();
})();
