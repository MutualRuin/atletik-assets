
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

      // Отправка через существующую Tilda-форму на странице
      // Форма #form4038046601 уже в DOM (в попапе), tildaForm загружена

      function sendViaTilda() {
        var tildaFormEl = document.getElementById('form4038046601');
        if (!tildaFormEl) {
          console.error('[ATLETIK] Tilda форма #form4038046601 не найдена');
          showSuccess(name, phone);
          return;
        }
        console.log('[ATLETIK] Tilda форма найдена');

        // Заполняем поля Name и Phone
        var nameInput = tildaFormEl.querySelector('input[name="Name"]');
        var phoneInput = tildaFormEl.querySelector('input[name="Phone"]');

        if (!nameInput || !phoneInput) {
          console.error('[ATLETIK] Поля Name/Phone не найдены в Tilda-форме');
          showSuccess(name, phone);
          return;
        }
        console.log('[ATLETIK] Поля Name/Phone найдены, заполняем...');

        nameInput.value = name;
        phoneInput.value = phone;

        // Триггерим события input и change — без них Tilda думает,
        // что поля не были заполнены пользователем, и молча отклоняет заявку
        ['input', 'change'].forEach(function(eventType) {
          var event = new Event(eventType, { bubbles: true });
          nameInput.dispatchEvent(event);
          phoneInput.dispatchEvent(event);
        });

        // Также триггерим blur (Tilda валидирует на blur)
        nameInput.dispatchEvent(new Event('blur', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('blur', { bubbles: true }));
        console.log('[ATLETIK] События input/change/blur отправлены');

        // Находим кнопку отправки
        var btn = tildaFormEl.querySelector('button[type="submit"]') || tildaFormEl.querySelector('.t-submit');
        if (!btn) {
          console.error('[ATLETIK] Кнопка отправки не найдена');
          showSuccess(name, phone);
          return;
        }
        console.log('[ATLETIK] Кнопка отправки найдена');

        // Устанавливаем статус кнопки (как делает Tilda перед отправкой)
        btn.tildaSendingStatus = '0';

        // Вызываем tildaForm.send()
        if (window.tildaForm && typeof window.tildaForm.send === 'function') {
          console.log('[ATLETIK] tildaForm.send() доступна, вызываем...');
          try {
            var formKey = document.getElementById('allrecords').getAttribute('data-tilda-formskey');
            var result = window.tildaForm.send(tildaFormEl, btn, 2, formKey);
            console.log('[ATLETIK] tildaForm.send() результат:', result);
          } catch (e) {
            console.error('[ATLETIK] Ошибка при tildaForm.send():', e);
            btn.click();
          }
        } else {
          console.log('[ATLETIK] tildaForm не загружена, используем прямой submit');
          tildaFormEl.submit();
        }

        // Показываем success через 2 секунды
        setTimeout(function() {
          showSuccess(name, phone);
        }, 2000);
      }

      // Проверяем, что tildaForm загружена, с retry
      function waitForTildaForm(retries) {
        if (window.tildaForm && typeof window.tildaForm.send === 'function') {
          sendViaTilda();
        } else if (retries > 0) {
          setTimeout(function() { waitForTildaForm(retries - 1); }, 200);
        } else {
          console.error('tildaForm не загрузилась после 10 попыток');
          // Всё равно пробуем submit
          sendViaTilda();
        }
      }

      waitForTildaForm(10); // 10 попыток × 200мс = 2 секунды
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



// ---------- Schedule Modal ----------
(function() {
  var overlay = document.getElementById('at-schedule-overlay');
  var modal = document.getElementById('at-schedule-modal');
  var closeBtn = document.getElementById('at-modal-close');
  var scheduleLink = document.getElementById('at-open-schedule');
  var scheduleLinkMobile = document.getElementById('at-open-schedule-mobile');

  function openModal(e) {
    if (e) e.preventDefault();
    if (!overlay) return;
    overlay.classList.add('at-open');
    document.body.style.overflow = 'hidden';
    // Триггерим resize чтобы виджет перерисовался
    setTimeout(function() {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('at-open');
    document.body.style.overflow = '';
  }

  if (scheduleLink) scheduleLink.addEventListener('click', openModal);
  if (scheduleLinkMobile) scheduleLinkMobile.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('at-open')) closeModal();
  });
})();


// ---------- FAQ Accordion ----------
(function() {
  var items = document.querySelectorAll('.at-faq-item');
  if (!items.length) return;
  items.forEach(function(item) {
    var question = item.querySelector('.at-faq-question');
    if (!question) return;
    question.addEventListener('click', function() {
      var isOpen = item.classList.contains('at-open');
      items.forEach(function(i) { i.classList.remove('at-open'); });
      if (!isOpen) item.classList.add('at-open');
    });
  });
})();
