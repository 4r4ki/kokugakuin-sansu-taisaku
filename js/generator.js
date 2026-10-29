// 数字を変えた練習問題の自動生成
// 各 make() は問題データ（problems.js と同じ形式）を返す。答えがきれいな数になるまで数字を選び直す。
(function () {
  "use strict";

  function ri(a, b, step) {
    step = step || 1;
    return a + step * Math.floor(Math.random() * (Math.floor((b - a) / step) + 1));
  }

  // 浮動小数点の誤差を消して表示用にする
  function fmt(x) {
    return Math.round(x * 1000) / 1000;
  }

  // 小数第1位までで表せるか
  function nice(x) {
    return Math.abs(x * 10 - Math.round(x * 10)) < 1e-9;
  }

  function isInt(x) {
    return Math.abs(x - Math.round(x)) < 1e-9;
  }

  function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  }

  // 比を整数でかんたんにする（小数でもOK）
  function ratio(a, b) {
    var k = 1;
    while ((!isInt(a * k) || !isInt(b * k)) && k < 1000) k *= 10;
    a = Math.round(a * k);
    b = Math.round(b * k);
    var g = gcd(a, b);
    return [a / g, b / g];
  }

  function retry(fn) {
    for (var i = 0; i < 500; i++) {
      var p = fn();
      if (p) return p;
    }
    throw new Error("問題を作れませんでした");
  }

  var GENERATORS = [
    {
      key: "mix-conc",
      name: "混ぜた濃度",
      category: "まぜる",
      level: 1,
      make: function () {
        var c1 = ri(2, 15), c2 = ri(c1 + 2, 24);
        var w1 = ri(100, 500, 50), w2 = ri(100, 500, 50);
        var salt1 = w1 * c1 / 100, salt2 = w2 * c2 / 100;
        var ans = (salt1 + salt2) * 100 / (w1 + w2);
        if (!nice(ans) || !nice(salt1) || !nice(salt2)) return null;
        var rw = ratio(w1, w2);
        return {
          question: c1 + "%の食塩水" + w1 + "gと、" + c2 + "%の食塩水" + w2 + "gを混ぜると、何%の食塩水になりますか。",
          answer: { value: fmt(ans), unit: "%" },
          hints: ["それぞれの食塩の重さを求めよう（食塩＝食塩水×濃度）。", "食塩の合計 ÷ 食塩水の合計 で濃度が出ます。"],
          steps: [
            { title: "食塩の重さ", html: w1 + " × " + fmt(c1 / 100) + " ＝ " + fmt(salt1) + "g、" + w2 + " × " + fmt(c2 / 100) + " ＝ " + fmt(salt2) + "g" },
            { title: "答え", html: "(" + fmt(salt1) + " ＋ " + fmt(salt2) + ") ÷ " + (w1 + w2) + " ＝ " + fmt(ans / 100) + " → <b>" + fmt(ans) + "%</b>" },
            {
              title: "天びん図で確認",
              html: "重さの比 " + rw[0] + ":" + rw[1] + " → うでの比 " + rw[1] + ":" + rw[0] + "。",
              fig: { type: "tenbin", left: { c: c1, w: w1 + "g" }, right: { c: c2, w: w2 + "g" }, mid: fmt(ans), distL: String(fmt(ans - c1)), distR: String(fmt(c2 - ans)), note: "重さ " + rw[0] + ":" + rw[1] + " → うで " + rw[1] + ":" + rw[0] },
            },
          ],
        };
      },
    },
    {
      key: "mix-weight",
      name: "混ぜる量",
      category: "まぜる",
      level: 2,
      make: function () {
        var c1 = ri(2, 12), cm = ri(c1 + 1, 18), c2 = ri(cm + 1, 24);
        var T = ri(300, 1000, 50);
        var d1 = cm - c1, d2 = c2 - cm;
        var w1 = T * d2 / (d1 + d2), w2 = T - w1;
        if (!isInt(w1) || w1 % 10 !== 0) return null;
        var askLeft = Math.random() < 0.5;
        var rd = ratio(d1, d2);
        var target = askLeft ? c1 : c2;
        return {
          question: c1 + "%の食塩水と" + c2 + "%の食塩水を混ぜて、" + cm + "%の食塩水を" + T + "g作りました。" + target + "%の食塩水を何g混ぜましたか。",
          answer: { value: askLeft ? w1 : w2, unit: "g" },
          hints: ["天びん図をかこう。両はしが" + c1 + "%と" + c2 + "%、支点が" + cm + "%です。", "うでの長さの比と重さの比は逆になります。"],
          steps: [
            {
              title: "天びん図",
              html: "うで：" + cm + " − " + c1 + " ＝ " + d1 + "、" + c2 + " − " + cm + " ＝ " + d2 + " → うでの比 <b>" + rd[0] + ":" + rd[1] + "</b>",
              fig: { type: "tenbin", left: { c: c1, w: "?g" }, right: { c: c2, w: "?g" }, mid: cm, distL: String(d1), distR: String(d2), note: "うで " + rd[0] + ":" + rd[1] + " → 重さ " + rd[1] + ":" + rd[0] },
            },
            { title: "重さの比", html: "重さの比は逆で <b>" + rd[1] + ":" + rd[0] + "</b>。" + T + "gを分けると、" + c1 + "%は " + w1 + "g、" + c2 + "%は " + w2 + "g" },
            { title: "答え", html: target + "%の食塩水は <b>" + (askLeft ? w1 : w2) + "g</b>" },
          ],
        };
      },
    },
    {
      key: "evaporate",
      name: "水の蒸発",
      category: "蒸発・水を加える",
      level: 2,
      make: function () {
        var c1 = ri(2, 12), c2 = ri(c1 + 1, 25), W = ri(200, 800, 50);
        var salt = W * c1 / 100;
        var W2 = salt * 100 / c2;
        if (!isInt(salt) || !isInt(W2)) return null;
        return {
          question: c1 + "%の食塩水" + W + "gから水を蒸発させたところ、" + c2 + "%の食塩水になりました。蒸発させた水は何gですか。",
          answer: { value: W - W2, unit: "g" },
          hints: ["水が蒸発しても、食塩の重さは変わりません。", "食塩の重さが" + c2 + "%にあたる食塩水の重さを考えよう。"],
          steps: [
            { title: "食塩は変わらない", html: "食塩：" + W + " × " + fmt(c1 / 100) + " ＝ <b>" + salt + "g</b>" },
            { title: "蒸発後の重さ", html: salt + " ÷ " + fmt(c2 / 100) + " ＝ <b>" + W2 + "g</b>" },
            { title: "答え", html: W + " − " + W2 + " ＝ <b>" + (W - W2) + "g</b>" },
          ],
        };
      },
    },
    {
      key: "add-water",
      name: "水でうすめる",
      category: "蒸発・水を加える",
      level: 2,
      make: function () {
        var c1 = ri(6, 25), c2 = ri(2, c1 - 1), W = ri(100, 600, 50);
        var salt = W * c1 / 100;
        var W2 = salt * 100 / c2;
        if (!isInt(salt) || !isInt(W2) || W2 > 2000) return null;
        var add = W2 - W;
        var rd = ratio(c2, c1 - c2);
        return {
          question: c1 + "%の食塩水" + W + "gに水を加えて、" + c2 + "%の食塩水にしたいと思います。水を何g加えればよいですか。",
          answer: { value: add, unit: "g" },
          hints: ["水を加えても食塩の重さは変わりません。", "水は0%の食塩水と考えて天びん図をかいてもOK。"],
          steps: [
            { title: "食塩の重さ", html: W + " × " + fmt(c1 / 100) + " ＝ <b>" + salt + "g</b>" },
            { title: "うすめた後の重さ", html: salt + " ÷ " + fmt(c2 / 100) + " ＝ <b>" + W2 + "g</b>" },
            {
              title: "答え",
              html: W2 + " − " + W + " ＝ <b>" + add + "g</b>",
              fig: { type: "tenbin", left: { c: 0, w: "水 ?g" }, right: { c: c1, w: W + "g" }, mid: c2, distL: String(c2), distR: String(c1 - c2), note: "うで " + rd[0] + ":" + rd[1] + " → 重さ " + rd[1] + ":" + rd[0] },
            },
          ],
        };
      },
    },
    {
      key: "add-salt",
      name: "食塩を加える",
      category: "食塩を加える",
      level: 2,
      make: function () {
        var c1 = ri(2, 20), c2 = ri(c1 + 2, 30), W = ri(100, 800, 20);
        var water = W * (100 - c1) / 100;
        var T = water * 100 / (100 - c2);
        if (!isInt(water) || !nice(T)) return null;
        var add = fmt(T - W);
        var rd = ratio(c2 - c1, 100 - c2);
        return {
          question: c1 + "%の食塩水" + W + "gに食塩を加えて、" + c2 + "%の食塩水にしたいと思います。食塩を何g加えればよいですか。",
          answer: { value: add, unit: "g" },
          hints: ["食塩を加えても、水の重さは変わりません。", "食塩は100%の食塩水と考えて天びん図をかいてもOK。"],
          steps: [
            { title: "水は変わらない", html: "水：" + W + " × " + fmt((100 - c1) / 100) + " ＝ <b>" + water + "g</b>" },
            { title: "加えた後の重さ", html: c2 + "%の食塩水では水が" + (100 - c2) + "%なので、" + water + " ÷ " + fmt((100 - c2) / 100) + " ＝ <b>" + fmt(T) + "g</b>" },
            {
              title: "答え",
              html: fmt(T) + " − " + W + " ＝ <b>" + add + "g</b>",
              fig: { type: "tenbin", left: { c: c1, w: W + "g" }, right: { c: 100, w: "?g" }, mid: c2, distL: String(c2 - c1), distR: String(100 - c2), note: "うで " + rd[0] + ":" + rd[1] + " → 重さ " + rd[1] + ":" + rd[0] },
            },
          ],
        };
      },
    },
    {
      key: "exchange",
      name: "AとBのやりとり",
      category: "やりとり",
      level: 3,
      make: function () {
        var cA = ri(4, 20), cB = ri(0, 15), wA = ri(200, 500, 100), wB = ri(100, 400, 100), m = ri(50, 200, 50);
        if (cA === cB || m >= wA || m > wB) return null;
        var sA = wA * cA / 100, sB = wB * cB / 100, sm = m * cA / 100;
        var cB2 = (sB + sm) * 100 / (wB + m);
        var back = m * cB2 / 100;
        var sA2 = sA - sm + back;
        var cA2 = sA2 * 100 / wA;
        if (!nice(cB2) || !nice(cA2) || !nice(sA) || !nice(sB) || !nice(sm)) return null;
        var bName = cB === 0 ? "水" : cB + "%の食塩水";
        return {
          question: "容器Aには" + cA + "%の食塩水が" + wA + "g、容器Bには" + bName + "が" + wB + "g入っています。Aから" + m + "gを取り出してBに入れ、よくかき混ぜてから、Bから" + m + "gを取り出してAに入れました。このとき、Aの食塩水は何%ですか。",
          answer: { value: fmt(cA2), unit: "%" },
          hints: ["1回ずつ、AとBの食塩水の重さと食塩の重さを表にして追いかけよう。", "Bから戻す" + m + "gの濃度は、混ぜたあとのBの濃度です。"],
          steps: [
            { title: "はじめ", html: "A：" + wA + "g（食塩" + fmt(sA) + "g）、B：" + wB + "g（食塩" + fmt(sB) + "g）" },
            { title: "A → B に" + m + "g", html: "移る食塩：" + fmt(sm) + "g<br>B：" + (wB + m) + "g、食塩 " + fmt(sB + sm) + "g → <b>" + fmt(cB2) + "%</b>" },
            {
              title: "B → A に" + m + "g",
              html: "移る食塩：" + m + " × " + fmt(cB2 / 100) + " ＝ " + fmt(back) + "g<br>A：" + wA + "g、食塩 " + fmt(sA2) + "g → <b>" + fmt(cA2) + "%</b>",
              fig: {
                type: "table",
                head: ["", "A 食塩水", "A 食塩", "B 食塩水", "B 食塩"],
                rows: [
                  ["はじめ", wA + "g", fmt(sA) + "g", wB + "g", fmt(sB) + "g"],
                  ["A→B", (wA - m) + "g", fmt(sA - sm) + "g", (wB + m) + "g", fmt(sB + sm) + "g"],
                  ["B→A", wA + "g", fmt(sA2) + "g", wB + "g", fmt(sB + sm - back) + "g"],
                ],
              },
            },
          ],
        };
      },
    },
    {
      key: "repeat",
      name: "くみ出しのくり返し",
      category: "やりとり",
      level: 3,
      make: function () {
        var k = ri(2, 5), n = ri(2, 3), c0 = ri(4, 30), W = ri(100, 600, 100);
        var c = c0;
        var list = [];
        for (var i = 0; i < n; i++) {
          c = c * (k - 1) / k;
          list.push(fmt(c));
        }
        if (!nice(c) || !isInt(W / k)) return null;
        var out = W / k;
        var steps = list.map(function (v, i) {
          return (i + 1) + "回目：" + (i === 0 ? c0 : list[i - 1]) + " × " + (k - 1) + "/" + k + " ＝ " + v + "%";
        });
        return {
          question: c0 + "%の食塩水が" + W + "gあります。ここから" + out + "gをくみ出し、かわりに水を" + out + "g入れてよくかき混ぜます。この作業を全部で" + n + "回行うと、何%の食塩水になりますか。",
          answer: { value: fmt(c), unit: "%" },
          hints: [out + "gは全体の1/" + k + "です。くみ出すと食塩も1/" + k + "減ります。", "1回ごとに濃度は" + (k - 1) + "/" + k + "倍になります。"],
          steps: [
            { title: "1回で何倍？", html: "1/" + k + "をくみ出すと食塩は" + (k - 1) + "/" + k + "が残り、重さは" + W + "gにもどるので、<b>濃度は" + (k - 1) + "/" + k + "倍</b>。" },
            { title: "順に計算", html: steps.join("<br>") },
            { title: "答え", html: "<b>" + fmt(c) + "%</b>" },
          ],
        };
      },
    },
    {
      key: "two-mix",
      name: "消去算",
      category: "逆算・消去算",
      level: 3,
      make: function () {
        var a = ri(2, 20), b = ri(2, 20), x = ri(100, 400, 100), y = ri(100, 400, 100);
        if (a === b || x <= y) return null;
        var p = (x * a + y * b) / (x + y), q = (y * a + x * b) / (x + y);
        if (!nice(p) || !nice(q)) return null;
        var X = x / 100, Y = y / 100;
        var S1 = (x + y) * p / 100, S2 = (x + y) * q / 100;
        var sum = (S1 + S2) / (X + Y), diff = (S1 - S2) / (X - Y);
        return {
          question: "食塩水Aを" + x + "g、食塩水Bを" + y + "g混ぜると" + fmt(p) + "%の食塩水になり、Aを" + y + "g、Bを" + x + "g混ぜると" + fmt(q) + "%の食塩水になります。食塩水Aの濃度は何%ですか。",
          answer: { value: a, unit: "%" },
          hints: ["それぞれの混ぜ方で、食塩の重さを求めよう。", "A100g・B100gの食塩をア・イとして、たし算とひき算で消去算にしよう。"],
          steps: [
            { title: "食塩の重さで式を作る", html: "① ア×" + X + " ＋ イ×" + Y + " ＝ " + (x + y) + " × " + fmt(p / 100) + " ＝ <b>" + fmt(S1) + "g</b><br>② ア×" + Y + " ＋ イ×" + X + " ＝ " + (x + y) + " × " + fmt(q / 100) + " ＝ <b>" + fmt(S2) + "g</b>" },
            { title: "たし算", html: "①＋②：(ア＋イ)×" + (X + Y) + " ＝ " + fmt(S1 + S2) + " → <b>ア＋イ ＝ " + fmt(sum) + "</b>" },
            diff >= 0
              ? { title: "ひき算", html: "①−②：(ア−イ)×" + (X - Y) + " ＝ " + fmt(S1 - S2) + " → <b>ア−イ ＝ " + fmt(diff) + "</b>" }
              : { title: "ひき算", html: "②−①：(イ−ア)×" + (X - Y) + " ＝ " + fmt(S2 - S1) + " → <b>イ−ア ＝ " + fmt(-diff) + "</b>" },
            { title: "答え", html: "和差算で ア ＝ (" + fmt(sum) + (diff >= 0 ? " ＋ " : " − ") + fmt(Math.abs(diff)) + ") ÷ 2 ＝ " + a + " → Aは <b>" + a + "%</b>（Bは" + b + "%）" },
          ],
        };
      },
    },
    {
      key: "same-exchange",
      name: "同じ量を交換",
      category: "やりとり",
      level: 3,
      make: function () {
        var wA = ri(100, 600, 50), wB = ri(100, 600, 50), cA = ri(2, 20), cB = ri(2, 20);
        if (wA === wB || cA === cB) return null;
        var m = wA * wB / (wA + wB);
        if (!isInt(m) || m % 10 !== 0) return null;
        var r = ratio(wA, wB);
        return {
          question: "容器Aには" + cA + "%の食塩水が" + wA + "g、容器Bには" + cB + "%の食塩水が" + wB + "g入っています。AとBから同じ重さずつ取り出し、それぞれ相手の容器に入れたところ、AとBの濃度が同じになりました。何gずつ取り出しましたか。",
          answer: { value: m, unit: "g" },
          hints: ["同じ濃度になるのは、どちらも「全部混ぜたとき」と同じ割合になったときです。", "交換後のAの中身が、もとのAともとのBを " + r[0] + ":" + r[1] + " でふくめばOK。"],
          steps: [
            { title: "中身の割合", html: "全部混ぜると もとのA：もとのB ＝ " + wA + ":" + wB + " ＝ <b>" + r[0] + ":" + r[1] + "</b>。交換後のA（" + wA + "g）も同じ割合になればよい。" },
            { title: "答え", html: "Aの中のもとのBは " + wA + " × " + r[1] + "/" + (r[0] + r[1]) + " ＝ <b>" + m + "g</b>。これが取り出した量。" },
            { title: "公式", html: wA + " × " + wB + " ÷ (" + wA + " ＋ " + wB + ") ＝ " + m + "g（濃度に関係なく決まる！）" },
          ],
        };
      },
    },
  ];

  window.PRACTICE = {
    types: GENERATORS,
    make: function (key) {
      var g = key ? GENERATORS.filter(function (x) { return x.key === key; })[0] : GENERATORS[ri(0, GENERATORS.length - 1)];
      var p = retry(g.make);
      p.key = g.key;
      p.title = g.name;
      p.category = g.category;
      p.level = g.level;
      return p;
    },
  };
})();
