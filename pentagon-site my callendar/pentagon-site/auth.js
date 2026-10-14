/* THE HEXAGON - login / sign up behaviour (used by login.html and signup.html) */
(function () {
  'use strict';
  var page = document.body.getAttribute('data-page');          // 'login' or 'signup'
  var NAMES = { student: 'Student', faculty: 'Faculty', school: 'School Administration', admin: 'Admin' };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.role-tab'));
  var roleLabel = document.getElementById('auth-role');
  var switchLink = document.getElementById('switch-link');
  var form = document.getElementById('auth-form');
  var status = document.getElementById('auth-status');

  /* ---------- which role? comes from the link, e.g. login.html?role=faculty ---------- */
  var role = new URLSearchParams(window.location.search).get('role');
  if (!NAMES[role]) role = 'student';
  var available = tabs.map(function (t) { return t.getAttribute('data-role'); });
  if (available.indexOf(role) === -1) role = available[0];     // e.g. "admin" has no sign-up tab

  function setRole(r) {
    role = r;
    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-role') === r); });
    if (roleLabel) roleLabel.textContent = NAMES[r];
    if (switchLink) {
      var other = page === 'login' ? 'signup.html' : 'login.html';
      // Admin has no public sign-up page
      switchLink.href = (page === 'login' && r === 'admin') ? 'login.html?role=admin' : other + '?role=' + r;
      if (page === 'login') switchLink.parentNode.style.visibility = (r === 'admin') ? 'hidden' : 'visible';
    }
    if (window.history && history.replaceState) history.replaceState(null, '', '?role=' + r);
    status.textContent = ''; status.className = 'auth-status';
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { setRole(t.getAttribute('data-role')); }); });
  setRole(role);

  /* ---------- show / hide password ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.pw-toggle'), function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentNode.querySelector('input');
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
    });
  });

  /* ---------- submit ---------- */
  function say(msg, bad) { status.textContent = msg; status.className = 'auth-status' + (bad ? ' err' : ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    if (page === 'signup' && form.password.value !== form.confirm.value) {
      say('The two passwords do not match.', true); return;
    }

    /* ==========================================================
       TODO (when your backend is ready): send the data to your server here.
       Example:
         fetch('/api/' + page, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(Object.assign({ role: role }, Object.fromEntries(new FormData(form))))
         }).then(function (r) { return r.json(); }).then(function () {
           window.location.href = '/dashboard';        // where the user lands after logging in
         });
       Until then, this only shows a message.
       ========================================================== */
    /* Students go straight to their dashboard.
       DEMO ONLY: this just remembers a "logged in" flag in the browser.
       When your backend exists, set this only after the server confirms the login. */
    if (role === 'student') {
      try { localStorage.setItem('hx_session', JSON.stringify({ role: 'student', email: form.elements.email.value, t: Date.now() })); } catch (err) {}
      window.location.href = 'student-dashboard.html';
      return;
    }

    if (role === 'faculty') {
      try { localStorage.setItem('hx_session', JSON.stringify({ role: 'faculty', email: form.elements.email.value, t: Date.now() })); } catch (err) {}
      window.location.href = 'teacher-profile.html';
      return;
    }

    say('The ' + NAMES[role] + ' ' + (page === 'login' ? 'log in' : 'sign up') + ' service is not connected yet.');
  });
})();
