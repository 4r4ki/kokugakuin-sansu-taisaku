// 難問チャレンジの「解き方ガイド」
// GUIDES のキーは hard-problems.js の category と同じにする（その分野の問題からガイドへ、ガイドから問題へリンクする）
// sections: { title, html, fig?: problems.js と同じ図の形式, widget?: GUIDE_WIDGETS のキー }
(function () {
  "use strict";

  // ---------- ニュートン算の線分図 ----------
  // 窓口3つで30分（受けつけ90）と、窓口4つで18分（受けつけ72）。はじめの行列は45、毎分1.5ふえる（①の数）

  function newtonBars() {
    var u = 3, x0 = 74; // 1目もり＝3px
    function seg(y, from, len, cls, label) {
      return '<rect x="' + (x0 + from * u) + '" y="' + y + '" width="' + len * u + '" height="24" class="' + cls + '"/>' +
        '<text x="' + (x0 + (from + len / 2) * u) + '" y="' + (y + 13) + '">' + label + "</text>";
    }
    var s = "";
    // 30分の場合
    s += '<text x="36" y="30" class="lbl">窓口3つ</text><text x="36" y="46" class="lbl">30分</text>';
    s += seg(14, 0, 45, "shade", "はじめの行列") + seg(14, 45, 45, "shade2", "30分でふえた");
    s += seg(42, 0, 90, "bar-done", "受けつけた ③×30＝90");
    // 18分の場合
    s += '<text x="36" y="104" class="lbl">窓口4つ</text><text x="36" y="120" class="lbl">18分</text>';
    s += seg(88, 0, 45, "shade", "はじめの行列") + seg(88, 45, 27, "shade2", "18分で");
    s += seg(116, 0, 72, "bar-done", "受けつけた ④×18＝72");
    // 差
    var a = x0 + 72 * u, b = x0 + 90 * u;
    s += '<line x1="' + a + '" y1="10" x2="' + a + '" y2="146" class="thin"/>';
    s += '<path d="M' + a + ",156 L" + a + ",162 L" + b + ",162 L" + b + ',156" class="mark"/>';
    s += '<text x="' + b + '" y="176" class="lbl" style="text-anchor: end">差18 ＝ 12分でふえた分</text>';
    return '<svg viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  }

  // ---------- 窓口の数を変えてみるグラフ ----------
  // 1つの窓口が1分に10人受けつけるとすると、はじめ450人、毎分15人ふえる

  var START = 450, GROW = 15, PER = 10, TMAX = 100, YMAX = 800;

  function newtonSim() {
    var ns = "http://www.w3.org/2000/svg";
    var W = 340, Hh = 230, L = 44, R = 12, T = 24, B = 30;
    var pw = W - L - R, ph = Hh - T - B;
    var n = 3;

    var root = document.createElement("div");
    root.className = "sim";

    var buttons = document.createElement("div");
    buttons.className = "filter";
    var info = document.createElement("p");
    info.className = "sim-info";

    var wrap = document.createElement("div");
    wrap.className = "sim-chart";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + Hh);
    svg.setAttribute("role", "img");
    var tip = document.createElement("div");
    tip.className = "sim-tip";
    tip.hidden = true;
    wrap.appendChild(svg);
    wrap.appendChild(tip);

    function X(t) { return L + (t / TMAX) * pw; }
    function Y(v) { return T + ph - (Math.min(v, YMAX) / YMAX) * ph; }
    function add(tag, attrs, text, parent) {
      var e = document.createElementNS(ns, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (text != null) e.textContent = text;
      (parent || svg).appendChild(e);
      return e;
    }
    // 行列の人数（t分後）。なくなったら0のまま
    function queue(t) {
      var net = PER * n - GROW;
      return Math.max(0, START - net * t);
    }
    function emptyAt() {
      var net = PER * n - GROW;
      return net > 0 ? START / net : null;
    }

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var g;
      for (g = 0; g <= YMAX; g += 200) {
        add("line", { x1: L, y1: Y(g), x2: W - R, y2: Y(g), class: "grid" });
        add("text", { x: L - 6, y: Y(g) + 4, class: "axis", "text-anchor": "end" }, String(g));
      }
      for (g = 0; g <= TMAX; g += 20) {
        add("text", { x: X(g), y: Hh - B + 16, class: "axis", "text-anchor": "middle" }, String(g));
      }
      add("text", { x: L - 6, y: T - 12, class: "axis", "text-anchor": "end" }, "（人）");
      add("text", { x: W - R, y: Hh - 2, class: "axis", "text-anchor": "end" }, "分後");
      add("line", { x1: L, y1: Y(0), x2: W - R, y2: Y(0), class: "base" });

      var e = emptyAt();
      var tEnd = e == null ? TMAX : Math.min(e, TMAX);
      var tStop = e == null ? Math.min(TMAX, (YMAX - START) / (GROW - PER * n) || TMAX) : tEnd;
      var d = "M" + X(0) + "," + Y(queue(0)) + " L" + X(tStop) + "," + Y(queue(tStop));
      if (e != null && e < TMAX) d += " L" + X(TMAX) + "," + Y(0);
      add("path", { d: d, class: "line" });
      if (e != null && e <= TMAX) {
        add("circle", { cx: X(e), cy: Y(0), r: 5, class: "dot" });
        add("text", { x: Math.min(X(e) + 8, W - R - 60), y: Y(0) - 10, class: "note" }, Math.round(e * 10) / 10 + "分でなくなる");
      }
      add("line", { x1: 0, y1: T, x2: 0, y2: T + ph, class: "cross", visibility: "hidden" });
      var hit = add("rect", { x: L, y: T, width: pw, height: ph, class: "hit" });
      hit.addEventListener("pointermove", move);
      hit.addEventListener("pointerdown", move);
      hit.addEventListener("pointerleave", function () {
        tip.hidden = true;
        svg.querySelector(".cross").setAttribute("visibility", "hidden");
      });

      var net = PER * n - GROW;
      var html = "窓口 <b>" + n + "つ</b>：1分に受けつける人数 " + PER + " × " + n + " ＝ " + PER * n + "人、ふえる人数 " + GROW + "人<br>";
      if (net > 0) {
        html += "→ 行列は1分に " + PER * n + " − " + GROW + " ＝ <b>" + net + "人</b> ずつへる → " + START + " ÷ " + net + " ＝ <b>" +
          (Math.round((START / net) * 100) / 100) + "分</b> でなくなる";
      } else {
        html += "→ ふえる人数のほうが多いので、行列は<b>いつまでもなくならない</b>（1分に " + (-net) + "人ずつふえる）";
      }
      info.innerHTML = html;
      svg.setAttribute("aria-label", "窓口" + n + "つのときの行列の人数のグラフ");
    }

    function move(ev) {
      var box = svg.getBoundingClientRect();
      var sx = ((ev.clientX - box.left) / box.width) * W;
      var t = Math.max(0, Math.min(TMAX, Math.round(((sx - L) / pw) * TMAX)));
      var cross = svg.querySelector(".cross");
      cross.setAttribute("x1", X(t));
      cross.setAttribute("x2", X(t));
      cross.setAttribute("visibility", "visible");
      var v = START + GROW * t - PER * n * t;
      tip.textContent = t + "分後：" + (v <= 0 ? "0人（行列なし）" : Math.round(v) + "人");
      tip.hidden = false;
      tip.style.left = Math.min((X(t) / W) * 100, 70) + "%";
    }

    for (var k = 1; k <= 8; k++) {
      (function (k) {
        var b = document.createElement("button");
        b.className = "chip" + (k === n ? " active" : "");
        b.textContent = "窓口" + k + "つ";
        b.addEventListener("click", function () {
          n = k;
          Array.prototype.forEach.call(buttons.children, function (c, i) { c.classList.toggle("active", i + 1 === n); });
          draw();
        });
        buttons.appendChild(b);
      })(k);
    }

    root.appendChild(buttons);
    root.appendChild(wrap);
    root.appendChild(info);
    draw();
    return root;
  }

  window.GUIDE_WIDGETS = { newtonSim: newtonSim };

  // ---------- ガイドの本文 ----------

  window.GUIDES = {
    "ニュートン算": {
      lead: "ニュートン算は「へらしているのに、ふえ続ける」問題です。図をかいて、4つのステップで解けるようになろう。",
      sections: [
        {
          title: "ニュートン算ってどんな問題？",
          html:
            "<p>はじめに<b>ある量</b>があって、それが<b>ふえ続けている</b>のに、同時に<b>へらしていく</b>問題です。</p>" +
            "<ul><li>行列：はじめから並んでいる人がいて、毎分ふえる。窓口で受けつけてへらす。</li>" +
            "<li>牧場の草：はじめから草が生えていて、毎日のびる。牛が食べてへらす。</li>" +
            "<li>わき水：井戸に水があって、毎分わき出る。ポンプでくみ出してへらす。</li>" +
            "<li>貯金：はじめに貯金があって、毎月収入がある。使ってへらす。</li></ul>" +
            "<p>どれも、<b>「はじめの量」「1分にふえる量」「1分にへらす量」</b>の3つでできています。</p>",
          fig: {
            type: "table",
            head: ["", "はじめ", "ふえる", "へらす"],
            rows: [
              ["行列", "並んでいる人", "並ぶ人", "窓口"],
              ["牧場", "生えている草", "のびる草", "牛"],
              ["井戸", "たまった水", "わく水", "ポンプ"],
              ["貯金", "はじめの貯金", "収入", "使うお金"],
            ],
          },
        },
        {
          title: "例題",
          html:
            "<p class=\"guide-q\">ある売り場では、発売開始のときすでに行列ができていて、その後も毎分同じ人数ずつ人が並びます。窓口を3つにすると30分で、4つにすると18分で行列がなくなります。窓口を6つにすると、何分で行列がなくなりますか。</p>" +
            "<p>わからない数が3つ（はじめの人数、毎分ふえる人数、1つの窓口が受けつける人数）もあります。でも、順番に考えればだいじょうぶ。</p>",
        },
        {
          title: "ステップ1：「1つ分」を①とおく",
          html:
            "<p>1つの窓口が1分間に受けつける人数を <b>①</b> とします。</p>" +
            "<p>窓口3つで30分なら、受けつけた人数は「①が 3 × 30 ＝ 90個分」。ここからは①を1として、<b>90</b> のように数だけで書きます。</p>" +
            "<ul><li>窓口3つ・30分 → 3 × 30 ＝ <b>90</b></li><li>窓口4つ・18分 → 4 × 18 ＝ <b>72</b></li></ul>",
        },
        {
          title: "ステップ2：線分図をかく",
          html:
            "<p>行列がなくなったとき、<b>受けつけた人数 ＝ はじめの行列 ＋ その間にふえた人数</b> です。2つの場合を、はじめの行列をそろえてならべてみよう。</p>",
          fig: { type: "svg", svg: newtonBars() },
        },
        {
          title: "ステップ3：差から「1分にふえる量」を出す",
          html:
            "<p>はじめの行列は同じなので、2つの差 90 − 72 ＝ <b>18</b> は、<b>30 − 18 ＝ 12分間にふえた人数</b>です。</p>" +
            "<p>1分にふえる量 ＝ 18 ÷ 12 ＝ <b>1.5</b></p>",
        },
        {
          title: "ステップ4：はじめの量を出す",
          html:
            "<p>窓口3つ・30分の場合で考えると、受けつけた90のうち、30分でふえた分は 1.5 × 30 ＝ 45。</p>" +
            "<p>はじめの行列 ＝ 90 − 45 ＝ <b>45</b></p>" +
            "<p>（窓口4つで確かめ：72 − 1.5 × 18 ＝ 45 ✔）</p>",
        },
        {
          title: "ステップ5：聞かれていることを計算する",
          html:
            "<p>窓口6つでは、1分に 6 受けつけて、1.5 ふえる。だから行列は1分に <b>6 − 1.5 ＝ 4.5</b> ずつへる。</p>" +
            "<p>はじめの45がなくなるのは 45 ÷ 4.5 ＝ <b>10分後</b>。これが答えです。</p>",
        },
        {
          title: "グラフで見てみよう：窓口の数を変えると？",
          html:
            "<p>1つの窓口が1分に10人受けつけるとすると、はじめの行列は450人、毎分15人ずつふえることになります。窓口の数を変えて、行列がへっていく様子を見てみよう。グラフをさわると、その時間の人数がわかります。</p>",
          widget: "newtonSim",
        },
        {
          title: "解き方の型（まとめ）",
          html:
            "<ol class=\"guide-steps\">" +
            "<li>「1つ分」（窓口1つ・牛1頭・ポンプ1台が1分〔1日〕にへらす量）を <b>1</b> とおく</li>" +
            "<li>2つの場合の <b>へらした量</b> を出す（台数 × 時間）</li>" +
            "<li><b>1分にふえる量</b> ＝ へらした量の差 ÷ 時間の差</li>" +
            "<li><b>はじめの量</b> ＝ へらした量 − ふえる量 × 時間</li>" +
            "<li><b>かかる時間</b> ＝ はじめの量 ÷ （へらす量 − ふえる量）</li></ol>" +
            "<p>「何台あればよいか」を聞かれたら、5の式を逆に使います：<br>台数 ＝ （はじめの量 ＋ ふえる量 × 時間） ÷ 時間</p>",
        },
        {
          title: "旅人算と同じしくみ",
          html:
            "<p>ステップ5は、<b>追いかける旅人算</b>とまったく同じです。</p>" +
            "<ul><li>はじめの量 ＝ はじめにはなれているきょり</li>" +
            "<li>へらす量 ＝ 追いかける人の速さ、ふえる量 ＝ にげる人の速さ</li>" +
            "<li>かかる時間 ＝ はじめのきょり ÷ 速さの差</li></ul>" +
            "<p>「へらす人が、ふえる量を追いかけて、はじめの差をうめる」と考えるとわかりやすいよ。</p>",
        },
        {
          title: "よくあるまちがい",
          html:
            "<ul>" +
            "<li><b>はじめの量をわすれる</b>：「へらした量 ＝ ふえた量」ではありません。はじめからあった分も入っています。</li>" +
            "<li><b>台数・人数は切り上げ</b>：「8.5台」と出たら、8台では足りないので <b>9台</b>。</li>" +
            "<li><b>ふえる量 ≧ へらす量</b>のときは、いつまでもなくならない（グラフで窓口1つを選んでみよう）。</li>" +
            "<li><b>とちゅうで台数が変わる</b>問題は、変わるところで区切って、それぞれ「1分に何へるか」を考える。</li>" +
            "<li>エスカレーターの問題は、「自分で歩いた段数」を「へらした量」と考えると同じ型で解けます。</li>" +
            "</ul>",
        },
      ],
    },
  };
})();
