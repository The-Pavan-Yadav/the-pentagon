/* THE HEXAGON - one day: classes, syllabus taught, 3 kinds of notes. Reads /calendar/day from your backend. */
(function () {
  'use strict';
  var A = window.HXAPI; if (!A) return;
  var esc = A.esc, $ = A.$, today = A.ymd(new Date());
  var qd = new URLSearchParams(location.search).get('d');
  var D8 = /^\d{4}-\d{2}-\d{2}$/.test(qd || '') ? qd : today, data = null, handle, G = { hw: [], bd: [] };
  var LK = 'hx_hw_local_v1';
  function localHW() { return A.arr((A.rd(LK, {}) || {})[D8]); }
  function setLocal(l) { var o = A.rd(LK, {}) || {}; o[D8] = l; A.wr(LK, o); }
  function tone(s) { var n = 0, i; for (i = 0; i < String(s).length; i++) n += String(s).charCodeAt(i); return ['', 't2', 't3'][n % 3]; }
  function empty(t) { return '<p class="muted sm" style="padding:6px 0">' + t + '</p>'; }

  /* header */
  var dt = A.fromKey(D8);
  function shift(n) { var d = new Date(dt); d.setDate(d.getDate() + n); return 'student-day.html?d=' + A.ymd(d); }
  $('#dtitle').textContent = dt.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#crumb-d').textContent = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
  $('#prevd').href = shift(-1); $('#nextd').href = shift(1);
  $('#back').href = $('#crumb-cal').href = 'student-calendar.html?m=' + D8.slice(0, 7);
  document.title = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' | THE HEXAGON';
  $('#pdf').addEventListener('click', function () { window.print(); });

  function render(d) {
    d = d || {};
    var classes = A.arr(d.classes), syl = A.arr(d.syllabus), hw = A.arr(d.homework), notes = d.notes || {};
    $('#dsub').textContent = d.dayNumber ? 'Academic year ' + (d.academicYear || '') + ' \u00b7 Day ' + d.dayNumber + (d.daysTotal ? ' of ' + d.daysTotal : '') : '';

    var taught = syl.filter(function (s) { return s.status === 'taught'; }).length, att = d.attendance;
    $('#sum').innerHTML = [['Classes', classes.length, ''], ['Attendance', att === 'present' ? 'Present' : att === 'absent' ? 'Absent' : '--', 'background:var(--gr)'], ['Topics covered', taught, 'background:var(--mt)'], ['Homework due', hw.length, '']].map(function (x) {
      return '<div class="sm" style="' + x[2] + '"><small>' + x[0] + '</small><b>' + esc(x[1]) + '</b></div>'; }).join('');

    $('#classes').innerHTML = classes.length ? classes.map(function (c) {
      var rec = A.safeUrl(c.recordingUrl), join = A.safeUrl(c.joinUrl);
      return '<div class="crow"><span class="tm">' + esc(A.timeOf(c.start)) + '</span><div class="nm"><b>' + esc(c.subject) + '</b><span class="muted sm">' + esc(c.teacher || '') + '</span></div>' +
        (c.topic ? '<span class="tag ' + tone(c.subject) + '">' + esc(c.topic) + '</span>' : '') +
        (join ? '<a class="btn sm" href="' + esc(join) + '" target="_blank" rel="noopener noreferrer"><i class="ti ti-video"></i>Join</a>' : '') +
        (rec ? '<a class="btn ghost sm" href="' + esc(rec) + '" target="_blank" rel="noopener noreferrer"><i class="ti ti-player-play"></i>Recording</a>' : '') + '</div>'; }).join('')
      : empty('No classes were scheduled on this day.');

    $('#syl-n').textContent = syl.length ? taught + ' of ' + syl.length + ' topics taught' : '';
    $('#syllabus').innerHTML = syl.length ? syl.map(function (s) {
      var done = s.status === 'taught';
      return '<div class="srow"><span class="ck' + (done ? '' : ' st') + '"><i class="ti ti-' + (done ? 'check' : 'clock') + '"></i></span><div style="flex:1"><b>' + esc(s.topic) + '</b><small>' +
        [s.unit, s.chapter, s.pages ? 'Pages ' + s.pages : '', s.exercise].filter(Boolean).map(esc).join(' &middot; ') + (done ? '' : ' &middot; Started, continues next class') + '</small></div><span class="tag ' + tone(s.subject) + '">' + esc(s.subject) + '</span></div>'; }).join('')
      : empty('Your teacher has not marked any syllabus topics for this day yet.');

    renderHW(A.arr(notes.handwritten)); renderBoard(A.arr(notes.board)); renderAI(notes.ai);

    $('#homework').innerHTML = hw.length ? hw.map(function (h) {
      return '<div style="margin-bottom:10px"><b style="font-size:14px">' + esc(h.title) + '</b><div class="muted sm">' + esc(h.subject || '') + (h.due ? ' &middot; Due ' + esc(A.nice(String(h.due).slice(0, 10))) : '') + '</div></div>'; }).join('') +
      '<a class="btn sm" style="width:100%;text-align:center" href="student-section.html?p=assignments">Open assignments</a>' : empty('No homework due.');
    var res = A.arr(d.resources);
    $('#resources').innerHTML = res.length ? res.map(function (r) {
      var u = A.safeUrl(r.url), ic = r.type === 'video' ? 'video' : r.type === 'link' ? 'link' : 'file-text';
      return '<div class="li"><i class="ti ti-' + ic + '"></i>' + (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(r.title) + '</a>' : esc(r.title)) + '</div>'; }).join('') : empty('No resources shared for this day.');
  }

  /* ----- my handwritten notes ----- */
  function hwItems(list) { return list.concat(localHW().map(function (l) { return { id: l.id, imageUrl: l.img, page: l.page, local: true }; })); }
  function renderHW(server) {
    var items = hwItems(server); G.hw = items;
    $('#hwnote').innerHTML = '<div class="cardh"><h2><i class="ti ti-pencil" style="color:var(--ac)"></i>My handwritten notes</h2></div><div class="gal">' +
      items.map(function (n, i) { var u = A.safeImg(n.imageUrl); return '<button type="button" class="th" data-g="hw" data-i="' + i + '">' + (u ? '<img src="' + esc(u) + '" alt="Notebook page ' + (n.page || i + 1) + '" loading="lazy">' : 'Page ' + (i + 1)) + '</button>'; }).join('') +
      '<label class="th add noprint"><i class="ti ti-camera-plus"></i>Add page ' + (items.length + 1) + '<input type="file" accept="image/*"></label></div>' +
      '<p class="cap">' + (items.length ? items.length + (items.length === 1 ? ' notebook page' : ' notebook pages') : 'No pages yet. Add a photo of your notebook.') + (items.some(function (n) { return n.local; }) ? ' &middot; some saved on this device only' : '') + '</p>' +
      '<button class="btn ghost sm noprint" style="width:100%" data-act="tr-hw"><i class="ti ti-text-recognition"></i>Convert handwriting to text</button>' + texts(items);
  }
  /* ----- teacher's board notes ----- */
  function renderBoard(items) {
    G.bd = items;
    var who = items.map(function (n) { return n.source === 'smartboard' ? 'Smart board' : n.teacher; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).join(', ');
    $('#bdnote').innerHTML = '<div class="cardh"><h2><i class="ti ti-presentation" style="color:var(--mtd)"></i>Teacher\'s board notes</h2>' + (items.length ? '<span class="tag t3">Published</span>' : '') + '</div>' +
      (items.length ? '<div class="gal">' + items.map(function (n, i) { var u = A.safeImg(n.imageUrl); return '<button type="button" class="th" data-g="bd" data-i="' + i + '" style="background:var(--mt)">' + (u ? '<img src="' + esc(u) + '" alt="Board photo ' + (i + 1) + '" loading="lazy">' : 'Board ' + (i + 1)) + '</button>'; }).join('') + '</div>' +
        '<p class="cap">' + items.length + ' board ' + (items.length === 1 ? 'photo' : 'photos') + (who ? ' &middot; ' + esc(who) : '') + '</p><button class="btn ghost sm noprint" style="width:100%" data-act="tr-bd"><i class="ti ti-text-recognition"></i>Convert board to text</button>' + texts(items)
        : empty('Board notes appear here automatically after class, from your teacher and the classroom smart board.'));
  }
  function texts(items) { var t = items.filter(function (n) { return n.text; }); return t.length ? '<div class="txt">' + t.map(function (n) { return esc(n.text); }).join('\n\n') + '</div>' : ''; }

  /* ----- AI structured notes ----- */
  function list(a) { a = A.arr(a); return a.length ? '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function renderAI(ai) {
    var h = '<div class="cardh"><h2><i class="ti ti-sparkles" style="color:var(--ac)"></i>AI structured notes</h2><div class="noprint" style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn ghost sm" data-act="regen">Regenerate</button><button class="btn sm" data-act="cards">Flashcards</button></div></div>';
    if (!ai) { $('#ainote').innerHTML = h + empty('AI notes appear here automatically after class, once the board notes arrive. Your AI agent builds them from the teacher\'s board notes and your handwritten pages.'); return; }
    if (ai.status === 'pending') { $('#ainote').innerHTML = h + '<p class="wait">Your AI agent is preparing today\'s notes...</p>'; return; }
    var f = A.arr(ai.formulas), terms = A.arr(ai.terms);
    $('#ainote').innerHTML = h + '<p class="muted sm">' + (ai.sources ? 'Built from ' + esc(ai.sources) + '. ' : '') + 'Check the notes against your textbook.' + (ai.generatedAt ? ' Updated ' + esc(A.timeOf(ai.generatedAt)) + '.' : '') + '</p>' +
      (ai.summary ? '<h4>SUMMARY</h4><p>' + esc(ai.summary) + '</p>' : '') +
      (A.arr(ai.keyConcepts).length ? '<h4>KEY CONCEPTS</h4>' + list(ai.keyConcepts) : '') +
      (f.length ? '<h4>FORMULAS</h4>' + f.map(function (x) { return '<div class="fm">' + esc(x) + '</div>'; }).join('') : '') +
      (A.arr(ai.mistakes).length ? '<h4>COMMON MISTAKES</h4>' + list(ai.mistakes) : '') +
      (terms.length ? '<h4>KEY TERMS</h4>' + terms.map(function (t, i) { return '<span class="tag ' + ['', 't2', 't3'][i % 3] + '">' + esc(t) + '</span>'; }).join('') : '') +
      '<div class="noprint" style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn ghost sm" data-act="quiz"><i class="ti ti-help-circle"></i>Practice quiz</button><button class="btn ghost sm" data-act="aipdf"><i class="ti ti-file-download"></i>Download as PDF</button></div>';
  }

  /* ----- actions ----- */
  function need() { if (A.connected()) return true; A.toast('This needs the backend. Set API_BASE in hx-config.js.'); return false; }
  function transcribe(items) {
    if (!need()) return;
    var todo = items.filter(function (n) { return !n.text && !n.local; });
    if (!todo.length) { A.toast(items.some(function (n) { return n.local; }) ? 'Pages saved on this device cannot be converted yet.' : 'Nothing left to convert.'); return; }
    A.toast('Converting...');
    Promise.all(todo.map(function (n) { return A.post('/notes/' + encodeURIComponent(n.id) + '/transcribe').then(function (r) { n.text = (r && r.text) || ''; }); }))
      .then(function () { render(data); }).catch(function () { A.toast('The conversion service did not respond.'); });
  }
  function shrink(file, max, q, blob, cb) {
    var r = new FileReader();
    r.onload = function () {
      var i = new Image();
      i.onload = function () {
        var s = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = Math.round(i.width * s); c.height = Math.round(i.height * s);
        c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); if (blob) c.toBlob(cb, 'image/jpeg', q); else cb(c.toDataURL('image/jpeg', q));
      };
      i.onerror = function () { A.toast('That file is not a readable image.'); }; i.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function keepLocal(file) {
    shrink(file, 1000, 0.7, false, function (u) { var l = localHW(); l.push({ id: A.uid(), img: u, page: l.length + 1 }); setLocal(l); render(data); A.toast('Saved on this device only. It will not sync until the backend is connected.'); });
  }
  function upload(file) {
    if (!file) return;
    shrink(file, 1600, 0.85, true, function (b) {
      if (!A.connected()) { keepLocal(file); return; }
      var f = new FormData(); f.append('date', D8); f.append('page', String(G.hw.length + 1)); f.append('image', b, 'page.jpg');
      A.upload('/notes/handwritten', f).then(function () { A.toast('Page uploaded'); handle.refresh(); }).catch(function () { keepLocal(file); });
    });
  }
  function dlg(id, html) { $(id + ' > div:first-child').innerHTML = html; if (!$(id).open) $(id).showModal(); }
  function flash() {
    if (!need()) return;
    A.get('/ai/flashcards', { date: D8 }).then(function (r) {
      var c = A.arr(r && r.cards), i = 0, back = false;
      if (!c.length) { A.toast('No flashcards yet.'); return; }
      function draw() { dlg('#dlg-cards', '<h2>Flashcards (' + (i + 1) + ' of ' + c.length + ')</h2><div class="fc" id="fc">' + esc(back ? c[i].a : c[i].q) + '</div><p class="muted sm">Click the card to flip it.</p><div class="acts" style="justify-content:space-between"><button class="btn ghost sm" id="fp">Previous</button><button class="btn sm" id="fn">Next</button></div>');
        $('#fc').onclick = function () { back = !back; draw(); }; $('#fp').onclick = function () { i = (i + c.length - 1) % c.length; back = false; draw(); }; $('#fn').onclick = function () { i = (i + 1) % c.length; back = false; draw(); }; }
      draw();
    }).catch(function () { A.toast('Flashcards are not available yet.'); });
  }
  function quiz() {
    if (!need()) return;
    A.get('/ai/quiz', { date: D8 }).then(function (r) {
      var q = A.arr(r && r.questions); if (!q.length) { A.toast('No practice quiz yet.'); return; }
      dlg('#dlg-cards', '<h2>Practice quiz</h2><form id="qf">' + q.map(function (x, i) { return '<fieldset style="border:0;padding:0;margin:0 0 14px"><legend style="font-weight:600">' + (i + 1) + '. ' + esc(x.q) + '</legend>' + A.arr(x.options).map(function (o, j) { return '<label class="opt"><input type="radio" name="q' + i + '" value="' + j + '" required>' + esc(o) + '</label>'; }).join('') + '</fieldset>'; }).join('') + '<div class="acts"><button class="btn" type="submit">Check answers</button></div></form>');
      $('#qf').onsubmit = function (e) { e.preventDefault(); var s = 0; q.forEach(function (x, i) { if (+e.target.elements['q' + i].value === x.answer) s++; }); dlg('#dlg-cards', '<h2>Your score</h2><p class="bigscore" style="font:600 36px Orbitron,sans-serif;color:var(--ac);margin:10px 0">' + s + ' / ' + q.length + '</p>'); };
    }).catch(function () { A.toast('The practice quiz is not available yet.'); });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('.th[data-g]');
    if (t) {
      var n = G[t.getAttribute('data-g')][+t.getAttribute('data-i')], u = A.safeImg(n && n.imageUrl); if (!n) return;
      dlg('#dlg-img', (u ? '<img src="' + esc(u) + '" alt="" style="width:100%;border-radius:10px">' : '') + (n.text ? '<div class="txt">' + esc(n.text) + '</div>' : '') +
        (n.local ? '<div class="acts" style="justify-content:flex-start"><button class="btn ghost sm" data-act="dellocal" data-id="' + esc(n.id) + '">Delete this page</button></div>' : ''));
      return;
    }
    var c = e.target.closest('[data-close]'); if (c) { c.closest('dialog').close(); return; }
    var b = e.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act');
    if (a === 'tr-hw') transcribe(G.hw); else if (a === 'tr-bd') transcribe(G.bd);
    else if (a === 'regen') { if (need()) A.post('/ai/notes/generate', { date: D8 }).then(function () { A.toast('Your AI agent is preparing new notes.'); handle.refresh(); }).catch(function () { A.toast('The AI agent did not respond.'); }); }
    else if (a === 'cards') flash(); else if (a === 'quiz') quiz();
    else if (a === 'aipdf') { document.body.classList.add('pa'); window.print(); setTimeout(function () { document.body.classList.remove('pa'); }, 500); }
    else if (a === 'dellocal') { setLocal(localHW().filter(function (x) { return x.id !== b.getAttribute('data-id'); })); $('#dlg-img').close(); render(data); }
  });
  document.addEventListener('change', function (e) { if (e.target.matches('#hwnote input[type=file]')) { upload(e.target.files[0]); e.target.value = ''; } });
  $('#f-doubt').addEventListener('submit', function (e) {
    e.preventDefault(); if (!need()) return; var f = e.target;
    A.post('/doubts', { date: D8, text: f.elements.t.value.trim() }).then(function () { f.reset(); A.toast('Your doubt was sent to your teacher.'); }).catch(function () { A.toast('Could not send your doubt. Try again.'); });
  });
  $('#remind').addEventListener('click', function () {
    if (!need()) return;
    A.post('/reminders', { date: D8, offsets: [1, 3, 7] }).then(function () { A.toast('Reminders set for 1, 3 and 7 days.'); }).catch(function () { A.toast('Could not set reminders.'); });
  });

  handle = A.watch(function () { return A.get('/calendar/day', { date: D8 }); }, function (d) { data = d; render(d); }, A.statusFn());
})();