// Firebase SDK를 동적 로드하여 네트워크 오류도 화면에 표시합니다.
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const sortedValues = (value, field) => Object.entries(record(value) ? value : {})
  .filter(([, item]) => record(item)).sort(([keyA, a], [keyB, b]) => {
    const orderA = Number.isFinite(a.order) ? a.order : Infinity;
    const orderB = Number.isFinite(b.order) ? b.order : Infinity;
    return (orderA === orderB ? 0 : orderA - orderB) || (Number(a[field]) || 0) - (Number(b[field]) || 0) || keyA.localeCompare(keyB);
  }).map(([key, item]) => ({...item,_key:key}));

export function publicImageUrl(item) {
  // blob: URL이나 관리자용 인증 URL은 방문자 페이지에서 사용할 수 없습니다.
  for (const candidate of [item.publicUrl, item.url]) {
    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:' && !url.searchParams.has('access_token')) return url.href;
    } catch (_) {}
  }
  return null;
}

export function normalizeCategories(value, type) {
  return sortedValues(value?.categories, 'createdAt').map(category => {
    const title = String(category.name || '(이름 없음)');
    if (type === 'video') {
      const videos = sortedValues(category.videos, 'addedAt')
        .map(video => video.id).filter(id => typeof id === 'string' && /^[\w-]{11}$/.test(id));
      return { key:category._key, title, videos };
    }
    return { key:category._key, title, images: sortedValues(category.images, 'addedAt').map(publicImageUrl).filter(Boolean) };
  });
}

function renderPortfolio(type, value, error) {
  const content = document.getElementById(type + 'TypeSections');
  const tabs = document.getElementById(type + 'TypeTabs');
  if (error) {
    let message = content.querySelector('[role="status"]');
    if (!message) {
      message = document.createElement('p');
      message.setAttribute('role', 'status');
      content.prepend(message);
    }
    message.textContent = '포트폴리오 연결에 실패했습니다. 잠시 후 새로고침해주세요.';
    return;
  }
  // 실시간 변경으로 제거되는 슬라이더의 resize 리스너를 해제합니다.
  content.querySelectorAll('.slider-root, .img-slider-root').forEach(root => {
    if (root._resize) window.removeEventListener('resize', root._resize);
  });
  const categories = normalizeCategories(value, type);
  const field = type === 'video' ? 'videos' : 'images';
  // 콘텐츠가 없는 카테고리는 슬라이더를 만들지 않습니다.
  const builder = type === 'video' ? buildYoutubeSlider : buildImageSlider;
  builder(categories.filter(category => category[field].length), content, tabs);
  if (!categories.some(category => category[field].length)) {
    content.textContent = type === 'video' ? '등록된 영상이 없습니다.' : '공개된 사진이 없습니다.';
  }
  resizeAllSliders();
  resizeAllImgSliders();
}

export async function startPortfolioSync() {
  if (new URLSearchParams(location.search).has('artmug-verify')) return;
  try {
    const [{ initializeApp }, { getDatabase, ref, onValue, runTransaction, serverTimestamp }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js')
    ]);
    const db = getDatabase(initializeApp(firebaseConfig));
    // 각각 구독하므로 main-page 쓰기 오류가 포트폴리오 읽기를 막지 않습니다.
    const unsubscribe = [
      onValue(ref(db, 'callendar-setting'), snapshot => {const values=snapshot.val()?.dates || {};Object.keys(specialDates).forEach(k=>delete specialDates[k]);for(const [key,type] of Object.entries(values)){if(['available','deadline','holiday'].includes(type))specialDates[key]={type,label:{available:'작업가능',deadline:'마감임박',holiday:'휴일'}[type]};}renderCalendar(calYear,calMonth);},error=>console.warn('일정 연결 실패',error.code)),
      onValue(ref(db, 'youtube-category'), snapshot => renderPortfolio('video', snapshot.val()), error => renderPortfolio('video', null, error)),
      onValue(ref(db, 'image-category'), snapshot => renderPortfolio('image', snapshot.val()), error => renderPortfolio('image', null, error))
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
    // 등록 실패와 SDK 로드 실패를 구분하여 정상 포트폴리오를 유지합니다.
    for (const type of ['video', 'image']) {
      const el = document.getElementById(type + 'TypeSections');
      if (el.textContent === '포트폴리오를 불러오는 중입니다...') renderPortfolio(type, null, error);
    }
  }
}

startPortfolioSync();
