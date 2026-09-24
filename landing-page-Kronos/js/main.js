(() => {
  'use strict';

  /* ============ NAV: solid on scroll + mobile burger ============ */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============ REVEAL ON SCROLL ============ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ============ AUDIO PLAYER — "Así nace Kronos" ============ */
  const audio = document.getElementById('originAudio');
  const audioToggle = document.getElementById('audioToggle');
  const audioTrack = document.getElementById('audioTrack');
  const audioProgress = document.getElementById('audioProgress');
  const audioLabel = document.getElementById('audioLabel');
  const iconPlay = audioToggle.querySelector('.icon-play');
  const iconPause = audioToggle.querySelector('.icon-pause');
  const storySegments = Array.from(document.querySelectorAll('#storyText p[data-seg]'));

  // Distribute segment boundaries proportionally by word count,
  // so this works with whatever real audio length is dropped in later —
  // no hardcoded timestamps that could drift from the actual recording.
  const weights = storySegments.map(p => p.textContent.trim().split(/\s+/).length);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let boundaries = []; // [{start, end}] in fractions 0..1
  (() => {
    let acc = 0;
    weights.forEach(w => {
      const start = acc / totalWeight;
      acc += w;
      const end = acc / totalWeight;
      boundaries.push({ start, end });
    });
  })();

  let audioAvailable = true;

  function disableAudio() {
    audioAvailable = false;
    audioLabel.textContent = 'Narración disponible muy pronto';
    audioToggle.style.opacity = '.45';
    audioToggle.style.cursor = 'default';
    setPlayingUI(false);
  }

  audio.addEventListener('error', disableAudio);

  // preload="none" means the browser won't touch the network until play()
  // is called — check up front with a lightweight HEAD request so the
  // button can start in its correct (disabled) state instead of flashing
  // "playing" first if the file isn't there yet.
  fetch(audio.currentSrc || audio.src, { method: 'HEAD' })
    .then(res => { if (!res.ok) disableAudio(); })
    .catch(disableAudio);

  function setPlayingUI(isPlaying) {
    iconPlay.hidden = isPlaying;
    iconPause.hidden = !isPlaying;
    audioToggle.dataset.state = isPlaying ? 'playing' : 'paused';
  }

  audioToggle.addEventListener('click', () => {
    if (!audioAvailable) return;
    if (audio.paused) {
      audioLabel.textContent = 'Escuchando a Flor…';
      audio.play().catch(() => {
        audioAvailable = false;
        audioLabel.textContent = 'Narración disponible muy pronto';
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
  audio.addEventListener('ended', () => {
    setPlayingUI(false);
    audioLabel.textContent = 'Escúchalo en la voz de Flor';
    audioProgress.style.width = '0%';
    storySegments.forEach(p => p.classList.remove('is-active'));
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const frac = audio.currentTime / audio.duration;
    audioProgress.style.width = (frac * 100).toFixed(2) + '%';

    const idx = boundaries.findIndex(b => frac >= b.start && frac < b.end);
    storySegments.forEach((p, i) => p.classList.toggle('is-active', i === idx));
  });

  audioTrack.addEventListener('click', (e) => {
    if (!audioAvailable || !audio.duration) return;
    const rect = audioTrack.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = frac * audio.duration;
  });

  // Clicking a paragraph seeks to its segment (only once we know duration).
  storySegments.forEach((p, i) => {
    p.addEventListener('click', () => {
      if (!audioAvailable || !audio.duration) return;
      audio.currentTime = boundaries[i].start * audio.duration;
      if (audio.paused) audio.play().catch(() => {});
    });
  });

  /* ============ ELEMENTS SECTION ============ */
  const ELEMENTS = [
    {
      id: 'agua',
      name: 'Agua',
      color: '#4fa3b8',
      soap: 'assets/img/jabon-agua.jpg',
      kit: 'assets/img/kit-agua.jpg',
      question: '¿Te ha pasado que una canción, un olor o un recuerdo te hacen llorar sin razón aparente? ¿Sientes las emociones de los demás como si fueran tuyas?',
      signs: [{ n: 'Cáncer', g: '♋' }, { n: 'Escorpio', g: '♏' }, { n: 'Piscis', g: '♓' }],
      description: 'El agua es la matriz de la emoción y la intuición que une a Cáncer, Escorpio y Piscis. Cáncer nutre el refugio del alma y la memoria; Escorpio alquimiza la sombra a través de la transformación profunda; y Piscis disuelve los límites en una compasión universal. Juntos, representan el viaje sanador de sentir, renacer y fluir con el inconsciente cósmico.',
      ingredient: 'Manzanilla',
      grabovoi: '5148214',
      closing: 'El agua ya fluyó.',
      icon: '<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z" fill="none" stroke="currentColor" stroke-width="1.6"/>'
    },
    {
      id: 'fuego',
      name: 'Fuego',
      color: '#d9642c',
      soap: 'assets/img/jabon-fuego.jpg',
      kit: 'assets/img/kit-fuego.jpg',
      question: '¿Te ha pasado que actúas antes de pensar, como si algo te empujara?',
      signs: [{ n: 'Aries', g: '♈' }, { n: 'Leo', g: '♌' }, { n: 'Sagitario', g: '♐' }],
      description: 'El fuego es la chispa vital y creadora que impulsa a Aries, Leo y Sagitario. Aries enciende el coraje de la acción y el inicio; Leo irradia la soberanía creativa y el calor del corazón; y Sagitario expande la conciencia en busca de la verdad y la fe. Juntos, encarnan el poder espiritual de iluminar, arder y transformar la voluntad en propósito.',
      ingredient: 'Canela, bergamota, vitamina E, semilla de uva',
      grabovoi: '9158721',
      closing: 'El fuego ya se encendió.',
      icon: '<path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-1-2-1-2 1 2 3 3 3 6a5 5 0 0 1-10 0c0-5 5-6 5-13Z" fill="none" stroke="currentColor" stroke-width="1.6"/>'
    },
    {
      id: 'aire',
      name: 'Aire',
      color: '#9db9d6',
      soap: 'assets/img/jabon-aire.jpg',
      kit: 'assets/img/kit-aire.jpg',
      question: '¿Te cuesta quedarte quieto en una sola idea, un solo lugar, un solo plan?',
      signs: [{ n: 'Géminis', g: '♊' }, { n: 'Libra', g: '♎' }, { n: 'Acuario', g: '♒' }],
      description: 'El aire es el aliento mental y vincular que anima a Géminis, Libra y Acuario. Géminis poliniza el mundo con ideas y adaptabilidad; Libra equilibra la armonía y la belleza en el encuentro con el otro; y Acuario revoluciona el futuro con visión colectiva. Juntos, representan la libertad de pensar, conectar y elevar la conciencia a través de la perspectiva.',
      ingredient: 'Lavanda',
      grabovoi: '52483317',
      closing: 'El aire ya se despejó.',
      icon: '<path d="M3 8h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17.5h9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'
    },
    {
      id: 'tierra',
      name: 'Tierra',
      color: '#b98a5c',
      soap: 'assets/img/jabon-tierra.jpg',
      kit: 'assets/img/kit-tierra.jpg',
      question: '¿Eres de las personas que le gusta tener todo bajo control y le cuesta cambiar de planes o salir de la rutina?',
      signs: [{ n: 'Tauro', g: '♉' }, { n: 'Virgo', g: '♍' }, { n: 'Capricornio', g: '♑' }],
      description: 'La tierra es el sustrato material y sagrado que sostiene a Tauro, Virgo y Capricornio. Tauro arraiga la abundancia y el disfrute sensorial; Virgo cultiva el discernimiento y el servicio consciente; y Capricornio esculpe la disciplina y la maestría del tiempo. Juntos, encarnan el arte de manifestar lo divino en la materia y construir legados con alma.',
      ingredient: 'Cacao',
      grabovoi: null, // pendiente: no se pudo leer en la foto del mockup — confirmar con Flor
      closing: 'La tierra ya se activó.',
      icon: '<path d="M12 3v6M9 6l3 3 3-3M4 14a8 8 0 0 1 16 0v1H4Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    }
  ];

  const tabsEl = document.getElementById('elementTabs');
  const stageMedia = document.getElementById('stageMedia');
  const imgSoap = document.getElementById('imgSoap');
  const imgKit = document.getElementById('imgKit');
  const stageHint = document.getElementById('stageHint');
  const stageBadge = document.getElementById('stageBadge');
  const stageEyebrow = document.getElementById('stageEyebrow');
  const stageQuestion = document.getElementById('stageQuestion');
  const stageSigns = document.getElementById('stageSigns');
  const stageDescription = document.getElementById('stageDescription');
  const stageCta = document.getElementById('stageCta');
  const stageDetails = document.getElementById('stageDetails');
  const elementsTint = document.getElementById('elementsTint');

  let currentIndex = 0;
  let showingKit = false;

  ELEMENTS.forEach((el, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.setAttribute('role', 'tab');
    btn.style.setProperty('--tab-color', el.color);
    btn.innerHTML = `<svg viewBox="0 0 24 24">${el.icon}</svg><span>${el.name}</span>`;
    btn.addEventListener('click', () => selectElement(i));
    tabsEl.appendChild(btn);
  });

  function renderTabs() {
    Array.from(tabsEl.children).forEach((btn, i) => {
      btn.classList.toggle('is-active', i === currentIndex);
    });
  }

  function selectElement(i, resetImage = true) {
    currentIndex = i;
    const el = ELEMENTS[i];
    if (resetImage) showingKit = false;

    imgSoap.src = el.soap;
    imgKit.src = el.kit;
    imgSoap.alt = `Jabón Kronos, elemento ${el.name}`;
    imgKit.alt = `Kit completo Kronos, elemento ${el.name}`;

    imgSoap.classList.toggle('is-active', !showingKit);
    imgKit.classList.toggle('is-active', showingKit);
    stageBadge.textContent = showingKit ? 'El kit completo' : 'El jabón';

    stageDetails.style.setProperty('--element-color', el.color);
    elementsTint.style.color = el.color;
    stageEyebrow.textContent = `Elemento ${el.name}`;
    stageQuestion.textContent = el.question;
    stageCta.textContent = `Escríbenos por tu kit de ${el.name}`;

    stageSigns.innerHTML = el.signs.map(s =>
      `<span class="sign-pill"><span class="glyph">${s.g}</span>${s.n}</span>`
    ).join('');

    stageDescription.textContent = el.description;

    renderTabs();
  }

  function toggleImage() {
    showingKit = !showingKit;
    imgSoap.classList.toggle('is-active', !showingKit);
    imgKit.classList.toggle('is-active', showingKit);
    stageBadge.textContent = showingKit ? 'El kit completo' : 'El jabón';
    stageMedia.classList.add('is-touched');
    stageHint.textContent = showingKit ? 'Toca para ver el jabón ✦' : 'Toca para ver el kit ✦';
  }

  stageMedia.addEventListener('click', toggleImage);
  stageMedia.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleImage(); }
  });

  // Swipe left/right on the stage to move between elements (mobile-friendly)
  let touchStartX = null;
  stageMedia.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  stageMedia.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      const next = dx < 0
        ? (currentIndex + 1) % ELEMENTS.length
        : (currentIndex - 1 + ELEMENTS.length) % ELEMENTS.length;
      selectElement(next);
    }
    touchStartX = null;
  }, { passive: true });

  selectElement(0);
})();
