(function () {
  "use strict";

  var STORAGE_KEY = "noudo-master-v1";
  var app = document.getElementById("app");
  var state = { view: "list", category: "すべて", current: null };
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

  // 全角数字・小数点・分数（3/4）を受け付ける
  function parseAnswer(text) {
    var s = String(text)
      .replace(/[０-９．／－]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
      })
      .replace(/[^0-9./-]/g, "");
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
      add("text", { x: p[0], y: y - 14, class: "ctext" }, p[1].c + "%");
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
    var node = f.type === "tenbin" ? tenbinSvg(f) : tableFig(f);
    return el("div", { class: "fig" }, [node]);
  }

  // ---------- 一覧 ----------

  function renderList() {
    var cats = ["すべて"];
    PROBLEMS.forEach(function (p) {
      if (cats.indexOf(p.category) < 0) cats.push(p.category);
    });

    var filter = el("div", { class: "filter" }, cats.map(function (c) {
      return el("button", {
        class: "chip" + (state.category === c ? " active" : ""),
        text: c,
        onclick: function () { state.category = c; render(); },
      });
    }));

    var list = el("div", { class: "cards" });
    PROBLEMS.filter(function (p) {
      return state.category === "すべて" || p.category === state.category;
    }).forEach(function (p) {
      var r = record[p.id];
      var badge = r && r.correct ? el("span", { class: "badge ok", text: "正解" })
        : r ? el("span", { class: "badge try", text: "挑戦中" }) : null;
      list.appendChild(el("button", {
        class: "card",
        onclick: function () { openProblem(p.id); },
      }, [
        el("div", { class: "card-top" }, [
          el("span", { class: "num", text: "問" + p.id }),
          el("span", { class: "level", text: stars(p.level) }),
          badge,
        ]),
        el("div", { class: "card-title", text: p.title }),
        el("div", { class: "card-cat", text: p.category }),
      ]));
    });

    app.appendChild(el("p", { class: "lead", text: "入試によく出る濃度の問題を集めました。まず自分で解いてから、ヒント・解説を見よう。" }));
    app.appendChild(filter);
    app.appendChild(list);
  }

  // ---------- 問題 ----------

  function openProblem(id) {
    state.view = "problem";
    state.current = { id: id, hints: 0, steps: 0, result: null };
    render();
    window.scrollTo(0, 0);
  }

  function renderProblem() {
    var cur = state.current;
    var idx = PROBLEMS.findIndex(function (p) { return p.id === cur.id; });
    var p = PROBLEMS[idx];

    app.appendChild(el("button", { class: "link back", text: "← 問題一覧", onclick: function () { state.view = "list"; render(); } }));

    app.appendChild(el("section", { class: "problem" }, [
      el("div", { class: "card-top" }, [
        el("span", { class: "num", text: "問" + p.id }),
        el("span", { class: "level", text: stars(p.level) }),
        el("span", { class: "card-cat", text: p.category }),
      ]),
      el("h2", { text: p.title }),
      el("p", { class: "question", text: p.question }),
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
        var r = record[p.id] || { tries: 0, correct: false };
        r.tries += 1;
        if (ok) r.correct = true;
        record[p.id] = r;
        saveRecord();
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
      exp.appendChild(el("p", { class: "final", html: "答え：<b>" + p.answer.value + p.answer.unit + "</b>" }));
    }
    app.appendChild(exp);

    // 前後
    var nav = el("div", { class: "row pager" });
    if (idx > 0) nav.appendChild(el("button", { class: "btn ghost", text: "← 前の問題", onclick: function () { openProblem(PROBLEMS[idx - 1].id); } }));
    if (idx < PROBLEMS.length - 1) nav.appendChild(el("button", { class: "btn ghost", text: "次の問題 →", onclick: function () { openProblem(PROBLEMS[idx + 1].id); } }));
    app.appendChild(nav);

    if (cur.focus !== false) input.focus({ preventScroll: true });
    cur.focus = false;
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
    var solved = PROBLEMS.filter(function (p) { return record[p.id] && record[p.id].correct; }).length;
    document.getElementById("progress").textContent = "正解した問題：" + solved + " / " + PROBLEMS.length;
  }

  function render() {
    app.innerHTML = "";
    document.querySelectorAll(".tab").forEach(function (t) {
      var v = t.getAttribute("data-view");
      t.classList.toggle("active", v === state.view || (v === "list" && state.view === "problem"));
    });
    if (state.view === "list") renderList();
    else if (state.view === "tips") renderTips();
    else renderProblem();
  }

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
