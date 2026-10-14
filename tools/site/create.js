// Crawler creation wizard. Data: window.CRAWLER_SKILLS (built from classes/crawler-skills.md).
(function () {
  "use strict";
  var ABIL = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  var ABIL_NAME = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };
  var SKILLS = [["Acrobatics", "DEX"], ["Animal Handling", "WIS"], ["Arcana", "INT"], ["Athletics", "STR"], ["Deception", "CHA"],
    ["History", "INT"], ["Insight", "WIS"], ["Intimidation", "CHA"], ["Investigation", "INT"], ["Medicine", "WIS"], ["Nature", "INT"],
    ["Perception", "WIS"], ["Performance", "CHA"], ["Persuasion", "CHA"], ["Religion", "INT"], ["Sleight of Hand", "DEX"],
    ["Stealth", "DEX"], ["Survival", "WIS"]];
  var DRILL = ["Martial weapons", "Firearms", "Medium armor", "Shields"];
  var CRAWLER_SKILLS = window.CRAWLER_SKILLS || [];
  var KEY = "worldDungeonCrawler";
  var STEPS = ["Who you were", "Ability scores", "Proficiencies", "First Skill Pick", "Gear and spells", "Your crawler"];

  function fresh() {
    var a = {}; ABIL.forEach(function (k) { a[k] = 10; });
    return { step: 0, name: "", background: "", where: "", wearing: "", pocket: "", assign: a, lowered: "", statPoint: "",
      saveChoice: "", skills: [], extraSkill: "", tool: "", extraLang: "", pickType: "learn", pickSkill: "", pickCat: "All",
      montage: ["", ""], drill: "" };
  }
  var S = fresh();
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) S = Object.assign(fresh(), saved); } catch (e) { /* storage unavailable */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }

  var $ = function (sel) { return document.querySelector(sel); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function base(a) { return S.lowered === a ? 8 : 10; }
  function pool() { return 6 + (S.lowered ? 2 : 0); }
  function spent() { return ABIL.reduce(function (t, a) { return t + (S.assign[a] - base(a)); }, 0); }
  function finalScore(a) {
    var s = S.assign[a] + (S.statPoint === a ? 1 : 0);
    if (S.pickType === "montage") S.montage.forEach(function (m) { if (m === a) s += 1; });
    return s;
  }
  function mod(s) { return Math.floor((s - 10) / 2); }
  function sign(n) { return (n >= 0 ? "+" : "") + n; }
  function profSkills() { var l = S.skills.slice(); if (S.extraSkill && l.indexOf(S.extraSkill) === -1) l.push(S.extraSkill); return l; }
  function saves() { return ["CON"].concat(S.saveChoice ? [S.saveChoice] : []); }
  function skillObj(n) { return CRAWLER_SKILLS.filter(function (s) { return s.name === n; })[0]; }

  // ---------- step rendering ----------
  function chips(list, isOn, onClick, locked) {
    return '<div class="chips">' + list.map(function (v) {
      var cls = locked && locked.indexOf(v) !== -1 ? "chip locked" : isOn(v) ? "chip on" : "chip";
      return '<button type="button" class="' + cls + '" data-v="' + esc(v) + '" data-act="' + onClick + '">' + esc(v) + "</button>";
    }).join("") + "</div>";
  }

  function stepWho() {
    var bgs = ["Acolyte", "Artisan", "Charlatan", "Criminal", "Entertainer", "Farmer", "Guard", "Guide", "Hermit", "Merchant", "Noble",
      "Sage", "Sailor", "Scribe", "Soldier", "Wayfarer"];
    return '<h2>Who were you?</h2><p class="hint">Crawlers start as ordinary people. Before the dungeon, you had a life. ' +
      "This is where it comes from.</p>" +
      field("name", "Crawler name", "text") +
      '<div class="field"><label>Background (any 5e background)</label><input type="text" data-k="background" list="bgs" value="' + esc(S.background) +
      '"><datalist id="bgs">' + bgs.map(function (b) { return "<option>" + b + "</option>"; }).join("") + "</datalist></div>" +
      field("where", "Where were you when the world ended?", "area") +
      field("wearing", "What were you wearing?", "text") +
      field("pocket", "Your one pocket item (phone, keys, multitool, a cat...)", "text");
  }
  function field(k, label, type) {
    var input = type === "area" ? '<textarea data-k="' + k + '">' + esc(S[k]) + "</textarea>"
      : '<input type="text" data-k="' + k + '" value="' + esc(S[k]) + '">';
    return '<div class="field"><label>' + label + "</label>" + input + "</div>";
  }

  function stepAbil() {
    var left = pool() - spent();
    var cards = ABIL.map(function (a) {
      return '<div class="abil-card"><div class="an">' + ABIL_NAME[a] + '</div><div class="score">' + S.assign[a] +
        '</div><div class="mod">' + sign(mod(S.assign[a])) + '</div><div>' +
        '<button type="button" data-act="minus" data-v="' + a + '"' + (S.assign[a] <= base(a) ? " disabled" : "") + ">−</button> " +
        '<button type="button" data-act="plus" data-v="' + a + '"' + (left <= 0 || S.assign[a] >= 14 ? " disabled" : "") + ">+</button></div></div>";
    }).join("");
    return "<h2>Ability scores</h2>" +
      '<p class="hint">Every score starts at <b>10</b>. Spend <b>6 points</b>, with no score above <b>14</b> in this step.</p>' +
      '<div class="pool">POINTS LEFT: ' + left + " / " + pool() + "</div>" +
      '<div class="field"><label>Optional: lower one score to 8 for 2 more points</label>' +
      chips(["None"].concat(ABIL), function (v) { return (S.lowered || "None") === v; }, "lower") + "</div>" +
      '<div class="abil-grid">' + cards + "</div>" +
      "<h3>Your 1st-level Stat Point</h3><p class='hint'>Every level gives 1 Stat Point: +1 to any ability. There is no cap.</p>" +
      chips(ABIL, function (v) { return S.statPoint === v; }, "statpt");
  }

  function stepProf() {
    var skillNames = SKILLS.map(function (s) { return s[0]; });
    return "<h2>Proficiencies</h2>" +
      "<h3>Saving throws</h3><p class='hint'>Constitution, plus one of your choice.</p>" +
      chips(ABIL, function (v) { return v === "CON" || S.saveChoice === v; }, "save", ["CON"]) +
      "<h3>Two proficiency skills</h3><p class='hint'>Choose any two.</p>" +
      chips(skillNames, function (v) { return S.skills.indexOf(v) !== -1; }, "skill") +
      "<h3>Ordinary person: one extra skill</h3><p class='hint'>From your life before the dungeon. You keep it forever.</p>" +
      chips(skillNames.filter(function (v) { return S.skills.indexOf(v) === -1; }), function (v) { return S.extraSkill === v; }, "extra") +
      field("tool", "One tool proficiency (Crawler)", "text") +
      field("extraLang", "Ordinary person: one extra language or tool", "text") +
      "<p class='hint'>You can also use any armor or weapon: armor never gives penalties, and unfamiliar weapons add half your proficiency bonus. Use them in real fights to learn them (<i>Learning by Doing</i>).</p>";
  }

  function stepPick() {
    var h = "<h2>Your first Skill Pick</h2><p class='hint'>You get a Skill Pick at every odd level. Spend your first one now.</p>" +
      chips(["Learn a Crawler Skill", "Training Montage", "Drill"], function (v) {
        return { learn: "Learn a Crawler Skill", montage: "Training Montage", drill: "Drill" }[S.pickType] === v; }, "ptype");
    if (S.pickType === "learn") {
      var cats = ["All"].concat(CRAWLER_SKILLS.map(function (s) { return s.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
      var list = CRAWLER_SKILLS.filter(function (s) { return S.pickCat === "All" || s.cat === S.pickCat; });
      h += chips(cats, function (v) { return S.pickCat === v; }, "pcat") + '<div class="skill-grid">' + list.map(function (s) {
        return '<button type="button" class="skill-card' + (S.pickSkill === s.name ? " on" : "") + '" data-act="pskill" data-v="' + esc(s.name) +
          '"><b>' + esc(s.name) + "</b><small>" + esc(s.cat) + " · " + esc(s.key) + "</small></button>";
      }).join("") + "</div>";
      var sel = skillObj(S.pickSkill);
      if (sel) {
        h += '<div class="skill-detail"><h3>' + esc(sel.name) + "</h3>" + (sel.intro ? "<p>" + sel.intro + "</p>" : "") +
          '<p class="kvline"><span class="k">GM cue</span>' + sel.cue + '</p><p class="kvline"><span class="k">Scaling</span>' + sel.scaling + "</p>" +
          '<ul class="milestones">' + sel.ms.map(function (m) {
            return '<li class="ms"><span class="lv"><small>LV</small>' + m.lv + "</span><div><strong>" + m.name + "</strong> " + m.text + "</div></li>";
          }).join("") + "</ul><p class='hint'>You start at Skill Level 1. The GM awards more levels as you use it well.</p></div>";
      }
    } else if (S.pickType === "montage") {
      h += "<p>Gain <b>2 Stat Points</b>. Choose where they go (the same ability twice is fine).</p>" +
        "<h3>First point</h3>" + chips(ABIL, function (v) { return S.montage[0] === v; }, "mont0") +
        "<h3>Second point</h3>" + chips(ABIL, function (v) { return S.montage[1] === v; }, "mont1");
    } else {
      h += "<p>Gain proficiency with one category. You are already proficient with simple weapons, improvised weapons and light armor.</p>" +
        chips(DRILL, function (v) { return S.drill === v; }, "drill");
    }
    return h;
  }

  function stepGear() {
    return "<h2>Gear and your first spell</h2>" +
      "<h3>What you have</h3><ul>" +
      "<li><b>Clothes:</b> " + esc(S.wearing || "whatever you were wearing") + " (no armor).</li>" +
      "<li><b>Pocket item:</b> " + esc(S.pocket || "your one pocket item") + ". The GM decides if it is useful.</li>" +
      "<li><b>System starter pack:</b> 1 day of rations, a waterskin, and a potion of healing (2d4 + 2).</li>" +
      "<li><b>Coin purse:</b> 0 gp. The dungeon only deals in gold.</li></ul>" +
      "<p class='hint'>Weapons and armor come from the dungeon: loot, boxes and anything you can pick up.</p>" +
      "<h3>Heal Self</h3><p>Every crawler starts with the <b>Heal Self</b> tome spell at Rank I: always 1st level, always <b>1 mana</b>, heals " +
      "<b>1d8 per rank</b>. Bonus action from Rank III.</p>" +
      "<h3>Survivor features at 1st level</h3><ul>" +
      "<li><b>Scrappy:</b> unarmed strikes 1d4; improvised weapons 1d6 (1d8 two-handed), thrown 20/60.</li>" +
      "<li><b>Will to Live:</b> bonus action, regain 1d8 + level hit points. Once per short rest.</li></ul>" +
      "<h3>Crawler Core</h3><ul><li>The Interface: status bars, Inspect (bonus action, 60 ft), notifications. No map: you draw your own.</li>" +
      "<li>Crawler Inventory: 21 slots at 1st level.</li><li>Learning by Doing: no armor penalties.</li></ul>";
  }

  function sheetHtml() {
    var dex = mod(finalScore("DEX")), con = mod(finalScore("CON")), int = mod(finalScore("INT")), wis = mod(finalScore("WIS"));
    var prof = profSkills(), sv = saves();
    var perc = wis + (prof.indexOf("Perception") !== -1 ? 2 : 0);
    var pick = S.pickType === "learn" ? (S.pickSkill ? S.pickSkill + " (Skill Level 1)" : "—")
      : S.pickType === "montage" ? "Training Montage (+1 " + (S.montage[0] || "?") + ", +1 " + (S.montage[1] || "?") + ")"
      : "Drill: " + (S.drill || "—");
    var sel = S.pickType === "learn" ? skillObj(S.pickSkill) : null;
    return '<div class="sheet"><h2 style="margin-top:0">' + esc(S.name || "Unnamed crawler") + "</h2>" +
      "<p><b>Level 1 Crawler</b> · Background: " + esc(S.background || "—") + " · Floor 1</p>" +
      '<div class="grid6">' + ABIL.map(function (a) {
        var sc = finalScore(a);
        return "<div><small>" + a + "</small><b>" + sc + "</b><small>" + sign(mod(sc)) + (sv.indexOf(a) !== -1 ? " · save " + sign(mod(sc) + 2) : "") + "</small></div>";
      }).join("") + "</div>" +
      '<div class="stats">' +
      stat("Hit points", Math.max(1, 8 + con)) + stat("Armor Class", 10 + dex) + stat("Initiative", sign(dex)) + stat("Speed", "30 ft") +
      stat("Prof. bonus", "+2") + stat("Mana", Math.max(1, 1 + int)) + stat("Passive Perception", 10 + perc) + stat("Inventory", "21 slots") +
      stat("Hit Dice", "1d8") + "</div>" +
      "<p><b>Saving throws:</b> " + sv.map(function (a) { return ABIL_NAME[a]; }).join(", ") + "</p>" +
      "<p><b>Skills:</b> " + (prof.length ? prof.map(function (n) {
        var ab = SKILLS.filter(function (s) { return s[0] === n; })[0][1];
        return n + " " + sign(mod(finalScore(ab)) + 2);
      }).join(", ") : "—") + "</p>" +
      "<p><b>Tools and languages:</b> " + esc([S.tool, S.extraLang].filter(Boolean).join(", ") || "—") + "</p>" +
      "<p><b>First Skill Pick:</b> " + esc(pick) + "</p>" +
      (sel && sel.ms[0] ? "<p class='hint'><b>" + sel.ms[0].name.replace(/\.$/, "") + ":</b> " + sel.ms[0].text + "</p>" : "") +
      "<p><b>Tome spells:</b> Heal Self (Rank I, 1 mana, 1d8).</p>" +
      "<p><b>Features:</b> Scrappy, Will to Live, The Interface, Crawler Inventory, Learning by Doing.</p>" +
      "<p><b>Gear:</b> " + esc(S.wearing || "clothes") + "; " + esc(S.pocket || "pocket item") + "; rations, waterskin, potion of healing. 0 gp.</p>" +
      (S.where ? "<p><b>When the world ended:</b> " + esc(S.where) + "</p>" : "") + "</div>";
  }
  function stat(label, v) { return "<div><small>" + label + "</small><b>" + v + "</b></div>"; }

  function stepDone() {
    var warn = [];
    if (pool() - spent() > 0) warn.push("You have " + (pool() - spent()) + " ability points left to spend.");
    if (!S.statPoint) warn.push("Your 1st-level Stat Point is not placed.");
    if (!S.saveChoice) warn.push("Choose a second saving throw.");
    if (S.skills.length < 2) warn.push("Choose two proficiency skills.");
    if (!S.extraSkill) warn.push("Choose your ordinary-person skill.");
    if (S.pickType === "learn" && !S.pickSkill) warn.push("Choose a Crawler Skill for your Skill Pick.");
    return "<h2>Your crawler</h2>" + (warn.length ? '<blockquote class="note">' + warn.join("<br>") + "</blockquote>" : "") +
      sheetHtml() +
      '<div class="nav-btns no-print" style="justify-content:flex-start;flex-wrap:wrap">' +
      '<button type="button" class="btn dark" data-act="print">Print</button>' +
      '<button type="button" class="btn light" data-act="export">Export JSON</button>' +
      '<label class="btn light">Import JSON<input type="file" accept=".json" data-act="import" hidden></label>' +
      '<a class="btn light" href="downloads/Crawler-Character-Sheet.pdf">Blank character sheet (PDF)</a>' +
      '<button type="button" class="btn light" data-act="reset">Start over</button></div>' +
      "<p class='hint no-print'>Your crawler is saved in this browser automatically. Copy it onto the Crawler Character Sheet to play.</p>";
  }

  var RENDER = [stepWho, stepAbil, stepProf, stepPick, stepGear, stepDone];

  function summary() {
    var left = pool() - spent();
    var rows = ABIL.map(function (a) { var s = finalScore(a); return row(ABIL_NAME[a], s + " (" + sign(mod(s)) + ")"); }).join("");
    return "<h3>" + esc(S.name || "New crawler") + "</h3>" + rows + row("Points left", left) +
      row("Hit points", Math.max(1, 8 + mod(finalScore("CON")))) + row("Mana", Math.max(1, 1 + mod(finalScore("INT")))) +
      row("AC", 10 + mod(finalScore("DEX"))) +
      row("Skill Pick", S.pickType === "learn" ? (S.pickSkill || "—") : S.pickType === "montage" ? "Training Montage" : "Drill");
  }
  function row(k, v) { return '<div class="row"><span>' + k + "</span><b>" + esc(v) + "</b></div>"; }

  function render() {
    $(".steps").innerHTML = STEPS.map(function (s, i) {
      return '<li data-step="' + i + '" class="' + (i === S.step ? "on" : i < S.step ? "done" : "") + '">' + (i + 1) + ". " + s + "</li>";
    }).join("");
    var host = $("#step-host");
    host.className = "step on" + (S.step === STEPS.length - 1 ? " print" : "");
    host.innerHTML = RENDER[S.step]() + (S.step < STEPS.length - 1
      ? '<div class="nav-btns"><button type="button" class="btn light" data-act="back"' + (S.step === 0 ? " disabled" : "") +
        '>Back</button><button type="button" class="btn primary" data-act="next">Next</button></div>' : "");
    $(".summary").innerHTML = summary();
    save();
  }

  function toggle(list, v, max) {
    var i = list.indexOf(v);
    if (i !== -1) list.splice(i, 1); else if (list.length < max) list.push(v);
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-act],[data-step]");
    if (!t) return;
    if (t.hasAttribute("data-step")) { S.step = +t.getAttribute("data-step"); render(); window.scrollTo(0, 0); return; }
    var act = t.getAttribute("data-act"), v = t.getAttribute("data-v");
    switch (act) {
      case "next": S.step = Math.min(STEPS.length - 1, S.step + 1); window.scrollTo(0, 0); break;
      case "back": S.step = Math.max(0, S.step - 1); window.scrollTo(0, 0); break;
      case "plus": if (pool() - spent() > 0 && S.assign[v] < 14) S.assign[v] += 1; break;
      case "minus": if (S.assign[v] > base(v)) S.assign[v] -= 1; break;
      case "lower":
        var nv = v === "None" ? "" : v;
        if (S.lowered && S.assign[S.lowered] < 10) S.assign[S.lowered] = 10;
        S.lowered = nv;
        if (nv) S.assign[nv] = 8;
        if (spent() > pool()) ABIL.forEach(function (a) { S.assign[a] = base(a); });
        break;
      case "statpt": S.statPoint = S.statPoint === v ? "" : v; break;
      case "save": if (v !== "CON") S.saveChoice = S.saveChoice === v ? "" : v; break;
      case "skill": toggle(S.skills, v, 2); if (S.extraSkill === v) S.extraSkill = ""; break;
      case "extra": S.extraSkill = S.extraSkill === v ? "" : v; break;
      case "ptype": S.pickType = { "Learn a Crawler Skill": "learn", "Training Montage": "montage", "Drill": "drill" }[v]; break;
      case "pcat": S.pickCat = v; break;
      case "pskill": S.pickSkill = v; break;
      case "mont0": S.montage[0] = v; break;
      case "mont1": S.montage[1] = v; break;
      case "drill": S.drill = v; break;
      case "print": window.print(); return;
      case "export":
        var blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = (S.name || "crawler").replace(/[^\w-]+/g, "_") + ".json"; a.click();
        return;
      case "reset": S = fresh(); break;
      default: return;
    }
    render();
  });

  document.addEventListener("input", function (ev) {
    var k = ev.target.getAttribute("data-k");
    if (k) { S[k] = ev.target.value; $(".summary").innerHTML = summary(); save(); }
  });
  document.addEventListener("change", function (ev) {
    if (ev.target.getAttribute("data-act") !== "import" || !ev.target.files[0]) return;
    var r = new FileReader();
    r.onload = function () { try { S = Object.assign(fresh(), JSON.parse(r.result)); render(); } catch (e) { alert("That file is not a crawler export."); } };
    r.readAsText(ev.target.files[0]);
  });

  render();
})();
