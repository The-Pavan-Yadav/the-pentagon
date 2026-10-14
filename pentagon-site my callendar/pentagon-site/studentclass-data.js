/* THE HEXAGON - shared helpers for the My class pages */
(function () {
  'use strict';
  window.HX = null;
  try { if (!localStorage.getItem('hx_session')) { location.replace('login.html?role=student'); return; } } catch (e) {}

  function read(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  var tt;
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('Browser storage is full.'); return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(u) { if (!u) return ''; try { var x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; } }
  function p2(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function fromKey(k) { return new Date(k + 'T00:00:00'); }
  function nice(k) { var d = fromKey(k); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
  function timeOf(ts) { return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* what the teacher classroom portal publishes (BACKEND: replace with a request to your server) */
  function classroom() {
    var c = read('hx_classroom_v1', {});
    return { classes: arr(c.classes), boardNotes: arr(c.boardNotes), aiNotes: arr(c.aiNotes), classAvg: c.classAvg || {}, attendance: c.attendance || null,
      leaderboard: arr(c.leaderboard), syllabus: arr(c.syllabus), library: arr(c.library), quizzes: arr(c.quizzes),
      assignments: arr(c.assignments), announcements: arr(c.announcements), journal: arr(c.journal) };
  }

  /* automatic summary (used when no AI service is connected) */
  var STOP = 'the and that with this from have were your their they them what when which will would about there been into also than then these those because while where over under such more most some only other very just can are for was has had not but you our out use used using'.split(' ');
  function words(t) { return (String(t).toLowerCase().match(/[a-z][a-z'-]{3,}/g) || []).filter(function (w) { return STOP.indexOf(w) < 0; }); }
  function summarize(text) {
    var sents = (String(text).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*/g) || []).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 25; });
    var freq = {}; words(text).forEach(function (w) { freq[w] = (freq[w] || 0) + 1; });
    var scored = sents.map(function (s, i) { return { s: s, i: i, sc: words(s).reduce(function (a, w) { return a + (freq[w] || 0); }, 0) / Math.sqrt(s.length) }; });
    var top = scored.slice().sort(function (a, b) { return b.sc - a.sc; }).slice(0, 5).sort(function (a, b) { return a.i - b.i; }).map(function (x) { return x.s; });
    var terms = Object.keys(freq).filter(function (w) { return w.length > 4; }).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 6);
    return { summary: top.length ? top : (String(text).trim() ? [String(text).trim().slice(0, 240)] : []), terms: terms };
  }
  function aiHTML(n) {
    var body = n.summary && n.summary.length ? '<ul>' + n.summary.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(n.text) + '</p>';
    var terms = n.terms && n.terms.length ? '<div class="terms">' + n.terms.map(function (t) { return '<span class="tagl">' + esc(t) + '</span>'; }).join('') + '</div>' : '';
    var label = n.source === 'auto' ? 'Automatic summary' : n.source === 'ai' ? 'AI notes' : 'AI notes';
    return '<article class="note"><div class="nh"><span class="tagl">' + label + '</span>' + (n.subject ? '<span class="tagl">' + esc(n.subject) + '</span>' : '') + '</div>' + body + terms + '</article>';
  }

  var S = read('hx_student_v2', {}), P = S.profile || null;
  var nav = document.getElementById('nav-av');
  if (nav) { nav.style.backgroundImage = P && P.avatar ? 'url("' + P.avatar + '")' : ''; nav.textContent = P && P.avatar ? '' : (P && P.name ? P.name.charAt(0).toUpperCase() : ''); }
  var out = document.getElementById('logout');
  if (out) out.addEventListener('click', function (e) { e.preventDefault(); try { localStorage.removeItem('hx_session'); } catch (x) {} location.href = 'index.html'; });
  document.addEventListener('click', function (e) { if (e.target.closest('[data-soon]')) { e.preventDefault(); toast('This section is coming soon.'); } });

  window.HX = { read: read, write: write, esc: esc, safeUrl: safeUrl, ymd: ymd, fromKey: fromKey, nice: nice, timeOf: timeOf, uid: uid,
    classroom: classroom, summarize: summarize, aiHTML: aiHTML, toast: toast, student: S, profile: P };
})();