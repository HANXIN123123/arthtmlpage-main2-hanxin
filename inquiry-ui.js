// 부모 아트머그 문서와 독립 메인페이지에서 함께 사용하는 문의 안내 UI.
(() => {
 if(window.HanxinInquiry)return;
 function modal(title,message){
   const previous=document.activeElement,dialog=document.createElement('dialog');
   dialog.setAttribute('aria-label',title);
   dialog.style.cssText='box-sizing:border-box;position:fixed;inset:0;margin:auto;border:1px solid #dfccec;border-radius:24px;padding:32px;max-width:440px;width:calc(100% - 36px);max-height:90vh;overflow:auto;color:#543768;box-shadow:0 0 0 100vmax #29153888,0 24px 90px #3a175940;background:#fffcff;text-align:center;font:14px/1.8 sans-serif;z-index:2147483647;';
   const star=document.createElement('div');star.textContent='✦';star.style.cssText='font-size:30px;color:#9c70c2';
   const heading=document.createElement('h3');heading.textContent=title;heading.style.cssText='font:bold 20px/1.5 sans-serif;margin:12px 0;color:#543768;word-break:keep-all';
   const note=document.createElement('p');note.textContent=message;note.style.cssText='font:13px/1.8 sans-serif;color:#947ba4;white-space:pre-line';
   const actions=document.createElement('div');actions.style.cssText='display:flex;justify-content:center;gap:10px;margin-top:24px;';
   dialog.append(star,heading,note,actions);document.body.append(dialog);
   const close=()=>{dialog.close();dialog.remove();previous?.focus?.({preventScroll:true});};
   dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
   dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
   dialog.showModal();
   return {dialog,note,actions,close};
 }
 function button(text,primary=false){const el=document.createElement('button');el.type='button';el.textContent=text;el.style.cssText=`border:0;border-radius:12px;padding:12px 25px;cursor:pointer;font:bold 13px sans-serif;background:${primary?'#8751b8':'#eee3f7'};color:${primary?'#fff':'#75508e'};`;return el;}
 function manual(text,message){const ui=modal('양식을 붙여넣어 주세요',message);const area=document.createElement('textarea');area.value=text;area.readOnly=true;area.style.cssText='box-sizing:border-box;width:100%;height:180px;margin:15px 0;padding:12px;border:1px solid #ddcbea;border-radius:12px;font:12px/1.6 sans-serif';ui.actions.before(area);const close=button('확인',true);close.onclick=ui.close;ui.actions.append(close);area.select();}
 function prompt(text,copied,onYes){
   const ui=modal('복사된 양식으로 바로 문의창을 여시겠습니까?',copied?'문의 내용만 작성하며 자동으로 보내지 않습니다.':'자동 복사가 차단되어 아래에 양식을 준비했습니다. 문의창에는 같은 내용을 작성합니다.');
   if(!copied){const area=document.createElement('textarea');area.value=text;area.readOnly=true;area.style.cssText='box-sizing:border-box;width:100%;height:130px;margin-top:16px;padding:10px;border:1px solid #ddcbea;font:12px/1.6 sans-serif';ui.actions.before(area);}
   const no=button('아니요'),yes=button('예',true);no.onclick=ui.close;yes.onclick=()=>{ui.close();onYes();};ui.actions.append(no,yes);yes.focus();
 }
 function acknowledge(doc){
   const notice=doc.getElementById('qna_alert');
   if(notice && notice.getClientRects().length){const ok=notice.querySelector('[onclick*="qnaAlert_ok"]');if(ok)ok.click();}
 }
 function fillEditor(doc,text){
   acknowledge(doc);
   const frame=doc.getElementById('content_iframe');
   const editor=frame?.contentDocument;
   if(!editor?.body || (editor.designMode.toLowerCase()!=='on' && !editor.body.isContentEditable))return false;
   // 데이터는 HTML로 해석하지 않고 텍스트로 넣습니다. 전송 함수는 호출하지 않습니다.
   editor.body.replaceChildren();
   text.split('\n').forEach(line=>{const p=editor.createElement('div');if(line)p.textContent=line;else p.append(editor.createElement('br'));editor.body.append(p);});
   const area=doc.querySelector('textarea[name="content"]');if(area){area.value=editor.body.innerHTML;area.dispatchEvent(new Event('input',{bubbles:true}));}
   const caution=doc.getElementById('explan_caution');if(caution)caution.click();
   editor.body.dispatchEvent(new Event('input',{bubbles:true}));editor.body.focus();return true;
 }
 function pollEditor(getDoc,text,onFailure,isActive=()=>true){
   let count=0;const timer=setInterval(()=>{
     if(!isActive()){clearInterval(timer);return;}
     try{const doc=getDoc();if(doc && fillEditor(doc,text)){clearInterval(timer);return;}}catch(_){}
     if(++count>=60){clearInterval(timer);onFailure();}
   },250);
 }
 async function openOnArtmug(text){
   // PC 페이지에서 모바일 리다이렉트가 완료될 시간을 확보한 뒤 현재 URL을 읽습니다.
   await new Promise(resolve=>setTimeout(resolve,Math.max(0,5000-performance.now())));
   const current=new URL(location.href),uid=current.searchParams.get('uid');
   if(!/(^|\.)artmug\.kr$/.test(current.hostname)||!/^\d+$/.test(uid||'')){manual(text,'현재 아트머그 작품번호를 확인하지 못했습니다. 작가에게 문의 버튼에서 양식을 붙여넣어 주세요.');return;}
   if(current.pathname.startsWith('/m/')){
     // 같은 출처의 문의 페이지를 열어 부모 스크립트가 유지된 상태에서 입력합니다.
     const ui=modal('작가에게 문의','내용을 확인한 후 직접 보내기 버튼을 눌러주세요.');
     ui.dialog.style.maxWidth='760px';ui.dialog.style.width='calc(100% - 16px)';ui.dialog.style.padding='15px';
     const frame=document.createElement('iframe');frame.title='아트머그 문의 작성';frame.style.cssText='width:100%;height:70dvh;border:0;background:#fff;margin-top:12px';frame.src=current.origin+'/m/index.php?channel=qna_write&number='+encodeURIComponent(uid);
     ui.actions.before(frame);const close=button('닫기');close.onclick=ui.close;ui.actions.append(close);
     pollEditor(()=>frame.contentDocument,text,()=>{ui.close();manual(text,'로그인 또는 페이지 상태 때문에 자동 입력을 완료하지 못했습니다. 로그인 후 복사한 양식을 붙여넣어 주세요.');},()=>ui.dialog.isConnected);
   }else{
     const nativeButton=document.querySelector('#goodsOrder .btn_qna');
     const handler=nativeButton?.getAttribute('onclick') || '';
     const number=handler.match(/[?&]number=(\d+)/)?.[1];
     if(!nativeButton || number!==uid){manual(text,'이 페이지의 문의 버튼을 확인하지 못했습니다. 작가에게 문의 버튼에서 양식을 붙여넣어 주세요.');return;}
     nativeButton.click();acknowledge(document);
     pollEditor(()=>{acknowledge(document);const frame=document.querySelector('iframe[src*="php/qna_write.php"]');if(!frame)return null;const url=new URL(frame.src);return url.origin===location.origin&&url.searchParams.get('number')===uid?frame.contentDocument:null;},text,()=>manual(text,'로그인 또는 페이지 상태 때문에 자동 입력을 완료하지 못했습니다. 로그인 후 복사한 양식을 붙여넣어 주세요.'),()=>!!document.querySelector('iframe[src*="php/qna_write.php"]'));
   }
 }
 window.HanxinInquiry={prompt,manual,openOnArtmug};
})();
