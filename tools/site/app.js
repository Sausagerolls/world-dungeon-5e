// World Dungeon setting site: navigation, search, table dice rollers, and the on-page contents.
(function () {
  "use strict";

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var side = document.querySelector("nav.side");
  if (menuBtn && side) {
    menuBtn.addEventListener("click", function () { side.classList.toggle("open"); });
  }

  // Search over window.SEARCH_INDEX: [{t: title, p: page, u: url, s: snippet}]
  var input = document.querySelector(".search input");
  var box = document.querySelector(".results");
  var index = window.SEARCH_INDEX || [];
  var base = document.body.getAttribute("data-base") || "";
  var selected = -1;

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) { box.classList.remove("open"); return; }
    var words = q.split(/\s+/);
    var hits = [];
    index.forEach(function (e) {
      var title = e.t.toLowerCase(), text = (e.t + " " + e.p + " " + e.s).toLowerCase();
      if (!words.every(function (w) { return text.indexOf(w) !== -1; })) return;
      var score = title.indexOf(q) === 0 ? 3 : title.indexOf(q) !== -1 ? 2 : 1;
      hits.push({ e: e, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    hits = hits.slice(0, 25);
    selected = -1;
    box.innerHTML = hits.length
      ? hits.map(function (h) {
          return '<a href="' + base + h.e.u + '"><b>' + esc(h.e.t) + "</b> &middot; " + esc(h.e.p) +
            "<small>" + esc(h.e.s.slice(0, 140)) + "</small></a>";
        }).join("")
      : '<div class="none">No matches.</div>';
    box.classList.add("open");
  }

  if (input && box) {
    input.addEventListener("input", function () { search(input.value); });
    input.addEventListener("keydown", function (ev) {
      var links = box.querySelectorAll("a");
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        selected = Math.max(0, Math.min(links.length - 1, selected + (ev.key === "ArrowDown" ? 1 : -1)));
        links.forEach(function (a, i) { a.classList.toggle("sel", i === selected); });
      } else if (ev.key === "Enter" && links.length) {
        window.location.href = links[Math.max(0, selected)].href;
      } else if (ev.key === "Escape") {
        box.classList.remove("open");
      }
    });
    document.addEventListener("click", function (ev) {
      if (!ev.target.closest(".search")) box.classList.remove("open");
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && document.activeElement !== input && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        ev.preventDefault(); input.focus();
      }
    });
  }

  // Dice rollers for tables whose first column is a die (d4 ... d100)
  function inRange(cell, n) {
    var t = cell.textContent.trim().replace(/[–—]/g, "-");
    var m = t.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) return n >= +m[1] && n <= +(m[2] === "00" ? 100 : m[2]);
    m = t.match(/^(\d+)\+?$/);
    if (m) return +m[1] === n || (+m[1] === 0 && n === 100);
    return false;
  }

  document.querySelectorAll("main table.grid").forEach(function (tbl) {
    var th = tbl.querySelector("thead th");
    if (!th) return;
    var m = th.textContent.trim().match(/^d(\d+)$/i);
    if (!m) return;
    var sides = +m[1];
    var bar = document.createElement("div");
    var btn = document.createElement("button");
    var out = document.createElement("span");
    btn.className = "roll-btn"; btn.type = "button"; btn.textContent = "Roll d" + sides;
    out.className = "roll-out";
    bar.appendChild(btn); bar.appendChild(out);
    var wrap = tbl.closest(".tablewrap") || tbl;
    wrap.parentNode.insertBefore(bar, wrap);
    btn.addEventListener("click", function () {
      var n = 1 + Math.floor(Math.random() * sides);
      out.textContent = "Rolled " + n;
      var found = null;
      tbl.querySelectorAll("tbody tr").forEach(function (tr) {
        tr.classList.remove("rolled");
        // Two-column dice tables (e.g. "d100 | Box | d100 | Box") check every die cell
        var cells = tr.querySelectorAll("td");
        for (var i = 0; i < cells.length; i += 1) {
          if (inRange(cells[i], n) && !found) { found = tr; }
        }
      });
      if (found) { found.classList.add("rolled"); found.scrollIntoView({ block: "center", behavior: "smooth" }); }
    });
  });

  // Highlight the on-page contents entry for the heading in view
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove("on"); });
          map[en.target.id].classList.add("on");
        }
      });
    }, { rootMargin: "-70px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
  }
})();
