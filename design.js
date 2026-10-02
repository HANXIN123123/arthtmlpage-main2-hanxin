(() => {
 const icon=(path)=>`<svg class="line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
 const symbols=[icon('<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16M8 15h2m4 0h2m-8 3h2"/>'),icon('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 12h6m-6 4h6"/>'),icon('<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'),icon('<rect x="3" y="5" width="18" height="15" rx="3"/><path d="m3 16 5-5 5 6 3-3 5 5"/><circle cx="16" cy="10" r="1"/>'),icon('<path d="M4 21h16M6 17l1-5L17 2l5 5-10 10zM14 5l5 5"/>')];
 document.querySelectorAll('.main-acc-icon').forEach((el,i)=>el.innerHTML=symbols[i]);
 document.querySelectorAll('.notice-cat-icon').forEach((el,i)=>el.innerHTML=symbols[[1,4,3,0][i]]);
 document.querySelectorAll('.alert-icon').forEach(el=>el.innerHTML=icon('<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'));
 document.querySelectorAll('.mob-link').forEach(el=>el.textContent=el.textContent.replace(/^\S+\s/,''));
 for(const selector of ['.estimate-card h3','.form-card h3','#formCopyBtn']){const el=document.querySelector(selector);el.textContent=el.textContent.replace(/^\S+\s/,'');}
 document.querySelectorAll('.form-field textarea').forEach(el=>el.previousElementSibling.setAttribute('for',el.id));
 document.querySelectorAll('.main-acc-header,.notice-cat-header').forEach(header=>{
   header.setAttribute('role','button');header.tabIndex=0;
   const sync=()=>{const open=header.classList.contains('open');header.setAttribute('aria-expanded',String(open));header.querySelector('.main-acc-arrow,.notice-cat-arrow').textContent=open?'−':'+';};
   header.addEventListener('click',sync);header.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();header.click();}});sync();
 });
 const stars=document.querySelector('.rating-stars');
 stars.innerHTML=Array.from({length:5},(_,i)=>`<svg viewBox="0 0 24 24" style="--i:${i}" aria-hidden="true"><path d="m12 2 3.1 6.3 7 .9-5.1 5 1.2 7-6.2-3.3-6.2 3.3 1.2-7-5.1-5 7-.9z"/></svg>`).join('');
 for(const [id,url] of [['profileImage',designConfig.profileImage],['dividerImage',designConfig.dividerImage]]){
   const img=document.getElementById(id);img.addEventListener('error',()=>{img.hidden=true;img.parentElement.classList.add('asset-missing');});if(url)img.src=url;else img.dispatchEvent(new Event('error'));
 }
 const aura=document.createElement('div');aura.className='ambient-gradient';aura.setAttribute('aria-hidden','true');document.body.prepend(aura);
 if(designConfig.meteorsEnabled){const sky=document.createElement('div');sky.className='meteor-layer';sky.setAttribute('aria-hidden','true');sky.innerHTML=Array.from({length:6},(_,i)=>`<i class="meteor" style="--n:${i}"></i>`).join('');document.body.prepend(sky);}
 const steps=[
   '<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5Z"/><path d="M8 9h7m-7 4h4"/>',
   '<rect x="2" y="4" width="20" height="15" rx="3"/><path d="M2 9h20M6 14h4m6 0h2"/>',
   '<path d="m4 16 1-5L16 1l6 6-11 10-5 1ZM13 4l6 6M3 22h18"/>',
   '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>'
 ];
 document.querySelectorAll('.step-circle').forEach((el,i)=>{el.innerHTML=icon(steps[i]);el.closest('.notice-step').style.setProperty('--step',i);});
 document.querySelector('.notice-alert > div:last-child > div').classList.add('contact-highlight');
 const sheet=document.querySelector('.profile-sheet'),content=document.getElementById('profileContent'),reopen=document.querySelector('.profile-reopen');
 const minimize=sheet.querySelector('[data-window="minimize"]'),maximize=sheet.querySelector('[data-window="maximize"]');
 const expandContent=()=>{content.hidden=false;minimize.setAttribute('aria-expanded','true');minimize.setAttribute('aria-label','프로필 접기');};
 minimize.addEventListener('click',()=>{content.hidden=!content.hidden;minimize.setAttribute('aria-expanded',String(!content.hidden));minimize.setAttribute('aria-label',content.hidden?'프로필 펼치기':'프로필 접기');});
 maximize.addEventListener('click',()=>{expandContent();const expanded=sheet.classList.toggle('is-maximized');maximize.setAttribute('aria-pressed',String(expanded));maximize.setAttribute('aria-label',expanded?'프로필 원래 크기로':'프로필 크게 보기');});
 sheet.querySelector('[data-window="close"]').addEventListener('click',()=>{sheet.hidden=true;reopen.hidden=false;reopen.focus({preventScroll:true});});
 reopen.addEventListener('click',()=>{sheet.hidden=false;reopen.hidden=true;expandContent();minimize.focus({preventScroll:true});});
 const photo=document.querySelector('.profile-photo');photo.style.setProperty('--profile-url',`url(${JSON.stringify(designConfig.profileImage)})`);
 // 버튼의 목적지를 따라가며 iframe 이동과 접힌 섹션 열기는 네비게이션과 공유합니다.
 document.querySelector('.hero-cta').addEventListener('click',event=>{
   const href=event.currentTarget.getAttribute('href');
   const link=Array.from(document.querySelectorAll('.topnav a[href^="#"]')).find(item=>item.getAttribute('href')===href);
   if(link){event.preventDefault();link.click();}
 });
 document.querySelectorAll('.pf-type-tabs').forEach(tabs=>tabs.addEventListener('click',event=>{const button=event.target.closest('button');if(button)tabs.scrollTo({left:button.offsetLeft-tabs.offsetLeft-(tabs.clientWidth-button.offsetWidth)/2,behavior:'smooth'});}));
})();

