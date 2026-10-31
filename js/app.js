(function () {
  "use strict";

  var STORAGE_KEY = "noudo-master-v1";
  var app = document.getElementById("app");
  var state = { view: "list", set: "noudo", guide: "ニュートン算", category: { noudo: "すべて", hard: "すべて" }, current: null, practice: null, practiceType: null };

  // 問題セット（濃度 / 難問）。記録のキーは prefix + id
  var SETS = {
    noudo: { list: window.PROBLEMS, prefix: "", view: "list", label: "濃度",
      lead: "入試によく出る濃度の問題を集めました。まず自分で解いてから、ヒント・解説を見よう。" },
    hard: { list: window.HARD_PROBLEMS, prefix: "h", view: "hard", label: "難問",
      lead: "角度・面積・特殊算・速さ・売買損益などの難問です。図や表をかいて、じっくり考えよう。答えが分数のときは「3/11」や「16と4/11」のように入力できます。" },
  };
  var record = loadRecord();

  function loadRecord() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveRecord() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {}
    renderProgress();
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function stars(level) {
    return "★★★".slice(0, level) + "☆☆☆".slice(0, 3 - level);
  }

  // 全角数字・小数点・分数（3/4）・帯分数（16と4/11、16 4/11）を受け付ける
  function parseAnswer(text) {
    var s = String(text).replace(/[０-９．／－　]/g, function (ch) {
      return ch === "　" ? " " : String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    });
    var mixed = s.match(/^\s*(\d+)\s*(?:と|\s)\s*(\d+)\s*\/\s*(\d+)/);
    if (mixed) return parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);
    s = s.replace(/[^0-9./-]/g, "");
    if (!s) return NaN;
    if (s.indexOf("/") >= 0) {
      var parts = s.split("/");
      return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(s);
  }

  // ---------- 図 ----------

  function tenbinSvg(f) {
    var W = 360, x0 = 40, x1 = 320, y = 70;
    var lo = f.left.c, hi = f.right.c;
    var xm = x0 + ((f.mid - lo) / (hi - lo)) * (x1 - x0);
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " 150");
    svg.setAttribute("class", "tenbin");

    function add(tag, attrs, text) {
      var n = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      if (text != null) n.textContent = text;
      svg.appendChild(n);
      return n;
    }

    add("line", { x1: x0, y1: y, x2: x1, y2: y, class: "bar" });
    add("polygon", { points: xm + "," + y + " " + (xm - 9) + "," + (y + 16) + " " + (xm + 9) + "," + (y + 16), class: "pivot" });
    [[x0, f.left], [x1, f.right]].forEach(function (p) {
      add("line", { x1: p[0], y1: y, x2: p[0], y2: y + 24, class: "string" });
      add("rect", { x: p[0] - 34, y: y + 24, width: 68, height: 28, rx: 6, class: "weight" });
      add("text", { x: p[0], y: y + 43, class: "wtext" }, p[1].w);
      add("text", { x: p[0], y: y - 14, class: "ctext" }, p[1].label || p[1].c + "%");
    });
    add("text", { x: xm, y: y + 34, class: "ctext mid" }, f.mid + "%");
    add("text", { x: (x0 + xm) / 2, y: y - 6, class: "dtext" }, f.distL);
    add("text", { x: (xm + x1) / 2, y: y - 6, class: "dtext" }, f.distR);
    if (f.note) add("text", { x: W / 2, y: 18, class: "note" }, f.note);
    return svg;
  }

  function tableFig(f) {
    var t = el("table", { class: "fig-table" });
    var tr = el("tr");
    f.head.forEach(function (h) { tr.appendChild(el("th", { html: h })); });
    t.appendChild(tr);
    f.rows.forEach(function (r) {
      var row = el("tr");
      r.forEach(function (c, i) { row.appendChild(el(i === 0 ? "th" : "td", { html: c })); });
      t.appendChild(row);
    });
    return t;
  }

  function figure(f) {
    if (!f) return null;
    if (f.type === "svg") return el("div", { class: "fig geo", html: f.svg });
    var node = f.type === "tenbin" ? tenbinSvg(f) : tableFig(f);
    return el("div", { class: "fig" }, [node]);
  }

  // ---------- 一覧 ----------

  function renderList(setKey) {
    var set = SETS[setKey];
    var cats = ["すべて"];
    set.list.forEach(function (p) {
      if (cats.indexOf(p.category) < 0) cats.push(p.category);
    });

    var filter = el("div", { class: "filter" }, cats.map(function (c) {
      return el("button", {
        class: "chip" + (state.category[setKey] === c ? " active" : ""),
        text: c,
        onclick: function () { state.category[setKey] = c; render(); },
      });
    }));

    var list = el("div", { class: "cards" });
    set.list.filter(function (p) {
      return state.category[setKey] === "すべて" || p.category === state.category[setKey];
    }).forEach(function (p) {
      var r = record[set.prefix + p.id];
      var badge = r && r.correct ? el("span", { class: "badge ok", text: "正解" })
        : r ? el("span", { class: "badge try", text: "挑戦中" }) : null;
      list.appendChild(el("button", {
        class: "card",
        onclick: function () { openProblem(setKey, p.id); },
      }, [
        el("div", { class: "card-top" }, [
          el("span", { class: "num", text: "問" + (p.no || p.id) }),
          el("span", { class: "level", text: stars(p.level) }),
          badge,
        ]),
        el("div", { class: "card-title", text: p.title }),
        el("div", { class: "card-cat", text: p.category }),
      ]));
    });

    app.appendChild(el("p", { class: "lead", text: set.lead }));
    app.appendChild(filter);
    var cat = state.category[setKey];
    if (setKey === "hard" && window.GUIDES && GUIDES[cat]) app.appendChild(guideLink(cat));
    app.appendChild(list);
  }

  // ---------- 問題 ----------

  function openProblem(setKey, id) {
    state.view = "problem";
    state.set = setKey;
    state.current = { id: id, hints: 0, steps: 0, result: null };
    render();
    window.scrollTo(0, 0);
  }

  // 問題文・解答欄・ヒント・解説（固定問題と練習で共通）
  function renderQuestion(p, cur, header, onAnswer) {
    app.appendChild(el("section", { class: "problem" }, [
      el("div", { class: "card-top" }, [
        el("span", { class: "num", text: header }),
        el("span", { class: "level", text: stars(p.level) }),
        el("span", { class: "card-cat", text: p.category }),
      ]),
      el("h2", { text: p.title }),
      el("p", { class: "question", text: p.question }),
      figure(p.fig),
    ]));

    // 解答欄
    var input = el("input", { type: "text", inputmode: "decimal", placeholder: "答え", "aria-label": "答え" });
    var form = el("form", {
      class: "answer",
      onsubmit: function (e) {
        e.preventDefault();
        var v = parseAnswer(input.value);
        if (isNaN(v)) return;
        var ok = Math.abs(v - p.answer.value) < 1e-6;
        cur.result = ok ? "ok" : "ng";
        onAnswer(ok);
        render();
      },
    }, [input, el("span", { class: "unit", text: p.answer.unit }), el("button", { class: "btn primary", type: "submit", text: "答え合わせ" })]);
    app.appendChild(form);

    if (cur.result === "ok") {
      app.appendChild(el("div", { class: "result ok", text: "正解！ 解説で解き方もたしかめよう。" }));
    } else if (cur.result === "ng") {
      app.appendChild(el("div", { class: "result ng", text: "ざんねん…もう一度考えるか、ヒントを見てみよう。" }));
    }

    // ヒント
    var hintBox = el("section", { class: "box hint" }, [el("h3", { text: "ヒント" })]);
    p.hints.slice(0, cur.hints).forEach(function (h, i) {
      hintBox.appendChild(el("p", { text: "ヒント" + (i + 1) + "：" + h }));
    });
    if (cur.hints < p.hints.length) {
      hintBox.appendChild(el("button", {
        class: "btn",
        text: cur.hints === 0 ? "ヒントを見る" : "次のヒント",
        onclick: function () { cur.hints++; render(); },
      }));
    }
    app.appendChild(hintBox);

    // 解説
    var exp = el("section", { class: "box explain" }, [el("h3", { text: "解き方の解説" })]);
    p.steps.slice(0, cur.steps).forEach(function (s, i) {
      exp.appendChild(el("div", { class: "step" }, [
        el("div", { class: "step-title" }, [el("span", { class: "step-no", text: String(i + 1) }), s.title]),
        el("div", { class: "step-body", html: s.html }),
        figure(s.fig),
      ]));
    });
    if (cur.steps < p.steps.length) {
      var btns = el("div", { class: "row" }, [
        el("button", {
          class: "btn",
          text: cur.steps === 0 ? "解説を1ステップずつ見る" : "次のステップ",
          onclick: function () { cur.steps++; render(); },
        }),
        el("button", {
          class: "btn ghost",
          text: "全部見る",
          onclick: function () { cur.steps = p.steps.length; render(); },
        }),
      ]);
      exp.appendChild(btns);
    } else {
      exp.appendChild(el("p", { class: "final", html: "答え：<b>" + (p.answer.text || p.answer.value + p.answer.unit) + "</b>" }));
    }
    app.appendChild(exp);

    if (cur.focus !== false) input.focus({ preventScroll: true });
    cur.focus = false;
  }

  function renderProblem() {
    var cur = state.current;
    var set = SETS[state.set];
    var list = set.list;
    var idx = list.findIndex(function (p) { return p.id === cur.id; });
    var p = list[idx];

    app.appendChild(el("button", { class: "link back", text: "← " + set.label + "の問題一覧", onclick: function () { state.view = set.view; render(); } }));

    renderQuestion(p, cur, "問" + (p.no || p.id), function (ok) {
      var key = set.prefix + p.id;
      var r = record[key] || { tries: 0, correct: false };
      r.tries += 1;
      if (ok) r.correct = true;
      record[key] = r;
      saveRecord();
    });

    if (state.set === "hard" && window.GUIDES && GUIDES[p.category]) app.appendChild(guideLink(p.category));

    // 前後
    var nav = el("div", { class: "row pager" });
    if (idx > 0) nav.appendChild(el("button", { class: "btn ghost", text: "← 前の問題", onclick: function () { openProblem(state.set, list[idx - 1].id); } }));
    if (idx < list.length - 1) nav.appendChild(el("button", { class: "btn ghost", text: "次の問題 →", onclick: function () { openProblem(state.set, list[idx + 1].id); } }));
    app.appendChild(nav);
  }

  // ---------- 解き方ガイド（難問チャレンジ） ----------

  function openGuide(cat) {
    state.view = "guide";
    state.guide = cat;
    render();
    window.scrollTo(0, 0);
  }

  function guideLink(cat) {
    return el("button", { class: "guide-link", onclick: function () { openGuide(cat); } }, [
      el("span", { class: "guide-link-title", text: cat + "の解き方ガイドを読む →" }),
      el("span", { class: "guide-link-desc", text: "図とグラフで、解き方をステップごとに説明しています" }),
    ]);
  }

  function renderGuide() {
    // 問題の分野と同じ順にならべる
    var order = [];
    SETS.hard.list.forEach(function (p) {
      if (order.indexOf(p.category) < 0) order.push(p.category);
    });
    var keys = order.filter(function (c) { return GUIDES[c]; });
    if (!GUIDES[state.guide]) state.guide = keys[0];
    var g = GUIDES[state.guide];

    app.appendChild(el("p", { class: "lead", text: "分野を選ぶと、解き方を例題・図・表でくわしく説明します。読んだら、その分野の問題にチャレンジしよう。" }));
    app.appendChild(el("div", { class: "filter" }, keys.map(function (k) {
      return el("button", {
        class: "chip" + (state.guide === k ? " active" : ""),
        text: k,
        onclick: function () { openGuide(k); },
      });
    })));

    app.appendChild(el("section", { class: "problem" }, [
      el("h2", { text: state.guide + "の解き方" }),
      el("p", { class: "question", text: g.lead }),
    ]));

    g.sections.forEach(function (s, i) {
      var box = el("section", { class: "box guide" }, [
        el("h3", {}, [el("span", { class: "step-no", text: String(i + 1) }), " " + s.title]),
        el("div", { class: "guide-body", html: s.html }),
        figure(s.fig),
      ]);
      if (s.widget && window.GUIDE_WIDGETS && GUIDE_WIDGETS[s.widget]) box.appendChild(GUIDE_WIDGETS[s.widget]());
      app.appendChild(box);
    });

    // この分野の問題へ
    var probs = SETS.hard.list.filter(function (p) { return p.category === state.guide; });
    var practice = el("section", { class: "box" }, [el("h3", { text: "練習しよう：" + state.guide + "の問題（" + probs.length + "問）" })]);
    var cards = el("div", { class: "cards" });
    probs.forEach(function (p) {
      var r = record[SETS.hard.prefix + p.id];
      cards.appendChild(el("button", { class: "card", onclick: function () { openProblem("hard", p.id); } }, [
        el("div", { class: "card-top" }, [
          el("span", { class: "num", text: "問" + (p.no || p.id) }),
          el("span", { class: "level", text: stars(p.level) }),
          r && r.correct ? el("span", { class: "badge ok", text: "正解" }) : null,
        ]),
        el("div", { class: "card-title", text: p.title }),
      ]));
    });
    practice.appendChild(cards);
    app.appendChild(practice);
  }

  // ---------- 練習（自動生成） ----------

  function newPractice() {
    state.practice = { problem: PRACTICE.make(state.practiceType), hints: 0, steps: 0, result: null, answered: false };
  }

  function renderPractice() {
    if (!state.practice) newPractice();
    var cur = state.practice;
    var stats = record._practice || { tries: 0, correct: 0, streak: 0, best: 0 };

    app.appendChild(el("p", { class: "lead", text: "数字が毎回かわる練習問題です。解き方は同じなので、何回でもチャレンジしよう。" }));

    var types = [{ key: null, name: "ランダム" }].concat(PRACTICE.types);
    app.appendChild(el("div", { class: "filter" }, types.map(function (t) {
      return el("button", {
        class: "chip" + (state.practiceType === t.key ? " active" : ""),
        text: t.name,
        onclick: function () { state.practiceType = t.key; newPractice(); render(); },
      });
    })));

    app.appendChild(el("div", { class: "stats" }, [
      el("span", { text: "正解 " + stats.correct + " / " + stats.tries + "問" }),
      el("span", { text: "連続正解 " + stats.streak }),
      el("span", { text: "最高 " + stats.best + "連続" }),
    ]));

    renderQuestion(cur.problem, cur, "練習", function (ok) {
      // 1問につき最初の答えだけを成績に入れる
      if (cur.answered) return;
      cur.answered = true;
      stats.tries += 1;
      if (ok) {
        stats.correct += 1;
        stats.streak += 1;
        stats.best = Math.max(stats.best, stats.streak);
      } else {
        stats.streak = 0;
      }
      record._practice = stats;
      saveRecord();
    });

    app.appendChild(el("div", { class: "row pager" }, [
      el("button", {
        class: "btn primary",
        text: "次の練習問題（数字をかえる）→",
        onclick: function () { newPractice(); render(); window.scrollTo(0, 0); },
      }),
    ]));
  }

  // ---------- コツ ----------

  function renderTips() {
    app.appendChild(el("p", { class: "lead", text: "濃度の問題で必ず使う考え方です。問題を解く前に確認しよう。" }));
    TIPS.forEach(function (t) {
      app.appendChild(el("section", { class: "box" }, [el("h3", { text: t.title }), el("div", { html: t.html })]));
    });
    app.appendChild(el("section", { class: "box" }, [
      el("h3", { text: "天びん図の例" }),
      el("p", { text: "6%と11%を混ぜて9%：うで 3:2 → 重さ 2:3" }),
      figure({ type: "tenbin", left: { c: 6, w: "②" }, right: { c: 11, w: "③" }, mid: 9, distL: "3", distR: "2" }),
    ]));
  }

  // ---------- 共通 ----------

  function renderProgress() {
    var text = Object.keys(SETS).map(function (k) {
      var set = SETS[k];
      var solved = set.list.filter(function (p) {
        var r = record[set.prefix + p.id];
        return r && r.correct;
      }).length;
      return set.label + " " + solved + " / " + set.list.length;
    });
    document.getElementById("progress").textContent = "正解した問題：" + text.join("　");
  }

  // いま表示しているコーナー（濃度マスター / 難問チャレンジ）
  function currentSection() {
    if (state.view === "hard" || state.view === "guide") return "hard";
    if (state.view === "problem") return state.set;
    return "noudo";
  }

  function render() {
    app.innerHTML = "";
    var section = currentSection();
    document.body.setAttribute("data-section", section);
    document.querySelectorAll(".section-tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-section") === section);
    });
    // コーナーの中のメニュー（濃度：問題・練習・コツ／難問：問題・解き方ガイド）
    document.querySelectorAll("nav.tabs").forEach(function (n) {
      n.hidden = n.getAttribute("data-section") !== section;
    });
    document.querySelectorAll(".tab").forEach(function (t) {
      var v = t.getAttribute("data-view");
      t.classList.toggle("active", v === state.view || (state.view === "problem" && v === SETS[state.set].view));
    });
    if (state.view === "list") renderList("noudo");
    else if (state.view === "hard") renderList("hard");
    else if (state.view === "guide") renderGuide();
    else if (state.view === "tips") renderTips();
    else if (state.view === "practice") renderPractice();
    else renderProblem();
  }

  document.querySelectorAll(".section-tab").forEach(function (t) {
    t.addEventListener("click", function () {
      state.view = t.getAttribute("data-section") === "hard" ? "hard" : "list";
      render();
    });
  });

  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      state.view = t.getAttribute("data-view");
      render();
    });
  });

  document.getElementById("reset").addEventListener("click", function () {
    if (confirm("正解の記録をすべて消しますか？")) {
      record = {};
      saveRecord();
      render();
    }
  });

  renderProgress();
  render();
})();
