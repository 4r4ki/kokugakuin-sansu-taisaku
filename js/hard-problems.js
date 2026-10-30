// 難問データ（角度・面積・特殊算・速さ など12分野）
// 形式は problems.js と同じ。図は fig:{ type:"svg", svg:"<svg>…</svg>" }（問題文の下 or 解説の中）
// answer.text があれば、解説の最後にそれを答えとして表示する（分数の答えなど）
(function () {
  "use strict";

  // ---------- 図をかくための小さな道具 ----------
  // 座標はふつうの数学の向き（上が＋）で考え、svg() の中で上下を反転する

  var H = 0; // いまかいている図の高さ（y 反転用）

  function f1(x) {
    return Math.round(x * 10) / 10;
  }
  function xy(p) {
    return f1(p[0]) + "," + f1(H - p[1]);
  }
  function rad(d) {
    return (d * Math.PI) / 180;
  }
  // 中心 c から角度 deg、距離 r の点
  function pol(c, r, deg) {
    return [c[0] + r * Math.cos(rad(deg)), c[1] + r * Math.sin(rad(deg))];
  }
  function lerp(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  function deg(a, b) {
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  }
  function dist(a, b) {
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  // 直線 ab と cd の交点
  function cross(a, b, c, d) {
    var r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]];
    var t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
    return [a[0] + t * r[0], a[1] + t * r[1]];
  }

  function svg(w, h, body) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg">' + body + "</svg>";
  }
  function line(a, b, cls) {
    return '<line x1="' + f1(a[0]) + '" y1="' + f1(H - a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(H - b[1]) + '" class="' + (cls || "ln") + '"/>';
  }
  function poly(pts, cls) {
    return '<polygon points="' + pts.map(xy).join(" ") + '" class="' + (cls || "ln") + '"/>';
  }
  function circle(c, r, cls) {
    return '<circle cx="' + f1(c[0]) + '" cy="' + f1(H - c[1]) + '" r="' + f1(r) + '" class="' + (cls || "ln") + '"/>';
  }
  function text(p, s, cls) {
    return '<text x="' + f1(p[0]) + '" y="' + f1(H - p[1]) + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + s + "</text>";
  }
  // 点の名前：中心 c から見て外側に少しずらして書く
  function name(p, s, c, d) {
    var a = deg(c, p);
    return text(pol(p, d || 12, a), s);
  }
  // 円弧のパス（中心 c、半径 r、角度 a1 → a2 を反時計回り）。start=true なら M から始める
  function arcPath(c, r, a1, a2, start) {
    var p1 = pol(c, r, a1), p2 = pol(c, r, a2);
    var large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    var sweep = a2 > a1 ? 0 : 1; // y を反転しているので反時計回りは sweep=0
    return (start ? "M" + xy(p1) + " " : "") + "A" + f1(r) + "," + f1(r) + " 0 " + large + "," + sweep + " " + xy(p2);
  }
  // 角のしるし（頂点 v、辺の向き a1→a2 を反時計回り）と、その近くの文字
  function angleMark(v, a1, a2, r, label, lr) {
    var s = '<path d="' + arcPath(v, r || 18, a1, a2, true) + '" class="mark"/>';
    if (label) s += text(pol(v, lr || (r || 18) + 14, (a1 + a2) / 2), label, "lbl");
    return s;
  }
  function path(d, cls) {
    return '<path d="' + d + '" class="' + (cls || "ln") + '"/>';
  }
  function fig(s) {
    return { type: "svg", svg: s };
  }

  // ---------- 角度の図 ----------

  // 二等辺三角形を交互につなぐ（角XOY＝18°）
  function figZigzag() {
    H = 150;
    var O = [20, 20], k = 78, a = 18;
    var A = pol(O, k * 1, 0);
    var B = pol(O, k * 2 * Math.cos(rad(18)), a);
    var C = pol(O, k * (1 + 2 * Math.cos(rad(36))), 0);
    var D = pol(O, k * (2 * Math.cos(rad(18)) + 2 * Math.cos(rad(54))), a);
    return svg(330, H,
      line(O, pol(O, 290, 0)) + line(O, pol(O, 290, a)) +
      line(A, B) + line(B, C) + line(C, D, "thin") +
      angleMark(O, 0, a, 34, "18°", 52) +
      name(O, "O", A, 12) + text([A[0], A[1] - 14], "A") + name(B, "B", O, 12) +
      text([C[0], C[1] - 14], "C") + name(D, "D", O, 12) +
      text(pol(O, 302, 0), "X") + text(pol(O, 302, a), "Y") +
      text(lerp(O, A, 0.5).map(function (v, i) { return i ? v - 12 : v; }), "1", "lbl") +
      text([(A[0] + B[0]) / 2 + 10, (A[1] + B[1]) / 2], "1", "lbl") +
      text([(B[0] + C[0]) / 2 + 8, (B[1] + C[1]) / 2 + 6], "1", "lbl"));
  }

  // 正五角形の中に正三角形
  function figPentagon() {
    H = 230;
    var c = [150, 112], r = 100;
    var A = pol(c, r, 234), B = pol(c, r, 306), Cc = pol(c, r, 18), D = pol(c, r, 90), E = pol(c, r, 162);
    var F = [(A[0] + B[0]) / 2, A[1] + dist(A, B) * Math.sqrt(3) / 2];
    return svg(300, H,
      poly([A, B, Cc, D, E]) + poly([A, B, F]) + line(F, Cc) + line(F, D) +
      angleMark(F, deg(F, Cc), deg(F, D), 20, "ア", 32) +
      name(A, "A", c) + name(B, "B", c) + name(Cc, "C", c) + name(D, "D", c) + name(E, "E", c) +
      text([F[0], F[1] - 22], "F"));
  }

  // AB＝AC、AD＝BD＝BC
  function figIsosceles() {
    H = 230;
    var A = [150, 205], B = [150 - 190 * Math.sin(rad(18)), 205 - 190 * Math.cos(rad(18))];
    var C = [300 - B[0], B[1]];
    var D = lerp(A, C, dist(B, C) / dist(A, C));
    return svg(300, H,
      poly([A, B, C]) + line(B, D) +
      angleMark(A, deg(A, B), deg(A, C), 26, "ア", 40) +
      name(A, "A", [150, 100]) + name(B, "B", [150, 100]) + name(C, "C", [150, 100]) + text(pol(D, 14, 0), "D"));
  }

  // 円の中心と3点
  function figCircle() {
    H = 230;
    var O = [150, 115], r = 95;
    var A = pol(O, r, 146), B = pol(O, r, 270), C = pol(O, r, 10);
    return svg(300, H,
      circle(O, r) + line(A, B) + line(B, C) + line(O, A) + line(O, B) + line(O, C) +
      '<circle cx="' + O[0] + '" cy="' + (H - O[1]) + '" r="3" class="dot"/>' +
      angleMark(A, deg(A, B), deg(A, O), 26, "28°", 44) +
      angleMark(C, deg(C, O), deg(C, B), 26, "40°", 44) +
      angleMark(O, 10, 146, 16, "ア", 30) +
      name(A, "A", O) + name(B, "B", O) + name(C, "C", O) + text(pol(O, 16, 215), "O"));
  }

  // 正三角形を折る
  function figFold() {
    H = 245;
    var s = 230, B = [35, 20], C = [30 + s, 20], A = [30 + s / 2, 20 + s * Math.sqrt(3) / 2];
    var se = Math.sin(rad(60)) / (Math.sin(rad(60)) + Math.sin(rad(46))); // AE の長さ（1辺を1とする）
    var E = lerp(A, B, se);
    var bd = (se * Math.sin(rad(74))) / Math.sin(rad(60));
    var D = [B[0] + s * bd, B[1]];
    // F は AC 上で FA＝FD となる点
    var lo = 0, hi = 1;
    for (var i = 0; i < 60; i++) {
      var m = (lo + hi) / 2, F0 = lerp(A, C, m);
      if (dist(F0, A) < dist(F0, D)) lo = m; else hi = m;
    }
    var F = lerp(A, C, lo);
    return svg(300, H,
      poly([A, E, F], "thin") + poly([B, C, F, E]) + poly([E, D, F], "shade") + line(E, F) +
      angleMark(D, deg(D, E), 180, 22, "46°", 38) +
      angleMark(E, deg(E, F), deg(E, A), 20, "ア", 32) +
      name(A, "A", [150, 90]) + name(B, "B", [150, 90]) + name(C, "C", [150, 90]) +
      text(pol(E, 14, 180), "E") + text(pol(F, 14, 0), "F") + text([D[0], D[1] - 14], "D"));
  }

  // ---------- 面積の図 ----------

  // 直角三角形の回転
  function figRotate() {
    H = 240;
    var k = 18, A = [70, 25];
    var bAng = Math.atan2(8, 6) * 180 / Math.PI; // AC を x 軸にとったときの AB の向き
    var C = pol(A, 6 * k, 0), B = pol(A, 10 * k, bAng);
    var C2 = pol(A, 6 * k, 45), B2 = pol(A, 10 * k, bAng + 45);
    var d = "M" + xy(B) + " " + arcPath(A, 10 * k, bAng, bAng + 45) + " L" + xy(C2) + " " + arcPath(A, 6 * k, 45, 0) + " Z";
    return svg(300, H,
      path(d, "shade") + poly([A, B, C]) + poly([A, B2, C2], "thin") +
      angleMark(A, 0, 45, 30, "45°", 46) +
      name(A, "A", lerp(B, C, 0.5)) + name(B, "B", A) + text(pol(C, 14, -30), "C") +
      name(B2, "B'", A) + text(pol(C2, 14, 135), "C'") +
      text(pol(lerp(A, B, 0.42), 16, bAng + 90), "10cm", "lbl") +
      text([A[0] + 3 * k, A[1] - 12], "6cm", "lbl"));
  }

  // 中心角30°のおうぎ形の弓形
  function figSegment() {
    H = 200;
    var O = [20, 20], r = 260;
    var A = pol(O, r, 30), B = pol(O, r, 0), Hf = [A[0], O[1]];
    var d = "M" + xy(B) + " " + arcPath(O, r, 0, 30) + " Z";
    return svg(300, H,
      path(d, "shade") + line(O, A) + line(O, B) + line(A, Hf, "thin") +
      angleMark(O, 0, 30, 40, "30°", 58) +
      name(O, "O", A) + name(A, "A", O) + text([B[0], B[1] - 14], "B") + text([Hf[0] - 2, Hf[1] - 14], "H") +
      text(lerp(O, A, 0.5).map(function (v, i) { return i ? v + 12 : v - 6; }), "12cm", "lbl"));
  }

  // 三角形の中の三角形
  function figTriangleDEF() {
    H = 220;
    var A = [100, 195], B = [20, 20], C = [280, 20];
    var D = lerp(A, B, 2 / 3), E = lerp(B, C, 3 / 4), F = lerp(C, A, 1 / 2);
    return svg(300, H,
      poly([A, B, C]) + poly([D, E, F], "shade") +
      name(A, "A", [130, 80]) + name(B, "B", [130, 80]) + name(C, "C", [130, 80]) +
      text(pol(D, 14, 160), "D") + text([E[0], E[1] - 14], "E") + text(pol(F, 14, 30), "F"));
  }

  // 平行四辺形と対角線
  function figParallelogram() {
    H = 190;
    var A = [20, 20], B = [230, 20], C = [290, 170], D = [80, 170];
    var E = lerp(D, C, 2 / 5), F = cross(A, E, B, D);
    return svg(310, H,
      poly([F, B, C, E], "shade") + poly([A, B, C, D]) + line(A, E) + line(B, D) +
      name(A, "A", [155, 95]) + name(B, "B", [155, 95]) + name(C, "C", [155, 95]) + name(D, "D", [155, 95]) +
      text([E[0], E[1] + 14], "E") + text(pol(F, 16, 200), "F"));
  }

  // 台形と対角線
  function figTrapezoid() {
    H = 190;
    var A = [100, 170], D = [200, 170], B = [30, 20], C = [270, 20];
    var O = cross(A, C, B, D);
    return svg(300, H,
      poly([A, O, B], "shade") + poly([A, B, C, D]) + line(A, C) + line(B, D) +
      name(A, "A", [150, 95]) + name(B, "B", [150, 95]) + name(C, "C", [150, 95]) + name(D, "D", [150, 95]) +
      text([O[0], O[1] - 16], "O") +
      text([150, 184], "6cm", "lbl") + text([150, 8], "12cm", "lbl"));
  }

  // 正三角形の外側を円が転がる
  function figRolling() {
    H = 260;
    var k = 25, P = [[72, 60], [72 + 6 * k, 60], [72 + 3 * k, 60 + 3 * Math.sqrt(3) * k]];
    var R = 2 * k;
    // 外側のふち：各辺を外へ R ずらした線と、頂点まわりの円弧（辺 P0P1, P1P2, P2P0 の外向きは 270°, 30°, 150°）
    var d = "M" + xy(pol(P[0], R, 270)) +
      " L" + xy(pol(P[1], R, 270)) + " " + arcPath(P[1], R, 270, 390) +
      " L" + xy(pol(P[2], R, 30)) + " " + arcPath(P[2], R, 30, 150) +
      " L" + xy(pol(P[0], R, 150)) + " " + arcPath(P[0], R, 150, 270);
    d += " Z M" + xy(P[0]) + " L" + xy(P[2]) + " L" + xy(P[1]) + " Z";
    var c = pol(lerp(P[1], P[2], 0.5), k, 30);
    return svg(300, H,
      '<path d="' + d + '" class="shade" fill-rule="evenodd"/>' + poly(P) + circle(c, k) +
      '<circle cx="' + f1(c[0]) + '" cy="' + f1(H - c[1]) + '" r="2.5" class="dot"/>' + line(c, pol(c, k, 30), "thin") +
      text([72 + 3 * k, 60 + 14], "6cm", "lbl") + text(pol(c, k + 16, 110), "1cm", "lbl"));
  }

  // 頂点 v で、点 p と点 q の方向がつくる角（180°未満の側）にしるしをつける
  function markAt(v, p, q, r, label, lr) {
    var a1 = deg(v, p), a2 = deg(v, q);
    var d = (((a2 - a1) % 360) + 360) % 360;
    if (d > 180) { var tmp = a1; a1 = a2; a2 = tmp; d = 360 - d; }
    return angleMark(v, a1, a1 + d, r, label, lr);
  }

  // 七角形の星形
  function figStar7() {
    H = 230;
    var c = [150, 112], P = [];
    for (var i = 0; i < 7; i++) P.push(pol(c, 105, 90 + (360 / 7) * i));
    var order = [0, 2, 4, 6, 1, 3, 5].map(function (k) { return P[k]; });
    var s = poly(order);
    for (var k = 0; k < 7; k++) s += markAt(P[k], P[(k + 2) % 7], P[(k + 5) % 7], 14, "", 0);
    return svg(300, H, s);
  }

  // 平行線の間の折れ線
  function figParallel() {
    H = 220;
    var A = [70, 190], P = pol(A, 120, -30), Q = pol(P, 70, -110);
    var B = pol(Q, (Q[1] - 30) / Math.sin(rad(40)), -40);
    return svg(300, H,
      line([20, 190], [290, 190]) + line([20, 30], [290, 30]) +
      line(A, P) + line(P, Q) + line(Q, B) +
      markAt(A, [290, 190], P, 26, "30°", 44) + markAt(P, A, Q, 18, "100°", 40) +
      markAt(Q, P, B, 18, "110°", 40) + markAt(B, [20, 30], Q, 26, "ア", 40) +
      text([285, 204], "ℓ") + text([285, 44], "m") +
      text(pol(A, 12, 120), "A") + text(pol(P, 14, 0), "P") + text(pol(Q, 14, 180), "Q") + text([B[0], B[1] - 14], "B"));
  }

  // 正方形と外側の正三角形
  function figSquareTri() {
    H = 270;
    var B = [90, 130], C = [210, 130], A = [90, 250], D = [210, 250], E = [150, 130 - 60 * Math.sqrt(3)];
    return svg(300, H,
      poly([A, B, C, D]) + poly([B, C, E]) + line(E, A) + line(E, D) +
      markAt(E, A, D, 26, "ア", 40) +
      name(A, "A", [150, 190]) + name(B, "B", [150, 190]) + name(C, "C", [150, 190]) + name(D, "D", [150, 190]) +
      text([E[0], E[1] - 14], "E"));
  }

  // 正九角形と2本の対角線
  function figNonagon() {
    H = 230;
    var c = [150, 112], P = [], L = "ABCDEFGHI";
    for (var i = 0; i < 9; i++) P.push(pol(c, 100, 90 - 40 * i));
    var X = cross(P[0], P[2], P[1], P[4]);
    var s = poly(P) + line(P[0], P[2]) + line(P[1], P[4]) + markAt(X, P[1], P[2], 14, "ア", 26);
    for (var k = 0; k < 9; k++) s += name(P[k], L[k], c);
    return svg(300, H, s);
  }

  // 四分円の中の正方形
  function figQuarterSquare() {
    H = 250;
    var O = [40, 25], r = 210, a = r / Math.SQRT2;
    var d = "M" + xy(O) + " L" + xy(pol(O, r, 0)) + " " + arcPath(O, r, 0, 90) + " Z";
    return svg(300, H,
      path(d, "shade") + poly([O, [O[0] + a, O[1]], [O[0] + a, O[1] + a], [O[0], O[1] + a]], "blank") +
      line(O, [O[0] + a, O[1] + a], "thin") +
      text(pol(O, 12, 225), "O") + text(pol([O[0] + a, O[1] + a], 14, 45), "P") +
      text(pol(lerp(O, [O[0] + a, O[1] + a], 0.55), 12, 135), "10cm", "lbl"));
  }

  // 半円の回転
  function figSemiRotate() {
    H = 240;
    var A = [40, 25], k = 20, B = [A[0] + 12 * k, A[1]], B2 = pol(A, 12 * k, 30);
    var M = lerp(A, B, 0.5), M2 = lerp(A, B2, 0.5), r = 6 * k;
    var sector = "M" + xy(A) + " L" + xy(B) + " " + arcPath(A, 12 * k, 0, 30) + " Z";
    var semi2 = "M" + xy(B2) + " " + arcPath(M2, r, 30, 210) + " Z";
    var semi1 = "M" + xy(B) + " " + arcPath(M, r, 0, 180) + " Z";
    return svg(300, H,
      path(sector, "shade") + path(semi2, "shade") + path(semi1, "blank") +
      path(semi2) + path("M" + xy(B) + " " + arcPath(A, 12 * k, 0, 30), "thin") +
      angleMark(A, 0, 30, 34, "30°", 50) +
      text(pol(A, 12, 210), "A") + text([B[0], B[1] - 14], "B") + text(pol(B2, 14, 30), "B'") +
      text([M[0], M[1] - 14], "12cm", "lbl"));
  }

  // 正方形と対角線
  function figSquareDiag() {
    H = 245;
    var B = [50, 20], C = [250, 20], D = [250, 220], A = [50, 220], E = lerp(B, C, 0.5), F = cross(A, E, B, D);
    return svg(300, H,
      poly([F, E, C, D], "shade") + poly([A, B, C, D]) + line(A, E) + line(B, D) +
      name(A, "A", [150, 120]) + name(B, "B", [150, 120]) + name(C, "C", [150, 120]) + name(D, "D", [150, 120]) +
      text([E[0], E[1] - 14], "E") + text(pol(F, 15, 160), "F"));
  }

  // 正方形の中のかたむいた正方形
  function figTilted() {
    H = 250;
    var k = 27, O = [42, 20], s = 8 * k;
    var P = [[O[0] + 5 * k, O[1]], [O[0] + s, O[1] + 5 * k], [O[0] + 3 * k, O[1] + s], [O[0], O[1] + 3 * k]];
    return svg(300, H,
      poly([O, [O[0] + s, O[1]], [O[0] + s, O[1] + s], [O[0], O[1] + s]]) + poly(P, "shade") +
      text([O[0] + 2.5 * k, O[1] + 12], "5cm", "lbl") + text([O[0] + 6.5 * k, O[1] + 12], "3cm", "lbl") +
      '<circle cx="' + f1(P[0][0]) + '" cy="' + f1(H - P[0][1]) + '" r="2.5" class="dot"/>');
  }

  // 正方形の中の2つの四分円（葉っぱの形）
  function figLens() {
    H = 240;
    var s = 200, B = [50, 20], C = [B[0] + s, B[1]], D = [B[0] + s, B[1] + s], A = [B[0], B[1] + s];
    var d = "M" + xy(C) + " " + arcPath(B, s, 0, 90) + " " + arcPath(D, s, 180, 270) + " Z";
    return svg(300, H,
      path(d, "shade") + poly([A, B, C, D]) +
      name(A, "A", [150, 120]) + name(B, "B", [150, 120]) + name(C, "C", [150, 120]) + name(D, "D", [150, 120]) +
      text([B[0] + s / 2, B[1] + 12], "10cm", "lbl"));
  }

  var t = {
    zigzag: figZigzag(), pentagon: figPentagon(), isosceles: figIsosceles(), circle: figCircle(), fold: figFold(),
    rotate: figRotate(), segment: figSegment(), def: figTriangleDEF(), para: figParallelogram(), trap: figTrapezoid(), rolling: figRolling(),
    star7: figStar7(), parallel: figParallel(), squareTri: figSquareTri(), nonagon: figNonagon(),
    quarterSquare: figQuarterSquare(), semiRotate: figSemiRotate(), squareDiag: figSquareDiag(), tilted: figTilted(), lens: figLens(),
  };

  function tbl(head, rows) {
    return { type: "table", head: head, rows: rows };
  }

  // ---------- 問題 ----------

  var list = [
    // ===== 角度 =====
    {
      category: "角度",
      level: 3,
      title: "同じ長さの線を交互に引く",
      question:
        "角XOYは18°です。OX上に点Aをとり、OAと同じ長さの線AB（BはOY上）、BC（CはOX上）、CD（DはOY上）…と、O から遠ざかるように同じ長さの線を交互に引いていきます。OAもふくめて、同じ長さの線は最大で何本引けますか。",
      fig: fig(t.zigzag),
      answer: { value: 5, unit: "本" },
      hints: [
        "OA＝AB なので三角形OABは二等辺三角形。角ABOも18°です。",
        "二等辺三角形の「底角」が 18°、36°、54°… とふえていきます。底角が90°になると三角形が作れません。",
      ],
      steps: [
        {
          title: "1つ目の二等辺三角形",
          html: "OA＝AB より三角形OABは二等辺三角形で、角ABO＝角AOB＝<b>18°</b>。<br>三角形の外角から 角BAC＝18＋18＝<b>36°</b>",
        },
        {
          title: "底角がふえていく",
          html: "AB＝BC なので 角BCA＝36°。外角で 角CBD＝18＋36＝<b>54°</b><br>BC＝CD なので 角CDB＝54°。外角で 角DCE＝18＋54＝<b>72°</b><br>CD＝DE なので 角DEC＝72°。外角で 角EDF＝18＋72＝<b>90°</b>",
        },
        {
          title: "90°になったら引けない",
          html: "次の線EF（FはOY上）は、二等辺三角形DEFの底角が90°になってしまうので作れません（DからEFは垂直に交わり、FはDと重なる）。",
        },
        {
          title: "答え",
          html: "引ける線は OA、AB、BC、CD、DE の <b>5本</b>。<br>底角は 18°×1、18°×2、… と18°ずつふえ、18°×5＝90° で止まる、と覚えよう。",
        },
      ],
    },
    {
      category: "角度",
      level: 3,
      title: "正五角形と正三角形",
      question:
        "図のように、正五角形ABCDEの内側に、辺ABを1辺とする正三角形ABFをかきました。角ア（角CFD）は何度ですか。",
      fig: fig(t.pentagon),
      answer: { value: 84, unit: "度" },
      hints: [
        "正五角形の1つの内角は 180×3÷5＝108° です。",
        "BF＝BA＝BC なので、三角形BCFは二等辺三角形です。",
      ],
      steps: [
        {
          title: "正五角形の内角",
          html: "五角形の内角の和は 180×3＝540°、1つの角は 540÷5＝<b>108°</b>",
        },
        {
          title: "二等辺三角形BCFを見つける",
          html: "BF＝AB＝BC なので三角形BCFは二等辺三角形。<br>角FBC＝108−60＝48°、角BFC＝(180−48)÷2＝<b>66°</b><br>同じように 角AFE＝<b>66°</b>",
        },
        {
          title: "Fのまわりの角",
          html: "Fのまわりは 360°。角AFB＝60°、角BFC＝角AFE＝66° なので、残りは 360−60−66−66＝168°。<br>図は直線FDについて左右対称なので、角CFD＝角DFE。",
        },
        {
          title: "答え",
          html: "角ア＝168÷2＝<b>84°</b>",
        },
      ],
    },
    {
      category: "角度",
      level: 3,
      title: "3つの二等辺三角形",
      question:
        "図の三角形ABCは AB＝AC の二等辺三角形です。辺AC上に点Dをとると、AD＝BD＝BC になりました。角ア（角BAC）は何度ですか。",
      fig: fig(t.isosceles),
      answer: { value: 36, unit: "度" },
      hints: [
        "角アを①として、ほかの角を①を使って表してみよう。",
        "AD＝BD なので角ABD＝①。角BDCは三角形ABDの外角です。",
      ],
      steps: [
        {
          title: "角を①で表す",
          html: "角BAC＝① とすると、AD＝BD より 角ABD＝①。<br>角BDC は三角形ABDの外角なので ①＋①＝<b>②</b>",
        },
        {
          title: "BD＝BC を使う",
          html: "BD＝BC より 角BCD＝角BDC＝<b>②</b>",
        },
        {
          title: "AB＝AC を使う",
          html: "AB＝AC より 角ABC＝角ACB＝②。<br>三角形ABCの内角の和：①＋②＋②＝<b>⑤＝180°</b>",
        },
        {
          title: "答え",
          html: "①＝180÷5＝<b>36°</b>（このとき角ABC＝角ACB＝72°）",
        },
      ],
    },
    {
      category: "角度",
      level: 2,
      title: "円の中心と二等辺三角形",
      question:
        "点Oは円の中心で、A、B、Cは円周上の点です。角OAB＝28°、角OCB＝40° のとき、角ア（角AOC）は何度ですか。",
      fig: fig(t.circle),
      answer: { value: 136, unit: "度" },
      hints: [
        "OA、OB、OC はどれも円の半径なので同じ長さです。",
        "三角形OAB と 三角形OBC は二等辺三角形になります。",
      ],
      steps: [
        {
          title: "二等辺三角形OAB",
          html: "OA＝OB なので 角OBA＝28°、角AOB＝180−28×2＝<b>124°</b>",
        },
        {
          title: "二等辺三角形OBC",
          html: "OB＝OC なので 角OBC＝40°、角BOC＝180−40×2＝<b>100°</b>",
        },
        {
          title: "答え",
          html: "Oのまわりは360°なので、角ア＝360−124−100＝<b>136°</b><br>（角ABC＝28＋40＝68° のちょうど2倍になっています）",
        },
      ],
    },
    {
      category: "角度",
      level: 3,
      title: "正三角形を折り返す",
      question:
        "正三角形ABCを、EFを折り目として折り返したところ、頂点Aが辺BC上の点Dに重なりました。角EDB＝46° のとき、角ア（角AEF）は何度ですか。",
      fig: fig(t.fold),
      answer: { value: 53, unit: "度" },
      hints: [
        "三角形BDEで、角B＝60°、角EDB＝46° です。",
        "折り返した図形はもとの図形と合同。角AEF＝角DEF です。",
      ],
      steps: [
        {
          title: "三角形BDE の角",
          html: "角BED＝180−60−46＝<b>74°</b>",
        },
        {
          title: "角AED",
          html: "AEBは一直線なので 角AED＝180−74＝<b>106°</b>",
        },
        {
          title: "折り返しは合同",
          html: "三角形AEF と 三角形DEF は合同なので、角AEF＝角DEF。<br>角ア＝106÷2＝<b>53°</b>",
        },
      ],
    },

    // ===== 面積 =====
    {
      category: "面積",
      level: 3,
      title: "辺が通過した部分",
      question:
        "図のような、AB＝10cm、AC＝6cm、角C＝90°の直角三角形ABCを、点Aを中心に45°回転させました。辺BCが通過した部分（色のついた部分）の面積は何cm²ですか。円周率は3.14とします。",
      fig: fig(t.rotate),
      answer: { value: 25.12, unit: "cm²" },
      hints: [
        "色の部分を「おうぎ形＋三角形」から「三角形＋おうぎ形」を引いた形と考えよう。",
        "三角形ABC と 三角形AB'C' は合同なので、引き算すると消えます。",
      ],
      steps: [
        {
          title: "面積の足し引きで表す",
          html: "色の部分 ＝（おうぎ形ABB'＋三角形AB'C'）−（三角形ABC＋おうぎ形ACC'）",
        },
        {
          title: "三角形は消える",
          html: "三角形ABC と 三角形AB'C' は合同なので打ち消し合い、<br>色の部分 ＝ おうぎ形ABB' − おうぎ形ACC'",
        },
        {
          title: "計算",
          html: "(10×10 − 6×6) × 3.14 × 45/360 ＝ 64 × 3.14 ÷ 8 ＝ 8 × 3.14 ＝ <b>25.12cm²</b>",
        },
        {
          title: "ポイント",
          html: "Aに一番近いBC上の点はC（角C＝90°）、一番遠い点はB。だから半径6cm と 10cm のおうぎ形の差になります。",
        },
      ],
    },
    {
      category: "面積",
      level: 3,
      title: "30°のおうぎ形の弓形",
      question:
        "図は半径12cm、中心角30°のおうぎ形OABです。色のついた部分（弧ABと直線ABで囲まれた部分）の面積は何cm²ですか。円周率は3.14とします。",
      fig: fig(t.segment),
      answer: { value: 1.68, unit: "cm²" },
      hints: [
        "色の部分 ＝ おうぎ形 − 三角形OAB",
        "AからOBに垂直な線AHを引くと、三角形OAHは正三角形を半分にした形です。",
      ],
      steps: [
        {
          title: "おうぎ形の面積",
          html: "12 × 12 × 3.14 × 30/360 ＝ 12 × 3.14 ＝ <b>37.68cm²</b>",
        },
        {
          title: "三角形OABの高さ",
          html: "AからOBに垂直な線AHを引く。角AOH＝30°なので、三角形OAHは正三角形の半分。<br>AH ＝ OA ÷ 2 ＝ <b>6cm</b>",
        },
        {
          title: "三角形OAB",
          html: "底辺OB＝12cm、高さAH＝6cm なので 12 × 6 ÷ 2 ＝ <b>36cm²</b>",
        },
        {
          title: "答え",
          html: "37.68 − 36 ＝ <b>1.68cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 2,
      title: "三角形の中の三角形",
      question:
        "面積が120cm²の三角形ABCがあります。AD:DB＝2:1、BE:EC＝3:1、CF:FA＝1:1 となるように点D、E、Fをとるとき、三角形DEFの面積は何cm²ですか。",
      fig: fig(t.def),
      answer: { value: 35, unit: "cm²" },
      hints: [
        "まわりの3つの三角形（ADF、BED、CFE）の面積を引くと考えよう。",
        "1つの角が共通な三角形の面積は「はさむ2辺の比」をかけて求められます。",
      ],
      steps: [
        {
          title: "三角形ADF",
          html: "角Aが共通。AD/AB × AF/AC ＝ 2/3 × 1/2 ＝ 1/3 → 120 × 1/3 ＝ <b>40cm²</b>",
        },
        {
          title: "三角形BED",
          html: "角Bが共通。BD/BA × BE/BC ＝ 1/3 × 3/4 ＝ 1/4 → <b>30cm²</b>",
        },
        {
          title: "三角形CFE",
          html: "角Cが共通。CE/CB × CF/CA ＝ 1/4 × 1/2 ＝ 1/8 → <b>15cm²</b>",
        },
        {
          title: "答え",
          html: "120 − 40 − 30 − 15 ＝ <b>35cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 3,
      title: "平行四辺形と対角線",
      question:
        "面積が140cm²の平行四辺形ABCDがあります。辺CD上に DE:EC＝2:3 となる点Eをとり、AEとBDの交わる点をFとします。四角形FBCE（色のついた部分）の面積は何cm²ですか。",
      fig: fig(t.para),
      answer: { value: 62, unit: "cm²" },
      hints: [
        "三角形FDE と 三角形FBA はちょうちょ型の相似（DE∥AB）。",
        "DE:AB＝2:5 なので、DF:FB＝2:5、EF:FA＝2:5 です。",
      ],
      steps: [
        {
          title: "相似な三角形",
          html: "DE∥AB なので、三角形FDE と 三角形FBA は相似（ちょうちょ型）。<br>DE:AB ＝ 2:(2＋3) ＝ <b>2:5</b> → DF:FB＝2:5、EF:FA＝2:5",
        },
        {
          title: "三角形ADF",
          html: "三角形ABD は平行四辺形の半分で 70cm²。DF:FB＝2:5 なので<br>三角形ADF ＝ 70 × 2/7 ＝ <b>20cm²</b>",
        },
        {
          title: "三角形DEF",
          html: "EF:FA＝2:5 なので 三角形DEF ＝ 20 × 2/5 ＝ <b>8cm²</b>",
        },
        {
          title: "答え",
          html: "三角形BCD も 70cm²。四角形FBCE ＝ 70 − 8 ＝ <b>62cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 2,
      title: "台形の対角線",
      question:
        "AD∥BC の台形ABCDで、AD＝6cm、BC＝12cm、面積は81cm²です。対角線ACとBDの交わる点をOとするとき、三角形ABO（色のついた部分）の面積は何cm²ですか。",
      fig: fig(t.trap),
      answer: { value: 18, unit: "cm²" },
      hints: [
        "三角形AOD と 三角形COB は相似で、相似比は 6:12＝1:2。",
        "AO:OC＝1:2 を使って、4つの三角形の面積の比を求めよう。",
      ],
      steps: [
        {
          title: "相似比",
          html: "AD∥BC より 三角形AOD と 三角形COB は相似、相似比 1:2。<br>AO:OC＝DO:OB＝<b>1:2</b>",
        },
        {
          title: "4つの三角形の比",
          html: "三角形AOD を ① とすると、<br>三角形ABO は AOD の 2倍（OB:OD＝2:1）で ②、三角形DOC も ②、三角形COB は ABO の2倍で ④。",
        },
        {
          title: "答え",
          html: "全体 ①＋②＋②＋④ ＝ ⑨ ＝ 81cm² → ①＝9cm²<br>三角形ABO ＝ ② ＝ <b>18cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 3,
      title: "円が転がって通る部分",
      question:
        "1辺6cmの正三角形の外側を、半径1cmの円が辺からはなれないように転がって1周します。円が通過した部分（色のついた部分）の面積は何cm²ですか。円周率は3.14とします。",
      fig: fig(t.rolling),
      answer: { value: 48.56, unit: "cm²" },
      hints: [
        "辺にそって動くところは、たて2cm（円の直径）、横6cm の長方形になります。",
        "頂点のまわりを回るところはおうぎ形。3つ合わせるとどんな形？",
      ],
      steps: [
        {
          title: "辺にそった部分",
          html: "円の直径は2cm。辺にそって動くと、6cm × 2cm の長方形ができる。3辺で 12 × 3 ＝ <b>36cm²</b>",
        },
        {
          title: "頂点のまわりの部分",
          html: "頂点のまわりでは、半径2cmのおうぎ形になる。中心角は 360 − 90 − 90 − 60 ＝ <b>120°</b>。<br>3つ合わせると 120×3 ＝ 360° → ちょうど<b>円1つ分</b>",
        },
        {
          title: "答え",
          html: "2 × 2 × 3.14 ＝ 12.56cm²<br>36 ＋ 12.56 ＝ <b>48.56cm²</b>",
        },
      ],
    },

    // ===== つるかめ算 =====
    {
      category: "つるかめ算",
      level: 3,
      title: "3種類のペン",
      question:
        "1本50円、80円、120円の3種類のペンを合わせて20本買い、代金は1800円でした。80円のペンの本数は50円のペンの本数の2倍です。120円のペンは何本買いましたか。",
      answer: { value: 8, unit: "本" },
      hints: [
        "50円1本と80円2本を「セット」にすると、3本で210円、1本あたり70円です。",
        "70円のセット と 120円のペン の2種類のつるかめ算になります。",
      ],
      steps: [
        {
          title: "セットにする",
          html: "50円1本＋80円2本 ＝ 3本で 210円 のセットを作る。",
        },
        {
          title: "全部120円だと考える",
          html: "20本すべて120円なら 2400円。実際との差は 2400 − 1800 ＝ <b>600円</b>",
        },
        {
          title: "セット1組に入れかえる",
          html: "120円3本（360円）をセット1組（210円）にかえると 150円へる。<br>600 ÷ 150 ＝ <b>4組</b> → 50円4本、80円8本",
        },
        {
          title: "答え",
          html: "120円のペンは 20 − 12 ＝ <b>8本</b><br>たしかめ：200 ＋ 640 ＋ 960 ＝ 1800円 ✔",
        },
      ],
    },
    {
      category: "つるかめ算",
      level: 2,
      title: "コップを運ぶアルバイト",
      question:
        "コップを運ぶ仕事で、1個運ぶと30円もらえますが、とちゅうで割ると30円はもらえず、さらに1個につき120円をはらいます。500個運んで、受け取ったお金は13650円でした。割ったコップは何個ですか。",
      answer: { value: 9, unit: "個" },
      hints: [
        "全部割らずに運べたらいくらもらえる？",
        "1個割ると、もらえるお金は 30＋120 円へります。",
      ],
      steps: [
        {
          title: "全部成功したら",
          html: "500 × 30 ＝ 15000円。実際との差は 15000 − 13650 ＝ <b>1350円</b>",
        },
        {
          title: "1個割ると",
          html: "30円もらえないうえに120円はらうので、30 ＋ 120 ＝ <b>150円</b>へる。",
        },
        {
          title: "答え",
          html: "1350 ÷ 150 ＝ <b>9個</b>",
        },
      ],
    },
    {
      category: "つるかめ算",
      level: 3,
      title: "ツル・カメ・カブトムシ",
      question:
        "ツル（足2本）、カメ（足4本）、カブトムシ（足6本）が合わせて30匹いて、足の数の合計は108本です。カメとカブトムシは同じ数だけいます。ツルは何匹いますか。",
      answer: { value: 14, unit: "匹" },
      hints: [
        "カメとカブトムシを1匹ずつペアにすると、2匹で足10本、1匹あたり5本です。",
        "「足2本」と「足5本」のつるかめ算にしよう。",
      ],
      steps: [
        {
          title: "ペアにして平均する",
          html: "カメ1匹＋カブトムシ1匹 ＝ 2匹で足10本 → <b>1匹あたり5本</b>",
        },
        {
          title: "全部ツルだとすると",
          html: "30 × 2 ＝ 60本。実際との差 108 − 60 ＝ <b>48本</b>",
        },
        {
          title: "入れかえる",
          html: "ツル1匹を「足5本の動物」にかえると3本ふえる → 48 ÷ 3 ＝ 16匹（カメ8匹、カブトムシ8匹）",
        },
        {
          title: "答え",
          html: "ツルは 30 − 16 ＝ <b>14匹</b><br>たしかめ：28 ＋ 32 ＋ 48 ＝ 108本 ✔",
        },
      ],
    },
    {
      category: "つるかめ算",
      level: 3,
      title: "峠をこえる道",
      question:
        "A町から峠をこえてB町まで行く道のりは18kmです。上り坂は時速4km、下り坂は時速6kmで歩いたところ、3時間40分かかりました。上り坂の道のりは何kmですか。",
      answer: { value: 8, unit: "km" },
      hints: [
        "時間のつるかめ算です。全部下り坂だと何時間かかる？",
        "1kmあたりにかかる時間は、上り 15分、下り 10分 です。",
      ],
      steps: [
        {
          title: "1kmあたりの時間",
          html: "上り：60 ÷ 4 ＝ <b>15分</b>、下り：60 ÷ 6 ＝ <b>10分</b>",
        },
        {
          title: "全部下りだとすると",
          html: "18 × 10 ＝ 180分。実際は 3時間40分 ＝ 220分 なので、差は <b>40分</b>",
        },
        {
          title: "答え",
          html: "1kmを下りから上りにかえると 5分ふえる → 40 ÷ 5 ＝ <b>8km</b><br>たしかめ：上り8km で120分、下り10km で100分、合計220分 ✔",
        },
      ],
    },
    {
      category: "つるかめ算",
      level: 3,
      title: "個数を逆にしてしまった",
      question:
        "1個80円のりんごと1個50円のみかんを買う予定で、代金は1940円になるはずでした。ところが、りんごとみかんの個数を逆にして買ったので、代金は予定より240円安くなりました。りんごは何個買う予定でしたか。",
      answer: { value: 18, unit: "個" },
      hints: [
        "予定と実際の代金を合計すると、りんごとみかんを「同じ数ずつ」買ったことになります。",
        "差の240円は、個数の差 × (80−50) です。",
      ],
      steps: [
        {
          title: "2つの代金を合計する",
          html: "実際の代金は 1940 − 240 ＝ 1700円。<br>予定＋実際 ＝ 3640円 は「りんご1個＋みかん1個（130円）」を合計個数分買ったのと同じ。<br>3640 ÷ 130 ＝ <b>28</b>（りんごとみかんの合計個数）",
        },
        {
          title: "差に注目",
          html: "りんごをみかんより□個多く予定していたとすると、逆にすると □ × (80 − 50) 円安くなる。<br>240 ÷ 30 ＝ <b>8個</b>（個数の差）",
        },
        {
          title: "答え（和差算）",
          html: "りんご ＝ (28 ＋ 8) ÷ 2 ＝ <b>18個</b>（みかん10個）<br>たしかめ：1440 ＋ 500 ＝ 1940円 ✔",
        },
      ],
    },

    // ===== 年齢算 =====
    {
      category: "年齢算",
      level: 2,
      title: "3人の子の年齢の和",
      question:
        "現在、父は45歳、3人の子どもは12歳、6歳、3歳です。3人の子どもの年齢の和が父の年齢と等しくなるのは何年後ですか。",
      answer: { value: 12, unit: "年後" },
      hints: [
        "1年たつと、父は1歳、子どもの年齢の和は3歳ふえます。",
        "今の差は 45 − 21 ＝ 24歳。1年に何歳ずつちぢまる？",
      ],
      steps: [
        {
          title: "今の差",
          html: "子どもの年齢の和は 12 ＋ 6 ＋ 3 ＝ 21歳。父との差は 45 − 21 ＝ <b>24歳</b>",
        },
        {
          title: "1年で差がちぢまる",
          html: "1年で 父は＋1、子どもの和は＋3 → 差は <b>2歳</b>ずつちぢまる。",
        },
        {
          title: "答え",
          html: "24 ÷ 2 ＝ <b>12年後</b>（父57歳、子 24＋18＋15＝57歳 ✔）",
        },
      ],
    },
    {
      category: "年齢算",
      level: 2,
      title: "5年前は7倍、今は4倍",
      question:
        "5年前、父の年齢は子どもの年齢の7倍でした。現在、父の年齢は子どもの年齢の4倍です。現在の父の年齢は何歳ですか。",
      answer: { value: 40, unit: "歳" },
      hints: [
        "年齢の差は何年たっても変わりません。",
        "5年前の子どもを①とすると、差は⑥。現在の子どもを【1】とすると、差は【3】。",
      ],
      steps: [
        {
          title: "差は変わらない",
          html: "5年前：子①、父⑦ → 差⑥<br>現在：子【1】、父【4】 → 差【3】<br>差は同じなので ⑥＝【3】、つまり 【1】＝②",
        },
        {
          title: "5年の差を使う",
          html: "現在の子【1】＝② と 5年前の子① の差が 5年 → ①＝<b>5歳</b>",
        },
        {
          title: "答え",
          html: "現在の子 ＝ ② ＝ 10歳、父 ＝ 10 × 4 ＝ <b>40歳</b><br>たしかめ：5年前は 35歳と5歳で7倍 ✔",
        },
      ],
    },
    {
      category: "年齢算",
      level: 2,
      title: "年齢の比",
      question:
        "現在、母と子どもの年齢の比は 7:2 です。8年後には 5:2 になります。現在の母の年齢は何歳ですか。",
      answer: { value: 42, unit: "歳" },
      hints: [
        "差が変わらないことを利用して、比の「差」をそろえよう。",
        "7:2 の差は5、5:2 の差は3。差を15にそろえると？",
      ],
      steps: [
        {
          title: "比の差をそろえる",
          html: "現在 7:2（差5）→ ×3 して <b>21:6</b>（差15）<br>8年後 5:2（差3）→ ×5 して <b>25:10</b>（差15）",
        },
        {
          title: "8年分",
          html: "母は 21 → 25 で 4 ふえた。これが8年 → 1目もり＝<b>2歳</b>",
        },
        {
          title: "答え",
          html: "現在の母 ＝ 21 × 2 ＝ <b>42歳</b>（子12歳。8年後 50:20＝5:2 ✔）",
        },
      ],
    },
    {
      category: "年齢算",
      level: 3,
      title: "わたしがあなたの年齢だったとき",
      question:
        "AさんはBさんより年上です。Aさんが今のBさんの年齢だったとき、Bさんは12歳でした。また、Bさんが今のAさんの年齢になるとき、Aさんは48歳になります。現在のAさんは何歳ですか。",
      answer: { value: 36, unit: "歳" },
      hints: [
        "2人の年齢の差を □歳 として、数直線にかいてみよう。",
        "12歳、今のB、今のA、48歳 が等しい間かく（□ずつ）でならびます。",
      ],
      steps: [
        {
          title: "年齢の差を□とする",
          html: "Aが今のBの年齢だったのは □年前。そのときBは 今のB − □ ＝ 12歳。<br>Bが今のAの年齢になるのは □年後。そのときAは 今のA ＋ □ ＝ 48歳。",
        },
        {
          title: "数直線で見る",
          html: "12 → 今のB → 今のA → 48 と、□ずつ等しい間かくでならぶ。",
          fig: tbl(["", "12歳", "今のB", "今のA", "48歳"], [["間かく", "", "□", "□", "□"]]),
        },
        {
          title: "答え",
          html: "□ × 3 ＝ 48 − 12 ＝ 36 → □＝12<br>今のA ＝ 12 ＋ 12 × 2 ＝ <b>36歳</b>（今のBは24歳）",
        },
      ],
    },
    {
      category: "年齢算",
      level: 3,
      title: "4人家族と末っ子",
      question:
        "4人家族の年齢の和は、現在100歳です。8年前の家族の年齢の和は70歳でした。末っ子は現在何歳ですか。ただし、末っ子以外の3人は8年前にも生まれていました。",
      answer: { value: 6, unit: "歳" },
      hints: [
        "4人全員が8年前にいたら、和は 8×4＝32歳 へるはず。",
        "実際は30歳しかへっていない。それはなぜ？",
      ],
      steps: [
        {
          title: "4人ともいたとすると",
          html: "8年前の和は 100 − 8 × 4 ＝ 68歳 になるはず。でも実際は <b>70歳</b>。",
        },
        {
          title: "末っ子は生まれていなかった",
          html: "70歳は「末っ子以外の3人」の和。3人の現在の和は 70 ＋ 8 × 3 ＝ <b>94歳</b>",
        },
        {
          title: "答え",
          html: "末っ子 ＝ 100 − 94 ＝ <b>6歳</b>（8年前はまだ生まれていない ✔）",
        },
      ],
    },

    // ===== 仕事算 =====
    {
      category: "仕事算",
      level: 2,
      title: "とちゅうで休んだ日数",
      question:
        "ある仕事をするのに、Aは1人で12日、Bは1人で18日かかります。AとBの2人で始めましたが、とちゅうでAが何日か休んだので、仕上げるのに9日かかりました。Bは1日も休んでいません。Aは何日休みましたか。",
      answer: { value: 3, unit: "日" },
      hints: [
        "仕事全体を12と18の最小公倍数36とおこう。",
        "Bは9日間ずっと働いた。Aがした仕事の量は？",
      ],
      steps: [
        {
          title: "全体を36とする",
          html: "1日の仕事量：A ＝ 36÷12 ＝ <b>3</b>、B ＝ 36÷18 ＝ <b>2</b>",
        },
        {
          title: "Bの仕事",
          html: "Bは9日働いて 2 × 9 ＝ 18。残り 36 − 18 ＝ <b>18</b> がAの仕事。",
        },
        {
          title: "答え",
          html: "Aが働いたのは 18 ÷ 3 ＝ 6日 → 休んだのは 9 − 6 ＝ <b>3日</b>",
        },
      ],
    },
    {
      category: "仕事算",
      level: 3,
      title: "2人ずつの組み合わせ",
      question:
        "ある仕事を、AとBの2人ですると6日、BとCの2人ですると10日、CとAの2人ですると7日半かかります。この仕事をAが1人ですると何日かかりますか。",
      answer: { value: 10, unit: "日" },
      hints: [
        "全体を 6、10、7.5 で割り切れる数（30）とおこう。",
        "3組を全部たすと、A・B・Cがそれぞれ2回ずつ出てきます。",
      ],
      steps: [
        {
          title: "全体を30とする",
          html: "1日の仕事量：A＋B ＝ 30÷6 ＝ 5、B＋C ＝ 30÷10 ＝ 3、C＋A ＝ 30÷7.5 ＝ 4",
        },
        {
          title: "3つをたす",
          html: "(A＋B＋C) × 2 ＝ 5 ＋ 3 ＋ 4 ＝ 12 → A＋B＋C ＝ <b>6</b>",
        },
        {
          title: "Aだけを取り出す",
          html: "A ＝ 6 − (B＋C) ＝ 6 − 3 ＝ <b>3</b>",
        },
        {
          title: "答え",
          html: "30 ÷ 3 ＝ <b>10日</b>",
        },
      ],
    },
    {
      category: "仕事算",
      level: 3,
      title: "給水管と排水管",
      question:
        "空の水そうに水を入れます。A管だけだと20分、B管だけだと30分で満水になります。また、満水の水そうからC管で水をぬくと15分で空になります。A管とB管で水を入れ始め、10分後にC管も開けました。満水になるのは水を入れ始めてから何分後ですか。",
      answer: { value: 20, unit: "分後" },
      hints: [
        "水そうの量を 20、30、15 の最小公倍数 60 とおこう。",
        "C管を開けたあとは、1分あたり A＋B−C ずつふえます。",
      ],
      steps: [
        {
          title: "全体を60とする",
          html: "1分あたり：A ＝ 3、B ＝ 2、C ＝ 4（ぬく）",
        },
        {
          title: "はじめの10分",
          html: "(3 ＋ 2) × 10 ＝ <b>50</b> たまる。残り 60 − 50 ＝ 10",
        },
        {
          title: "C管を開けたあと",
          html: "1分あたり 3 ＋ 2 − 4 ＝ <b>1</b> ずつふえる → 10 ÷ 1 ＝ 10分",
        },
        {
          title: "答え",
          html: "10 ＋ 10 ＝ <b>20分後</b>",
        },
      ],
    },
    {
      category: "仕事算",
      level: 3,
      title: "はじめはBが1人で",
      question:
        "ある仕事を、Aが1人ですると15日、AとBの2人ですると10日かかります。はじめBが1人で何日か仕事をし、残りをAとBの2人でしたところ、全部で16日かかりました。Bが1人で仕事をしたのは何日ですか。",
      answer: { value: 9, unit: "日" },
      hints: [
        "全体を30とすると、A＝2、A＋B＝3 なので B＝1。",
        "16日全部2人で働いたら仕事量は？ 実際より多すぎる分を考えよう（つるかめ算）。",
      ],
      steps: [
        {
          title: "1日の仕事量",
          html: "全体を30とすると A ＝ 2、A＋B ＝ 3 → B ＝ <b>1</b>",
        },
        {
          title: "16日全部2人で働いたら",
          html: "3 × 16 ＝ 48。実際は30なので 48 − 30 ＝ <b>18</b> 多い。",
        },
        {
          title: "答え",
          html: "1日を「2人」から「Bだけ」にかえると 3 − 1 ＝ 2 へる → 18 ÷ 2 ＝ <b>9日</b><br>たしかめ：B 9日で9、2人 7日で21、合計30 ✔",
        },
      ],
    },
    {
      category: "仕事算",
      level: 3,
      title: "あと何人ふやすか",
      question:
        "20人ですると15日で終わる仕事があります。はじめ12人で10日間仕事をしました。残りの仕事を8日以内に終わらせるには、少なくとも何人ふやせばよいですか。1人が1日にする仕事の量はみな同じです。",
      answer: { value: 11, unit: "人" },
      hints: [
        "1人が1日にする仕事を1とすると、全体は 20×15＝300。",
        "人数は整数。わり算の答えが小数になったら切り上げよう。",
      ],
      steps: [
        {
          title: "仕事全体",
          html: "1人1日の仕事を1とすると、全体は 20 × 15 ＝ <b>300</b>",
        },
        {
          title: "残りの仕事",
          html: "12人で10日 → 120。残り 300 − 120 ＝ <b>180</b>",
        },
        {
          title: "8日で終わらせるには",
          html: "180 ÷ 8 ＝ 22.5人 → 22人では足りないので <b>23人</b> 必要。",
        },
        {
          title: "答え",
          html: "23 − 12 ＝ <b>11人</b> ふやす。",
        },
      ],
    },

    // ===== 過不足算 =====
    {
      category: "過不足算",
      level: 2,
      title: "最後の1人だけ少ない",
      question:
        "子どもにみかんを配ります。1人に5個ずつ配ると8個余ります。1人に7個ずつ配ると、最後の1人は3個しかもらえません。みかんは全部で何個ありますか。",
      answer: { value: 38, unit: "個" },
      hints: [
        "「最後の1人は3個しかもらえない」は、何個たりないということ？",
        "7個ずつ配るには 7−3＝4個たりません。",
      ],
      steps: [
        {
          title: "たりない数",
          html: "最後の1人に7個配るには 4個たりない → 「7個ずつだと <b>4個不足</b>」",
        },
        {
          title: "全体の差 ÷ 1人分の差",
          html: "余り8個と不足4個で、全体の差は 8 ＋ 4 ＝ 12個。1人あたりの差は 7 − 5 ＝ 2個。<br>子どもは 12 ÷ 2 ＝ <b>6人</b>",
        },
        {
          title: "答え",
          html: "5 × 6 ＋ 8 ＝ <b>38個</b>",
        },
      ],
    },
    {
      category: "過不足算",
      level: 3,
      title: "長いすと空いたいす",
      question:
        "長いすに生徒がすわります。1脚に5人ずつすわると12人がすわれません。1脚に7人ずつすわると、最後の1脚には3人だけがすわり、さらに長いすが2脚余ります。生徒は何人いますか。",
      answer: { value: 87, unit: "人" },
      hints: [
        "7人ずつのとき、全部の長いすに7人ずつすわるには何人たりない？",
        "最後の1脚で4人、空いた2脚で14人、合わせて18人不足です。",
      ],
      steps: [
        {
          title: "7人ずつのときの不足",
          html: "最後の1脚：7 − 3 ＝ 4人、空いた2脚：7 × 2 ＝ 14人 → <b>18人不足</b>",
        },
        {
          title: "長いすの数",
          html: "5人ずつで12人余り、7人ずつで18人不足。<br>(12 ＋ 18) ÷ (7 − 5) ＝ <b>15脚</b>",
        },
        {
          title: "答え",
          html: "5 × 15 ＋ 12 ＝ <b>87人</b><br>たしかめ：7人×12脚＋3人＝87人、使ったのは13脚で2脚余り ✔",
        },
      ],
    },
    {
      category: "過不足算",
      level: 3,
      title: "値段のちがうノート",
      question:
        "持っているお金で、Aのノートを12冊買うと80円余ります。Aより1冊30円高いBのノートを10冊買おうとすると40円たりません。持っているお金は何円ですか。",
      answer: { value: 1160, unit: "円" },
      hints: [
        "Bのノート10冊は「Aのノート10冊＋300円」と同じです。",
        "すると「Aを12冊で80円余る」「Aを10冊で340円余る」…になります。",
      ],
      steps: [
        {
          title: "Bの代金をAで表す",
          html: "B10冊 ＝ A10冊 ＋ 30 × 10 ＝ A10冊 ＋ 300円。<br>B10冊で40円たりない → A10冊なら 300 − 40 ＝ <b>260円余る</b>",
        },
        {
          title: "Aのノートの値段",
          html: "A12冊で80円余り、A10冊で260円余り。<br>2冊の差で 260 − 80 ＝ 180円 → A1冊 ＝ <b>90円</b>",
        },
        {
          title: "答え",
          html: "90 × 12 ＋ 80 ＝ <b>1160円</b><br>たしかめ：B は120円、10冊で1200円 → 40円不足 ✔",
        },
      ],
    },
    {
      category: "過不足算",
      level: 3,
      title: "男子と女子で配る数がちがう",
      question:
        "生徒にえん筆を配ります。1人に4本ずつ配ると20本余り、1人に6本ずつ配ると30本たりません。また、男子に6本ずつ、女子に3本ずつ配るとちょうど配りきれます。男子は何人いますか。",
      answer: { value: 15, unit: "人" },
      hints: [
        "まず前半の過不足算で、生徒の人数とえん筆の本数を求めよう。",
        "後半は「6本」と「3本」のつるかめ算です。",
      ],
      steps: [
        {
          title: "人数と本数",
          html: "(20 ＋ 30) ÷ (6 − 4) ＝ <b>25人</b>、えん筆は 4 × 25 ＋ 20 ＝ <b>120本</b>",
        },
        {
          title: "全員女子だとすると",
          html: "3 × 25 ＝ 75本。120本との差 <b>45本</b>",
        },
        {
          title: "答え",
          html: "女子1人を男子にかえると 3本ふえる → 45 ÷ 3 ＝ <b>15人</b>（女子10人）<br>たしかめ：90 ＋ 30 ＝ 120本 ✔",
        },
      ],
    },

    // ===== 植木算 =====
    {
      category: "植木算",
      level: 2,
      title: "テープをつなぐ",
      question:
        "長さ15cmのテープを、のりしろ2cmでつないでいきます。全体の長さを2m以上にするには、テープは少なくとも何本必要ですか。",
      answer: { value: 16, unit: "本" },
      hints: [
        "のりしろの数は「テープの本数−1」です。",
        "1本目は15cm、2本目からは1本ふえるごとに 15−2＝13cm ずつ長くなります。",
      ],
      steps: [
        {
          title: "長さの式",
          html: "□本つなぐと、のりしろは (□ − 1) か所。<br>長さ ＝ 15 ＋ 13 × (□ − 1) cm",
        },
        {
          title: "200cm以上にする",
          html: "15 ＋ 13 × (□ − 1) ≧ 200 → 13 × (□ − 1) ≧ 185 → □ − 1 ≧ 14.2…",
        },
        {
          title: "答え",
          html: "□ − 1 は 15 以上 → □ ＝ <b>16本</b><br>（15本だと 15＋13×14＝197cm で足りない）",
        },
      ],
    },
    {
      category: "植木算",
      level: 3,
      title: "エレベーターなしの階段",
      question:
        "あるビルで、1階から4階まで階段で上るのに36秒かかります。同じ速さで1階から上り始め、6階で20秒休んでから10階まで上ると、全部で何秒かかりますか。",
      answer: { value: 128, unit: "秒" },
      hints: [
        "1階から4階までに、階と階の「間」はいくつ？",
        "1階から10階までの「間」は 10−1＝9 個です。",
      ],
      steps: [
        {
          title: "1つの間にかかる時間",
          html: "1階から4階までは 4 − 1 ＝ 3つの間 → 36 ÷ 3 ＝ <b>12秒</b>",
        },
        {
          title: "1階から10階まで",
          html: "10 − 1 ＝ 9つの間 → 12 × 9 ＝ <b>108秒</b>",
        },
        {
          title: "答え",
          html: "休けいの20秒をたして 108 ＋ 20 ＝ <b>128秒</b>",
        },
      ],
    },
    {
      category: "植木算",
      level: 3,
      title: "旗とくい",
      question:
        "長さ240mのまっすぐな道の片側に、はしからはしまで6mおきに旗を、8mおきにくいを立てます（両はしにも立てます）。旗とくいが同じ場所になるところには、くいは立てずに旗だけを立てます。旗とくいは合わせて何本立ちますか。",
      answer: { value: 61, unit: "本" },
      hints: [
        "旗とくいが同じ場所になるのは、6と8の最小公倍数24mおきです。",
        "両はしにも立てるので、本数は「間の数＋1」です。",
      ],
      steps: [
        {
          title: "旗の本数",
          html: "240 ÷ 6 ＋ 1 ＝ <b>41本</b>",
        },
        {
          title: "くいの本数（重なりをのぞく）",
          html: "8mおきなら 240 ÷ 8 ＋ 1 ＝ 31本。<br>重なるのは24mおきで 240 ÷ 24 ＋ 1 ＝ 11か所 → くいは 31 − 11 ＝ <b>20本</b>",
        },
        {
          title: "答え",
          html: "41 ＋ 20 ＝ <b>61本</b>",
        },
      ],
    },
    {
      category: "植木算",
      level: 3,
      title: "中空方陣",
      question:
        "碁石をすきまなくならべて、外側の1辺が15個、厚さが3列の中空の正方形（まん中があいた正方形）を作ります。碁石は全部で何個必要ですか。",
      answer: { value: 144, unit: "個" },
      hints: [
        "まん中のあいている正方形の1辺は、15 − 3×2 ＝ 9個分です。",
        "大きい正方形 − あいている正方形 で求められます。",
      ],
      steps: [
        {
          title: "大きい正方形から引く",
          html: "外側の正方形：15 × 15 ＝ 225個分<br>まん中のあき：1辺 15 − 3 × 2 ＝ 9個 → 9 × 9 ＝ 81個分",
        },
        {
          title: "答え",
          html: "225 − 81 ＝ <b>144個</b>",
        },
        {
          title: "別解（1周ずつ）",
          html: "1周の個数は「(1辺−1)×4」。外から 14×4＝56、12×4＝48、10×4＝40 → 合計 144個 ✔",
        },
      ],
    },
    {
      category: "植木算",
      level: 2,
      title: "丸太を切る",
      question:
        "丸太を1回切るのに4分かかり、1回切るごとに1分休みます。1本の丸太を12本に切り分けるには、何分かかりますか。最後に切ったあとは休みません。",
      answer: { value: 54, unit: "分" },
      hints: [
        "12本に分けるには、何回切ればよい？",
        "休けいは「切る回数−1」回です。",
      ],
      steps: [
        {
          title: "切る回数と休む回数",
          html: "12本にするには 12 − 1 ＝ <b>11回</b>切る。休けいは 11 − 1 ＝ <b>10回</b>",
        },
        {
          title: "答え",
          html: "4 × 11 ＋ 1 × 10 ＝ <b>54分</b>",
        },
      ],
    },

    // ===== 通過算 =====
    {
      category: "通過算",
      level: 3,
      title: "鉄橋とトンネル",
      question:
        "ある列車が長さ360mの鉄橋をわたり始めてからわたり終わるまでに25秒かかりました。また、同じ速さで長さ960mのトンネルを通るとき、列車が完全にかくれていたのは35秒間でした。この列車の長さは何mですか。",
      answer: { value: 190, unit: "m" },
      hints: [
        "鉄橋をわたるとき進むきょりは「鉄橋＋列車」、トンネルにかくれている間に進むきょりは「トンネル−列車」。",
        "2つをたすと列車の長さが消えます。",
      ],
      steps: [
        {
          title: "進んだきょり",
          html: "鉄橋：360 ＋ 列車 を 25秒<br>トンネル：960 − 列車 を 35秒",
        },
        {
          title: "たして列車の長さを消す",
          html: "合わせて 360 ＋ 960 ＝ 1320m を 25 ＋ 35 ＝ 60秒 → 秒速 <b>22m</b>",
        },
        {
          title: "答え",
          html: "22 × 25 − 360 ＝ <b>190m</b><br>たしかめ：(960 − 190) ÷ 22 ＝ 35秒 ✔",
        },
      ],
    },
    {
      category: "通過算",
      level: 3,
      title: "すれちがいと追いこし",
      question:
        "長さ180mで秒速20mの列車Aと、長さ150mの列車Bがあります。AとBが向かい合って進むと、出会ってから完全にすれちがうまでに6秒かかりました。BがAを後ろから追いこすとき、追いついてから完全に追いこすまでに何秒かかりますか。",
      answer: { value: 22, unit: "秒" },
      hints: [
        "すれちがい：2つの列車の長さの和を「速さの和」で進む。",
        "追いこし：長さの和を「速さの差」で進む。",
      ],
      steps: [
        {
          title: "Bの速さ",
          html: "長さの和 180 ＋ 150 ＝ 330m。すれちがいでは 330 ÷ 6 ＝ 秒速55m が速さの和。<br>B ＝ 55 − 20 ＝ 秒速<b>35m</b>",
        },
        {
          title: "追いこし",
          html: "速さの差は 35 − 20 ＝ 秒速15m",
        },
        {
          title: "答え",
          html: "330 ÷ 15 ＝ <b>22秒</b>",
        },
      ],
    },
    {
      category: "通過算",
      level: 3,
      title: "歩く人と列車",
      question:
        "線路ぞいの道を秒速1mで歩いている人を、後ろから来た列車が追いこすのに15秒かかりました。また、同じ列車が、向こうから秒速2mで歩いてくる人とすれちがうのに10秒かかりました。列車の長さは何mですか。",
      answer: { value: 90, unit: "m" },
      hints: [
        "追いこし：列車の長さ ＝ (列車 − 1) × 15",
        "すれちがい：列車の長さ ＝ (列車 ＋ 2) × 10",
      ],
      steps: [
        {
          title: "式を立てる",
          html: "列車の秒速を□mとすると<br>(□ − 1) × 15 ＝ (□ ＋ 2) × 10",
        },
        {
          title: "解く",
          html: "15 × □ − 15 ＝ 10 × □ ＋ 20 → 5 × □ ＝ 35 → □ ＝ <b>7</b>",
        },
        {
          title: "答え",
          html: "列車の長さ ＝ (7 − 1) × 15 ＝ <b>90m</b><br>たしかめ：(7 ＋ 2) × 10 ＝ 90m ✔",
        },
      ],
    },
    {
      category: "通過算",
      level: 3,
      title: "鉄橋から長さと速さを求める",
      question:
        "長さ720mの鉄橋を、ある列車がわたり始めてからわたり終わるまでに45秒、列車全体が鉄橋の上にある時間は27秒でした。この列車が、長さ160mで秒速14mの列車と出会ってから完全にすれちがうまでに何秒かかりますか。",
      answer: { value: 10, unit: "秒" },
      hints: [
        "わたり始め〜わたり終わり：鉄橋＋列車、全体が鉄橋の上：鉄橋−列車。",
        "45秒と27秒の平均36秒で、鉄橋の長さだけ進みます。",
      ],
      steps: [
        {
          title: "鉄橋の長さを進む時間",
          html: "(鉄橋＋列車) が45秒、(鉄橋−列車) が27秒。平均をとると 鉄橋720mを (45 ＋ 27) ÷ 2 ＝ <b>36秒</b>",
        },
        {
          title: "速さと長さ",
          html: "秒速 720 ÷ 36 ＝ <b>20m</b>。列車の長さは 20 × 45 − 720 ＝ <b>180m</b>",
        },
        {
          title: "答え",
          html: "すれちがい：(180 ＋ 160) ÷ (20 ＋ 14) ＝ 340 ÷ 34 ＝ <b>10秒</b>",
        },
      ],
    },

    // ===== ニュートン算 =====
    {
      category: "ニュートン算",
      level: 3,
      title: "窓口の数と行列",
      question:
        "ある売り場では、発売開始のときすでに行列ができていて、その後も毎分同じ人数ずつ人が並びます。窓口を3つにすると30分で、4つにすると18分で行列がなくなります。窓口を6つにすると何分で行列がなくなりますか。どの窓口も1分間に同じ人数を受けつけます。",
      answer: { value: 10, unit: "分" },
      hints: [
        "1つの窓口が1分間に受けつける人数を①とおこう。",
        "3窓口×30分で①が90個分、4窓口×18分で72個分。その差は 12分間に並んだ人数です。",
      ],
      steps: [
        {
          title: "受けつけた人数",
          html: "1窓口1分で①とすると、3窓口30分で <b>90</b>、4窓口18分で <b>72</b>（単位は①）",
        },
        {
          title: "毎分ふえる人数",
          html: "差 90 − 72 ＝ 18 は、30 − 18 ＝ 12分間に並んだ人数 → 毎分 18 ÷ 12 ＝ <b>1.5</b>",
        },
        {
          title: "はじめの行列",
          html: "90 − 1.5 × 30 ＝ <b>45</b>",
        },
        {
          title: "答え",
          html: "6窓口では1分に 6 − 1.5 ＝ 4.5 ずつへる → 45 ÷ 4.5 ＝ <b>10分</b>",
        },
      ],
    },
    {
      category: "ニュートン算",
      level: 3,
      title: "牧場の草",
      question:
        "ある牧場では草が毎日同じ量ずつのびます。この牧場に牛を10頭放すと24日で、15頭放すと12日で草を食べつくします。8日で食べつくすには、牛を何頭放せばよいですか。",
      answer: { value: 20, unit: "頭" },
      hints: [
        "牛1頭が1日に食べる草の量を1とおこう。",
        "10頭×24日＝240、15頭×12日＝180。差は12日分のびた草です。",
      ],
      steps: [
        {
          title: "食べた草の量",
          html: "10 × 24 ＝ <b>240</b>、15 × 12 ＝ <b>180</b>",
        },
        {
          title: "1日にのびる草",
          html: "(240 − 180) ÷ (24 − 12) ＝ <b>5</b>",
        },
        {
          title: "はじめの草",
          html: "240 − 5 × 24 ＝ <b>120</b>",
        },
        {
          title: "答え",
          html: "8日で食べる量は 120 ＋ 5 × 8 ＝ 160 → 160 ÷ 8 ＝ <b>20頭</b>",
        },
      ],
    },
    {
      category: "ニュートン算",
      level: 3,
      title: "わき出る井戸",
      question:
        "水がいつも同じ割合でわき出ている井戸があります。この井戸の水をポンプ4台でくみ出すと20分で、6台でくみ出すと12分で空になります。8分以内に空にするには、ポンプは少なくとも何台必要ですか。",
      answer: { value: 9, unit: "台" },
      hints: [
        "ポンプ1台が1分にくみ出す量を1とすると、80と72。",
        "台数は整数。小数になったら切り上げます。",
      ],
      steps: [
        {
          title: "わき出る量",
          html: "4 × 20 ＝ 80、6 × 12 ＝ 72。(80 − 72) ÷ (20 − 12) ＝ 毎分 <b>1</b>",
        },
        {
          title: "はじめの水",
          html: "80 − 1 × 20 ＝ <b>60</b>",
        },
        {
          title: "8分で空にするには",
          html: "8分でくむ量は 60 ＋ 1 × 8 ＝ 68 → 68 ÷ 8 ＝ <b>8.5台</b>",
        },
        {
          title: "答え",
          html: "8台では足りないので <b>9台</b>",
        },
      ],
    },
    {
      category: "ニュートン算",
      level: 3,
      title: "とちゅうで入口をへらす",
      question:
        "遊園地の開園時、入口にはすでに600人が並んでいて、その後も毎分20人ずつ並びます。1つの入口からは毎分10人が入場できます。はじめ入口を5つ開けていましたが、開園から10分後に入口を2つ閉めました。行列がなくなるのは開園から何分後ですか。",
      answer: { value: 40, unit: "分後" },
      hints: [
        "はじめの10分間、行列は1分あたり何人へる？",
        "入口が3つになると、1分あたり 30 − 20 ＝ 10人ずつへります。",
      ],
      steps: [
        {
          title: "はじめの10分",
          html: "入口5つで毎分50人入場、20人ふえる → 毎分 <b>30人</b>へる。<br>10分後の行列：600 − 30 × 10 ＝ <b>300人</b>",
        },
        {
          title: "入口3つになってから",
          html: "毎分 30 − 20 ＝ <b>10人</b>へる → 300 ÷ 10 ＝ 30分",
        },
        {
          title: "答え",
          html: "10 ＋ 30 ＝ <b>40分後</b>",
        },
      ],
    },

    // ===== 比 =====
    {
      category: "比",
      level: 2,
      title: "連比",
      question:
        "A、B、Cの3つの数があり、A:B＝3:4、B:C＝6:5 です。A＋B＋C＝186 のとき、Aはいくつですか。",
      answer: { value: 54, unit: "" },
      hints: [
        "Bの数をそろえて、A:B:C の連比を作ろう。",
        "4と6の最小公倍数は12です。",
      ],
      steps: [
        {
          title: "Bをそろえる",
          html: "A:B ＝ 3:4 ＝ 9:12、B:C ＝ 6:5 ＝ 12:10 → A:B:C ＝ <b>9:12:10</b>",
        },
        {
          title: "答え",
          html: "合計 9 ＋ 12 ＋ 10 ＝ 31 が186 → 1あたり 6<br>A ＝ 9 × 6 ＝ <b>54</b>",
        },
      ],
    },
    {
      category: "比",
      level: 3,
      title: "お金をわたす（和が一定）",
      question:
        "兄と弟の所持金の比は 5:3 でした。兄が弟に600円わたしたので、兄と弟の所持金の比は 7:9 になりました。はじめの兄の所持金は何円ですか。",
      answer: { value: 2000, unit: "円" },
      hints: [
        "お金のやりとりでは、2人の合計は変わりません。",
        "5:3（和8）と 7:9（和16）の和をそろえよう。",
      ],
      steps: [
        {
          title: "和をそろえる",
          html: "合計は変わらない。5:3（和8）を2倍して <b>10:6</b>、7:9（和16）はそのまま。",
        },
        {
          title: "600円は何目もり？",
          html: "兄は 10 → 7 で 3目もりへった。これが600円 → 1目もり ＝ <b>200円</b>",
        },
        {
          title: "答え",
          html: "はじめの兄 ＝ 10 × 200 ＝ <b>2000円</b>（弟1200円 → 1400円と1800円で 7:9 ✔）",
        },
      ],
    },
    {
      category: "比",
      level: 3,
      title: "○分の○が等しい",
      question:
        "AさんとBさんの所持金について、Aさんの所持金の 2/5 と、Bさんの所持金の 3/4 が等しくなっています。2人の所持金の合計が1840円のとき、Aさんの所持金は何円ですか。",
      answer: { value: 1200, unit: "円" },
      hints: [
        "A × 2/5 ＝ B × 3/4 のとき、A:B はかけた数の逆比になります。",
        "A:B ＝ 3/4 : 2/5 を整数の比にしよう。",
      ],
      steps: [
        {
          title: "逆比",
          html: "A × 2/5 ＝ B × 3/4 なので A:B ＝ 3/4 : 2/5。<br>20倍して <b>15:8</b>",
        },
        {
          title: "答え",
          html: "合計 23 が1840円 → 1目もり 80円<br>A ＝ 15 × 80 ＝ <b>1200円</b>（B640円。1200×2/5＝480、640×3/4＝480 ✔）",
        },
      ],
    },
    {
      category: "比",
      level: 3,
      title: "同じ金額を使う（差が一定）",
      question:
        "姉と妹の所持金の比は 7:4 でした。2人とも600円ずつ使ったところ、所持金の比は 2:1 になりました。はじめの姉の所持金は何円ですか。",
      answer: { value: 4200, unit: "円" },
      hints: [
        "2人とも同じ金額を使ったので、2人の差は変わりません。",
        "7:4（差3）と 2:1（差1）の差をそろえよう。",
      ],
      steps: [
        {
          title: "差をそろえる",
          html: "7:4 は差3、2:1 は差1 → 3倍して <b>6:3</b>（差3）",
        },
        {
          title: "600円は何目もり？",
          html: "姉は 7 → 6 で1目もりへった → 1目もり ＝ <b>600円</b>",
        },
        {
          title: "答え",
          html: "はじめの姉 ＝ 7 × 600 ＝ <b>4200円</b>（妹2400円 → 3600円と1800円で 2:1 ✔）",
        },
      ],
    },
    {
      category: "比",
      level: 3,
      title: "男女比と電車通学",
      question:
        "ある学校の男子と女子の人数の比は 5:4 です。男子の 3/5 と、女子の 1/2 が電車で通学していて、電車で通学している生徒は180人です。全校生徒は何人ですか。",
      answer: { value: 324, unit: "人" },
      hints: [
        "男子を⑤、女子を④とすると、電車通学の男子は ⑤×3/5＝③。",
        "電車通学の女子は ④×1/2＝②。",
      ],
      steps: [
        {
          title: "電車通学を比で表す",
          html: "男子⑤ × 3/5 ＝ ③、女子④ × 1/2 ＝ ② → 合わせて <b>⑤＝180人</b>",
        },
        {
          title: "答え",
          html: "①＝36人。全校生徒 ＝ ⑨ ＝ 36 × 9 ＝ <b>324人</b>",
        },
      ],
    },

    // ===== 時計算 =====
    {
      category: "時計算",
      level: 2,
      title: "長針と短針が重なる",
      question:
        "3時と4時の間で、時計の長針と短針が重なるのは3時何分ですか。分数で答えましょう（例：16と4/11）。",
      answer: { value: 180 / 11, unit: "分", text: "3時16と4/11分" },
      hints: [
        "長針は1分に6°、短針は1分に0.5°進みます。1分で 5.5° ずつ追いつきます。",
        "3時ちょうど、短針は長針より 90° 先にあります。",
      ],
      steps: [
        {
          title: "3時の角度",
          html: "3時ちょうど、短針は長針より 30 × 3 ＝ <b>90°</b> 先にある。",
        },
        {
          title: "追いつく速さ",
          html: "長針 6°/分 − 短針 0.5°/分 ＝ <b>5.5°/分</b> ずつ追いつく。",
        },
        {
          title: "答え",
          html: "90 ÷ 5.5 ＝ 180/11 ＝ <b>16と4/11分</b> → 3時16と4/11分",
        },
      ],
    },
    {
      category: "時計算",
      level: 3,
      title: "一直線になる",
      question:
        "4時と5時の間で、時計の長針と短針が反対向きに一直線になるのは4時何分ですか。分数で答えましょう。",
      answer: { value: 600 / 11, unit: "分", text: "4時54と6/11分" },
      hints: [
        "4時ちょうど、短針は長針より120°先。",
        "一直線になるのは、長針が短針を追いこして180°先に出たときです。",
      ],
      steps: [
        {
          title: "長針が進むべき角度",
          html: "4時ちょうど、短針は 120° 先。追いついて（120°）、さらに 180° 先に出る → <b>300°</b> の差を作る。",
        },
        {
          title: "答え",
          html: "300 ÷ 5.5 ＝ 600/11 ＝ <b>54と6/11分</b> → 4時54と6/11分",
        },
      ],
    },
    {
      category: "時計算",
      level: 3,
      title: "直角になる（1回目）",
      question:
        "7時と8時の間で、時計の長針と短針が直角になるのは2回あります。1回目は7時何分ですか。分数で答えましょう。",
      answer: { value: 240 / 11, unit: "分", text: "7時21と9/11分" },
      hints: [
        "7時ちょうど、短針は長針より 210° 先にあります。",
        "1回目は、2本の針の差が 210° → 90° になるときです。",
      ],
      steps: [
        {
          title: "7時の角度",
          html: "7時ちょうど、短針は長針より 30 × 7 ＝ <b>210°</b> 先。",
        },
        {
          title: "1回目の直角",
          html: "長針が追いついて、差が 210° から 90° になるとき。<br>ちぢめる角度は 210 − 90 ＝ <b>120°</b>",
        },
        {
          title: "答え",
          html: "120 ÷ 5.5 ＝ 240/11 ＝ <b>21と9/11分</b> → 7時21と9/11分<br>（2回目は 300 ÷ 5.5 ＝ 54と6/11分）",
        },
      ],
    },
    {
      category: "時計算",
      level: 3,
      title: "同じ角度にもどる",
      question:
        "時計がちょうど1時を指しています。このあと、長針と短針のつくる角の大きさが、はじめて1時ちょうどのときと同じになるのは何分後ですか。分数で答えましょう。",
      answer: { value: 120 / 11, unit: "分後", text: "10と10/11分後" },
      hints: [
        "1時ちょうどの角は30°（短針が先）。",
        "次に30°になるのは、長針が短針を追いこして30°先に出たときです。",
      ],
      steps: [
        {
          title: "1時の角度",
          html: "1時ちょうど、短針は長針より <b>30°</b> 先。",
        },
        {
          title: "次に30°になるとき",
          html: "長針が追いついて（30°）、さらに30°先に出る → 差を <b>60°</b> 作る。",
        },
        {
          title: "答え",
          html: "60 ÷ 5.5 ＝ 120/11 ＝ <b>10と10/11分後</b>",
        },
      ],
    },
    {
      category: "時計算",
      level: 3,
      title: "おくれる時計",
      question:
        "1時間に2分ずつおくれる時計があります。この時計を月曜日の正午に正しい時刻に合わせました。この時計が火曜日の午後5時を指すとき、正しい時刻は火曜日の午後何時ですか。",
      answer: { value: 6, unit: "時", text: "火曜日の午後6時" },
      hints: [
        "正しい時刻で60分たつ間に、この時計は58分しか進みません。",
        "時計が進んだ時間は、月曜の正午から火曜の午後5時までの29時間です。",
      ],
      steps: [
        {
          title: "進み方の比",
          html: "正しい時間 : 時計の時間 ＝ 60 : 58 ＝ <b>30 : 29</b>",
        },
        {
          title: "時計が進んだ時間",
          html: "月曜の正午から火曜の午後5時まで → <b>29時間</b>",
        },
        {
          title: "答え",
          html: "正しい時間は 29 × 30/29 ＝ 30時間 → 月曜の正午の30時間後 ＝ <b>火曜日の午後6時</b>",
        },
      ],
    },

    // ===== 速さ =====
    {
      category: "速さ",
      level: 3,
      title: "池のまわりで出発点に",
      question:
        "1周1200mの池のまわりを、AとBが同じ地点から同時に反対向きに歩き始めました。Aは分速80m、Bは分速70mです。2人がはじめて出発地点で同時に出会うのは、出発してから何分後ですか。",
      answer: { value: 120, unit: "分後" },
      hints: [
        "Aが1周するのは15分ごと、Bが1周するのは 1200÷70＝120/7 分ごと。",
        "2人とも出発地点にいるのは、2人とも「ちょうど何周か」したときです。",
      ],
      steps: [
        {
          title: "1周にかかる時間",
          html: "A：1200 ÷ 80 ＝ <b>15分</b>、B：1200 ÷ 70 ＝ <b>120/7分</b>",
        },
        {
          title: "周回数で考える",
          html: "同じ時間に歩く道のりの比は 80:70 ＝ 8:7。<br>2人がちょうど何周かしているのは、A が8周、B が7周したとき（はじめて）。",
        },
        {
          title: "答え",
          html: "A が8周するのは 15 × 8 ＝ <b>120分後</b>（B は 70 × 120 ＝ 8400m ＝ 7周 ✔）",
        },
      ],
    },
    {
      category: "速さ",
      level: 3,
      title: "流れが速くなった日",
      question:
        "ある船が、川の36kmはなれた2地点を上るのに3時間、下るのに2時間かかります。ある日、川の流れの速さがふだんの2倍になっていました。この日、同じ船で同じ区間を上ると何時間かかりますか。",
      answer: { value: 4, unit: "時間" },
      hints: [
        "上りの速さ ＝ 船 − 流れ、下りの速さ ＝ 船 ＋ 流れ。",
        "船の速さ ＝ (上り＋下り)÷2、流れ ＝ (下り−上り)÷2。",
      ],
      steps: [
        {
          title: "上り・下りの速さ",
          html: "上り：36 ÷ 3 ＝ 時速12km、下り：36 ÷ 2 ＝ 時速18km",
        },
        {
          title: "船と流れの速さ",
          html: "船 ＝ (12 ＋ 18) ÷ 2 ＝ 時速<b>15km</b>、流れ ＝ (18 − 12) ÷ 2 ＝ 時速<b>3km</b>",
        },
        {
          title: "答え",
          html: "流れが時速6kmになると、上りは 15 − 6 ＝ 時速9km → 36 ÷ 9 ＝ <b>4時間</b>",
        },
      ],
    },
    {
      category: "速さ",
      level: 3,
      title: "往復の平均の速さ",
      question:
        "A地点からB地点まで時速12kmで行き、B地点からA地点まで同じ道を時速□kmで帰ったところ、往復の平均の速さは時速15kmでした。□にあてはまる数を答えましょう。",
      answer: { value: 20, unit: "" },
      hints: [
        "平均の速さは (12＋□)÷2 ではありません！",
        "AB間のきょりを、12と15で割り切れる60kmとおいてみよう。",
      ],
      steps: [
        {
          title: "きょりを決める",
          html: "AB間を60kmとすると、往復120kmを時速15km → <b>8時間</b>",
        },
        {
          title: "行きと帰りの時間",
          html: "行き：60 ÷ 12 ＝ <b>5時間</b> → 帰り：8 − 5 ＝ <b>3時間</b>",
        },
        {
          title: "答え",
          html: "帰りの速さ ＝ 60 ÷ 3 ＝ 時速<b>20km</b>",
        },
      ],
    },
    {
      category: "速さ",
      level: 2,
      title: "歩くと4分おくれ、走ると6分前",
      question:
        "家から駅まで分速60mで歩くと、電車の発車時刻の4分後に着きます。分速90mで走ると、発車時刻の6分前に着きます。家から駅までの道のりは何mですか。",
      answer: { value: 1800, unit: "m" },
      hints: [
        "2つの方法でかかる時間の差は 4＋6＝10分。",
        "同じ道のりなら、かかる時間の比は速さの逆比 90:60＝3:2。",
      ],
      steps: [
        {
          title: "時間の差",
          html: "4分おくれ と 6分前 → かかる時間の差は <b>10分</b>",
        },
        {
          title: "時間の比",
          html: "速さの比 60:90 ＝ 2:3 → 時間の比は <b>3:2</b>。差1目もりが10分。",
        },
        {
          title: "答え",
          html: "歩くと 30分 → 60 × 30 ＝ <b>1800m</b>（走ると 20分で 90×20＝1800m ✔）",
        },
      ],
    },
    {
      category: "速さ",
      level: 3,
      title: "追いついて引き返す",
      question:
        "兄が分速80mで家を出発しました。その10分後に、弟が自転車で分速240mで兄を追いかけました。弟は兄に追いつくとすぐに同じ速さで家に引き返しました。弟が家に着いたとき、兄は家から何mのところにいますか。",
      answer: { value: 1600, unit: "m" },
      hints: [
        "弟が出発するとき、兄は 80×10＝800m 先にいます。",
        "追いつくのにかかる時間 ＝ 800 ÷ (240−80)。",
      ],
      steps: [
        {
          title: "追いつくまで",
          html: "弟が出発するとき、2人の差は 800m。1分に 240 − 80 ＝ 160m ちぢまる → <b>5分</b>で追いつく。",
        },
        {
          title: "引き返す時間",
          html: "追いついた場所は家から 240 × 5 ＝ 1200m。同じ速さで帰るので <b>5分</b>。",
        },
        {
          title: "答え",
          html: "兄が歩いた時間は 10 ＋ 5 ＋ 5 ＝ 20分 → 80 × 20 ＝ <b>1600m</b>",
        },
      ],
    },
    {
      category: "速さ",
      level: 3,
      title: "2回目に出会う場所",
      question:
        "AとBが、P地点とQ地点からそれぞれ同時に向かい合って出発し、P地点から600mのところではじめて出会いました。そのあと2人はそのまま進み、それぞれQ地点、P地点で折り返したところ、Q地点から400mのところで2回目に出会いました。PQ間の道のりは何mですか。2人の速さはそれぞれ一定です。",
      answer: { value: 1400, unit: "m" },
      hints: [
        "1回目に出会うまでに、2人が進んだ道のりの合計は PQ 1つ分。",
        "2回目に出会うまでに、2人が進んだ道のりの合計は PQ 3つ分。Aも1回目の3倍進んでいます。",
      ],
      steps: [
        {
          title: "1回目まで",
          html: "2人合わせて PQ 1つ分を進む。そのうちAは <b>600m</b>。",
        },
        {
          title: "2回目まで",
          html: "2人合わせて PQ 3つ分を進む（かかる時間も3倍）。<br>Aも 600 × 3 ＝ <b>1800m</b> 進んでいる。",
        },
        {
          title: "答え",
          html: "Aは PからQまで行って400m もどったので、1800 ＝ PQ ＋ 400 → PQ ＝ <b>1400m</b>",
        },
      ],
    },
  ];

  list.forEach(function (p, i) {
    p.id = i + 1;
  });

  // ---------- 追加の問題（v2.2.0） ----------
  // 記録が変わらないよう id は 60 から順につける。表示は分野ごとにまとめる

  var more = [
    // ===== 角度 =====
    {
      category: "角度",
      level: 3,
      title: "七角形の星形",
      question: "図のような、7つの頂点をもつ星形があります。7つの先端の角（しるしをつけた角）の大きさの和は何度ですか。",
      fig: fig(t.star7),
      answer: { value: 540, unit: "度" },
      hints: [
        "星形の内側には七角形ができます。先端は、その七角形の辺を底辺とする三角形です。",
        "先端の三角形の底角は、内側の七角形の「外角」と同じ大きさです。",
      ],
      steps: [
        {
          title: "7つの三角形に分ける",
          html: "7つの先端は、内側の七角形の辺を底辺とする三角形になっている。7つの三角形の内角の和は 180 × 7 ＝ <b>1260°</b>",
        },
        {
          title: "底角は七角形の外角",
          html: "先端の三角形の底角は、内側の七角形の外角と同じ大きさ。七角形の各頂点には、底角が2つずつ集まっている。<br>多角形の外角の和は360°なので、底角の合計は 360 × 2 ＝ <b>720°</b>",
        },
        {
          title: "答え",
          html: "先端の角の和 ＝ 1260 − 720 ＝ <b>540°</b><br>（星形がゆがんでいても、この和は変わりません）",
        },
      ],
    },
    {
      category: "角度",
      level: 2,
      title: "平行線の間の折れ線",
      question: "図で、直線ℓとmは平行です。角ア（Bの角）は何度ですか。",
      fig: fig(t.parallel),
      answer: { value: 40, unit: "度" },
      hints: [
        "P と Q を通り、ℓ に平行な線を引いてみよう。",
        "平行線の錯角（Z の形）は等しくなります。",
      ],
      steps: [
        {
          title: "Pを通る平行線",
          html: "Pを通りℓに平行な線を引くと、100°は錯角で <b>30°</b> と <b>70°</b> に分かれる。",
        },
        {
          title: "Qを通る平行線",
          html: "Qを通りℓに平行な線を引くと、110°は錯角で <b>70°</b>（上の部分）と <b>40°</b>（下の部分）に分かれる。",
        },
        {
          title: "答え",
          html: "下の部分の40°は、mとの錯角でアと等しい → ア ＝ <b>40°</b>",
        },
        {
          title: "覚え方",
          html: "左にとがった角の和 ＝ 右にとがった角の和。<br>30 ＋ 110 ＝ 100 ＋ ア → ア ＝ 40°",
        },
      ],
    },
    {
      category: "角度",
      level: 3,
      title: "正方形と外側の正三角形",
      question: "図のように、正方形ABCDの辺BCの外側に正三角形EBCをかき、EとA、EとDをそれぞれ結びました。角ア（角AED）は何度ですか。",
      fig: fig(t.squareTri),
      answer: { value: 30, unit: "度" },
      hints: [
        "BA＝BC＝BE なので、三角形ABEは二等辺三角形です。",
        "角ABE＝90＋60＝150° です。",
      ],
      steps: [
        {
          title: "二等辺三角形ABE",
          html: "BA＝BC＝BE なので三角形ABEは二等辺三角形。<br>角ABE ＝ 90 ＋ 60 ＝ 150° → 角BEA ＝ (180 − 150) ÷ 2 ＝ <b>15°</b>",
        },
        {
          title: "反対側も同じ",
          html: "同じように 角CED ＝ <b>15°</b>",
        },
        {
          title: "答え",
          html: "角BEC＝60° なので、角ア ＝ 60 − 15 − 15 ＝ <b>30°</b>",
        },
      ],
    },
    {
      category: "角度",
      level: 3,
      title: "正九角形の対角線",
      question: "図の正九角形ABCDEFGHIで、対角線ACとBEの交わる点をPとします。角ア（角BPC）は何度ですか。",
      fig: fig(t.nonagon),
      answer: { value: 120, unit: "度" },
      hints: [
        "正九角形の1つの内角は 180×7÷9＝140° です。",
        "四角形BCDEは、BEを底辺とする等脚台形です。",
      ],
      steps: [
        {
          title: "内角",
          html: "九角形の内角の和は 180 × 7 ＝ 1260°、1つの角は <b>140°</b>",
        },
        {
          title: "角BCA",
          html: "三角形ABCは BA＝BC の二等辺三角形。角BCA ＝ (180 − 140) ÷ 2 ＝ <b>20°</b>",
        },
        {
          title: "角CBE",
          html: "四角形BCDEは等脚台形で、角C＝角D＝140°。<br>角CBE ＝ 角DEB ＝ (360 − 140 × 2) ÷ 2 ＝ <b>40°</b>",
        },
        {
          title: "答え",
          html: "三角形PBCで、角ア ＝ 180 − 20 − 40 ＝ <b>120°</b>",
        },
      ],
    },

    // ===== 面積 =====
    {
      category: "面積",
      level: 2,
      title: "四分円の中の正方形",
      question: "図は半径10cmの四分円（円を4等分した形）で、正方形の頂点Pは弧の上にあります。色のついた部分の面積は何cm²ですか。円周率は3.14とします。",
      fig: fig(t.quarterSquare),
      answer: { value: 28.5, unit: "cm²" },
      hints: [
        "正方形の1辺の長さはわかりませんが、対角線OPの長さはわかります。",
        "正方形（ひし形）の面積 ＝ 対角線 × 対角線 ÷ 2",
      ],
      steps: [
        {
          title: "正方形の対角線",
          html: "OPは半径なので <b>10cm</b>。これが正方形の対角線。",
        },
        {
          title: "正方形の面積",
          html: "10 × 10 ÷ 2 ＝ <b>50cm²</b>",
        },
        {
          title: "答え",
          html: "四分円 10 × 10 × 3.14 ÷ 4 ＝ 78.5cm²<br>78.5 − 50 ＝ <b>28.5cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 3,
      title: "半円を回転させる",
      question: "直径ABが12cmの半円を、点Aを中心に30°回転させました。色のついた部分の面積は何cm²ですか。円周率は3.14とします。",
      fig: fig(t.semiRotate),
      answer: { value: 37.68, unit: "cm²" },
      hints: [
        "色の部分 ＝（回転後の半円＋おうぎ形ABB'）− もとの半円",
        "回転後の半円ともとの半円は同じ大きさです。",
      ],
      steps: [
        {
          title: "面積の足し引き",
          html: "色の部分 ＝ 回転後の半円 ＋ おうぎ形ABB' − もとの半円",
        },
        {
          title: "半円は消える",
          html: "2つの半円は合同なので打ち消し合い、<b>色の部分 ＝ おうぎ形ABB'</b>",
        },
        {
          title: "答え",
          html: "半径12cm、中心角30°のおうぎ形：12 × 12 × 3.14 × 30/360 ＝ 12 × 3.14 ＝ <b>37.68cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 2,
      title: "正方形の中のちょうちょ型",
      question: "1辺12cmの正方形ABCDで、Eは辺BCの真ん中の点です。AEとBDの交わる点をFとするとき、四角形FECD（色のついた部分）の面積は何cm²ですか。",
      fig: fig(t.squareDiag),
      answer: { value: 60, unit: "cm²" },
      hints: [
        "三角形FBE と 三角形FDA は相似（ちょうちょ型）で、相似比は BE:DA＝1:2。",
        "四角形FECD ＝ 三角形BCD − 三角形BEF",
      ],
      steps: [
        {
          title: "相似比",
          html: "BE∥AD なので 三角形FBE と 三角形FDA は相似。BE:DA ＝ 6:12 ＝ <b>1:2</b> → EF:FA ＝ 1:2",
        },
        {
          title: "三角形BEF",
          html: "三角形ABE ＝ 12 × 6 ÷ 2 ＝ 36cm²。EF:FA＝1:2 なので 三角形BEF ＝ 36 × 1/3 ＝ <b>12cm²</b>",
        },
        {
          title: "答え",
          html: "三角形BCD ＝ 12 × 12 ÷ 2 ＝ 72cm²<br>四角形FECD ＝ 72 − 12 ＝ <b>60cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 2,
      title: "かたむいた正方形",
      question: "図のように、1辺8cmの正方形の各辺を 5cm と 3cm に分ける点を結んで、かたむいた正方形（色のついた部分）を作りました。この正方形の面積は何cm²ですか。",
      fig: fig(t.tilted),
      answer: { value: 34, unit: "cm²" },
      hints: [
        "かたむいた正方形の1辺の長さを直接求めるのはむずかしい。",
        "まわりの4つの直角三角形（直角をはさむ辺が5cmと3cm）を引こう。",
      ],
      steps: [
        {
          title: "まわりの直角三角形",
          html: "まわりの4つの三角形は、直角をはさむ2辺が 5cm と 3cm。1つ 5 × 3 ÷ 2 ＝ 7.5cm²、4つで <b>30cm²</b>",
        },
        {
          title: "答え",
          html: "大きい正方形 8 × 8 ＝ 64cm² から引いて、64 − 30 ＝ <b>34cm²</b>",
        },
      ],
    },
    {
      category: "面積",
      level: 2,
      title: "葉っぱの形",
      question: "1辺10cmの正方形ABCDの中に、BとDをそれぞれ中心とする半径10cmの四分円をかきました。2つの四分円が重なった部分（色のついた部分）の面積は何cm²ですか。円周率は3.14とします。",
      fig: fig(t.lens),
      answer: { value: 57, unit: "cm²" },
      hints: [
        "色の部分を対角線ACで2つに分けてみよう。",
        "半分は「四分円 − 直角二等辺三角形」です。",
      ],
      steps: [
        {
          title: "半分に分ける",
          html: "対角線ACで分けると、半分は 四分円 − 三角形ABC",
        },
        {
          title: "半分の面積",
          html: "10 × 10 × 3.14 ÷ 4 − 10 × 10 ÷ 2 ＝ 78.5 − 50 ＝ <b>28.5cm²</b>",
        },
        {
          title: "答え",
          html: "28.5 × 2 ＝ <b>57cm²</b><br>（葉っぱの形 ＝ 1辺 × 1辺 × 0.57 と覚えておくと便利）",
        },
      ],
    },

    // ===== つるかめ算 =====
    {
      category: "つるかめ算",
      level: 3,
      title: "3種類の硬貨",
      question: "50円玉、100円玉、500円玉が合わせて30枚あり、金額の合計は8300円です。100円玉は50円玉より4枚多くあります。500円玉は何枚ありますか。",
      answer: { value: 14, unit: "枚" },
      hints: [
        "100円玉から4枚（400円）を取りのぞくと、50円玉と100円玉が同じ枚数になります。",
        "50円玉1枚と100円玉1枚をセット（2枚で150円）にしよう。",
      ],
      steps: [
        {
          title: "4枚を取りのぞく",
          html: "100円玉4枚を取りのぞくと、26枚で 8300 − 400 ＝ <b>7900円</b>。50円玉と100円玉は同じ枚数。",
        },
        {
          title: "セットにする",
          html: "50円玉＋100円玉 ＝ 2枚で150円のセット。全部500円玉なら 26 × 500 ＝ 13000円、実際との差 5100円。",
        },
        {
          title: "入れかえる",
          html: "500円玉2枚（1000円）をセット1組（150円）にかえると 850円へる → 5100 ÷ 850 ＝ <b>6組</b>",
        },
        {
          title: "答え",
          html: "50円玉6枚、100円玉10枚、500円玉は 30 − 16 ＝ <b>14枚</b><br>たしかめ：300 ＋ 1000 ＋ 7000 ＝ 8300円 ✔",
        },
      ],
    },
    {
      category: "つるかめ算",
      level: 3,
      title: "じゃんけんで階段",
      question: "AとBがじゃんけんを20回しました。勝つと3段上がり、負けると1段下がり、あいこのときは2人とも1段上がります。あいこは5回で、Aは最初より30段上にいました。Aは何回勝ちましたか。",
      answer: { value: 10, unit: "回" },
      hints: [
        "あいこ以外の15回は、Aが勝つか負けるかのどちらかです。",
        "あいこの5回で、Aは5段上がっています。",
      ],
      steps: [
        {
          title: "あいこの分を引く",
          html: "あいこ5回で5段上がるので、勝ち負けの15回で 30 − 5 ＝ <b>25段</b>上がった。",
        },
        {
          title: "全部負けたとすると",
          html: "15回全部負けると 15段下がる（−15段）。実際との差は 25 − (−15) ＝ <b>40段</b>",
        },
        {
          title: "答え",
          html: "1回を負けから勝ちにかえると 3 ＋ 1 ＝ 4段ふえる → 40 ÷ 4 ＝ <b>10回</b><br>たしかめ：10勝で＋30段、5敗で−5段、あいこ5回で＋5段 → 30段 ✔",
        },
      ],
    },
    {
      category: "つるかめ算",
      level: 3,
      title: "5点と8点のテスト",
      question: "1問5点の問題と1問8点の問題が合わせて20問あり、全部正解すると130点です。ある生徒はちょうど5問まちがえて96点でした。この生徒がまちがえた8点の問題は何問ですか。",
      answer: { value: 3, unit: "問" },
      hints: [
        "まず、8点の問題が何問あるかを考えなくても解けます。",
        "まちがえた5問で、130−96＝34点を失っています。",
      ],
      steps: [
        {
          title: "失った点数",
          html: "130 − 96 ＝ <b>34点</b> を、まちがえた5問で失った。",
        },
        {
          title: "全部5点の問題だとすると",
          html: "5 × 5 ＝ 25点。34点との差は <b>9点</b>",
        },
        {
          title: "答え",
          html: "1問を5点から8点にかえると3点ふえる → 9 ÷ 3 ＝ <b>3問</b><br>（参考：8点の問題は (130 − 100) ÷ 3 ＝ 10問）",
        },
      ],
    },
    {
      category: "つるかめ算",
      level: 3,
      title: "定価と2割引き",
      question: "定価400円の品物を、1日目は定価で、2日目は定価の2割引きで売りました。2日間で合わせて50個売れ、売り上げは18400円でした。2日目に売れたのは何個ですか。",
      answer: { value: 20, unit: "個" },
      hints: [
        "2割引きの値段は 400×(1−0.2)＝320円 です。",
        "全部定価で売れたとすると、売り上げはいくら？",
      ],
      steps: [
        {
          title: "2割引きの値段",
          html: "400 × 0.8 ＝ <b>320円</b>",
        },
        {
          title: "全部定価だとすると",
          html: "400 × 50 ＝ 20000円。実際との差は 20000 − 18400 ＝ <b>1600円</b>",
        },
        {
          title: "答え",
          html: "1個を2割引きにかえると 80円へる → 1600 ÷ 80 ＝ <b>20個</b>",
        },
      ],
    },

    // ===== 年齢算 =====
    {
      category: "年齢算",
      level: 3,
      title: "3年前は5倍、5年後は3倍",
      question: "3年前、父の年齢は子どもの年齢の5倍でした。5年後には、父の年齢は子どもの年齢の3倍になります。現在の父の年齢は何歳ですか。",
      answer: { value: 43, unit: "歳" },
      hints: [
        "年齢の差は変わりません。3年前の子を①、5年後の子を【1】とおこう。",
        "差は ④＝【2】 です。また、【1】と①の差は8年です。",
      ],
      steps: [
        {
          title: "差をそろえる",
          html: "3年前：子①、父⑤ → 差④<br>5年後：子【1】、父【3】 → 差【2】<br>差は同じなので ④＝【2】、つまり 【1】＝②",
        },
        {
          title: "8年の差",
          html: "5年後の子② と 3年前の子① の差は 3 ＋ 5 ＝ 8年 → ①＝<b>8歳</b>",
        },
        {
          title: "答え",
          html: "3年前の父 ＝ 8 × 5 ＝ 40歳 → 現在の父 ＝ <b>43歳</b><br>たしかめ：5年後は 48歳と16歳で3倍 ✔",
        },
      ],
    },
    {
      category: "年齢算",
      level: 3,
      title: "母は子3人の和の2倍",
      question: "現在、母は38歳、3人の子どもは12歳、8歳、4歳です。母の年齢が3人の子どもの年齢の和のちょうど2倍だったのは何年前ですか。",
      answer: { value: 2, unit: "年前" },
      hints: [
        "今の子どもの年齢の和は24歳。その2倍は48歳で、母より10歳多い。",
        "1年さかのぼると、母は1歳、「子の和の2倍」は 3×2＝6歳 へります。",
      ],
      steps: [
        {
          title: "今の様子",
          html: "子の和 24歳、その2倍は48歳。母38歳より <b>10歳</b>多い。",
        },
        {
          title: "1年さかのぼると",
          html: "母は1歳へり、子の和の2倍は 3 × 2 ＝ 6歳へる → 差は <b>5歳</b>ずつちぢまる。",
        },
        {
          title: "答え",
          html: "10 ÷ 5 ＝ <b>2年前</b><br>たしかめ：母36歳、子 10＋6＋2＝18歳 → 2倍 ✔",
        },
      ],
    },
    {
      category: "年齢算",
      level: 3,
      title: "祖父と孫3人",
      question: "現在、祖父の年齢は3人の孫の年齢の和の4倍です。6年後には、祖父の年齢は3人の孫の年齢の和の2倍になります。現在の祖父の年齢は何歳ですか。",
      answer: { value: 60, unit: "歳" },
      hints: [
        "6年たつと、祖父は6歳、孫3人の和は18歳ふえます。",
        "現在の孫の和を①として、6年後の式を作ろう。",
      ],
      steps: [
        {
          title: "①で表す",
          html: "現在：孫の和①、祖父④<br>6年後：孫の和 ① ＋ 18、祖父 ④ ＋ 6",
        },
        {
          title: "2倍の式",
          html: "④ ＋ 6 ＝ (① ＋ 18) × 2 ＝ ② ＋ 36 → ② ＝ 30 → ① ＝ <b>15歳</b>",
        },
        {
          title: "答え",
          html: "祖父 ＝ 15 × 4 ＝ <b>60歳</b><br>たしかめ：6年後 66歳、孫の和 33歳 → 2倍 ✔",
        },
      ],
    },
    {
      category: "年齢算",
      level: 3,
      title: "何年生まれ？",
      question: "2026年に、姉の年齢は妹の年齢の3倍でした。2032年には、姉の年齢は妹の年齢の2倍になります。姉は何年生まれですか。（年齢はその年の誕生日のあとで考えます）",
      answer: { value: 2008, unit: "年" },
      hints: [
        "2026年の妹を①とすると、差は②。",
        "2032年（6年後）の妹を【1】とすると、差は【1】。",
      ],
      steps: [
        {
          title: "差をそろえる",
          html: "2026年：妹①、姉③ → 差②<br>2032年：妹【1】、姉【2】 → 差【1】 → 【1】＝②",
        },
        {
          title: "6年の差",
          html: "2032年の妹② と 2026年の妹① の差が6年 → ①＝<b>6歳</b>",
        },
        {
          title: "答え",
          html: "2026年の姉は 18歳 → 2026 − 18 ＝ <b>2008年</b>生まれ",
        },
      ],
    },

    // ===== 仕事算 =====
    {
      category: "仕事算",
      level: 3,
      title: "残りをAが1人で",
      question: "ある仕事を、AとBの2人ですると12日かかります。この仕事を2人で4日したあと、残りをAが1人で20日かけて仕上げました。この仕事をBが1人ですると何日かかりますか。",
      answer: { value: 20, unit: "日" },
      hints: [
        "2人で4日すると、全体の 4/12＝1/3 が終わります。",
        "残りの2/3をAが20日でしたので、Aの1日分がわかります。",
      ],
      steps: [
        {
          title: "2人でした分",
          html: "2人の1日分は 1/12。4日で 4/12 ＝ <b>1/3</b>",
        },
        {
          title: "Aの1日分",
          html: "残り 2/3 を20日 → Aの1日分 ＝ 2/3 ÷ 20 ＝ <b>1/30</b>",
        },
        {
          title: "Bの1日分",
          html: "1/12 − 1/30 ＝ 5/60 − 2/60 ＝ <b>1/20</b>",
        },
        {
          title: "答え",
          html: "Bが1人ですると <b>20日</b>",
        },
      ],
    },
    {
      category: "仕事算",
      level: 3,
      title: "大きいポンプと小さいポンプ",
      question: "水そうに水を入れるのに、大ポンプ2台と小ポンプ1台では12分、大ポンプ1台と小ポンプ3台では14分で満水になります。大ポンプ1台だけでは何分で満水になりますか。",
      answer: { value: 28, unit: "分" },
      hints: [
        "大ポンプ1台の1分の量を大、小ポンプを小として、水そうの量を2通りに表そう。",
        "(大×2＋小)×12 ＝ (大＋小×3)×14",
      ],
      steps: [
        {
          title: "式を作る",
          html: "大×24 ＋ 小×12 ＝ 大×14 ＋ 小×42 → 大×10 ＝ 小×30 → <b>大 ＝ 小×3</b>",
        },
        {
          title: "小を1とする",
          html: "小＝1、大＝3 とすると、水そうは (3×2 ＋ 1) × 12 ＝ <b>84</b>",
        },
        {
          title: "答え",
          html: "大ポンプ1台：84 ÷ 3 ＝ <b>28分</b>（たしかめ：(3 ＋ 3) × 14 ＝ 84 ✔）",
        },
      ],
    },
    {
      category: "仕事算",
      level: 3,
      title: "1日交代で",
      question: "ある仕事を、Aが1人ですると10日、Bが1人ですると15日かかります。Aから始めて、A、B、A、B、…と1日ずつ交代で仕事をすると、仕事が終わるのは始めてから何日目ですか。",
      answer: { value: 12, unit: "日目" },
      hints: [
        "全体を30とすると、A＝3、B＝2。AとBの2日で5進みます。",
        "最後の1日の途中で終わる場合も、その日を数えます。",
      ],
      steps: [
        {
          title: "2日で1セット",
          html: "全体を30とすると、A＝3、B＝2。A→Bの2日で <b>5</b> 進む。",
        },
        {
          title: "セットをくり返す",
          html: "5セット（10日）で 25。残り <b>5</b>",
        },
        {
          title: "答え",
          html: "11日目（A）で 3 → 残り2。12日目（B）で 2 → ちょうど終わる → <b>12日目</b>",
        },
      ],
    },
    {
      category: "仕事算",
      level: 2,
      title: "AのあとをBが引きつぐ",
      question: "ある仕事を、Aが1人ですると20日、Bが1人ですると30日かかります。はじめAが1人で何日か仕事をし、残りをBが1人でしたところ、全部で24日かかりました。Aが仕事をしたのは何日ですか。",
      answer: { value: 12, unit: "日" },
      hints: [
        "全体を60とすると、A＝3、B＝2。",
        "24日全部Bがしたらどうなる？（つるかめ算）",
      ],
      steps: [
        {
          title: "全体を60とする",
          html: "A＝3、B＝2",
        },
        {
          title: "全部Bだとすると",
          html: "2 × 24 ＝ 48。実際との差は 60 − 48 ＝ <b>12</b>",
        },
        {
          title: "答え",
          html: "1日をBからAにかえると1ふえる → 12 ÷ 1 ＝ <b>12日</b>（Bも12日）",
        },
      ],
    },

    // ===== 過不足算 =====
    {
      category: "過不足算",
      level: 3,
      title: "もらえない人がいる",
      question: "子どもに折り紙を配ります。1人に5枚ずつ配ると18枚余ります。1人に8枚ずつ配ると、5人がもらえず、さらにもう1人は3枚しかもらえません。折り紙は何枚ありますか。",
      answer: { value: 123, unit: "枚" },
      hints: [
        "8枚ずつ配るとき、何枚たりないかを考えよう。",
        "もらえない5人に 8×5＝40枚、3枚の人に5枚、合わせて45枚不足です。",
      ],
      steps: [
        {
          title: "8枚ずつのときの不足",
          html: "5人分 8 × 5 ＝ 40枚、3枚しかもらえない人にあと 5枚 → <b>45枚不足</b>",
        },
        {
          title: "人数",
          html: "(18 ＋ 45) ÷ (8 − 5) ＝ <b>21人</b>",
        },
        {
          title: "答え",
          html: "5 × 21 ＋ 18 ＝ <b>123枚</b><br>たしかめ：8枚×15人＋3枚＝123枚（もらえない人5人） ✔",
        },
      ],
    },
    {
      category: "過不足算",
      level: 2,
      title: "高いりんごと安いりんご",
      question: "持っているお金で1個120円のりんごを何個か買うと60円余ります。同じ個数だけ1個150円のりんごを買おうとすると180円たりません。持っているお金は何円ですか。",
      answer: { value: 1020, unit: "円" },
      hints: [
        "同じ個数を買うので、1個あたりの差は30円です。",
        "全体の差は 60＋180＝240円。",
      ],
      steps: [
        {
          title: "個数",
          html: "全体の差 60 ＋ 180 ＝ 240円、1個の差 150 − 120 ＝ 30円 → 240 ÷ 30 ＝ <b>8個</b>",
        },
        {
          title: "答え",
          html: "120 × 8 ＋ 60 ＝ <b>1020円</b>",
        },
      ],
    },
    {
      category: "過不足算",
      level: 3,
      title: "部屋わり",
      question: "林間学校で生徒を部屋に分けます。1部屋6人ずつにすると15人が部屋に入れません。1部屋8人ずつにすると、最後の部屋は5人になり、さらに2部屋が空きます。生徒は何人いますか。",
      answer: { value: 117, unit: "人" },
      hints: [
        "8人ずつのとき、全部の部屋を8人でうめるには何人たりない？",
        "最後の部屋で3人、空いた2部屋で16人、合わせて19人不足です。",
      ],
      steps: [
        {
          title: "8人ずつのときの不足",
          html: "最後の部屋 8 − 5 ＝ 3人、空き部屋 8 × 2 ＝ 16人 → <b>19人不足</b>",
        },
        {
          title: "部屋の数",
          html: "(15 ＋ 19) ÷ (8 − 6) ＝ <b>17部屋</b>",
        },
        {
          title: "答え",
          html: "6 × 17 ＋ 15 ＝ <b>117人</b><br>たしかめ：8人×14部屋＋5人＝117人、使ったのは15部屋で2部屋空き ✔",
        },
      ],
    },
    {
      category: "過不足算",
      level: 3,
      title: "パンの数を変える",
      question: "1個100円のパンを、予定より4個少なく買うと60円余ります。また、1個80円のパンを予定の個数だけ買うと300円余ります。持っているお金は何円ですか。",
      answer: { value: 2860, unit: "円" },
      hints: [
        "100円のパンを予定の個数買ったとすると、いくら余る（たりない）？",
        "4個多く買うと400円多くかかるので、60−400＝−340 → 340円不足です。",
      ],
      steps: [
        {
          title: "条件をそろえる",
          html: "100円のパンを予定の個数買うと、あと4個で400円多くかかる → 400 − 60 ＝ <b>340円不足</b>",
        },
        {
          title: "予定の個数",
          html: "80円なら300円余り、100円なら340円不足。<br>(300 ＋ 340) ÷ (100 − 80) ＝ <b>32個</b>",
        },
        {
          title: "答え",
          html: "80 × 32 ＋ 300 ＝ <b>2860円</b><br>たしかめ：100 × 28 ＋ 60 ＝ 2860円 ✔",
        },
      ],
    },

    // ===== 植木算 =====
    {
      category: "植木算",
      level: 2,
      title: "池のまわりの木をふやす",
      question: "1周240mの池のまわりに、8mおきに木が植えてあります。これを2mおきにするため、もとの木はそのままにして木を植えたします。新しく植える木は何本ですか。",
      answer: { value: 90, unit: "本" },
      hints: [
        "池のまわり（輪）では、木の本数 ＝ 間の数 です。",
        "8mの間1つに、新しい木は何本入る？",
      ],
      steps: [
        {
          title: "もとの木",
          html: "240 ÷ 8 ＝ <b>30本</b>（輪なので 間の数＝本数）",
        },
        {
          title: "2mおきにすると",
          html: "240 ÷ 2 ＝ <b>120本</b>",
        },
        {
          title: "答え",
          html: "120 − 30 ＝ <b>90本</b>（8mの間1つに3本ずつ入る：3 × 30 ＝ 90）",
        },
      ],
    },
    {
      category: "植木算",
      level: 3,
      title: "テープの輪",
      question: "長さ20cmの紙テープ15本を、のりしろ3cmでつないで1つの輪にしました。輪のまわりの長さは何cmですか。",
      answer: { value: 255, unit: "cm" },
      hints: [
        "まっすぐつなぐときと、輪にするときでは、のりしろの数がちがいます。",
        "輪にすると、のりしろの数はテープの本数と同じです。",
      ],
      steps: [
        {
          title: "のりしろの数",
          html: "輪にすると、のりしろはテープと同じ <b>15か所</b>",
        },
        {
          title: "答え",
          html: "20 × 15 − 3 × 15 ＝ 300 − 45 ＝ <b>255cm</b>",
        },
      ],
    },
    {
      category: "植木算",
      level: 2,
      title: "電柱で速さを求める",
      question: "50mおきに電柱が立っているまっすぐな道を歩きます。1本目の電柱を通りすぎてから21本目の電柱を通りすぎるまでに12分30秒かかりました。歩く速さは分速何mですか。",
      answer: { value: 80, unit: "m" },
      hints: [
        "1本目から21本目までに、電柱の間はいくつ？",
        "12分30秒 ＝ 12.5分",
      ],
      steps: [
        {
          title: "歩いた道のり",
          html: "間の数は 21 − 1 ＝ 20 → 50 × 20 ＝ <b>1000m</b>",
        },
        {
          title: "答え",
          html: "1000 ÷ 12.5 ＝ 分速<b>80m</b>",
        },
      ],
    },
    {
      category: "植木算",
      level: 3,
      title: "長方形の土地のまわり",
      question: "たて48m、横72mの長方形の土地のまわりに、等しい間かくで木を植えます。4つのかどには必ず植え、間かくは5m以上10m以下で、mの整数とします。木をできるだけ少なくするには、何本植えればよいですか。",
      answer: { value: 30, unit: "本" },
      hints: [
        "かどに必ず植えるので、間かくは48と72の両方を割り切る数（公約数）です。",
        "本数を少なくするには、間かくをできるだけ長くします。",
      ],
      steps: [
        {
          title: "間かくの候補",
          html: "48と72の公約数は 1、2、3、4、6、8、12、24。このうち5以上10以下は <b>6m と 8m</b>",
        },
        {
          title: "できるだけ長く",
          html: "本数を少なくするには間かくを長くする → <b>8m</b>",
        },
        {
          title: "答え",
          html: "まわりの長さ (48 ＋ 72) × 2 ＝ 240m。1周（輪）なので本数は 240 ÷ 8 ＝ <b>30本</b>",
        },
      ],
    },

    // ===== 通過算 =====
    {
      category: "通過算",
      level: 3,
      title: "電柱とトンネルから追いこしへ",
      question: "ある列車が電柱の前を通りすぎるのに8秒、長さ400mのトンネルに入り始めてから出終わるまでに24秒かかります。この列車が、長さ120mで秒速15mの列車に追いついてから完全に追いこすまでに何秒かかりますか。",
      answer: { value: 32, unit: "秒" },
      hints: [
        "電柱を通りすぎる8秒で、列車の長さだけ進みます。",
        "24−8＝16秒で、トンネルの長さ400mを進みます。",
      ],
      steps: [
        {
          title: "速さ",
          html: "24秒で（トンネル＋列車）、8秒で（列車）だけ進む → 16秒で400m → 秒速<b>25m</b>",
        },
        {
          title: "列車の長さ",
          html: "25 × 8 ＝ <b>200m</b>",
        },
        {
          title: "答え",
          html: "追いこし：(200 ＋ 120) ÷ (25 − 15) ＝ <b>32秒</b>",
        },
      ],
    },
    {
      category: "通過算",
      level: 3,
      title: "時速と秒速のすれちがい",
      question: "長さ150mで時速72kmの上り列車と、時速90kmの下り列車が、出会ってから完全にすれちがうまでに8秒かかりました。下り列車の長さは何mですか。",
      answer: { value: 210, unit: "m" },
      hints: [
        "時速を秒速になおそう。時速72km＝秒速20m。",
        "すれちがう8秒で、2つの列車の長さの和を進みます。",
      ],
      steps: [
        {
          title: "秒速になおす",
          html: "時速72km ＝ 72000m ÷ 3600秒 ＝ 秒速<b>20m</b>、時速90km ＝ 秒速<b>25m</b>",
        },
        {
          title: "長さの和",
          html: "(20 ＋ 25) × 8 ＝ <b>360m</b>",
        },
        {
          title: "答え",
          html: "360 − 150 ＝ <b>210m</b>",
        },
      ],
    },
    {
      category: "通過算",
      level: 3,
      title: "鉄橋と歩く人",
      question: "ある列車が長さ864mの鉄橋をわたり始めてからわたり終わるまでに48秒かかりました。また、この列車が線路ぞいを向こうから秒速2mで歩いてくる人とすれちがうのに8秒かかりました。この列車の長さは何mですか。",
      answer: { value: 192, unit: "m" },
      hints: [
        "列車の長さは、8×(列車の速さ＋2) と表せます。",
        "鉄橋：864＋列車の長さ ＝ 48×(列車の速さ)",
      ],
      steps: [
        {
          title: "式を作る",
          html: "列車の秒速を□mとすると、長さは (□ ＋ 2) × 8 ＝ □×8 ＋ 16<br>鉄橋：864 ＋ □×8 ＋ 16 ＝ □×48",
        },
        {
          title: "解く",
          html: "□×40 ＝ 880 → □ ＝ <b>22</b>",
        },
        {
          title: "答え",
          html: "長さ ＝ (22 ＋ 2) × 8 ＝ <b>192m</b><br>たしかめ：(864 ＋ 192) ÷ 22 ＝ 48秒 ✔",
        },
      ],
    },
    {
      category: "通過算",
      level: 2,
      title: "ホームを通過する",
      question: "長さ180mの列車が、長さ240mのホームのはしに先頭が着いてから、最後尾がホームをはなれるまでに21秒かかりました。この列車の速さは時速何kmですか。",
      answer: { value: 72, unit: "km" },
      hints: [
        "進んだきょりは ホーム＋列車 です。",
        "秒速□m は 時速 □×3.6 km。",
      ],
      steps: [
        {
          title: "秒速",
          html: "(240 ＋ 180) ÷ 21 ＝ 秒速<b>20m</b>",
        },
        {
          title: "答え",
          html: "20 × 3600 ＝ 72000m → 時速<b>72km</b>",
        },
      ],
    },

    // ===== ニュートン算 =====
    {
      category: "ニュートン算",
      level: 3,
      title: "貯金とおこづかい",
      question: "ある人は貯金があり、毎月決まった金額の収入があります。毎月8000円ずつ使うと12か月で、毎月10000円ずつ使うと8か月で貯金がなくなります。毎月6000円ずつ使うと何か月でなくなりますか。",
      answer: { value: 24, unit: "か月" },
      hints: [
        "8000×12 と 10000×8 の差は、4か月分の収入です。",
        "1か月の収入とはじめの貯金を求めよう。",
      ],
      steps: [
        {
          title: "使った金額",
          html: "8000 × 12 ＝ 96000円、10000 × 8 ＝ 80000円",
        },
        {
          title: "1か月の収入",
          html: "(96000 − 80000) ÷ (12 − 8) ＝ <b>4000円</b>",
        },
        {
          title: "はじめの貯金",
          html: "96000 − 4000 × 12 ＝ <b>48000円</b>",
        },
        {
          title: "答え",
          html: "毎月6000円なら、1か月に 6000 − 4000 ＝ 2000円へる → 48000 ÷ 2000 ＝ <b>24か月</b>",
        },
      ],
    },
    {
      category: "ニュートン算",
      level: 3,
      title: "動くエスカレーター",
      question: "上りのエスカレーターを、1秒に1段ずつ歩いて上ると20秒、1秒に2段ずつ歩いて上ると12秒で上に着きます。エスカレーターが止まっているとき、1秒に1段ずつ歩いて上ると何秒かかりますか。",
      answer: { value: 30, unit: "秒" },
      hints: [
        "エスカレーターが1秒に運ぶ段数を□段とすると、全体の段数は (1＋□)×20 ＝ (2＋□)×12。",
        "自分で歩いた段数の差 24−20＝4段 は、8秒間にエスカレーターが運ぶ段数です。",
      ],
      steps: [
        {
          title: "自分で歩いた段数",
          html: "1段ずつ：1 × 20 ＝ 20段、2段ずつ：2 × 12 ＝ 24段",
        },
        {
          title: "エスカレーターの速さ",
          html: "差 24 − 20 ＝ 4段 は、20 − 12 ＝ 8秒間にエスカレーターが運ぶ段数 → 1秒に <b>0.5段</b>",
        },
        {
          title: "全体の段数",
          html: "20 ＋ 0.5 × 20 ＝ <b>30段</b>",
        },
        {
          title: "答え",
          html: "止まっていれば、1秒に1段で <b>30秒</b>",
        },
      ],
    },
    {
      category: "ニュートン算",
      level: 3,
      title: "水が流れこむ水そう",
      question: "満水の水そうに、毎分一定の量の水が流れこんでいます。この水そうの水をポンプ3台でくみ出すと36分で、5台でくみ出すと18分で空になります。ポンプ2台でくみ出すと何分で空になりますか。",
      answer: { value: 72, unit: "分" },
      hints: [
        "ポンプ1台が1分にくみ出す量を1とすると、108と90。",
        "流れこむ量は毎分 (108−90)÷(36−18)。",
      ],
      steps: [
        {
          title: "流れこむ量",
          html: "3 × 36 ＝ 108、5 × 18 ＝ 90 → (108 − 90) ÷ 18 ＝ 毎分 <b>1</b>",
        },
        {
          title: "はじめの水",
          html: "108 − 1 × 36 ＝ <b>72</b>",
        },
        {
          title: "答え",
          html: "2台なら1分に 2 − 1 ＝ 1 ずつへる → 72 ÷ 1 ＝ <b>72分</b><br>（1台だと流れこむ量と同じで、いつまでも空になりません）",
        },
      ],
    },
    {
      category: "ニュートン算",
      level: 3,
      title: "入口1つの人数",
      question: "開場のとき、入口にはすでに900人が並んでいて、その後も毎分同じ人数ずつ並びます。入口を4つ開けると30分で、6つ開けると15分で行列がなくなります。1つの入口からは1分間に何人入場できますか。",
      answer: { value: 15, unit: "人" },
      hints: [
        "1つの入口が1分に入れる人数を1個分とすると、4×30＝120個分、6×15＝90個分。",
        "120個分−90個分＝30個分 は、15分間に並んだ人数です。",
      ],
      steps: [
        {
          title: "入場した人数",
          html: "4つで30分 → <b>120個分</b>、6つで15分 → <b>90個分</b>",
        },
        {
          title: "毎分並ぶ人数",
          html: "差の30個分は、30 − 15 ＝ 15分間に並んだ人数 → 毎分 <b>2個分</b>",
        },
        {
          title: "はじめの900人",
          html: "120個分 − 2個分 × 30 ＝ <b>60個分</b> が900人",
        },
        {
          title: "答え",
          html: "1個分 ＝ 900 ÷ 60 ＝ <b>15人</b>（毎分並ぶのは30人）",
        },
      ],
    },

    // ===== 比 =====
    {
      category: "比",
      level: 3,
      title: "使う・もらうで同じになる",
      question: "AとBの所持金の比は 7:5 でした。Aが400円使い、Bが200円もらったところ、2人の所持金は同じになりました。はじめのAの所持金は何円ですか。",
      answer: { value: 2100, unit: "円" },
      hints: [
        "はじめのAを⑦、Bを⑤とおこう。",
        "⑦−400 ＝ ⑤＋200",
      ],
      steps: [
        {
          title: "式を作る",
          html: "⑦ − 400 ＝ ⑤ ＋ 200",
        },
        {
          title: "①を求める",
          html: "② ＝ 600 → ① ＝ <b>300円</b>",
        },
        {
          title: "答え",
          html: "A ＝ 7 × 300 ＝ <b>2100円</b>（B1500円 → どちらも1700円 ✔）",
        },
      ],
    },
    {
      category: "比",
      level: 2,
      title: "長方形の辺の比",
      question: "たてと横の長さの比が 3:5 の長方形があり、まわりの長さは64cmです。この長方形の面積は何cm²ですか。",
      answer: { value: 240, unit: "cm²" },
      hints: [
        "たて＋横 はまわりの長さの半分です。",
        "32cm を 3:5 に分けよう。",
      ],
      steps: [
        {
          title: "たて＋横",
          html: "64 ÷ 2 ＝ <b>32cm</b>",
        },
        {
          title: "比で分ける",
          html: "32 ÷ (3 ＋ 5) ＝ 4 → たて 12cm、横 20cm",
        },
        {
          title: "答え",
          html: "12 × 20 ＝ <b>240cm²</b>",
        },
      ],
    },
    {
      category: "比",
      level: 3,
      title: "3つの歯車",
      question: "歯数が48のA、30のB、18のCの3つの歯車が、A・B・Cの順にかみ合っています。3つの歯車に印をつけて回し始めたとき、3つの印がはじめて同時にもとの位置にもどるのは、Aが何回転したときですか。",
      answer: { value: 15, unit: "回転" },
      hints: [
        "かみ合う歯車は、同じ時間に同じ数の歯が進みます。",
        "進んだ歯の数が 48、30、18 のすべての倍数になればよい。",
      ],
      steps: [
        {
          title: "進む歯の数は同じ",
          html: "かみ合っているので、3つの歯車が進む歯の数はいつも同じ。",
        },
        {
          title: "最小公倍数",
          html: "48、30、18 の最小公倍数は <b>720</b>。歯が720進んだとき、3つとももとの位置。",
        },
        {
          title: "答え",
          html: "A：720 ÷ 48 ＝ <b>15回転</b>（B は24回転、C は40回転）",
        },
      ],
    },
    {
      category: "比",
      level: 3,
      title: "3人で分ける（相当算）",
      question: "あるお金をA、B、Cの3人で分けました。Aは全体の 2/5 より200円多くもらい、Bは残りの 1/2 より100円少なくもらい、Cは1200円もらいました。はじめのお金は何円ですか。",
      answer: { value: 4000, unit: "円" },
      hints: [
        "後ろから考えよう。Aがもらった残りを□円とすると、Cは □の1/2 ＋ 100円。",
        "線分図をかくとわかりやすい。",
      ],
      steps: [
        {
          title: "Aの残り",
          html: "Aの残りを□円とすると、Bは □×1/2 − 100、Cは □×1/2 ＋ 100 ＝ 1200<br>□×1/2 ＝ 1100 → □ ＝ <b>2200円</b>",
        },
        {
          title: "全体",
          html: "全体の 3/5 から200円引くと 2200円 → 全体の 3/5 ＝ <b>2400円</b>",
        },
        {
          title: "答え",
          html: "2400 ÷ 3/5 ＝ <b>4000円</b><br>たしかめ：A ＝ 1600＋200 ＝ 1800、B ＝ 1100−100 ＝ 1000、C ＝ 1200 → 合計4000 ✔",
        },
      ],
    },

    // ===== 時計算 =====
    {
      category: "時計算",
      level: 2,
      title: "9時台に重なる",
      question: "9時と10時の間で、時計の長針と短針が重なるのは9時何分ですか。分数で答えましょう。",
      answer: { value: 540 / 11, unit: "分", text: "9時49と1/11分" },
      hints: [
        "9時ちょうど、短針は長針より 270° 先にあります。",
        "長針は1分に5.5°ずつ追いつきます。",
      ],
      steps: [
        {
          title: "9時の角度",
          html: "短針は長針より 30 × 9 ＝ <b>270°</b> 先",
        },
        {
          title: "答え",
          html: "270 ÷ 5.5 ＝ 540/11 ＝ <b>49と1/11分</b> → 9時49と1/11分",
        },
      ],
    },
    {
      category: "時計算",
      level: 3,
      title: "12時と6時の線で線対称",
      question: "2時と3時の間で、時計の長針と短針が、文字盤の12と6を結ぶ直線について線対称になるのは2時何分ですか。分数で答えましょう。",
      answer: { value: 600 / 13, unit: "分", text: "2時46と2/13分" },
      hints: [
        "線対称になるとき、短針が12から右回りに進んだ角と、長針が12から左回りにある角が等しい。",
        "つまり、2本の針が12から右回りに進んだ角の和が 360° になります。",
      ],
      steps: [
        {
          title: "条件を言いかえる",
          html: "12から右回りに測った角で、短針 ＋ 長針 ＝ <b>360°</b> になればよい。",
        },
        {
          title: "□分後の角",
          html: "短針：60 ＋ 0.5 × □、長針：6 × □<br>和：60 ＋ 6.5 × □ ＝ 360",
        },
        {
          title: "答え",
          html: "6.5 × □ ＝ 300 → □ ＝ 600/13 ＝ <b>46と2/13分</b> → 2時46と2/13分<br>（2本の針が「近づく」のではなく「両方とも12に向かって角をうめる」ので、5.5ではなく 6＋0.5＝6.5 を使う）",
        },
      ],
    },
    {
      category: "時計算",
      level: 3,
      title: "100°になる（2回目）",
      question: "6時と7時の間で、時計の長針と短針のつくる角が100°になるのは2回あります。2回目は6時何分ですか。分数で答えましょう。",
      answer: { value: 560 / 11, unit: "分", text: "6時50と10/11分" },
      hints: [
        "6時ちょうど、2本の針の角は180°（短針が先）。",
        "2回目は、長針が短針を追いこして、100°先に出たときです。",
      ],
      steps: [
        {
          title: "1回目",
          html: "差を 180° → 100° にちぢめる：80 ÷ 5.5 ＝ 14と6/11分",
        },
        {
          title: "2回目",
          html: "追いついて（180°）、さらに100°先に出る → 280°の差を作る。",
        },
        {
          title: "答え",
          html: "280 ÷ 5.5 ＝ 560/11 ＝ <b>50と10/11分</b> → 6時50と10/11分",
        },
      ],
    },
    {
      category: "時計算",
      level: 3,
      title: "進む時計",
      question: "1日に6分ずつ進む時計を、ある日の午前9時に正しい時刻に合わせました。次の日、この時計が午後3時7分30秒を指しているとき、正しい時刻は午後何時ですか。",
      answer: { value: 3, unit: "時", text: "午後3時" },
      hints: [
        "正しい時間で1日（1440分）たつ間に、この時計は1446分進みます。",
        "時計が進んだ時間は、午前9時から次の日の午後3時7分30秒まで。",
      ],
      steps: [
        {
          title: "進み方の比",
          html: "正しい時間 : 時計の時間 ＝ 1440 : 1446 ＝ <b>240 : 241</b>",
        },
        {
          title: "時計が進んだ時間",
          html: "午前9時から次の日の午後3時7分30秒まで → 30時間7分30秒 ＝ <b>1807.5分</b>",
        },
        {
          title: "答え",
          html: "正しい時間 ＝ 1807.5 × 240/241 ＝ 1800分 ＝ 30時間 → 次の日の <b>午後3時</b>",
        },
      ],
    },

    // ===== 速さ =====
    {
      category: "速さ",
      level: 3,
      title: "忘れ物を取りに帰る",
      question: "太郎さんは家から学校へ分速60mで歩いて向かいました。出発してから10分後に忘れ物に気づき、分速120mで走って家にもどり、すぐに分速120mで学校へ向かったところ、予定より5分おくれて学校に着きました。家から学校までの道のりは何mですか。家で忘れ物を取る時間は考えません。",
      answer: { value: 1200, unit: "m" },
      hints: [
        "家にもどってきた時点で、出発から何分たっている？",
        "家から学校まで、分速60mと分速120mでかかる時間の差を考えよう。",
      ],
      steps: [
        {
          title: "家にもどるまで",
          html: "10分で 600m 進み、もどるのに 600 ÷ 120 ＝ 5分 → 家にもどったのは出発から <b>15分後</b>",
        },
        {
          title: "時間の差",
          html: "予定より5分おくれ → 家から学校まで、分速120mでかかる時間は、分速60mでかかる時間より 15 − 5 ＝ <b>10分</b>短い。",
        },
        {
          title: "答え",
          html: "速さが2倍なので時間は半分。半分が10分 → 分速60mで20分 → 60 × 20 ＝ <b>1200m</b>",
        },
      ],
    },
    {
      category: "速さ",
      level: 3,
      title: "エンジンが止まった船",
      question: "静水での速さが時速11kmの船で、流れの速さが時速3kmの川を24km上ります。とちゅうで40分間エンジンが止まり、船は流されました。上り終えるまでに全部で何分かかりましたか。",
      answer: { value: 235, unit: "分", text: "235分（3時間55分）" },
      hints: [
        "上りの速さは 11−3＝時速8km。",
        "エンジンが止まっている間、船は川の流れの速さで下流に流されます。",
      ],
      steps: [
        {
          title: "流された道のり",
          html: "40分 ＝ 2/3時間。3 × 2/3 ＝ <b>2km</b> 流された。",
        },
        {
          title: "上る道のり",
          html: "24 ＋ 2 ＝ 26km を時速8kmで上る → 26 ÷ 8 ＝ 3.25時間 ＝ <b>195分</b>",
        },
        {
          title: "答え",
          html: "195 ＋ 40 ＝ <b>235分</b>（3時間55分）",
        },
      ],
    },
    {
      category: "速さ",
      level: 2,
      title: "折り返して出会う",
      question: "PとQは2400mはなれています。AとBは同時にPを出発してQに向かい、Aは分速70m、Bは分速50mで歩きます。AはQに着くとすぐに引き返しました。AとBが出会うのは出発してから何分後ですか。",
      answer: { value: 40, unit: "分後" },
      hints: [
        "出会うまでに、2人が歩いた道のりの合計はいくつ？",
        "AはQまで行ってもどるので、2人合わせて PQ の2倍を歩いています。",
      ],
      steps: [
        {
          title: "2人の道のりの合計",
          html: "出会うとき、2人の道のりの合計は 2400 × 2 ＝ <b>4800m</b>",
        },
        {
          title: "答え",
          html: "1分に 70 ＋ 50 ＝ 120m → 4800 ÷ 120 ＝ <b>40分後</b><br>たしかめ：A 2800m（Qから400mもどる）、B 2000m（Pから2000m＝Qから400m） ✔",
        },
      ],
    },
    {
      category: "速さ",
      level: 3,
      title: "池のまわりで追いつく",
      question: "1周1800mの池のまわりを、AとBが同じ地点から反対向きに同時に歩き始めると12分後に出会います。AはBより分速20m速く歩きます。2人が同じ地点から同じ向きに同時に歩き始めると、AがBにはじめて追いつくのは何分後ですか。",
      answer: { value: 90, unit: "分後" },
      hints: [
        "反対向き：12分で2人合わせて1800m → 速さの和がわかります。",
        "同じ向き：Aが1周分（1800m）多く歩いたときに追いつきます。",
      ],
      steps: [
        {
          title: "速さの和",
          html: "1800 ÷ 12 ＝ 分速 <b>150m</b>（A＝85m、B＝65m）",
        },
        {
          title: "答え",
          html: "同じ向きでは、差の分速20mで1800mの差をつける → 1800 ÷ 20 ＝ <b>90分後</b>",
        },
      ],
    },
  ];

  more.forEach(function (p, i) {
    p.id = 60 + i;
  });

  // 分野ごとに並べ、画面に出す番号（no）は並び順にする
  var order = [];
  list.concat(more).forEach(function (p) {
    if (order.indexOf(p.category) < 0) order.push(p.category);
  });
  var all = [];
  order.forEach(function (c) {
    list.concat(more).forEach(function (p) {
      if (p.category === c) all.push(p);
    });
  });
  all.forEach(function (p, i) {
    p.no = i + 1;
  });
  window.HARD_PROBLEMS = all;
})();
