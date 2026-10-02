// 영상과 이미지에서 동일한 탐색, 동그라미 창, 썸네일 스크롤을 사용합니다.
function initPortfolioCarousel(root, slideSelector) {
  const slides = Array.from(root.querySelectorAll(slideSelector));
  const thumbs = Array.from(root.querySelectorAll('.slider-thumb-btn'));
  const dots = root.querySelector('.slider-dots');
  const wrap = root.querySelector('.slider-thumbs-wrap');
  const strip = root.querySelector('.slider-thumbs');
  const total = slides.length;
  let current = 0;
  const before = document.createElement('span');
  const windowEl = document.createElement('div');
  const after = document.createElement('span');
  before.className = after.className = 'slider-more';
  windowEl.className = 'slider-dot-window';
  dots.replaceChildren(before, windowEl, after);

  function center(behavior = 'smooth') {
    if (!thumbs[current] || !wrap.clientWidth) return;
    // 양 끝 항목도 중앙에 올 수 있도록 좌우 여백을 확보합니다.
    strip.style.paddingLeft = Math.max(0, (wrap.clientWidth - thumbs[0].offsetWidth) / 2) + 'px';
    strip.style.paddingRight = Math.max(0, (wrap.clientWidth - thumbs[total - 1].offsetWidth) / 2) + 'px';
    const thumbRect = thumbs[current].getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const left = wrap.scrollLeft + thumbRect.left - wrapRect.left - (wrap.clientWidth - thumbRect.width) / 2;
    wrap.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : behavior });
  }

  function renderDots() {
    const start = Math.max(0, Math.min(current - 4, total - 10));
    const end = Math.min(total, start + 10);
    before.textContent = start ? '+' + start + '개' : '';
    after.textContent = total > end ? '+' + (total - end) + '개' : '';
    before.setAttribute('aria-label', '앞에 ' + start + '개');
    after.setAttribute('aria-label', '뒤에 ' + (total - end) + '개');
    windowEl.replaceChildren();
    for (let index = start; index < end; index++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot' + (index === current ? ' active' : '');
      dot.setAttribute('aria-label', (index + 1) + '번째 포트폴리오 보기');
      dot.setAttribute('aria-current', index === current ? 'true' : 'false');
      dot.addEventListener('click', () => {
        goTo(index);
        // 동그라미 창을 갱신한 뒤에도 키보드 포커스를 유지합니다.
        windowEl.querySelector('[aria-current="true"]')?.focus({ preventScroll: true });
      });
      windowEl.appendChild(dot);
    }
  }

  function goTo(index, track = true) {
    if (!total) return;
    current = (index + total) % total;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === current);
      thumb.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
    renderDots();
    center();
    if(track)root.dispatchEvent(new CustomEvent('portfolio-view',{bubbles:true,detail:{index:current}}));
  }
  for (const [selector, delta, label] of [['.prev', -1, '이전 포트폴리오'], ['.next', 1, '다음 포트폴리오']]) {
    const button = root.querySelector('.slider-btn' + selector);
    button.type = 'button';
    button.disabled = total < 2;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', event => {
      event.stopPropagation();
      goTo(current + delta);
    });
  }
  thumbs.forEach((thumb, index) => {
    thumb.type = 'button';
    thumb.setAttribute('aria-label', (index + 1) + '번째 포트폴리오 보기');
    thumb.addEventListener('click', () => goTo(index));
  });
  goTo(0,false);
  return { center };
}
