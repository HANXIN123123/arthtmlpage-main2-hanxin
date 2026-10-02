(() => {
 const modes={video:true,image:true};
 function enhance(type,categories,container){
  container.dataset.kind=type;
  container.querySelectorAll('.pf-type-section').forEach((section,index)=>{
   const category=categories[index];section.dataset.category=category.title;section.dataset.categoryKey=category.key||String(index);
   const toolbar=document.createElement('div');toolbar.className='portfolio-toolbar';
   const toggle=document.createElement('button');toggle.type='button';toggle.className='portfolio-mode';toolbar.append(toggle);section.prepend(toolbar);
   const grid=document.createElement('div');grid.className='portfolio-grid '+type;
   const items=type==='video'?category.videos:category.images;
   const label=(el,value,i)=>{el.dataset.portfolioIdentity=type+'|'+section.dataset.categoryKey+'|'+value;el.dataset.portfolioLabel=(type==='video'?'영상 ':'이미지 ')+(i+1);};
   section.querySelectorAll('.slider-slide,.img-slide').forEach((el,i)=>label(el,items[i],i));
   items.forEach((value,i)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',category.title+' '+(i+1)+(type==='video'?' 영상 재생':' 이미지 확대'));const img=document.createElement('img');img.loading='lazy';img.src=type==='video'?'https://img.youtube.com/vi/'+value+'/hqdefault.jpg':value;img.alt=category.title+' '+(i+1);button.append(img);if(type==='video'){const play=document.createElement('span');play.className='grid-play';play.textContent='▷';button.append(play);}button.onclick=()=>{if(type==='video')window.openPortfolioVideo(value);else window.openPortfolioImage(value,img.alt);section.dispatchEvent(new CustomEvent('portfolio-view',{bubbles:true,detail:{index:i,grid:true}}));};grid.append(button);});section.append(grid);
   [...grid.children].forEach((el,i)=>label(el,items[i],i));
   const sync=()=>{section.classList.toggle('grid-mode',modes[type]);grid.hidden=!modes[type];toggle.textContent=modes[type]?'슬라이드로 보기':'격자로 보기';toggle.setAttribute('aria-pressed',String(modes[type]));};
   toggle.onclick=()=>{modes[type]=!modes[type];container.querySelectorAll('iframe').forEach(f=>{f.src=f.src;});container.querySelectorAll('.pf-type-section').forEach(s=>s._modeSync?.());resizeAllSliders();resizeAllImgSliders();};section._modeSync=sync;sync();
  });
 }
 const videoBuilder=buildYoutubeSlider,imageBuilder=buildImageSlider;
 buildYoutubeSlider=function(c,el,tabs){videoBuilder(c,el,tabs);enhance('video',c,el);};
 buildImageSlider=function(c,el,tabs){imageBuilder(c,el,tabs);enhance('image',c,el);};
})();
