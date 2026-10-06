// Standalone slide viewer: keys ← → / Space / PgUp PgDn, Home/End, F fullscreen,
// G or Esc overview, N speaker notes, type a number + Enter to jump. URL hash = slide number.
(function () {
  'use strict';
  var stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(stage.children).filter(function (el) { return el.tagName === 'SECTION'; });
  var hud = document.getElementById('hud');
  var countEl = document.getElementById('count');
  var notesEl = document.getElementById('notes');
  var overview = document.getElementById('overview');
  var NOTES = window.DECK_NOTES || [];
  var SECTIONS = window.DECK_SECTIONS || {};
  var cur = -1, typed = '', hudTimer = null;

  function fit() {
    var w = window.innerWidth, h = window.innerHeight;
    var s = Math.min(w / 1920, h / 1080);
    stage.style.transform = 'translate(' + (w - 1920 * s) / 2 + 'px,' + (h - 1080 * s) / 2 + 'px) scale(' + s + ')';
  }

  // Clips with sound: browsers refuse audible autoplay until the viewer has interacted with the
  // page. If that happens, play muted and turn the sound on at the next key press, click or tap.
  var pendingUnmute = [];
  function playClip(v) {
    try { v.currentTime = 0; } catch (e) {}
    var p = v.play();
    if (p && p.catch) p.catch(function () {
      if (v.muted || v.classList.contains('gifv')) return;
      v.muted = true; v.dataset.wantSound = '1'; pendingUnmute.push(v);
      v.play().catch(function () {});
    });
  }
  function unmutePending() {
    pendingUnmute.splice(0).forEach(function (v) { if (v.dataset.wantSound) { v.muted = false; delete v.dataset.wantSound; } });
  }
  ['keydown', 'pointerdown', 'touchstart'].forEach(function (t) { document.addEventListener(t, unmutePending, true); });

  function videos(sec) { return Array.prototype.slice.call(sec.querySelectorAll('video.clip')); }

  function go(n, fromHash) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur) return;
    if (cur >= 0) {
      slides[cur].classList.remove('active');
      videos(slides[cur]).forEach(function (v) { v.pause(); });
    }
    cur = n;
    var sec = slides[cur];
    sec.classList.add('active');
    videos(sec).forEach(playClip);
    countEl.textContent = (cur + 1) + ' / ' + slides.length;
    if (!fromHash) history.replaceState(null, '', '#' + (cur + 1));
    renderNotes();
    // warm up the next slide's media
    var nx = slides[cur + 1];
    if (nx) videos(nx).forEach(function (v) { v.preload = 'auto'; });
  }

  function renderNotes() {
    if (notesEl.hidden) return;
    var t = NOTES[cur] || '(no notes)';
    notesEl.innerHTML = '';
    var l = document.createElement('span'); l.className = 'lbl'; l.textContent = 'Notes · slide ' + (cur + 1);
    notesEl.appendChild(l); notesEl.appendChild(document.createTextNode(t));
  }

  function toggleNotes() { notesEl.hidden = !notesEl.hidden; renderNotes(); }

  function fullscreen() {
    var d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
  }

  var built = false;
  function buildOverview() {
    if (built) return; built = true;
    var S = 1 / 8;
    slides.forEach(function (sec, i) {
      if (SECTIONS[i + 1]) {
        var h = document.createElement('div'); h.className = 'sec'; h.textContent = SECTIONS[i + 1];
        overview.appendChild(h);
      }
      var th = document.createElement('div'); th.className = 'thumb'; th.tabIndex = 0; th.dataset.i = i;
      var c = sec.cloneNode(true);
      c.classList.remove('active'); c.removeAttribute('id');
      Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (e) { if (e.tagName.toLowerCase() !== 'lineargradient' && e.tagName.toLowerCase() !== 'radialgradient') e.removeAttribute('id'); });
      Array.prototype.forEach.call(c.querySelectorAll('video'), function (v) {
        var img = document.createElement('img'); img.src = v.getAttribute('poster'); img.setAttribute('style', v.getAttribute('style')); img.alt = '';
        v.parentNode.replaceChild(img, v);
      });
      th.appendChild(c);
      var num = document.createElement('span'); num.className = 'num'; num.textContent = i + 1; th.appendChild(num);
      overview.appendChild(th);
    });
    function scaleThumbs() {
      Array.prototype.forEach.call(overview.querySelectorAll('.thumb'), function (th) {
        th.firstChild.style.transform = 'scale(' + th.clientWidth / 1920 + ')';
      });
    }
    overview.addEventListener('click', function (e) {
      var th = e.target.closest('.thumb'); if (!th) return;
      closeOverview(); go(+th.dataset.i);
    });
    overview.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.classList.contains('thumb')) { closeOverview(); go(+e.target.dataset.i); }
    });
    window.addEventListener('resize', function () { if (!overview.hidden) scaleThumbs(); });
    overview._scale = scaleThumbs;
  }
  function openOverview() {
    buildOverview(); overview.hidden = false; overview._scale();
    Array.prototype.forEach.call(overview.querySelectorAll('.thumb'), function (t) { t.classList.toggle('cur', +t.dataset.i === cur); });
    var c = overview.querySelector('.thumb.cur'); if (c) { c.scrollIntoView({ block: 'center' }); c.focus({ preventScroll: true }); }
  }
  function closeOverview() { overview.hidden = true; }
  function toggleOverview() { overview.hidden ? openOverview() : closeOverview(); }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (!overview.hidden) { if (k === 'Escape' || k === 'g' || k === 'G') { closeOverview(); e.preventDefault(); } return; }
    if (/^[0-9]$/.test(k)) { typed += k; return; }
    if (k === 'Enter' && typed) { go(parseInt(typed, 10) - 1); typed = ''; e.preventDefault(); return; }
    typed = '';
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter': case 'l': case 'j':
        go(cur + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': case 'h': case 'k':
        go(cur - 1); break;
      case 'Home': go(0); break;
      case 'End': go(slides.length - 1); break;
      case 'f': case 'F': fullscreen(); break;
      case 'g': case 'G': case 'Escape': if (k !== 'Escape' || !document.fullscreenElement) toggleOverview(); else return; break;
      case 'n': case 'N': toggleNotes(); break;
      default: return;
    }
    e.preventDefault();
  });

  // click: left third = back, elsewhere = forward; links and videos keep their own behaviour
  document.getElementById('viewport').addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    var v = e.target.closest('video.clip');
    if (v) { v.paused ? v.play() : v.pause(); return; }
    if (window.getSelection && String(window.getSelection())) return;
    go(e.clientX < window.innerWidth / 3 ? cur - 1 : cur + 1);
  });

  // swipe
  var tx = null, ty = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? cur + 1 : cur - 1);
    tx = ty = null;
  });

  document.getElementById('prev').onclick = function (e) { e.stopPropagation(); go(cur - 1); };
  document.getElementById('next').onclick = function (e) { e.stopPropagation(); go(cur + 1); };
  document.getElementById('grid').onclick = function (e) { e.stopPropagation(); openOverview(); };
  document.getElementById('fs').onclick = function (e) { e.stopPropagation(); fullscreen(); };
  document.getElementById('nt').onclick = function (e) { e.stopPropagation(); toggleNotes(); };

  function showHud() { hud.classList.add('show'); clearTimeout(hudTimer); hudTimer = setTimeout(function () { hud.classList.remove('show'); }, 2200); }
  document.addEventListener('mousemove', showHud);

  function fromHash() { var n = parseInt(location.hash.slice(1), 10); return isNaN(n) ? 0 : n - 1; }
  window.addEventListener('hashchange', function () { go(fromHash(), true); });
  window.addEventListener('resize', fit);
  fit();
  go(fromHash(), true);
  history.replaceState(null, '', '#' + (cur + 1));
})();
