/* THE HEXAGON - My class sections: journal, syllabus, library, quiz, assignments, announcements, notes, report */
(function () {
  'use strict';
  var H = window.HX; if (!H) return;
  var C = H.classroom(), esc = H.esc, nice = H.nice, marks = (H.student.marks || []);
  var W = H.read('hx_classwork_v1', {});
  ['done', 'topics', 'saved', 'quiz', 'subm'].forEach(function (k) { W[k] = W[k] || {}; }); W.journal = W.journal || [];
  var N = H.read('hx_notes_v1', {}), A = H.read('hx_ainotes_v1', {});
  var $ = function (s) { return document.querySelector(s); }, root = $('#sec');
  var st = { lib: { q: '', type: 'All', saved: false }, qz: { id: null, res: null }, asg: 'all', nt: { tab: 'mine', q: '' } };
  function save() { H.write('hx_classwork_v1', W); }
  function empty(t) { return '<div class="empty">' + t + '</div>'; }
  function head(t) { return '<div class="head"><h2>' + t + '</h2></div>'; }
  function chp(label, on, act, v) { return '<button type="button" class="chp' + (on ? ' on' : '') + '" data-act="' + act + '" data-v="' + esc(v) + '">' + esc(label) + '</button>'; }
  function avgOf(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; }

  /* ---------- school journal ---------- */
  function journal() {
    var feed = C.journal.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var mine = W.journal.slice().sort(function (a, b) { return b.created - a.created; });
    return '<div class="two"><section class="card">' + head('School updates') + (feed.length ? feed.map(function (e) {
      return '<article class="entry"><small>' + esc(nice(e.date)) + '</small><b>' + esc(e.title) + '</b><p>' + esc(e.text) + '</p></article>'; }).join('') : empty('Your teacher has not posted daily notes yet.')) + '</section>' +
      '<section class="card">' + head('My journal') + '<form id="jf"><textarea name="t" required maxlength="1000" placeholder="Write what you learned today..."></textarea><div class="acts"><button class="btn sm" type="submit">Save entry</button></div></form>' +
      mine.map(function (e) { return '<article class="entry"><small>' + esc(nice(H.ymd(new Date(e.created)))) + '</small><p>' + esc(e.t) + '</p><button class="x" data-act="jdel" data-id="' + e.id + '" title="Delete">&#10005;</button></article>'; }).join('') + '</section></div>';
  }

  /* ---------- syllabus ---------- */
  function tid(s, u, t) { return t.id || (s.subject + '|' + u.title + '|' + t.title); }
  function topicTotals() {
    var t = 0, d = 0;
    C.syllabus.forEach(function (s) { (s.units || []).forEach(function (u) { (u.topics || []).forEach(function (tp) { t++; if (W.topics[tid(s, u, tp)]) d++; }); }); });
    return { t: t, d: d };
  }
  function syllabus() {
    if (!C.syllabus.length) return empty('Your teacher has not published the syllabus yet.');
    var tot = topicTotals(), pc = tot.t ? Math.round(tot.d / tot.t * 100) : 0;
    return '<section class="card sumcard"><b>Overall progress</b><div class="pbar"><i style="width:' + pc + '%"></i></div><b>' + pc + '% (' + tot.d + ' of ' + tot.t + ' topics)</b></section><div class="gridc">' +
      C.syllabus.map(function (s) {
        var t = 0, d = 0, units = (s.units || []).map(function (u) {
          return '<div class="unit"><h4>' + esc(u.title) + '</h4>' + (u.topics || []).map(function (tp) {
            var id = tid(s, u, tp), on = !!W.topics[id]; t++; if (on) d++;
            return '<label class="chk"><input type="checkbox" data-act="topic" data-id="' + esc(id) + '"' + (on ? ' checked' : '') + '><span>' + esc(tp.title) + '</span></label>'; }).join('') + '</div>'; }).join('');
        var p = t ? Math.round(d / t * 100) : 0;
        return '<section class="card"><div class="head"><h2>' + esc(s.subject) + '</h2><b>' + p + '%</b></div><div class="pbar"><i style="width:' + p + '%"></i></div>' + units + '</section>'; }).join('') + '</div>';
  }

  /* ---------- library ---------- */
  function libList() {
    var q = st.lib.q.toLowerCase(), list = C.library.filter(function (r) {
      return (st.lib.type === 'All' || r.type === st.lib.type) && (!st.lib.saved || W.saved[r.id]) && (!q || (r.title + ' ' + (r.subject || '') + ' ' + (r.desc || '')).toLowerCase().indexOf(q) > -1); });
    return list.length ? '<div class="gridc">' + list.map(function (r) {
      var u = H.safeUrl(r.link);
      return '<section class="card lib-card"><span class="tagl">' + esc(r.type || 'Resource') + '</span><h3>' + esc(r.title) + '</h3><p>' + esc(r.subject || '') + (r.desc ? ' &middot; ' + esc(r.desc) : '') + '</p><div class="acts">' +
        (u ? '<a class="btn sm" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">Open</a>' : '') +
        '<button class="btn ghost sm" data-act="save" data-id="' + esc(r.id) + '">' + (W.saved[r.id] ? 'Saved' : 'Save') + '</button></div></section>'; }).join('') + '</div>'
      : empty(C.library.length ? 'Nothing matches your search.' : 'Your teachers have not added library resources yet.');
  }
  function library() {
    var types = ['All'].concat(C.library.map(function (r) { return r.type; }).filter(function (t, i, a) { return t && a.indexOf(t) === i; }));
    return '<div class="tools"><input id="lib-q" type="search" placeholder="Search the library" value="' + esc(st.lib.q) + '">' + types.map(function (t) { return chp(t, st.lib.type === t, 'lib-type', t); }).join('') +
      '<button type="button" class="chp' + (st.lib.saved ? ' on' : '') + '" data-act="lib-saved">Saved only</button></div><div id="lib-res">' + libList() + '</div>';
  }

  /* ---------- quiz ---------- */
  function quiz() {
    var q = st.qz, z = q.id ? C.quizzes.filter(function (x) { return x.id === q.id; })[0] : null;
    if (z) return q.res ? quizResult(z) : quizForm(z);
    if (!C.quizzes.length) return empty('No quizzes yet. Your teachers will publish quizzes here.');
    return '<div class="gridc">' + C.quizzes.map(function (z) {
      var b = W.quiz[z.id], n = (z.questions || []).length;
      return '<section class="card">' + head(esc(z.title)) + '<p class="muted sm">' + esc(z.subject || '') + ' &middot; ' + n + ' questions</p><p style="margin:10px 0">' + (b ? 'Best score: <b>' + b.score + '/' + b.total + '</b>' : 'Not attempted yet') +
        '</p><button class="btn sm" data-act="qstart" data-id="' + esc(z.id) + '">' + (b ? 'Try again' : 'Start quiz') + '</button></section>'; }).join('') + '</div>';
  }
  function quizForm(z) {
    return '<form id="qf" class="card"><div class="head"><h2>' + esc(z.title) + '</h2><button type="button" class="btn ghost sm" data-act="qback">Back</button></div>' + (z.questions || []).map(function (q, i) {
      return '<fieldset class="qq"><legend>' + (i + 1) + '. ' + esc(q.q) + '</legend>' + (q.options || []).map(function (o, j) { return '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '" required><span>' + esc(o) + '</span></label>'; }).join('') + '</fieldset>'; }).join('') +
      '<div class="acts"><button class="btn" type="submit">Submit quiz</button></div></form>';
  }
  function quizResult(z) {
    var r = st.qz.res, total = (z.questions || []).length;
    return '<section class="card"><div class="head"><h2>' + esc(z.title) + ': result</h2><button class="btn ghost sm" data-act="qback">Back to quizzes</button></div><p class="bigscore">' + r.score + ' / ' + total + '</p>' +
      (z.questions || []).map(function (q, i) { var ok = r.ans[i] === q.answer;
        return '<div class="qr ' + (ok ? 'ok' : 'no') + '"><b>' + (i + 1) + '. ' + esc(q.q) + '</b><p>Your answer: ' + esc((q.options || [])[r.ans[i]] || '-') + (ok ? '' : ' &middot; Correct answer: ' + esc((q.options || [])[q.answer])) + '</p></div>'; }).join('') + '</section>';
  }

  /* ---------- assignments ---------- */
  function asgStatus(a) { return W.done[a.id] ? 'done' : (a.due && a.due < Date.now() ? 'overdue' : 'pending'); }
  function assignments() {
    var list = C.assignments.slice().sort(function (a, b) { return (a.due || 0) - (b.due || 0); }).filter(function (a) { return st.asg === 'all' || asgStatus(a) === st.asg; });
    var chips = [['all', 'All'], ['pending', 'Pending'], ['overdue', 'Overdue'], ['done', 'Done']].map(function (c) { return chp(c[1], st.asg === c[0], 'asg-f', c[0]); }).join('');
    return '<div class="tools">' + chips + '</div><section class="card">' + (list.length ? list.map(function (a) {
      var s = asgStatus(a), u = H.safeUrl(a.link);
      return '<div class="asg"><div><b>' + esc(a.title) + '</b><small>' + esc(a.subject || '') + (a.due ? ' &middot; Due ' + esc(new Date(a.due).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })) : '') + '</small>' + (a.desc ? '<p>' + esc(a.desc) + '</p>' : '') + '</div>' +
        '<div class="ar"><span class="stt s-' + s + '">' + (s === 'done' ? 'Done' : s === 'overdue' ? 'Overdue' : 'Pending') + '</span>' +
        '<input data-act="subm" data-id="' + esc(a.id) + '" value="' + esc(W.subm[a.id] || '') + '" placeholder="Submission link or note" maxlength="300">' +
        '<div class="acts" style="margin:0">' + (u ? '<a class="btn ghost sm" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">Open</a>' : '') + '<button class="btn sm" data-act="adone" data-id="' + esc(a.id) + '">' + (W.done[a.id] ? 'Mark as not done' : 'Mark as done') + '</button></div></div></div>'; }).join('')
      : empty(C.assignments.length ? 'Nothing here.' : 'Your teachers have not given any assignments yet.')) + '</section>';
  }

  /* ---------- announcements ---------- */
  function announcements() {
    var l = C.announcements.slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    return '<section class="card">' + (l.length ? l.map(function (a) {
      return '<article class="entry"><small>' + esc(a.at ? new Date(a.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + H.timeOf(a.at) : '') + (a.teacher ? ' · ' + esc(a.teacher) : '') + '</small><b>' + esc(a.title) + '</b><p>' + esc(a.text) + '</p></article>'; }).join('')
      : empty('No announcements yet.')) + '</section>';
  }

  /* ---------- class notes (all days) ---------- */
  function allNotes(kind) {
    var out = [];
    if (kind === 'mine') Object.keys(N).forEach(function (k) { (N[k] || []).forEach(function (n) { out.push({ date: k, subject: n.subject, text: n.text }); }); });
    else if (kind === 'board') C.boardNotes.forEach(function (n) { out.push({ date: n.date, subject: n.subject, title: n.title, text: n.text }); });
    else { C.aiNotes.forEach(function (n) { out.push(Object.assign({}, n)); }); Object.keys(A).forEach(function (k) { (A[k] || []).forEach(function (n) { out.push(Object.assign({ date: k }, n)); }); }); }
    return out.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }
  function ntList() {
    var q = st.nt.q.toLowerCase(), list = allNotes(st.nt.tab).filter(function (n) { return !q || (String(n.subject) + ' ' + (n.title || '') + ' ' + (n.text || '') + ' ' + (n.summary || []).join(' ')).toLowerCase().indexOf(q) > -1; });
    return list.length ? list.map(function (n) {
      var link = '<a href="student-calendar.html?d=' + esc(n.date) + '">' + esc(nice(n.date)) + '</a>';
      if (st.nt.tab === 'ai') return '<div class="muted sm" style="margin:10px 0 4px">' + link + '</div>' + H.aiHTML(n);
      return '<article class="note"><div class="nh"><span class="tagl">' + esc(n.subject || 'General') + '</span>' + link + '</div>' + (n.title ? '<b class="t">' + esc(n.title) + '</b>' : '') + '<p>' + esc(n.text) + '</p></article>'; }).join('')
      : empty('No notes here yet. Add notes from your <a href="student-calendar.html">calendar</a>.');
  }
  function notes() {
    return '<div class="tools">' + [['mine', 'My notes'], ['board', 'Teacher board notes'], ['ai', 'AI notes']].map(function (t) { return chp(t[1], st.nt.tab === t[0], 'nt-tab', t[0]); }).join('') +
      '<input id="nt-q" type="search" placeholder="Search notes" value="' + esc(st.nt.q) + '"></div><section class="card" id="nt-res">' + ntList() + '</section>';
  }

  /* ---------- performance report ---------- */
  function report() {
    var by = {}; marks.forEach(function (m) { (by[m.subject] = by[m.subject] || []).push(m.marks); });
    var cmap = {}; Object.keys(C.classAvg).forEach(function (k) { cmap[k.toLowerCase()] = C.classAvg[k]; });
    var rows = Object.keys(by).map(function (s) { var me = avgOf(by[s]), c = cmap[s.toLowerCase()]; return { s: s, me: me, c: typeof c === 'number' ? c : null }; });
    var mine = avgOf(rows.map(function (r) { return r.me; })), cls = avgOf(rows.filter(function (r) { return r.c != null; }).map(function (r) { return r.c; }));
    var a = C.attendance, att = a && a.present + a.absent ? Math.round(a.present / (a.present + a.absent) * 100) : null;
    var tot = topicTotals(), qs = Object.keys(W.quiz).map(function (k) { return W.quiz[k].score / W.quiz[k].total * 100; });
    var done = C.assignments.filter(function (x) { return W.done[x.id]; }).length;
    function k2(l, v) { return '<div class="k2"><small>' + l + '</small><b>' + v + '</b></div>'; }
    var p = H.profile;
    return '<section class="card"><div class="head"><h2>' + esc(p ? p.name : 'Student') + (p ? ' &middot; ' + esc(p.grade) : '') + '</h2><button class="btn sm noprint" data-act="print"><i class="ti ti-printer"></i>Print report</button></div>' +
      '<div class="kpis2">' + k2('Your average', mine == null ? '--' : mine.toFixed(1) + '%') + k2('Class average', cls == null ? '--' : cls.toFixed(1) + '%') + k2('Attendance', att == null ? '--' : att + '%') +
      k2('Syllabus done', tot.t ? Math.round(tot.d / tot.t * 100) + '%' : '--') + k2('Assignments done', C.assignments.length ? done + '/' + C.assignments.length : '--') + k2('Quiz average', qs.length ? Math.round(avgOf(qs)) + '%' : '--') + '</div>' +
      (rows.length ? '<table class="tbl"><thead><tr><th>Subject</th><th>You</th><th>Class average</th><th>Difference</th></tr></thead><tbody>' + rows.map(function (r) {
        var d = r.c == null ? null : r.me - r.c;
        return '<tr><td>' + esc(r.s) + '</td><td>' + r.me.toFixed(1) + '%</td><td>' + (r.c == null ? '--' : r.c.toFixed(1) + '%') + '</td><td>' + (d == null ? '--' : '<span class="' + (d >= 0 ? 'up' : 'dn2') + '">' + (d >= 0 ? '+' : '') + d.toFixed(1) + '</span>') + '</td></tr>'; }).join('') + '</tbody></table>'
        : empty('Add subject marks on your <a href="student-dashboard.html#performance">dashboard</a> to build your report.')) + '</section>';
  }

  /* ---------- page switcher ---------- */
  var PAGES = {
    journal: { t: 'School journal', d: 'Daily notes, announcements and updates', fn: journal },
    syllabus: { t: 'Syllabus', d: 'Track your syllabus and progress', fn: syllabus },
    library: { t: 'Library', d: 'E-books, study material and resources', fn: library },
    quiz: { t: 'Quiz', d: 'Practice, test and improve', fn: quiz },
    assignments: { t: 'Assignments', d: 'Pending and completed tasks', fn: assignments },
    announcements: { t: 'Class announcements', d: 'Latest updates from your teachers', fn: announcements },
    notes: { t: 'Class notes', d: 'Your notes, teacher board notes and AI notes', fn: notes },
    report: { t: 'Performance report', d: 'Detailed subject-wise report', fn: report }
  };
  var p = new URLSearchParams(location.search).get('p'); if (!PAGES[p]) p = 'journal';
  $('#snav').innerHTML = Object.keys(PAGES).map(function (k) { return '<a href="student-section.html?p=' + k + '"' + (k === p ? ' class="on"' : '') + '>' + PAGES[k].t + '</a>'; }).join('');
  $('#pg-title').textContent = PAGES[p].t; $('#pg-desc').textContent = PAGES[p].d; $('#crumb').textContent = PAGES[p].t; document.title = PAGES[p].t + ' | THE HEXAGON';
  function show() { root.innerHTML = PAGES[p].fn(); }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act'), id = b.getAttribute('data-id'), v = b.getAttribute('data-v');
    if (a === 'jdel') W.journal = W.journal.filter(function (x) { return x.id !== id; });
    else if (a === 'lib-type') { st.lib.type = v; show(); return; }
    else if (a === 'lib-saved') { st.lib.saved = !st.lib.saved; show(); return; }
    else if (a === 'save') W.saved[id] = !W.saved[id];
    else if (a === 'qstart') { st.qz = { id: id, res: null }; show(); window.scrollTo(0, 0); return; }
    else if (a === 'qback') { st.qz = { id: null, res: null }; show(); return; }
    else if (a === 'asg-f') { st.asg = v; show(); return; }
    else if (a === 'adone') W.done[id] = !W.done[id];
    else if (a === 'nt-tab') { st.nt.tab = v; show(); return; }
    else if (a === 'print') { window.print(); return; }
    else return;
    save(); show();
  });
  root.addEventListener('change', function (e) {
    var t = e.target, a = t.getAttribute('data-act'), id = t.getAttribute('data-id');
    if (a === 'topic') { W.topics[id] = t.checked; save(); show(); }
    else if (a === 'subm') { W.subm[id] = t.value.trim(); save(); H.toast('Saved'); }
  });
  root.addEventListener('input', function (e) {
    if (e.target.id === 'lib-q') { st.lib.q = e.target.value; $('#lib-res').innerHTML = libList(); }
    else if (e.target.id === 'nt-q') { st.nt.q = e.target.value; $('#nt-res').innerHTML = ntList(); }
  });
  root.addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    if (f.id === 'jf') { var t = f.elements.t.value.trim(); if (!t) return; W.journal.push({ id: H.uid(), t: t, created: Date.now() }); save(); show(); H.toast('Entry saved'); }
    else if (f.id === 'qf') {
      var z = C.quizzes.filter(function (x) { return x.id === st.qz.id; })[0], ans = [], score = 0;
      (z.questions || []).forEach(function (q, i) { var v = +f.elements['q' + i].value; ans.push(v); if (v === q.answer) score++; });
      var total = (z.questions || []).length, prev = W.quiz[z.id];
      if (!prev || score > prev.score) W.quiz[z.id] = { score: score, total: total, at: Date.now() };
      save(); st.qz.res = { score: score, ans: ans }; show(); window.scrollTo(0, 0);
    }
  });
  window.addEventListener('storage', function (e) { if (e.key === 'hx_classroom_v1') { C = H.classroom(); show(); } });
  show();
})();