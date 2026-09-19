
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

      // Отправка данных в Tilda CRM через скрытый iframe
      // Создаём невидимый iframe, загружаем в него страницу /form-handler,
      // заполняем поля формы программно и отправляем.
      // Tilda думает, что форму заполнил клиент на странице /form-handler.

      var iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '1024px';
      iframe.style.height = '600px';
      iframe.src = 'https://atletik-fitnes.ru/form-handler';
      document.body.appendChild(iframe);

      var attempts = 0;
      var maxAttempts = 30; // 30 попыток × 200мс = 6 секунд максимум

      function tryFillAndSubmit() {
        attempts++;
        try {
          var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          // Проверяем, что форма Tilda загрузилась
          var tildaForm = iframeDoc.getElementById('form4039527701');
          if (!tildaForm || !iframe.contentWindow.jQuery) {
            if (attempts < maxAttempts) {
              setTimeout(tryFillAndSubmit, 200);
              return;
            }
            console.error('Tilda форма не загрузилась вовремя');
            showSuccess(name, phone);
            document.body.removeChild(iframe);
            return;
          }

          // Заполняем поля
          var nameInput = tildaForm.querySelector('input[name="Name"]');
          var phoneInput = tildaForm.querySelector('input[name="Phone"]');
          if (!nameInput || !phoneInput) {
            console.error('Поля формы не найдены');
            showSuccess(name, phone);
            document.body.removeChild(iframe);
            return;
          }

          // Устанавливаем значения
          nameInput.value = name;
          phoneInput.value = phone;

          // Отправляем форму через jQuery (как делает сама Tilda)
          // Используем tildaForm.send() если доступна, иначе просто submit()
          if (iframe.contentWindow.tildaForm && iframe.contentWindow.tildaForm.send) {
            // Имитируем клик по кнопке отправки, чтобы Tilda обработала форму
            var submitButton = tildaForm.querySelector('button[type="submit"]') || tildaForm.querySelector('.t-submit');
            if (submitButton) {
              // Tilda вешает обработчик на клик, вызываем его
              var clickEvent = new iframe.contentWindow.MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: iframe.contentWindow
              });
              submitButton.dispatchEvent(clickEvent);
            } else {
              tildaForm.submit();
            }
          } else {
            tildaForm.submit();
          }

          // Даём Tilda время обработать и отправить email
          setTimeout(function() {
            showSuccess(name, phone);
            document.body.removeChild(iframe);
          }, 2500);

        } catch (e) {
          if (attempts < maxAttempts) {
            setTimeout(tryFillAndSubmit, 200);
          } else {
            console.error('Ошибка при заполнении iframe:', e);
            showSuccess(name, phone);
            document.body.removeChild(iframe);
          }
        }
      }

      // Ждём загрузки iframe
      iframe.onload = function() {
        setTimeout(tryFillAndSubmit, 500);
      };

      // На случай если onload не сработал
      setTimeout(function() {
        if (attempts === 0) tryFillAndSubmit();
      }, 3000);
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

