document.addEventListener('DOMContentLoaded', () => {
  console.log('System initialized: Trexo-Elix');

  // 1. Инициализация иконок
  if (typeof lucide !== 'undefined') {
      lucide.createIcons();
  }

  // 2. Инициализация плавного скролла (Lenis)
  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
  });
  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 3. Регистрация плагина GSAP
  gsap.registerPlugin(ScrollTrigger);

  // --- ЗАПУСК МОДУЛЕЙ ---
  initHero3D();      // 3D сфера
  initMobileMenu();  // Мобильное меню (исправлено)
  initAnimations();  // Анимации списков (исправлено через forEach)
  initAccordion();   // FAQ (исправлено через forEach)
  initContactForm(); // Форма
  initCookies();     // Куки
});

/* --- ФУНКЦИИ --- */

// 1. ИСПРАВЛЕННОЕ МОБИЛЬНОЕ МЕНЮ
function initMobileMenu() {
  const burger = document.querySelector('.header__burger');
  const closeBtn = document.querySelector('.mobile-menu__close');
  const menu = document.querySelector('.mobile-menu');
  // Используем querySelectorAll, чтобы найти все ссылки внутри меню
  const menuLinks = document.querySelectorAll('.mobile-menu__link');

  function openMenu() {
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden'; // Блокируем скролл сайта
  }

  function closeMenu() {
      menu.classList.remove('is-open');
      document.body.style.overflow = ''; // Возвращаем скролл
  }

  if (burger) {
      burger.addEventListener('click', (e) => {
          e.preventDefault();
          openMenu();
      });
  }

  if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeMenu();
      });
  }

  // Вешаем событие на КАЖДУЮ ссылку меню
  menuLinks.forEach(link => {
      link.addEventListener('click', () => {
          closeMenu();
      });
  });
}

// 2. ИСПРАВЛЕННЫЕ АНИМАЦИИ (FOREACH LOOP)
function initAnimations() {

  // А) Заголовки секций (по одному)
  const titles = document.querySelectorAll('.section__title');
  titles.forEach(title => {
      gsap.from(title, {
          scrollTrigger: {
              trigger: title,
              start: "top 85%", // Начинаем, когда элемент чуть показался
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
      });
  });

  // Б) Карточки преимуществ, Блога и Технологий
  // Собираем ВСЕ элементы, которые должны появляться списком
  const cards = document.querySelectorAll('.card, .blog-card, .tech-item, .step');

  cards.forEach((card, index) => {
      gsap.from(card, {
          scrollTrigger: {
              trigger: card,
              start: "top 90%", // Срабатывает для КАЖДОЙ карточки отдельно
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.1, // Небольшая задержка для плавности
          ease: 'power2.out'
      });
  });

  // В) Статистика в About
  const stats = document.querySelectorAll('.stat-card');
  stats.forEach((stat, index) => {
      gsap.from(stat, {
          scrollTrigger: {
              trigger: stat,
              start: "top 85%",
          },
          x: 50,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.2, // Индекс используется для очередности
          ease: 'power3.out'
      });
  });

  // Г) Hero анимация (оставляем timeline для синхронности)
  const tl = gsap.timeline();
  tl.from('.hero__badge', { y: -20, opacity: 0, duration: 0.8 })
    .from('.hero__line', { y: 100, opacity: 0, duration: 1, stagger: 0.15, ease: 'power4.out' }, "-=0.5")
    .from('.hero__desc', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
    .from('.hero__btns', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5");
}

// 3. ИСПРАВЛЕННЫЙ АККОРДЕОН (FAQ)
function initAccordion() {
  const items = document.querySelectorAll('.accordion__btn');

  items.forEach(item => {
      item.addEventListener('click', function() {
          // Переключаем активный класс
          this.classList.toggle('active');

          // Находим контент, идущий сразу после кнопки
          const content = this.nextElementSibling;

          if (content.style.maxHeight) {
              // Если открыто — закрываем
              content.style.maxHeight = null;
          } else {
              // Если закрыто — открываем на полную высоту
              content.style.maxHeight = content.scrollHeight + "px";
          }
      });
  });
}

// 4. THREE.JS (Остается без изменений, работает корректно)
function initHero3D() {
  const container = document.getElementById('hero-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 2.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const particlesGeometry = new THREE.BufferGeometry();
  const count = 1500;
  const posArray = new Float32Array(count * 3);
  for(let i = 0; i < count * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 6;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const material = new THREE.PointsMaterial({
      size: 0.006, color: 0xCEFF00, transparent: true, opacity: 0.7
  });

  const particlesMesh = new THREE.Points(particlesGeometry, material);
  scene.add(particlesMesh);

  let mouseX = 0, mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - windowHalfX) * 0.0005;
      mouseY = (e.clientY - windowHalfY) * 0.0005;
  });

  const clock = new THREE.Clock();
  function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      particlesMesh.rotation.y += 0.05 * (mouseX - particlesMesh.rotation.y);
      particlesMesh.rotation.x += 0.05 * (mouseY - particlesMesh.rotation.x);
      particlesMesh.rotation.z = elapsedTime * 0.08;
      renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// 5. КОНТАКТНАЯ ФОРМА
function initContactForm() {
  const form = document.getElementById('main-form');
  if (!form) return;

  // Генерация капчи
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const captchaResult = num1 + num2;
  const taskEl = document.getElementById('captcha-task');
  if(taskEl) taskEl.textContent = `${num1} + ${num2}`;

  // Валидация телефона
  const phoneInput = document.getElementById('phone');
  if(phoneInput) {
      phoneInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '');
      });
  }

  form.addEventListener('submit', (e) => {
      e.preventDefault();

      const captchaInput = document.getElementById('captcha-input');
      const userCaptcha = parseInt(captchaInput.value);
      const captchaError = document.getElementById('captcha-error');

      if (userCaptcha !== captchaResult) {
          captchaError.style.display = 'block';
          return;
      }
      captchaError.style.display = 'none';

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerText;
      btn.innerText = 'Отправка...';
      btn.disabled = true;

      setTimeout(() => {
          form.reset();
          btn.innerText = originalText;
          btn.disabled = false;
          document.getElementById('form-success').style.display = 'flex';
          // Обновляем капчу
          const n1 = Math.floor(Math.random() * 10) + 1;
          const n2 = Math.floor(Math.random() * 10) + 1;
          if(taskEl) taskEl.textContent = `${n1} + ${n2}`;
      }, 1500);
  });
}

// 6. COOKIES
function initCookies() {
  const popup = document.getElementById('cookie-popup');
  const btn = document.getElementById('accept-cookies');

  if (!popup || !btn) return;

  if (!localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => {
          popup.style.display = 'block';
          gsap.fromTo(popup, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
      }, 2000);
  }

  btn.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      gsap.to(popup, {
          y: 50, opacity: 0, duration: 0.3,
          onComplete: () => popup.style.display = 'none'
      });
  });
}