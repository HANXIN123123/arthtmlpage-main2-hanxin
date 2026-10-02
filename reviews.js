// 전달받은 후기 원문. 작업기간은 표시하지 않으며 본문 길이순으로 정렬합니다.
const clientReviews = [
['항상 취향에 맞게 잘해주십니당 최고','2uz','2026.04.22','7번째 신청'],
['이번에도 마음에 듭니당','2uz','2026.04.14','6번째 신청'],
['이번에도 넘 마음에 듭니당','2uz','2026.03.19','3번째 신청'],
['이번에도 만족합니다 감사해요~!','2uz','2026.03.10','2번째 신청'],
['작업물 너무 마음에 들어요 최고십니다 🥺🩶','2uz','2026.02.23'],
['갑작스레 빠른 마감으로 필요했는데 최대한 빠르게 해주셔서 넘 감사드렸답니다! 잘 쓰고 있어요!','리티','2026.01.08'],
['예쁘게 잘 받았습니다!','익명','2025.12.15'],
['최고의 커미션!!!!','신청용','2025.12.10','2번째 신청'],
['최고의 커미션!','신청용','2025.12.08'],
['수정사항이 많았는데 세세히 잘 들어주셔서 너무 좋았어요!! 디자인 쪽은 커미션을 잘 맡기지 않아 서툴렀을텐데 친절히 진행해주셔서 감사해요~!','익명','2025.06.22'],
['너무 예뻐요! 맘에 듭니다!','루아','2025.06.13'],
['고생하셨습니다~','꺅','2025.04.17','3번째 신청'],
['작업도 빠르고 수정도 빠르게 잘해주셨어요~!','익명','2025.03.24'],
['실력이 뛰어나셔요. 이번도 감사드립니다.','꺅','2025.01.27','2번째 신청'],
['원하는 그대로 작업해주셨어요!!','담','2024.12.29'],
['제가 원하던 느낌으로 금방 작업해주셔서 맘에 들었어요!! 퀄리티가 너무 만족스럽습니다 ㅠㅠ','익명','2024.12.24'],
['2연 의뢰 드렸습니다. 아마추어라 어설프게 부탁드렸음에도 너무 완벽하게 작업물 만들어주셨어요. 진짜 종목 가리지 않으시고 열심히 해주십니다! b','백덤블링 두더지','2024.12.22','2번째 신청'],
['동호회 로고 작업 요청드렸는데, 너무 깔끔하게 잘 작업해주셨습니다. 작업속도도 굉장히 빠르신편입니다. 추천합니다!','백덤블링 두더지','2024.12.06'],
['원하던 느낌 그대로 나왔습니다! 감사합니다!!','타치','2024.10.09'],
['진짜 너무 예뿌네여…작업하시느라 고생하셨습니다.','꺅','2024.09.09'],
['예쁘게 해주십니당','익명','2024.08.26'],
['급하게 문의드렸는데 엄청 빨리 해주셨어요🥹🥹🥹!! 감사합니다ㅜ/ㅜ!','익명','2024.08.14'],
['상상 이상으로 고퀄리티한 작업물에 깜짝 놀랐습니다!! 한 세배는 완벽한듯?합니다 잘 사용하겠습니다!!!♡♡','이세계','2024.07.02'],
['컴션주님이 친절하구 빠르세요~:)','익명','2024.06.24'],
['우와!!!! 정말 멋집니다 믿고 신청할 만한 퀄리티... 굿굿','익명','2024.05.11'],
['예쁘게 잘 만들어주십니다!! 대만족 중이에요♥︎','익명','2024.03.26'],
['정말 좋았어요!! 마감도 잘 지켜주시고 수정도 두번이나 그냥 진행해주셔서ㅠㅠ 감사합니다!!','익명','2023.07.31'],
['코딩 관련으로 또 왔습니다... 짱입니다... 감사합니다...','닉','2023.07.16','2번째 신청'],
['코딩을 부탁드렸는데 제가 원하는 그대로 코딩을 해주셨습니다... 그것도 12시간이 안 되었는데 작업물이 도착했습니다ㅠ 친절한 설명과 빠른 피드백이 이루어지신 정말 최고이신 분입니다...... ㅠ.ㅜ♡♡♡♡ 정말 감사합니다 제가 꿈에 그리던 것을 손에 넣은 기분이 이런 것이라는 걸 느끼게 해주셔서 감사합니다♡♡♡','닉','2023.05.13'],
['천재를 찾았다... 7.0짜리 작업이었는데 너무 미치게 맘에 들어서 4.0 추가 결제 했습니다...... 그정도로 아깝지 않았어요 ;ㅁ;!!!!! 당신 최고.','아트머그 **오님','']
];
clientReviews.sort((a,b)=>Array.from(b[0]).length-Array.from(a[0]).length).forEach(([text,author,date,repeat])=>{
 const card=document.createElement('article');card.className='review-card';
 const title=document.createElement('div');title.className='review-card-top';title.textContent='고퀄/가성비 종합 디자인 및 모션작업';
 const body=document.createElement('p');body.className='review-card-text';body.textContent=text;
 const foot=document.createElement('div');foot.className='review-card-footer';
 const name=document.createElement('strong');name.textContent=author;
 if(repeat){const badge=document.createElement('span');badge.className='review-repeat';badge.textContent=repeat;name.append(badge);}
 const time=document.createElement('span');time.textContent=date || '작성일 미제공';
 foot.append(name,time);card.append(title,body,foot);document.getElementById('reviewGrid').append(card);
});
// 한 번에 데스크톱 2개, 모바일 1개. 화면 밖/포커스/호버 시 자동 넘김을 멈춥니다.
(() => {
 const grid=document.getElementById('reviewGrid'),cards=[...grid.children];let start=0,paused=false,visible=false;
 const controls=document.createElement('div');controls.className='review-controls';
 const previous=document.createElement('button'),next=document.createElement('button'),pause=document.createElement('button'),status=document.createElement('span');
 previous.textContent='이전 후기';next.textContent='다음 후기';pause.textContent='자동 넘김 정지';pause.setAttribute('aria-pressed','false');
 controls.append(previous,status,next,pause);grid.after(controls);
 const size=()=>matchMedia('(max-width:700px)').matches?1:2;
 function show(delta=0){start=(start+delta+cards.length)%cards.length;cards.forEach((c,i)=>c.hidden=!Array.from({length:size()},(_,n)=>(start+n)%cards.length).includes(i));status.textContent=(start+1)+' / '+cards.length;}
 previous.onclick=()=>show(-size());next.onclick=()=>show(size());pause.onclick=()=>{paused=!paused;pause.textContent=paused?'자동 넘김 재생':'자동 넘김 정지';pause.setAttribute('aria-pressed',String(paused));};
 new IntersectionObserver(es=>visible=es[0].isIntersecting,{threshold:.15}).observe(grid);
 setInterval(()=>{if(visible&&!paused&&!document.hidden&&!grid.matches(':hover')&&!grid.contains(document.activeElement)&&!controls.contains(document.activeElement)&&!matchMedia('(prefers-reduced-motion:reduce)').matches)show(size());},7000);
 window.addEventListener('resize',()=>show());show();
})();
