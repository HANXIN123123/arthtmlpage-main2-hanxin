window.openVideoDialog=function(id){
 if(!/^[\w-]{11}$/.test(id))return;
 const previous=document.activeElement,d=document.createElement('dialog');d.setAttribute('aria-label','유튜브 포트폴리오 재생');d.style.cssText='position:fixed;inset:0;margin:auto;width:100vw;max-width:none;height:100dvh;max-height:none;padding:24px;border:0;background:#000e;box-sizing:border-box;color:white;';
 const wrap=document.createElement('div');wrap.style.cssText='height:100%;display:flex;align-items:center;justify-content:center';
 const f=document.createElement('iframe');f.title='유튜브 포트폴리오';f.src='https://www.youtube-nocookie.com/embed/'+id+'?rel=0&autoplay=1';f.allow='autoplay;encrypted-media;picture-in-picture;fullscreen';f.allowFullscreen=true;f.style.cssText='width:min(94vw,1200px,150dvh);aspect-ratio:16/9;border:0;background:#000';
 const close=document.createElement('button');close.type='button';close.textContent='✕';close.setAttribute('aria-label','영상 닫기');close.style.cssText='position:absolute;right:16px;top:16px;width:44px;height:44px;border:0;border-radius:50%;background:#8751b8;color:#fff;font-size:22px;cursor:pointer';
 function done(){d.close();d.remove();previous?.focus?.({preventScroll:true});}
 close.onclick=done;d.addEventListener('cancel',e=>{e.preventDefault();done();});wrap.onclick=e=>{if(e.target===wrap)done();};wrap.append(f);d.append(wrap,close);document.body.append(d);d.showModal();close.focus();return d;
};
