// 入試対策：大問1（計算問題）・大問2（穴埋め：単位換算・割合など）の自動生成
// 出題内容（一般入試・算数 50分/100点）
//   大問1：計算問題（基礎〜標準レベル）／大問2：穴埋め問題（単位換算・割合など）
// 各 make() は problems.js と同じ形の問題を返す。question のかわりに questionHtml（分数の表示用）を使う。
// 数は分数（F）で正確に計算し、表示のときに小数や帯分数に直す。
(function () {
  "use strict";

  function ri(a, b, step) {
    step = step || 1;
    return a + step * Math.floor(Math.random() * (Math.floor((b - a) / step) + 1));
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }
  function lcm(a, b) {
    return a / gcd(a, b) * b;
  }

  // ---------- 分数 ----------
  function F(n, d) {
    d = d || 1;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }
  function add(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function sub(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function mul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function div(a, b) { return F(a.n * b.d, a.d * b.n); }
  function val(a) { return a.n / a.d; }
  function isInt(a) { return a.d === 1; }
  // 小数で表せる（分母が2と5だけ）
  function isDec(a) {
    var d = a.d;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1;
  }
  // 小数の文字列（2.50 → 2.5）
  function ds(a) {
    var s = (a.n / a.d).toFixed(6);
    return s.replace(/\.?0+$/, "");
  }
  // 小数 x を分数に（x は 0.125 などの有限小数）
  function D(x) {
    var k = 1;
    while (Math.abs(x * k - Math.round(x * k)) > 1e-9) k *= 10;
    return F(Math.round(x * k), k);
  }
  // 分数のHTML（帯分数にする）
  function fh(a, improper) {
    if (a.d === 1) return String(a.n);
    var w = Math.floor(a.n / a.d), r = a.n - w * a.d;
    var fr = '<span class="frac"><span>' + (improper || !w ? a.n : r) + "</span><span>" + a.d + "</span></span>";
    return (!improper && w ? w : "") + fr;
  }
  // 答えの表示：整数・小数・分数
  function ah(a) {
    return isDec(a) ? ds(a) : fh(a);
  }
  function retry(fn) {
    for (var i = 0; i < 2000; i++) {
      var p = fn();
      if (p) return p;
    }
    throw new Error("問題を作れませんでした");
  }
  function calcQ(expr) {
    return "次の計算をしなさい。" + '<div class="calc-expr">' + expr + " ＝</div>";
  }
  function fillQ(text) {
    return "次の□にあてはまる数を答えなさい。" + '<div class="calc-expr">' + text + "</div>";
  }
  var BOX = '<span class="box-blank">□</span>';
  var FRAC_HINT = "答えが分数のときは「5/6」や「1と2/3」のように入力します（約分してもしなくても正解になります）。";

  // =================== 大問1：計算 ===================

  var CALC = [
    {
      key: "seisu", name: "整数（計算の順序）", category: "計算", level: 1,
      make: function () {
        var form = ri(0, 3), a, b, c, d, e, ans, expr, steps;
        if (form === 0) {
          a = ri(10, 99); b = ri(2, 19); c = ri(2, 15); e = ri(2, 9); var q = ri(2, 20); d = e * q;
          ans = a + b * c - q;
          expr = a + " ＋ " + b + " × " + c + " − " + d + " ÷ " + e;
          steps = [
            { title: "かけ算・わり算を先に", html: b + " × " + c + " ＝ " + b * c + "、" + d + " ÷ " + e + " ＝ " + q },
            { title: "左から順にたし算・ひき算", html: a + " ＋ " + b * c + " − " + q + " ＝ <b>" + ans + "</b>" },
          ];
        } else if (form === 1) {
          b = ri(5, 40); a = b + ri(2, 15); c = ri(2, 12); e = ri(2, 9); q = ri(2, 15); d = e * q;
          ans = (a - b) * c + q;
          expr = "(" + a + " − " + b + ") × " + c + " ＋ " + d + " ÷ " + e;
          steps = [
            { title: "（　）の中を先に", html: a + " − " + b + " ＝ " + (a - b) },
            { title: "かけ算・わり算", html: (a - b) + " × " + c + " ＝ " + (a - b) * c + "、" + d + " ÷ " + e + " ＝ " + q },
            { title: "たし算", html: (a - b) * c + " ＋ " + q + " ＝ <b>" + ans + "</b>" },
          ];
        } else if (form === 2) {
          a = ri(3, 19); b = ri(5, 30); c = ri(5, 30); d = ri(2, 15); e = ri(2, 9);
          ans = a * (b + c) - d * e;
          if (ans <= 0) return null;
          expr = a + " × (" + b + " ＋ " + c + ") − " + d + " × " + e;
          steps = [
            { title: "（　）の中を先に", html: b + " ＋ " + c + " ＝ " + (b + c) },
            { title: "かけ算", html: a + " × " + (b + c) + " ＝ " + a * (b + c) + "、" + d + " × " + e + " ＝ " + d * e },
            { title: "ひき算", html: a * (b + c) + " − " + d * e + " ＝ <b>" + ans + "</b>" },
          ];
        } else {
          c = ri(2, 20); b = c + ri(2, 9); var k = ri(3, 25); a = k * (b - c); d = ri(2, 12); e = ri(2, 12);
          ans = k + d * e;
          expr = a + " ÷ (" + b + " − " + c + ") ＋ " + d + " × " + e;
          steps = [
            { title: "（　）の中を先に", html: b + " − " + c + " ＝ " + (b - c) },
            { title: "わり算・かけ算", html: a + " ÷ " + (b - c) + " ＝ " + k + "、" + d + " × " + e + " ＝ " + d * e },
            { title: "たし算", html: k + " ＋ " + d * e + " ＝ <b>" + ans + "</b>" },
          ];
        }
        return {
          questionHtml: calcQ(expr),
          answer: { value: ans, unit: "" },
          hints: ["計算の順序：①（　）の中 ②かけ算・わり算 ③たし算・ひき算（左から順に）。"],
          steps: steps,
        };
      },
    },
    {
      key: "shosu", name: "小数", category: "計算", level: 1,
      make: function () {
        var form = ri(0, 3), x, y, z, w, k, ans, expr, steps;
        if (form === 0) {
          x = F(ri(12, 98), 10); y = F(ri(12, 49), 10);
          if (x.d === 1 || y.d === 1) return null;
          ans = mul(x, y);
          expr = ds(x) + " × " + ds(y);
          steps = [
            { title: "小数点を考えずに計算", html: Math.round(val(x) * 10) + " × " + Math.round(val(y) * 10) + " ＝ " + Math.round(val(ans) * 100) },
            { title: "小数点をうつ", html: "小数点以下のけた数は 1 ＋ 1 ＝ 2けた → <b>" + ds(ans) + "</b>" },
          ];
        } else if (form === 1) {
          y = F(ri(2, 48), 10); k = F(ri(11, 99), 10);
          if (y.d === 1 || k.d === 1) return null;
          x = mul(y, k); ans = k;
          expr = ds(x) + " ÷ " + ds(y);
          steps = [
            { title: "わる数を整数にする", html: "わる数とわられる数の小数点を、同じけただけ右へ移します：" + ds(x) + " ÷ " + ds(y) + " ＝ " + ds(mul(x, F(10))) + " ÷ " + ds(mul(y, F(10))) },
            { title: "計算", html: ds(mul(x, F(10))) + " ÷ " + ds(mul(y, F(10))) + " ＝ <b>" + ds(ans) + "</b>" },
          ];
        } else if (form === 2) {
          x = F(ri(12, 60), 10); y = F(ri(12, 40), 10); w = F(ri(2, 9), 10); k = F(ri(2, 40), 10); z = mul(w, k);
          var xy = mul(x, y);
          ans = sub(xy, k);
          if (val(ans) <= 0 || x.d === 1 || y.d === 1) return null;
          expr = ds(x) + " × " + ds(y) + " − " + ds(z) + " ÷ " + ds(w);
          steps = [
            { title: "かけ算・わり算を先に", html: ds(x) + " × " + ds(y) + " ＝ " + ds(xy) + "、" + ds(z) + " ÷ " + ds(w) + " ＝ " + ds(k) },
            { title: "ひき算", html: ds(xy) + " − " + ds(k) + " ＝ <b>" + ds(ans) + "</b>" },
          ];
        } else {
          x = F(ri(101, 999), 100); y = F(ri(101, 999), 100); z = F(ri(2, 25), 10);
          var s = add(x, y);
          ans = mul(s, z);
          if (ans.d > 100) return null;
          expr = "(" + ds(x) + " ＋ " + ds(y) + ") × " + ds(z);
          steps = [
            { title: "（　）の中を先に", html: ds(x) + " ＋ " + ds(y) + " ＝ " + ds(s) + "（小数点をそろえてたす）" },
            { title: "かけ算", html: ds(s) + " × " + ds(z) + " ＝ <b>" + ds(ans) + "</b>" },
          ];
        }
        return {
          questionHtml: calcQ(expr),
          answer: { value: val(ans), unit: "" },
          hints: ["かけ算は、小数点を考えずに計算してから、かける数とかけられる数の小数点以下のけた数の合計だけ小数点をうつ。", "わり算は、わる数が整数になるように、両方の小数点を同じけただけ動かす。"],
          steps: steps,
        };
      },
    },
    {
      key: "bunsu", name: "分数のたし算・ひき算", category: "計算", level: 2,
      make: function () {
        var dens = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15];
        var fr = [0, 1, 2].map(function () {
          var d = pick(dens), n = ri(1, d - 1);
          if (gcd(n, d) !== 1) return null;
          return F(ri(0, 2) * d + n, d);
        });
        if (fr.indexOf(null) >= 0) return null;
        var L = lcm(lcm(fr[0].d, fr[1].d), fr[2].d);
        if (L > 60 || fr[0].d === fr[1].d) return null;
        var plus = ri(0, 1) === 1;
        var ans = plus ? add(add(fr[0], fr[1]), fr[2]) : sub(add(fr[0], fr[1]), fr[2]);
        if (val(ans) <= 0 || ans.d === 1) return null;
        var op = plus ? " ＋ " : " − ";
        var expr = fh(fr[0]) + " ＋ " + fh(fr[1]) + op + fh(fr[2]);
        var tsu = fr.map(function (f) { return fh({ n: f.n * (L / f.d), d: L }, true); });
        var raw = fr[0].n * (L / fr[0].d) + fr[1].n * (L / fr[1].d) + (plus ? 1 : -1) * fr[2].n * (L / fr[2].d);
        return {
          questionHtml: calcQ(expr),
          answer: { value: val(ans), unit: "", text: ah(ans) },
          hints: ["帯分数は仮分数に直し、分母を" + L + "にそろえて（通分して）計算しよう。", FRAC_HINT],
          steps: [
            { title: "通分する（分母を " + L + " に）", html: tsu[0] + " ＋ " + tsu[1] + op + tsu[2] },
            { title: "分子を計算", html: fh({ n: raw, d: L }, true) + (raw / L === val(ans) && ans.d === L ? "" : " ＝ " + fh(ans, true) + "（約分）") },
            { title: "答え（約分・帯分数に）", html: "<b>" + fh(ans) + "</b>" },
          ],
        };
      },
    },
    {
      key: "bunsu2", name: "分数のかけ算・わり算", category: "計算", level: 2,
      make: function () {
        function rf() {
          var d = ri(2, 12), n = ri(1, d * 2);
          if (gcd(n, d) !== 1) return null;
          return F(n, d);
        }
        var a = rf(), b = rf(), c = rf();
        if (!a || !b || !c) return null;
        var form = ri(0, 1);
        var ans = form ? mul(div(a, b), c) : div(mul(a, b), c);
        if (ans.d > 12 || val(ans) > 30 || val(ans) < 0.1) return null;
        if ([a, b, c].some(function (f) { return f.d === 1; })) return null;
        var expr = form ? fh(a) + " ÷ " + fh(b) + " × " + fh(c) : fh(a) + " × " + fh(b) + " ÷ " + fh(c);
        var one = form ? fh(a, true) + " × " + fh(F(b.d, b.n), true) + " × " + fh(c, true) : fh(a, true) + " × " + fh(b, true) + " × " + fh(F(c.d, c.n), true);
        return {
          questionHtml: calcQ(expr),
          answer: { value: val(ans), unit: "", text: ah(ans) },
          hints: ["帯分数は仮分数に直そう。わり算は、わる数の分母と分子を入れかえてかけ算にします。", "かけ算にしたら、計算する前に約分すると楽です。", FRAC_HINT],
          steps: [
            { title: "仮分数にして、わり算をかけ算に", html: one },
            { title: "約分して計算", html: "＝ " + fh(ans, true) },
            { title: "答え", html: "<b>" + fh(ans) + "</b>" },
          ],
        };
      },
    },
    {
      key: "mix", name: "小数と分数のまじった計算", category: "計算", level: 2,
      make: function () {
        var x = D(pick([0.25, 0.5, 0.75, 1.25, 1.5, 0.2, 0.4, 0.6, 0.8, 1.2, 2.4, 0.125, 0.375, 3.6, 1.75, 2.5]));
        function rf() {
          var d = ri(2, 9), n = ri(1, d * 2);
          if (gcd(n, d) !== 1 || n % d === 0) return null;
          return F(n, d);
        }
        var p = rf(), q = rf();
        if (!p || !q) return null;
        var form = ri(0, 2), ans, expr, s1, s2;
        if (form === 0) {
          var t = sub(x, p);
          if (val(t) <= 0) return null;
          ans = mul(t, q);
          expr = "(" + ds(x) + " − " + fh(p) + ") × " + fh(q);
          s1 = "(" + fh(x) + " − " + fh(p) + ") × " + fh(q, true);
          s2 = fh(t, true) + " × " + fh(q, true) + " ＝ " + fh(ans, true);
        } else if (form === 1) {
          ans = add(div(x, p), q);
          expr = ds(x) + " ÷ " + fh(p) + " ＋ " + fh(q);
          s1 = fh(x) + " × " + fh(F(p.d, p.n), true) + " ＋ " + fh(q, true);
          s2 = fh(div(x, p), true) + " ＋ " + fh(q, true) + " ＝ " + fh(ans, true);
        } else {
          var m = mul(x, p);
          ans = sub(m, q);
          if (val(ans) <= 0) return null;
          expr = ds(x) + " × " + fh(p) + " − " + fh(q);
          s1 = fh(x) + " × " + fh(p, true) + " − " + fh(q, true);
          s2 = fh(m, true) + " − " + fh(q, true) + " ＝ " + fh(ans, true);
        }
        if (ans.d > 30 || val(ans) > 30) return null;
        return {
          questionHtml: calcQ(expr),
          answer: { value: val(ans), unit: "", text: ah(ans) },
          hints: ["小数を分数に直してから計算しよう。0.25＝1/4、0.75＝3/4、0.125＝1/8、0.2＝1/5 などは覚えておくと速い。", FRAC_HINT],
          steps: [
            { title: "小数を分数に直す", html: ds(x) + " ＝ " + fh(x) + " → " + s1 },
            { title: "計算", html: s2 },
            { title: "答え", html: "<b>" + ah(ans) + "</b>" },
          ],
        };
      },
    },
    {
      key: "gyaku", name: "逆算（□を求める）", category: "計算", level: 2,
      make: function () {
        var form = ri(0, 3), x, a, b, c, d, k, expr, steps, ans;
        if (form === 0) {
          x = ri(2, 30); a = ri(2, 20); b = ri(2, 9); c = (x + a) * b; ans = F(x);
          expr = "(" + BOX + " ＋ " + a + ") × " + b + " ＝ " + c;
          steps = [
            { title: "外側から順にもどす", html: BOX + " ＋ " + a + " ＝ " + c + " ÷ " + b + " ＝ " + (x + a) },
            { title: "□を求める", html: BOX + " ＝ " + (x + a) + " − " + a + " ＝ <b>" + x + "</b>" },
          ];
        } else if (form === 1) {
          b = ri(2, 9); k = ri(2, 20); x = b * k; c = ri(1, 30); a = c + k; ans = F(x);
          expr = a + " − " + BOX + " ÷ " + b + " ＝ " + c;
          steps = [
            { title: "□÷" + b + " のかたまりを求める", html: BOX + " ÷ " + b + " ＝ " + a + " − " + c + " ＝ " + k + "（ひかれる数 − 答え）" },
            { title: "□を求める", html: BOX + " ＝ " + k + " × " + b + " ＝ <b>" + x + "</b>" },
          ];
        } else if (form === 2) {
          b = ri(2, 8); k = ri(2, 15); a = ri(2, 30); x = k * b + a; c = ri(2, 40); d = k + c; ans = F(x);
          expr = "(" + BOX + " − " + a + ") ÷ " + b + " ＋ " + c + " ＝ " + d;
          steps = [
            { title: "最後のたし算をもどす", html: "(" + BOX + " − " + a + ") ÷ " + b + " ＝ " + d + " − " + c + " ＝ " + k },
            { title: "わり算をもどす", html: BOX + " − " + a + " ＝ " + k + " × " + b + " ＝ " + k * b },
            { title: "□を求める", html: BOX + " ＝ " + k * b + " ＋ " + a + " ＝ <b>" + x + "</b>" },
          ];
        } else {
          var dx = ri(2, 9), xf = F(ri(1, dx * 2), dx), p = F(ri(1, 9), ri(2, 9)), q = F(ri(1, 5), ri(2, 9));
          if (xf.d === 1 || p.d === 1) return null;
          var r = sub(mul(xf, p), q);
          if (val(r) <= 0 || r.d > 36) return null;
          ans = xf;
          expr = BOX + " × " + fh(p) + " − " + fh(q) + " ＝ " + fh(r);
          steps = [
            { title: "ひき算をもどす", html: BOX + " × " + fh(p) + " ＝ " + fh(r) + " ＋ " + fh(q) + " ＝ " + fh(mul(xf, p)) },
            { title: "かけ算をもどす", html: BOX + " ＝ " + fh(mul(xf, p)) + " ÷ " + fh(p) + " ＝ <b>" + fh(xf) + "</b>" },
          ];
        }
        return {
          questionHtml: fillQ(expr),
          answer: { value: val(ans), unit: "", text: ah(ans) },
          hints: ["計算の順番と反対に、最後にした計算からもどしていこう。", "＋はひき算で、×はわり算でもどす。「□でわる」「□をひく」ときは注意（a − □ ＝ c なら □ ＝ a − c）。"],
          steps: steps.concat([{ title: "たしかめ", html: "答えを□に入れて計算し、右の数になるか確かめよう。" }]),
        };
      },
    },
    {
      key: "kufu", name: "計算のくふう", category: "計算", level: 2,
      make: function () {
        var form = ri(0, 4), expr, steps, ans;
        if (form === 0) {
          var s = pick([10, 20, 30, 50, 100]), a = ri(1, s - 1), b = s - a;
          ans = mul(D(3.14), F(s));
          expr = "3.14 × " + a + " ＋ 3.14 × " + b;
          steps = [
            { title: "同じ数（3.14）でまとめる", html: "3.14 × (" + a + " ＋ " + b + ") ＝ 3.14 × " + s },
            { title: "答え", html: "<b>" + ds(ans) + "</b>" },
          ];
        } else if (form === 1) {
          var n = ri(12, 89), m = pick([99, 999, 101]);
          ans = F(n * m);
          expr = n + " × " + m;
          var big = m === 101 ? 100 : m + 1;
          steps = [
            { title: m + " を " + (m === 101 ? "100 ＋ 1" : big + " − 1") + " と考える", html: n + " × " + big + (m === 101 ? " ＋ " : " − ") + n + " × 1" },
            { title: "答え", html: n * big + (m === 101 ? " ＋ " : " − ") + n + " ＝ <b>" + n * m + "</b>" },
          ];
        } else if (form === 2) {
          var pair = pick([[25, 4], [125, 8], [0.25, 4], [1.25, 8], [2.5, 4]]), c = ri(3, 47);
          var p0 = D(pair[0]);
          ans = mul(mul(p0, F(c)), F(pair[1]));
          expr = ds(p0) + " × " + c + " × " + pair[1];
          steps = [
            { title: "かける順番を入れかえる", html: ds(p0) + " × " + pair[1] + " × " + c + " ＝ " + ds(mul(p0, F(pair[1]))) + " × " + c },
            { title: "答え", html: "<b>" + ds(ans) + "</b>" },
          ];
        } else if (form === 3) {
          var a3 = D(ri(11, 99) / 10), t = pick([10, 100]), b3 = ri(2, t - 2), c3 = ri(2, 40), d3 = b3 + c3 - t;
          if (d3 <= 0 || a3.d === 1) return null;
          ans = mul(a3, F(t));
          expr = ds(a3) + " × " + b3 + " ＋ " + ds(a3) + " × " + c3 + " − " + ds(a3) + " × " + d3;
          steps = [
            { title: ds(a3) + " でまとめる", html: ds(a3) + " × (" + b3 + " ＋ " + c3 + " − " + d3 + ") ＝ " + ds(a3) + " × " + t },
            { title: "答え", html: "<b>" + ds(ans) + "</b>" },
          ];
        } else {
          var k0 = ri(1, 3), k1 = k0 + ri(3, 5);
          var terms = [];
          for (var k = k0; k <= k1; k++) terms.push(fh(F(1, k * (k + 1))));
          ans = sub(F(1, k0), F(1, k1 + 1));
          expr = terms.join(" ＋ ");
          steps = [
            { title: "分母を「となり合う整数の積」と見る", html: fh(F(1, k0 * (k0 + 1))) + " ＝ " + fh(F(1, k0)) + " − " + fh(F(1, k0 + 1)) + " のように、1つの分数を2つの分数の差に分けられます（分母 " + k0 * (k0 + 1) + " ＝ " + k0 + " × " + (k0 + 1) + "）。" },
            { title: "となりどうしが消える", html: "(" + fh(F(1, k0)) + " − " + fh(F(1, k0 + 1)) + ") ＋ (" + fh(F(1, k0 + 1)) + " − " + fh(F(1, k0 + 2)) + ") ＋ … ＋ (" + fh(F(1, k1)) + " − " + fh(F(1, k1 + 1)) + ") ＝ " + fh(F(1, k0)) + " − " + fh(F(1, k1 + 1)) },
            { title: "答え", html: "<b>" + fh(ans) + "</b>" },
          ];
        }
        return {
          questionHtml: calcQ(expr),
          answer: { value: val(ans), unit: "", text: ah(ans) },
          hints: ["まともに計算すると大変です。同じ数をまとめたり（分配法則）、かける順番を入れかえたりできないか考えよう。", "25×4＝100、125×8＝1000、99＝100−1 は、くふうの定番です。"],
          steps: steps,
        };
      },
    },
  ];

  // =================== 大問2：穴埋め ===================

  var LEN = [["km", "m", 1000], ["m", "cm", 100], ["cm", "mm", 10], ["kg", "g", 1000], ["t", "kg", 1000], ["g", "mg", 1000],
    ["L", "mL", 1000], ["L", "dL", 10], ["dL", "mL", 100]];
  var AREA = [["m²", "cm²", 10000], ["a", "m²", 100], ["ha", "a", 100], ["ha", "m²", 10000], ["km²", "ha", 100], ["km²", "m²", 1000000],
    ["m³", "cm³", 1000000], ["L", "cm³", 1000], ["m³", "L", 1000], ["dL", "cm³", 100]];
  var WHY = {
    "m²,cm²": "1m＝100cm なので、1m² ＝ 100cm × 100cm ＝ 10000cm²",
    "a,m²": "1a は 1辺10m の正方形 → 10 × 10 ＝ 100m²",
    "ha,a": "1ha は 1辺100m の正方形 ＝ 10000m² ＝ 100a",
    "ha,m²": "1ha は 1辺100m の正方形 → 100 × 100 ＝ 10000m²",
    "km²,ha": "1km² ＝ 1000m × 1000m ＝ 1000000m² ＝ 100ha",
    "km²,m²": "1km ＝ 1000m なので、1km² ＝ 1000 × 1000 ＝ 1000000m²",
    "m³,cm³": "1m ＝ 100cm なので、1m³ ＝ 100 × 100 × 100 ＝ 1000000cm³",
    "L,cm³": "1L は 1辺10cm の立方体 → 10 × 10 × 10 ＝ 1000cm³",
    "m³,L": "1m³ ＝ 1000000cm³、1L ＝ 1000cm³ なので 1m³ ＝ 1000L",
    "dL,cm³": "1L ＝ 1000cm³ ＝ 10dL なので、1dL ＝ 100cm³",
  };

  function unitProblem(list) {
    var u = pick(list), big = u[0], small = u[1], f = u[2];
    var toSmall = ri(0, 1) === 1, given, ans;
    if (toSmall) {
      given = D(ri(1, 999) / pick([10, 100]));
      if (given.d === 1) return null;
      ans = mul(given, F(f));
      if (!isInt(ans) && ans.d > 100) return null;
    } else {
      given = F(ri(1, 99) * pick([1, 10]) * f / pick([10, 100]));
      if (!isInt(given) || given.n <= 0) return null;
      ans = div(given, F(f));
      if (!isDec(ans) || val(ans) < 0.001) return null;
    }
    var from = toSmall ? big : small, to = toSmall ? small : big;
    var why = WHY[big + "," + small] || "1" + big + " ＝ " + f + small;
    return {
      questionHtml: fillQ(ds(given) + from + " ＝ " + BOX + to),
      answer: { value: val(ans), unit: to },
      hints: ["1" + big + " は何" + small + "かを思い出そう。", toSmall ? "大きい単位 → 小さい単位は、かけ算（数が大きくなる）。" : "小さい単位 → 大きい単位は、わり算（数が小さくなる）。"],
      steps: [
        { title: "単位の関係", html: "1" + big + " ＝ " + f + small + (WHY[big + "," + small] ? "（" + why + "）" : "") },
        { title: "計算", html: ds(given) + (toSmall ? " × " : " ÷ ") + f + " ＝ <b>" + ds(ans) + to + "</b>" },
      ],
    };
  }

  var FILL = [
    {
      key: "tani1", name: "単位換算（長さ・重さ・かさ）", category: "単位換算", level: 1,
      make: function () {
        if (ri(0, 3) === 0) {
          // 2つの単位がまじった形：3m45cm ＝ □m
          var u = pick([["m", "cm", 100], ["kg", "g", 1000], ["L", "mL", 1000], ["km", "m", 1000]]);
          var a = ri(1, 9), b = ri(1, u[2] - 1);
          if (u[2] === 1000 && b % 10 !== 0 && ri(0, 1)) b = ri(1, 99) * 10;
          var ans = add(F(a), F(b, u[2]));
          return {
            questionHtml: fillQ(a + u[0] + " " + b + u[1] + " ＝ " + BOX + u[0]),
            answer: { value: val(ans), unit: u[0] },
            hints: ["1" + u[0] + " ＝ " + u[2] + u[1] + "。" + b + u[1] + " は何" + u[0] + "かを考えよう。"],
            steps: [
              { title: b + u[1] + " を " + u[0] + " に", html: b + " ÷ " + u[2] + " ＝ " + ds(F(b, u[2])) + u[0] },
              { title: "合わせる", html: a + " ＋ " + ds(F(b, u[2])) + " ＝ <b>" + ds(ans) + u[0] + "</b>" },
            ],
          };
        }
        return unitProblem(LEN);
      },
    },
    {
      key: "tani2", name: "単位換算（面積・体積）", category: "単位換算", level: 2,
      make: function () { return unitProblem(AREA); },
    },
    {
      key: "tani3", name: "時間・速さの単位", category: "単位換算", level: 2,
      make: function () {
        var form = ri(0, 5), q, ans, unit, steps, hints;
        if (form === 0) {
          var k = ri(1, 30), a = 3 * k; ans = F(50 * k); unit = "m";
          q = "時速" + a + "km ＝ 分速" + BOX + "m";
          steps = [
            { title: "km を m に", html: "時速" + a + "km ＝ 時速" + a * 1000 + "m" },
            { title: "1時間 ＝ 60分 でわる", html: a * 1000 + " ÷ 60 ＝ <b>" + 50 * k + "</b> → 分速" + 50 * k + "m" },
          ];
          hints = ["時速→分速は ÷60、さらに km→m は ×1000。"];
        } else if (form === 1) {
          var a1 = ri(1, 40) * 18; ans = F(a1 * 5, 18); unit = "m";
          q = "時速" + a1 + "km ＝ 秒速" + BOX + "m";
          if (a1 > 200) return null;
          steps = [
            { title: "1時間 ＝ 3600秒", html: a1 + " × 1000 ÷ 3600 ＝ " + a1 + " ÷ 3.6" },
            { title: "答え", html: "<b>" + ds(ans) + "</b> → 秒速" + ds(ans) + "m" },
          ];
          hints = ["時速□km を秒速にするには、×1000（m に）して ÷3600（秒に）。まとめると ÷3.6。"];
        } else if (form === 2) {
          var s = ri(2, 40); ans = mul(F(s), D(3.6)); unit = "km";
          q = "秒速" + s + "m ＝ 時速" + BOX + "km";
          steps = [
            { title: "秒速 → 時速は ×3600、m → km は ÷1000", html: s + " × 3600 ÷ 1000 ＝ " + s + " × 3.6" },
            { title: "答え", html: "<b>" + ds(ans) + "</b> → 時速" + ds(ans) + "km" },
          ];
          hints = ["秒速□m → 時速は、×3.6 でまとめて計算できます。"];
        } else if (form === 3) {
          var h = D(ri(1, 39) / pick([10, 4]));
          if (h.d === 1) return null;
          ans = mul(h, F(60)); unit = "分";
          if (!isInt(ans)) return null;
          q = ds(h) + "時間 ＝ " + BOX + "分";
          steps = [{ title: "1時間 ＝ 60分", html: ds(h) + " × 60 ＝ <b>" + ans.n + "分</b>" }];
          hints = ["1時間 ＝ 60分。小数の時間に60をかけます（0.1時間 ＝ 6分）。"];
        } else if (form === 4) {
          var hh = ri(1, 4), mm = pick([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54]);
          ans = add(F(hh), F(mm, 60)); unit = "時間";
          q = hh + "時間" + mm + "分 ＝ " + BOX + "時間";
          steps = [
            { title: mm + "分を時間に", html: mm + " ÷ 60 ＝ " + ds(F(mm, 60)) + "時間" },
            { title: "合わせる", html: hh + " ＋ " + ds(F(mm, 60)) + " ＝ <b>" + ds(ans) + "時間</b>" },
          ];
          hints = ["分 → 時間は ÷60。6分 ＝ 0.1時間、15分 ＝ 0.25時間 を覚えておこう。"];
        } else {
          var sec = pick([15, 30, 45, 6, 12, 18, 24, 36, 42, 48, 54]) + 60 * ri(1, 5);
          ans = F(sec, 60); unit = "分";
          q = sec + "秒 ＝ " + BOX + "分";
          steps = [{ title: "1分 ＝ 60秒", html: sec + " ÷ 60 ＝ <b>" + ds(ans) + "分</b>" }];
          hints = ["秒 → 分は ÷60。"];
        }
        return { questionHtml: fillQ(q), answer: { value: val(ans), unit: unit }, hints: hints, steps: steps };
      },
    },
    {
      key: "wariai", name: "割合・百分率・歩合", category: "割合", level: 2,
      make: function () {
        var form = ri(0, 5), q, ans, unit, steps;
        var A = ri(2, 60) * 20, p = ri(1, 19) * 5;
        var B = F(A * p, 100);
        if (!isInt(B)) return null;
        if (form === 0) {
          q = A + "円の" + p + "% は " + BOX + "円";
          ans = B; unit = "円";
          steps = [{ title: "くらべる量 ＝ もとにする量 × 割合", html: A + " × " + ds(F(p, 100)) + " ＝ <b>" + B.n + "円</b>" }];
        } else if (form === 1) {
          q = BOX + "円の" + p + "% が " + B.n + "円";
          ans = F(A); unit = "円";
          steps = [{ title: "もとにする量 ＝ くらべる量 ÷ 割合", html: B.n + " ÷ " + ds(F(p, 100)) + " ＝ <b>" + A + "円</b>" }];
        } else if (form === 2) {
          q = B.n + "人は " + A + "人の " + BOX + "%";
          ans = F(p); unit = "%";
          steps = [
            { title: "割合 ＝ くらべる量 ÷ もとにする量", html: B.n + " ÷ " + A + " ＝ " + ds(F(p, 100)) },
            { title: "百分率に", html: ds(F(p, 100)) + " × 100 ＝ <b>" + p + "%</b>" },
          ];
        } else if (form === 3) {
          var wari = ri(1, 9), bu = ri(0, 1) * 5, r = F(wari * 10 + bu, 100);
          var C = mul(F(A), r);
          if (!isInt(C)) return null;
          q = A + "円の" + wari + "割" + (bu ? bu + "分" : "") + " は " + BOX + "円";
          ans = C; unit = "円";
          steps = [
            { title: "歩合を小数に", html: wari + "割" + (bu ? bu + "分" : "") + " ＝ " + ds(r) + "（1割 ＝ 0.1、1分 ＝ 0.01）" },
            { title: "計算", html: A + " × " + ds(r) + " ＝ <b>" + C.n + "円</b>" },
          ];
        } else if (form === 4) {
          var pr = ri(1, 8) * 5, after = mul(F(A), F(100 - pr, 100));
          if (!isInt(after)) return null;
          q = "定価" + A + "円の品物を " + pr + "% 引きで買うと " + BOX + "円";
          ans = after; unit = "円";
          steps = [
            { title: pr + "% 引き → 定価の " + (100 - pr) + "%", html: "1 − " + ds(F(pr, 100)) + " ＝ " + ds(F(100 - pr, 100)) },
            { title: "計算", html: A + " × " + ds(F(100 - pr, 100)) + " ＝ <b>" + after.n + "円</b>" },
          ];
        } else {
          var wr = ri(1, 4), sale = mul(F(A), F(10 - wr, 10));
          if (!isInt(sale)) return null;
          q = BOX + "円の " + wr + "割引きは " + sale.n + "円";
          ans = F(A); unit = "円";
          steps = [
            { title: wr + "割引き → もとの " + (10 - wr) + "割", html: "1 − " + ds(F(wr, 10)) + " ＝ " + ds(F(10 - wr, 10)) },
            { title: "もとの値段 ＝ 売り値 ÷ 割合", html: sale.n + " ÷ " + ds(F(10 - wr, 10)) + " ＝ <b>" + A + "円</b>" },
          ];
        }
        return {
          questionHtml: fillQ(q),
          answer: { value: val(ans), unit: unit },
          hints: ["「〜の」の前が「もとにする量」。くらべる量 ＝ もとにする量 × 割合。", "1% ＝ 0.01、1割 ＝ 0.1、1分 ＝ 0.01。"],
          steps: steps,
        };
      },
    },
    {
      key: "hi", name: "比", category: "比", level: 2,
      make: function () {
        var form = ri(0, 4), q, ans, unit = "", steps;
        var x = ri(1, 9), y = ri(1, 9);
        if (gcd(x, y) !== 1 || x === y) return null;
        if (form === 0) {
          var k = ri(2, 12);
          q = x * k + " : " + y * k + " を最も簡単な整数の比にすると " + x + " : " + BOX;
          ans = F(y);
          steps = [{ title: "両方を最大公約数 " + k + " でわる", html: x * k + " ÷ " + k + " ＝ " + x + "、" + y * k + " ÷ " + k + " ＝ <b>" + y + "</b>" }];
        } else if (form === 1) {
          var m = ri(2, 9);
          q = x + " : " + y + " ＝ " + x * m + " : " + BOX;
          ans = F(y * m);
          steps = [{ title: "前の数が " + m + " 倍", html: x + " × " + m + " ＝ " + x * m + " なので、後ろも " + m + " 倍：" + y + " × " + m + " ＝ <b>" + y * m + "</b>" }];
        } else if (form === 2) {
          var a = D(x / 10), b = D(y / 10);
          if (ri(0, 1)) {
            q = ds(a) + " : " + ds(b) + " ＝ " + x + " : " + BOX;
            ans = F(y);
            steps = [{ title: "両方を10倍して整数に", html: ds(a) + " : " + ds(b) + " ＝ " + x + " : <b>" + y + "</b>" }];
          } else {
            var p = F(x, ri(2, 9)), r = F(y, ri(2, 9));
            if (p.d === 1 || r.d === 1) return null;
            var L = lcm(p.d, r.d), s1 = p.n * L / p.d, s2 = r.n * L / r.d, g = gcd(s1, s2);
            q = fh(p) + " : " + fh(r) + " を最も簡単な整数の比にすると " + s1 / g + " : " + BOX;
            ans = F(s2 / g);
            steps = [
              { title: "分母の最小公倍数 " + L + " をかける", html: fh(p) + " × " + L + " ＝ " + s1 + "、" + fh(r) + " × " + L + " ＝ " + s2 },
              { title: "簡単にする", html: s1 + " : " + s2 + " ＝ " + s1 / g + " : <b>" + s2 / g + "</b>" },
            ];
          }
        } else if (form === 3) {
          var u = ri(2, 30) * 10, total = u * (x + y);
          q = total + "円を、AとBで " + x + " : " + y + " に分けると、Bは " + BOX + "円";
          ans = F(u * y); unit = "円";
          steps = [
            { title: "全体を " + (x + y) + " 等分", html: total + " ÷ (" + x + " ＋ " + y + ") ＝ " + u + "（①あたり）" },
            { title: "Bは " + y + " つ分", html: u + " × " + y + " ＝ <b>" + u * y + "円</b>" },
          ];
        } else {
          var u2 = ri(2, 20) * 5;
          q = "AとBの比は " + x + " : " + y + " で、Aが " + u2 * x + "cm のとき、Bは " + BOX + "cm";
          ans = F(u2 * y); unit = "cm";
          steps = [
            { title: "①にあたる量", html: u2 * x + " ÷ " + x + " ＝ " + u2 },
            { title: "Bは " + y + " つ分", html: u2 + " × " + y + " ＝ <b>" + u2 * y + "cm</b>" },
          ];
        }
        return {
          questionHtml: fillQ(q),
          answer: { value: val(ans), unit: unit },
          hints: ["比の両方に同じ数をかけたり、同じ数でわったりしても、比は等しい。", "分ける問題は、まず「①あたり」がいくつかを求めよう。"],
          steps: steps,
        };
      },
    },
    {
      key: "sonota", name: "平均・速さ", category: "平均・速さ", level: 2,
      make: function () {
        var form = ri(0, 3), q, ans, unit, steps;
        if (form === 0) {
          var n = ri(3, 5), avg = ri(60, 85), next = ri(avg + 1, 100), sum = avg * n + next;
          if (sum % (n + 1)) return null;
          q = n + "回のテストの平均点は " + avg + "点でした。" + (n + 1) + "回目に " + next + "点をとると、" + (n + 1) + "回の平均点は " + BOX + "点";
          ans = F(sum / (n + 1)); unit = "点";
          steps = [
            { title: "合計点を求める", html: avg + " × " + n + " ＝ " + avg * n + "点、" + avg * n + " ＋ " + next + " ＝ " + sum + "点" },
            { title: "平均 ＝ 合計 ÷ 回数", html: sum + " ÷ " + (n + 1) + " ＝ <b>" + sum / (n + 1) + "点</b>" },
          ];
        } else if (form === 1) {
          var v = ri(3, 16) * 4, h = ri(1, 3), mm = pick([15, 30, 45]);
          var t = add(F(h), F(mm, 60)), d = mul(F(v), t);
          q = "時速" + v + "kmで " + h + "時間" + mm + "分 進むと、" + BOX + "km 進む";
          ans = d; unit = "km";
          steps = [
            { title: "時間を「時間」の単位に", html: h + "時間" + mm + "分 ＝ " + ds(t) + "時間" },
            { title: "道のり ＝ 速さ × 時間", html: v + " × " + ds(t) + " ＝ <b>" + ds(d) + "km</b>" },
          ];
        } else if (form === 2) {
          var vm = ri(5, 16) * 10, tm = ri(8, 40), dist = vm * tm;
          q = dist + "m の道のりを、分速" + vm + "mで歩くと " + BOX + "分かかる";
          ans = F(tm); unit = "分";
          steps = [{ title: "時間 ＝ 道のり ÷ 速さ", html: dist + " ÷ " + vm + " ＝ <b>" + tm + "分</b>" }];
        } else {
          var kk = ri(2, 6), each = ri(30, 90), extra = ri(1, 4) * kk;
          var total = each * kk;
          var w = F(extra * (kk + 1), kk);
          if (!isInt(w)) return null;
          var newAvg = F(total + each + w.n, kk + 1);
          if (!isDec(newAvg)) return null;
          q = kk + "人の体重の平均は " + each + "kg です。そこに体重 " + (each + w.n) + "kg の人が1人加わると、" + (kk + 1) + "人の平均は " + BOX + "kg";
          ans = newAvg; unit = "kg";
          steps = [
            { title: "合計を求める", html: each + " × " + kk + " ＝ " + total + "kg、" + total + " ＋ " + (each + w.n) + " ＝ " + (total + each + w.n) + "kg" },
            { title: "平均 ＝ 合計 ÷ 人数", html: (total + each + w.n) + " ÷ " + (kk + 1) + " ＝ <b>" + ds(newAvg) + "kg</b>" },
          ];
        }
        return {
          questionHtml: fillQ(q),
          answer: { value: val(ans), unit: unit },
          hints: ["平均 ＝ 合計 ÷ 個数。合計 ＝ 平均 × 個数。", "速さ ＝ 道のり ÷ 時間、道のり ＝ 速さ × 時間。時間の単位をそろえること。"],
          steps: steps,
        };
      },
    },
  ];

  function makeFrom(list) {
    return {
      types: list,
      make: function (key) {
        var g = key ? list.filter(function (x) { return x.key === key; })[0] : pick(list);
        var p = retry(g.make);
        p.key = g.key;
        p.title = g.name;
        p.category = g.category;
        p.level = g.level;
        return p;
      },
    };
  }

  window.EXAM_GEN = {
    calc: makeFrom(CALC),
    fill: makeFrom(FILL),
    // ミニテスト：大問1から5問、大問2から5問
    mock: function () {
      var c = makeFrom(CALC), f = makeFrom(FILL);
      return ["seisu", "shosu", "bunsu", pick(["bunsu2", "mix", "kufu"]), "gyaku"].map(function (k) { return c.make(k); })
        .concat([pick(["tani1", "tani2"]), "tani3", "wariai", "hi", "sonota"].map(function (k) { return f.make(k); }));
    },
  };
})();
