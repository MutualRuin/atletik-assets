
/* ============================================================
   JS — ротация слоганов + обработка формы
   ============================================================ */
(function() {
  // ---------- Ротация слоганов ----------
  var slogans = document.querySelectorAll('#at-slogan-container p');
  var dots = document.querySelectorAll('#at-slogan-dots button');
  var current = 0;
  var interval;

  function showSlogan(idx) {
    slogans.forEach(function(s, i) {
      s.classList.toggle('at-active', i === idx);
    });
    dots.forEach(function(d, i) {
      d.classList.toggle('at-active', i === idx);
    });
    current = idx;
  }

  function startRotation() {
    interval = setInterval(function() {
      current = (current + 1) % slogans.length;
      showSlogan(current);
    }, 3200);
  }

  function stopRotation() {
    clearInterval(interval);
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      stopRotation();
      showSlogan(i);
      startRotation();
    });
  });

  startRotation();

  // ---------- Обработка формы ----------
  var form = document.getElementById('at-lead-form-el');
  var submitBtn = document.getElementById('at-submit-btn');
  var inner = document.getElementById('at-lead-inner');
  var consentCheck = document.getElementById('at-consent-check');
  var consentError = document.getElementById('at-consent-error');

  // Скрываем ошибку при клике на чекбокс
  if (consentCheck) {
    consentCheck.addEventListener('change', function() {
      if (consentCheck.checked && consentError) {
        consentError.classList.remove('at-show');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('at-name').value.trim();
      var phone = document.getElementById('at-phone').value.trim();
      if (!name || !phone) return;

      // Проверка чекбокса согласия
      if (consentCheck && !consentCheck.checked) {
        if (consentError) consentError.classList.add('at-show');
        consentCheck.focus();
        return;
      }

      // Показать spinner
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="at-spinner"></span> Отправляем…';

      // Отправка через существующую Tilda-форму на главной странице
      // На странице уже загружена форма #form4038046601 (в попапе #popup:myform_uslugi)
      // и window.tildaForm (из tilda-forms-1.0.min.js)
      // Мы заполняем поля этой формы и вызываем tildaForm.send()

      function sendViaTilda() {
        var tildaFormEl = document.getElementById('form4038046601');
        if (!tildaFormEl) {
          console.error('Tilda форма #form4038046601 не найдена на странице');
          showSuccess(name, phone);
          return;
        }

        // Заполняем поля Name и Phone в Tilda-форме
        var nameInput = tildaFormEl.querySelector('input[name="Name"]');
        var phoneInput = tildaFormEl.querySelector('input[name="Phone"]');

        if (!nameInput || !phoneInput) {
          console.error('Поля Name/Phone не найдены в Tilda-форме');
          showSuccess(name, phone);
          return;
        }

        nameInput.value = name;
        phoneInput.value = phone;

        // Вызываем tildaForm.send() — это функция, которую Tilda использует
        // для отправки формы через AJAX
        if (window.tildaForm && typeof window.tildaForm.send === 'function') {
          // tildaForm.send(formNode, btnSubmitNode, formType, formKey)
          var btn = tildaFormEl.querySelector('button[type="submit"]') || tildaFormEl.querySelector('.t-submit');
          var formKey = tildaFormEl.getAttribute('data-tilda-formskey') || document.getElementById('allrecords').getAttribute('data-tilda-formskey');

          // Вызываем отправку Tilda
          var result = window.tildaForm.send(tildaFormEl, btn, 2, formKey);

          // Через 2 секунды показываем наш success
          setTimeout(function() {
            showSuccess(name, phone);
          }, 2000);
        } else {
          // Если tildaForm недоступна — просто submit
          tildaFormEl.submit();
          setTimeout(function() {
            showSuccess(name, phone);
          }, 1500);
        }
      }

      // Небольшая задержка, чтобы убедиться что Tilda-скрипты загружены
      setTimeout(sendViaTilda, 100);
    });
  }

  function showSuccess(name, phone) {
    if (!inner) return;
    inner.innerHTML =
      '<div class="at-success">' +
        '<div class="at-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>' +
        '<h3>Заявка отправлена!</h3>' +
        '<p>Спасибо, ' + escapeHtml(name) + '! Мы свяжемся с вами по телефону ' + escapeHtml(phone) + ' в ближайшее время.</p>' +
      '</div>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();




// ---------- Header: sticky on scroll ----------
(function() {
  var header = document.getElementById('at-header');
  if (header) {
    window.addEventListener('scroll', function() {
      var scroll = window.pageYOffset || document.documentElement.scrollTop;
      if (scroll > 50) {
        header.classList.add('at-scrolled');
      } else {
        header.classList.remove('at-scrolled');
      }
    }, { passive: true });
  }

  // ---------- Mobile drawer ----------
  var burger = document.getElementById('at-burger');
  var drawer = document.getElementById('at-drawer');
  var overlay = document.getElementById('at-overlay');

  function openDrawer() {
    if (burger) burger.classList.add('at-open');
    if (drawer) drawer.classList.add('at-open');
    if (overlay) overlay.classList.add('at-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (burger) burger.classList.remove('at-open');
    if (drawer) drawer.classList.remove('at-open');
    if (overlay) overlay.classList.remove('at-open');
    document.body.style.overflow = '';
  }
  if (burger) burger.addEventListener('click', function() {
    if (drawer && drawer.classList.contains('at-open')) { closeDrawer(); } else { openDrawer(); }
  });
  if (overlay) overlay.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeDrawer);
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('at-open')) { closeDrawer(); }
  });

  // ---------- Back to top ----------
  var backTop = document.getElementById('at-back-to-top');
  if (backTop) {
    backTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

