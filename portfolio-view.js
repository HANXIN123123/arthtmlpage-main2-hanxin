(() => {
  'use strict';

  const model = window.ArtmugPortfolio;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(className, label, text) {
    const node = element('button', className, text);
    node.type = 'button';
    node.setAttribute('aria-label', label);
    return node;
  }

  function mediaSource(item) {
    if (item.type === 'video') return /^[\w-]{11}$/.test(item.id || '') ? item.id : null;
    if (item.type !== 'image') return null;
    for (const value of [item.publicUrl, item.url]) {
      if (typeof value !== 'string') continue;
      try {
        const url = new URL(value);
        if (url.protocol === 'https:' && !url.searchParams.has('access_token')) return url.href;
      } catch (_) { /* A legacy record can contain an unpublished image. */ }
    }
    return null;
  }

  function publicWorks(secondary) {
    const result = [];
    for (const [key, item] of model.entries(secondary?.items, 'addedAt')) {
      const source = mediaSource(item);
      if (!source) continue;
      const name = model.itemName(item) || (item.type === 'video' ? '영상' : '이미지');
      result.push({key, type: item.type, source, name});
    }
    return result;
  }

  function thumbnail(work) {
    const img = element('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = work.type === 'video'
      ? 'https://img.youtube.com/vi/' + work.source + '/hqdefault.jpg'
      : work.source;
    return img;
  }

  function markWork(node, work, categoryKey, originalCategory) {
    node.dataset.kind = work.type;
    node.dataset.portfolioIdentity = [work.type, categoryKey, originalCategory ? work.source : work.key].join('|');
    node.dataset.portfolioLabel = work.name;
  }

  function renderGrid(section, works, originalCategory) {
    const grid = element('div', 'portfolio-grid pv-grid');
    for (const work of works) {
      const isVideo = work.type === 'video';
      const card = button('pv-grid-item', work.name + (isVideo ? ' 영상 재생' : ' 이미지 확대'));
      markWork(card, work, section.dataset.categoryKey, originalCategory);
      card.append(thumbnail(work));
      if (isVideo) {
        const play = element('span', 'grid-play', '▶');
        play.setAttribute('aria-hidden', 'true');
        card.append(play);
      }
      card.addEventListener('click', () => {
        if (isVideo) window.openPortfolioVideo(work.source);
        else window.openPortfolioImage(work.source, work.name);
        card.dispatchEvent(new CustomEvent('portfolio-view', {bubbles: true}));
      });
      grid.append(card);
    }
    section.append(grid);
  }

  function activeMedia(work) {
    if (work.type === 'video') {
      const frame = element('iframe');
      frame.title = work.name;
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.src = 'https://www.youtube-nocookie.com/embed/' + work.source + '?rel=0';
      return frame;
    }
    const open = button('pv-slide-image', work.name + ' 이미지 확대');
    const img = element('img');
    img.alt = work.name;
    img.src = work.source;
    open.append(img);
    open.addEventListener('click', () => window.openPortfolioImage(work.source, work.name));
    return open;
  }

  function renderSlider(section, works, originalCategory, selectedKey, remember) {
    const root = element('div', 'slider-root pv-slider');
    const stage = element('div', 'slider-stage pv-stage');
    const strip = element('div', 'slider-thumbs');
    const wrap = element('div', 'slider-thumbs-wrap');
    const slides = works.map(work => {
      const slide = element('div', 'slider-slide');
      markWork(slide, work, section.dataset.categoryKey, originalCategory);
      stage.append(slide);
      const thumb = button('slider-thumb-btn', work.name);
      thumb.append(thumbnail(work));
      strip.append(thumb);
      return slide;
    });
    const previous = button('slider-btn prev', '이전 작품', '❮');
    const next = button('slider-btn next', '다음 작품', '❯');
    stage.append(previous, next);
    wrap.append(strip);
    root.append(stage, element('div', 'slider-dots'), wrap);
    section.append(root);

    let current = -1;
    function activate(index) {
      if (index === current) return;
      if (current >= 0) slides[current].replaceChildren();
      current = index;
      const work = works[index];
      root.dataset.kind = work.type;
      slides[index].append(activeMedia(work));
      remember(work.key);
    }
    root.addEventListener('portfolio-view', event => activate(event.detail.index));
    const initial = Math.max(0, works.findIndex(work => work.key === selectedKey));
    activate(initial);
    const carousel = initPortfolioCarousel(root, '.slider-slide', initial);
    const resize = new ResizeObserver(() => carousel.center('auto'));
    resize.observe(stage);
    return () => resize.disconnect();
  }

  function create(host) {
    const primaryNav = element('nav', 'pv-primary-nav');
    primaryNav.setAttribute('aria-label', '포트폴리오 1차 카테고리');
    const backward = button('pv-scroll', '이전 카테고리 표시', '‹');
    const forward = button('pv-scroll', '다음 카테고리 표시', '›');
    const tabs = element('div', 'portfolio-cat-tabs pv-tabs');
    primaryNav.append(backward, tabs, forward);
    function scrollTabs(direction) {
      tabs.scrollBy({left: direction * Math.max(120, tabs.clientWidth * 0.8), behavior: 'smooth'});
    }
    backward.onclick = () => scrollTabs(-1);
    forward.onclick = () => scrollTabs(1);
    function updateScrollButtons() {
      primaryNav.classList.toggle('pv-overflow', tabs.scrollWidth > primaryNav.clientWidth + 2);
      const overflow = tabs.scrollWidth - tabs.clientWidth;
      backward.disabled = tabs.scrollLeft < 2;
      forward.disabled = tabs.scrollLeft >= overflow - 2;
    }
    const sizeObserver = new ResizeObserver(updateScrollButtons);
    sizeObserver.observe(tabs);
    tabs.addEventListener('scroll', updateScrollButtons, {passive:true});

    const controls = element('div', 'pv-controls');
    const select = element('select', 'pv-secondary');
    select.setAttribute('aria-label', '2차 카테고리 선택');
    const modeButton = button('portfolio-mode pv-mode', '슬라이드로 보기');
    controls.append(select, modeButton);
    const status = element('p', 'pv-status', '포트폴리오를 불러오는 중입니다.');
    status.setAttribute('role', 'status');
    const section = element('div', 'pf-type-section active pv-section');
    host.replaceChildren(primaryNav, controls, status, section);
    primaryNav.hidden = controls.hidden = true;

    let data, selectedPrimary, selectedSecondary, selectedMode, slideKey;
    let manuallySelected = false;
    let primarySignature, secondarySignature, contentSignature;
    let releaseSlider;

    function revealPrimary(activeTab) {
      const box = activeTab.getBoundingClientRect();
      const area = tabs.getBoundingClientRect();
      if (box.left < area.left) tabs.scrollLeft += box.left - area.left;
      else if (box.right > area.right) tabs.scrollLeft += box.right - area.right;
    }

    function render() {
      const defaults = model.resolveDefaults(data);
      const primaries = model.entries(data.categories);
      if (!manuallySelected || !data.categories?.[selectedPrimary]) {
        selectedPrimary = defaults.primaryId;
        selectedSecondary = defaults.secondaryId;
      }
      const primary = data.categories?.[selectedPrimary];
      const secondaries = model.entries(primary?.categories);
      if (!primary?.categories?.[selectedSecondary]) {
        selectedSecondary = selectedPrimary === defaults.primaryId ? defaults.secondaryId : secondaries[0]?.[0];
      }
      const secondary = primary?.categories?.[selectedSecondary];
      const mode = selectedMode || defaults.mode;
      const works = publicWorks(secondary);
      primaryNav.hidden = !primaries.length;
      controls.hidden = !secondaries.length;
      modeButton.hidden = !works.length;
      modeButton.textContent = mode === 'slide' ? '격자로 보기' : '슬라이드로 보기';
      modeButton.setAttribute('aria-label', modeButton.textContent);
      modeButton.onclick = () => {
        selectedMode = mode === 'slide' ? 'grid' : 'slide';
        render();
      };

      const primaryList = JSON.stringify(primaries.map(([id, entry]) => [id, entry.name]));
      if (primaryList !== primarySignature) {
        tabs.replaceChildren();
        primarySignature = primaryList;
        for (const [id, entry] of primaries) {
          const tab = button('pf-tab-btn', entry.name, entry.name);
          tab.dataset.primaryId = id;
          tab.onclick = () => {
            if (selectedPrimary === id) return;
            manuallySelected = true;
            selectedPrimary = id;
            selectedSecondary = slideKey = null;
            render();
          };
          tabs.append(tab);
        }
      }
      for (const tab of tabs.children) {
        const active = tab.dataset.primaryId === selectedPrimary;
        const changed = tab.classList.contains('active') !== active;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', String(active));
        if (active && changed) revealPrimary(tab);
      }
      updateScrollButtons();

      const options = JSON.stringify(secondaries.map(([id, entry]) => [id, entry.name]));
      if (options !== secondarySignature) {
        select.replaceChildren(...secondaries.map(([id, entry]) => new Option(entry.name, id)));
        secondarySignature = options;
      }
      select.value = selectedSecondary || '';
      status.hidden = !!works.length;
      if (!works.length) {
        status.textContent = !primaries.length ? '등록된 포트폴리오가 없습니다.'
          : !secondaries.length ? '등록된 2차 카테고리가 없습니다.' : '이 카테고리에 공개된 작품이 없습니다.';
      }
      const signature = JSON.stringify([selectedPrimary, selectedSecondary, mode, works]);
      const originalCategory = selectedPrimary === 'youtube-category' || selectedPrimary === 'image-category';
      section.dataset.categoryKey = originalCategory ? selectedSecondary || '' : selectedPrimary + '/' + selectedSecondary;
      section.dataset.category = secondary?.name || '';
      if (contentSignature === signature) return;
      contentSignature = signature;
      releaseSlider?.();
      releaseSlider = null;
      section.replaceChildren();
      if (!works.length) return;
      if (mode === 'slide') {
        releaseSlider = renderSlider(section, works, originalCategory, slideKey, key => { slideKey = key; });
      } else {
        renderGrid(section, works, originalCategory);
      }
    }

    select.onchange = () => {
      manuallySelected = true;
      selectedSecondary = select.value;
      slideKey = null;
      render();
    };

    function showInitialError() {
      if (!data) {
        status.hidden = false;
        status.textContent = '포트폴리오를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
      }
    }

    function subscribe(db, ref, onValue) {
      const roots = new Map();
      function watch(path) {
        return onValue(ref(db, path), snapshot => {
          roots.set(path, snapshot.val());
          const imageRoot = roots.get('image-category');
          if (roots.size < 2 && imageRoot?.portfolioV2?.version !== 2) return;
          data = model.read(roots.get('youtube-category'), imageRoot, firebaseConfig.projectId);
          render();
        }, showInitialError);
      }
      return [watch('youtube-category'), watch('image-category'), () => {
        sizeObserver.disconnect();
        releaseSlider?.();
      }];
    }

    return {subscribe, showInitialError};
  }

  window.ArtmugPortfolioView = {create};
})();
