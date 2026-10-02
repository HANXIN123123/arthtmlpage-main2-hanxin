(() => {
  const embedded = window.parent !== window;
  const channel = 'artmug-embed-v1';
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImg');
  const close = document.getElementById('lightboxClose');

    let zoom=1;
    const zoomHint=document.createElement('p');zoomHint.textContent='마우스 스크롤로 이미지 크기를 조절할 수 있습니다';
    zoomHint.style.cssText='position:absolute;top:16px;left:50%;transform:translateX(-50%);color:white;font:13px sans-serif;text-align:center;z-index:3;pointer-events:none';
    if(matchMedia('(hover:hover) and (pointer:fine)').matches)lightbox.append(zoomHint);
    lightbox.addEventListener('wheel',event=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;event.preventDefault();zoom=Math.max(.5,Math.min(4,zoom*Math.exp(-event.deltaY*.0015)));image.style.transform='scale('+zoom+')';},{passive:false});

  let parentOrigin = null, bridge = false, navOffset = 0;
  let inquiryTimer = null;
  try { parentOrigin = new URL(document.referrer).origin; } catch (_) {}
  function post(type, data = {}) {
    if (embedded && parentOrigin) window.parent.postMessage({channel,type,...data},parentOrigin);
  }
  window.addEventListener('message',event=>{
    if(event.source !== window.parent || !parentOrigin || event.origin !== parentOrigin || event.data?.channel !== channel) return;
    if(event.data.type === 'context'){window.artmugContext=event.data;window.dispatchEvent(new CustomEvent('artmug-context'));}
    if(event.data.type === 'viewport' && Number.isFinite(event.data.top)) {
      window.artmugViewport=event.data;
      window.dispatchEvent(new Event('artmug-viewport'));
      bridge = true;
      navOffset = Math.max(0, Math.min(event.data.top, window.innerHeight - 80));
      document.documentElement.style.setProperty('--embed-nav-offset',navOffset + 'px');
    }
    if(event.data.type === 'inquiry-accepted'){clearTimeout(inquiryTimer);inquiryTimer=null;}
  });
  window.requestArtmugInquiry = function(text,copied){
    const fallback=()=>window.HanxinInquiry.prompt(text,copied,()=>{
      const url=new URL(mainPageConfig.artmugUrl);
      window.open(url.href,'_blank','noopener,noreferrer');
      window.HanxinInquiry.manual(text,'아트머그 페이지를 열었습니다. 작가에게 문의 버튼을 누르고 복사한 양식을 붙여넣어 주세요.');
    });
    if(embedded && bridge){
      clearTimeout(inquiryTimer);inquiryTimer=setTimeout(fallback,15000);
      post('inquiry-open',{text,copied});
    }else fallback();
  };
  window.openPortfolioVideo=function(id){if(!/^[\w-]{11}$/.test(id))return;if(embedded&&bridge){post('video-open',{id});return;}const dialog=window.openVideoDialog(id);if(embedded&&dialog?.requestFullscreen)dialog.requestFullscreen().catch(()=>{});};
  window.openPortfolioImage = function(src,alt='포트폴리오') {
    if(embedded && bridge) {post('lightbox-open',{src,alt});return;}
    zoom=1;image.style.transform='';image.src=src;image.alt=alt;
    lightbox.classList.add('open');
    close.focus({preventScroll:true});
    // 연결 스크립트가 없는 이전 iframe에서도 사용자 클릭으로 전체화면을 시도합니다.
    if(embedded && lightbox.requestFullscreen) lightbox.requestFullscreen().catch(()=>{
      // 브라우저가 전체화면을 허용하지 않으면 이미지 자체를 별도 탭에서 볼 수 있습니다.
      document.getElementById('lightboxOriginal').hidden=false;
    });
  };
  function closeImage() {
    lightbox.classList.remove('open');
    if(document.fullscreenElement === lightbox) document.exitFullscreen().catch(()=>{});
    post('lightbox-close');
  }
  close.addEventListener('click',closeImage);
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeImage();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeImage();});
  document.addEventListener('fullscreenchange',()=>{
    if(embedded && !document.fullscreenElement)lightbox.classList.remove('open');
  });
  document.getElementById('lightboxOriginal').addEventListener('click',event=>{
    event.currentTarget.href=image.src;
  });
  document.querySelectorAll('.topnav a[href^="#"], .nav-mobile-menu a[href^="#"]').forEach(link=>{
    link.addEventListener('click',event=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(!target)return;
      event.preventDefault();
      const header=target.querySelector('.main-acc-header');
      if(header && !header.classList.contains('open'))header.click();
      post('align');
      window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+window.scrollY-70),behavior:'smooth'});
    });
  });
  if(embedded) {
    document.documentElement.classList.add('is-embedded');
    post('ready');
  }
  // 콘솔의 페이지 연결 검증: API 키 등 공개 SDK 설정만 응답합니다.
  window.addEventListener('message',event=>{
    if(event.source !== window.parent || window.parent === window || event.data?.type !== 'ARTMUG_CONFIG_REQUEST' || typeof event.data.nonce !== 'string')return;
    if(event.origin === 'null')return;
    const config=typeof firebaseConfig === 'object' ? firebaseConfig : {};
    event.source.postMessage({type:'ARTMUG_CONFIG_RESPONSE',nonce:event.data.nonce,config:{
      apiKey:config.apiKey || '',projectId:config.projectId || '',appId:config.appId || '',databaseURL:config.databaseURL || ''
    },name:typeof mainPageConfig === 'object' ? mainPageConfig.name : document.title,url:location.origin+location.pathname},event.origin);
  });
})();
