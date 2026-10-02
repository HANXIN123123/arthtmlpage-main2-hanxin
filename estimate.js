// artmug.kr uid=26315 가격 옵션 · 2026-09-21 확인 (일일방문자 체크 제외).
const workCategories = [
 ['누끼,벡터화',[['단순누끼',1000],['고급누끼',5000],['이미지 벡터화(문의필요)',null]]],
 ['방송/상업용',[['사진형 프사',20000],['움짤형 프사',30000],['사진형 로고,프사 타이포[1]',40000],['사진형 로고,프사 타이포[2]',60000],['홍보지 사진형(방송용)',45000],['홍보지 사진형(상업용)',60000],['홍보지 움짤형(방송용)',75000],['홍보지 움짤형(상업용)',100000]]],
 ['비상업용',[['사진형 프로필',10000],['움짤형 프로필',15000],['사진형 로고,프사 타이포[1]',20000],['사진형 로고,프사 타이포[2]',30000],['홍보지 사진형',30000],['홍보지 움짤형',50000]]],
 ['추가옵션',[['원본파일 제공[PSD,AI]',20000],['당일마감[1일, 선문의 필수, 100%+]',null],['빠른마감[3일, 선문의 필수, 50%+]',null],['빠른마감[5일, 선문의 필수, 30%+]',null],['사진형 로고/프사 효과추가',10000],['문의용',null],['포트폴리오 사용X',20000],['수정 추가',5000],['실시간 피드백 및 제작',100000]]],
 ['치지직 패널',[['사진형(개당)',6000],['움짤형(개당)',10000],['치지직 10종 세트(개별 구매는 문의해주세요)',5000]]],
 ['방송관련디자인',[['썸네일',10000],['커버곡 썸네일',10000],['누끼/이미지업스케일링(배경이 있는 파일을 제공할 경우에만)',3000],['방송,게임화면(사진)',30000],['방송,게임화면(영상효과)',50000],['채팅화면추가',10000],['RT공개 이미지',30000],['채널아트',20000],['영상편집 (견적문의)',null],['인트로/아웃트로',50000],['화면전환 트렌지션(스팅어)',30000]]],
 ['메뉴바 및 상세페이지',[['메뉴바 기본형',30000],['메뉴바 맞춤제작(디자인포함)',50000],['메뉴바 옵션 [모바일/PC 자동 변경 추가]',10000],['메뉴바 옵션 [페이지 방문자 수 확인 추가]',15000],['상세페이지 디자인 (길이당 견적문의)',30000],['페이지 공지사항 HTML',20000]]],
 ['LD일러스트 추가',[['몬드 작가님과 협업중(선문의필수)',null]]],
 ['SD일러스트 추가',[['동빵순 작가님과 협업중(선문의필수)',null]]]
];
const selectedItems=new Map();
let selectedUsageName='비상업용';
const money=value=>value===null?'별도 견적':value.toLocaleString()+'원';
function estimateSummary(){const items=[...selectedItems.values()];return {items,total:items.reduce((sum,item)=>sum+(item.price||0),0),inquiry:items.some(item=>item.price===null)};}
const estList=document.getElementById('estCatList');
workCategories.forEach(([category,items],ci)=>{
 const wrap=document.createElement('div');
 const button=document.createElement('button');button.type='button';button.className='est-cat-header';button.style.width='100%';button.setAttribute('aria-expanded','false');
 button.innerHTML=`<span class="est-cat-header-left"><span class="est-cat-emoji">${String(ci+1).padStart(2,'0')}</span><span class="est-cat-name">${category}</span></span><span class="est-cat-arrow">+</span>`;
 const body=document.createElement('div');body.className='est-cat-body';body.hidden=true;
 button.onclick=()=>{const open=body.hidden;body.hidden=!open;body.classList.toggle('open',open);button.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));button.lastChild.textContent=open?'−':'+';};
 items.forEach(([name,price],ii)=>{
   const key=ci+'-'+ii,row=document.createElement('label');row.className='est-item-row';
   const left=document.createElement('span');left.className='est-item-left';
   const input=document.createElement('input');input.type='checkbox';input.value=key;
   const label=document.createElement('span');label.className='est-item-name';label.textContent=name;
   const cost=document.createElement('span');cost.className='est-item-price';cost.textContent=money(price);
   input.onchange=()=>{if(input.checked)selectedItems.set(key,{category,name,price});else selectedItems.delete(key);row.classList.toggle('checked',input.checked);updateReceipt();};
   left.append(input,label);row.append(left,cost);body.append(row);
 });
 wrap.append(button,body);estList.append(wrap);
});
const note=document.createElement('p');note.className='estimate-note';note.textContent='표시 가격은 기본 견적입니다. 당일·빠른 마감의 추가 비율, 길이·난이도와 별도 견적 항목은 상담 후 확정합니다.';estList.after(note);
['비상업용','방송/상업용','외주','양도'].forEach((name,i)=>{
 const label=document.createElement('label');label.className='usage-radio-label';const input=document.createElement('input');input.type='radio';input.name='usageOpt';input.value=name;input.checked=i===0;input.onchange=()=>{selectedUsageName=name;updateReceipt();};label.append(input,document.createTextNode(name));document.getElementById('usageGroup').append(label);
});
function updateReceipt(){
 const box=document.getElementById('receiptBox');box.replaceChildren();const {items,total,inquiry}=estimateSummary();
 if(!items.length){const empty=document.createElement('p');empty.className='receipt-empty';empty.textContent='선택한 항목이 없습니다';box.append(empty);return;}
 items.forEach(({category,name,price})=>{const row=document.createElement('div');row.className='receipt-item';const title=document.createElement('span');title.className='receipt-item-name';title.textContent=category+' / '+name;const cost=document.createElement('span');cost.className='receipt-item-price';cost.textContent=money(price);row.append(title,cost);box.append(row);});
 const sum=document.createElement('div');sum.className='receipt-total';const label=document.createElement('span');label.textContent=inquiry?'금액 표시 항목 합계':'예상 합계';const value=document.createElement('span');value.textContent=money(total);sum.append(label,value);box.append(sum);
 if(inquiry){const p=document.createElement('p');p.className='estimate-note';p.textContent='별도 견적 및 마감 추가금은 위 합계에 포함되지 않습니다.';box.append(p);}
}
function buildApplication(){
 const {items,total,inquiry}=estimateSummary();
 const receipt=items.length?items.map(({category,name,price})=>`- ${category} / ${name}: ${money(price)}`).join('\n')+`\n${inquiry?'금액 표시 항목 합계':'예상 합계'}: ${money(total)}${inquiry?'\n※ 별도 견적 및 마감 추가금 제외':''}`:'선택 없음';
 const value=id=>document.getElementById(id).value.trim() || '(미입력)';
 return `디자인 한신 · 작업 신청서\n━━━━━━━━━━━━━━━━━━━━\n견적 내역\n${receipt}\n사용 범위: ${selectedUsageName}\n━━━━━━━━━━━━━━━━━━━━\n작업 유형: ${value('fWorkType')}\n사용 용도: ${value('fUsage')}\n작업 내용: ${value('fDetail')}\n참고 자료: ${value('fRef')}\n기타 요청: ${value('fEtc')}\n━━━━━━━━━━━━━━━━━━━━\n※ 최종 견적은 상담 후 확정됩니다.`;
}
async function copyApplication(text){
 try{await navigator.clipboard.writeText(text);return true;}catch(_){}
 const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.append(area);area.select();let done=false;try{done=document.execCommand('copy');}catch(_){}area.remove();return done;
}
document.getElementById('formCopyBtn').onclick=async()=>{
 document.dispatchEvent(new Event('application-copied'));
 const text=buildApplication();const copied=await copyApplication(text);
 const toast=document.getElementById('copyToast');toast.textContent=copied?'양식과 견적을 복사했습니다.':'자동 복사가 차단되었습니다. 아래 창에서 내용을 직접 복사할 수 있습니다.';toast.classList.add('show');
 window.requestArtmugInquiry(text,copied);
};
updateReceipt();
