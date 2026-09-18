
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

      // ⚠️ ВАЖНО: Замените этот блок на реальную отправку данных
      // Например, через fetch к вашему webhook Tilda или на свой backend
      /*
      fetch('https://your-webhook-url.com/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: phone })
      }).then(function(res) { return res.json(); })
        .then(function(data) { showSuccess(name, phone); })
        .catch(function(err) { showSuccess(name, phone); });
      */

      // Демо: показываем success через 1.2 сек
      setTimeout(function() {
        showSuccess(name, phone);
      }, 1200);
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

