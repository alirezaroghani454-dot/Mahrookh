/* ==========================================================================
   ماه‌رخ — js/3d/hero.js
   قهرمان سه‌بعدی با WebGL خام (بدون هیچ کتابخانه‌ای):
   ۱) یک ماهِ مرواریدی با سایه‌زنی واقعی، برجستگی نویز، رنگین‌کمانی لبه و نور متحرک
   ۲) هزاران ذرهٔ درخشان که در چند حلقهٔ شیب‌دار دور ماه می‌چرخند (عمق و پرسپکتیو)
   ۳) ستاره‌های چشمک‌زن در پس‌زمینه
   با حرکت ماوس/لمس، ماه و ذرات به سمت نشانگر می‌چرخند.
   اگر WebGL در دسترس نباشد، یک پس‌زمینهٔ CSS جایگزین نشان داده می‌شود.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  /* ---------------- شیدرها ---------------- */
  var VERT_QUAD = [
    'attribute vec2 aPos;',
    'void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG_MOON = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uDpr;

float hash(vec3 p){
  p = 17.0 * fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.0,0.0,0.0)), hash(i + vec3(1.0,0.0,0.0)), f.x),
        mix(hash(i + vec3(0.0,1.0,0.0)), hash(i + vec3(1.0,1.0,0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0,0.0,1.0)), hash(i + vec3(1.0,0.0,1.0)), f.x),
        mix(hash(i + vec3(0.0,1.0,1.0)), hash(i + vec3(1.0,1.0,1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;

  /* پس‌زمینهٔ شب بنفش */
  vec3 top = vec3(0.145, 0.075, 0.290);
  vec3 bot = vec3(0.071, 0.031, 0.141);
  vec3 col = mix(bot, top, smoothstep(0.0, 1.0, uv.y * 0.9 + 0.1));

  vec2 p = (frag - uCenter) / uRadius;
  float r2 = dot(p, p);
  float rr = sqrt(r2);

  /* هالهٔ اطراف ماه */
  col += vec3(0.62, 0.22, 0.50) * exp(-r2 * 0.40) * 0.55;
  vec2 q2 = p - vec2(1.9, -1.1);
  col += vec3(0.20, 0.55, 0.62) * exp(-dot(q2, q2) * 0.45) * 0.16;

  /* ستاره‌ها */
  vec2 sc = frag / (46.0 * uDpr);
  vec2 cell = floor(sc);
  vec2 f = fract(sc);
  float h = hash(vec3(cell, 7.0));
  if (h > 0.86) {
    vec2 sp = vec2(hash(vec3(cell, 1.0)), hash(vec3(cell, 2.0)));
    float d = length(f - sp);
    float tw = 0.5 + 0.5 * sin(uTime * (1.0 + h * 3.0) + h * 40.0);
    col += vec3(1.0, 0.92, 1.0) * smoothstep(0.05, 0.0, d) * tw * 0.9;
  }

  /* خود ماه */
  float mask = 1.0 - smoothstep(0.985, 1.0, rr);
  if (rr < 1.02) {
    float z = sqrt(max(0.0, 1.0 - r2));
    vec3 n = vec3(p, z);

    float a = uTime * 0.12;
    float ca = cos(a);
    float sa = sin(a);
    vec3 q = vec3(n.x * ca + n.z * sa, n.y, -n.x * sa + n.z * ca);

    float h1 = fbm(q * 2.6 + 3.0);
    float h2 = fbm(q * 7.0 + 11.0);
    vec3 bump = vec3(fbm(q * 6.0 + 1.7), fbm(q * 6.0 + 5.3), fbm(q * 6.0 + 9.1)) - 0.5;
    vec3 nn = normalize(n + 0.16 * bump);

    vec3 L = normalize(vec3(0.62 + uMouse.x * 0.35, 0.50 + uMouse.y * 0.30, 0.62));
    float ndl = dot(nn, L);
    float wrap = clamp((ndl + 0.25) / 1.25, 0.0, 1.0);

    vec3 pearl = vec3(0.99, 0.90, 0.95);
    vec3 rose  = vec3(0.89, 0.35, 0.68);
    vec3 aqua  = vec3(0.47, 0.90, 0.84);
    vec3 base = mix(pearl, rose, smoothstep(0.35, 0.78, h1));
    base = mix(base, aqua, smoothstep(0.62, 0.90, h2) * 0.35);
    float crater = smoothstep(0.50, 0.62, fbm(q * 4.2 + 20.0));
    base *= 1.0 - crater * 0.18;

    float fres = pow(1.0 - z, 2.2);
    vec3 irid = 0.5 + 0.5 * cos(6.28318 * (fres * 0.9 + h1 * 0.6 + vec3(0.0, 0.33, 0.67)));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(nn, H), 0.0), 48.0);

    vec3 sph = base * (0.16 + 0.95 * wrap)
             + irid * fres * 0.55 * (0.35 + 0.65 * wrap)
             + vec3(1.0) * spec * 0.55
             + rose * pow(1.0 - wrap, 3.0) * fres * 0.5;

    col = mix(col, sph, mask);
  }

  /* درخشش لبهٔ بیرونی */
  col += vec3(0.95, 0.50, 0.82) * smoothstep(1.35, 1.0, rr) * (1.0 - mask) * 0.25;

  gl_FragColor = vec4(col, 1.0);
}
`;

  var VERT_PARTICLES = `
attribute vec4 aData;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uDpr;
varying float vAlpha;
varying vec3 vColor;

void main(){
  float rad = aData.x;
  float ang = aData.y + uTime * aData.z;
  float rnd = aData.w;

  /* شعاع‌های بالای ۵ یعنی «غبار» روی پوستهٔ کروی؛ بقیه روی حلقهٔ شیب‌دار */
  float isDust = step(5.0, rad);
  float r = rad - isDust * 10.0;
  vec3 ringPos = vec3(cos(ang) * r, (rnd - 0.5) * 0.06 * r, sin(ang) * r);
  float e = (rnd - 0.5) * 2.2;
  vec3 dustPos = vec3(cos(ang) * cos(e) * r, sin(e) * r, sin(ang) * cos(e) * r);
  vec3 pos = mix(ringPos, dustPos, isDust);

  float tz = 0.42;
  pos = vec3(pos.x * cos(tz) - pos.y * sin(tz), pos.x * sin(tz) + pos.y * cos(tz), pos.z);
  float tx = 0.38 + uMouse.y * 0.2;
  pos = vec3(pos.x, pos.y * cos(tx) - pos.z * sin(tx), pos.y * sin(tx) + pos.z * cos(tx));
  float ty = uMouse.x * 0.35 + uTime * 0.03;
  pos = vec3(pos.x * cos(ty) + pos.z * sin(ty), pos.y, -pos.x * sin(ty) + pos.z * cos(ty));

  float persp = 1.0 / (1.0 - pos.z * 0.16);
  vec2 sp = uCenter + pos.xy * uRadius * persp;
  gl_Position = vec4(sp / uRes * 2.0 - 1.0, 0.0, 1.0);

  float hidden = (pos.z < 0.0 && length(pos.xy) < 1.0) ? 1.0 : 0.0;
  float depth = smoothstep(-1.6, 1.6, pos.z);
  float tw = 0.55 + 0.45 * sin(uTime * 2.0 + rnd * 40.0);

  gl_PointSize = (2.2 + rnd * rnd * 5.5) * uDpr * persp * (0.7 + 0.5 * depth) * clamp(uRadius / (170.0 * uDpr), 0.7, 1.5);
  vAlpha = (1.0 - hidden) * (0.45 + 0.55 * depth) * tw * (1.0 + 0.3 * (1.0 - isDust));

  float k = fract(rnd * 7.0);
  vec3 c = mix(vec3(0.94, 0.55, 0.78), vec3(0.47, 0.90, 0.84), step(0.68, k));
  c = mix(c, vec3(0.91, 0.76, 0.48), step(0.86, k));
  c = mix(c, vec3(1.0), step(0.95, k));
  vColor = c;
}
`;

  var FRAG_PARTICLES = `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

  /* ---------------- ابزارهای WebGL ---------------- */
  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[ماه‌رخ] خطای شیدر:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function program(gl, vsSrc, fsSrc) {
    var vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
    var fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    var pr = gl.createProgram();
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      console.warn('[ماه‌رخ] خطای لینک:', gl.getProgramInfoLog(pr));
      return null;
    }
    return pr;
  }

  function getGL(canvas) {
    var opts = { antialias: false, alpha: false, powerPreference: 'high-performance' };
    try {
      return canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    } catch (e) { return null; }
  }

  /* ---------------- کارت‌های شناور روی هیرو ---------------- */
  function buildChips() {
    var host = M.$('#heroChips');
    if (!host) return;
    var picks = M.data.products.filter(function (p) { return p.hot && p.stock > 0; }).slice(0, 3);
    host.innerHTML = picks.map(function (p, i) {
      var name = p.name.split(' ').slice(0, 3).join(' ');
      return '<button type="button" class="hero__chip" data-quick="' + p.id + '" style="--n:' + i + '" aria-label="مشاهدهٔ ' + M.esc(p.name) + '">' +
        '<span class="hero__chip-art">' + M.artFor(p, 0) + '</span>' +
        '<span class="hero__chip-text"><b>' + M.esc(name) + '</b><span>' + M.price(p.price) + '</span></span></button>';
    }).join('');
  }

  /* ---------------- ماژول اصلی ---------------- */
  M.register('hero', function () {
    var hero = M.$('#top');
    var canvas = M.$('#heroCanvas');
    var chips = M.$('#heroChips');
    if (!hero || !canvas) return;

    buildChips();

    var gl = getGL(canvas);
    if (!gl) { hero.classList.add('no-webgl'); return; }

    var moonProg = program(gl, VERT_QUAD, FRAG_MOON);
    var partProg = program(gl, VERT_PARTICLES, FRAG_PARTICLES);
    if (!moonProg || !partProg) { hero.classList.add('no-webgl'); return; }

    /* بافر چهارضلعی تمام‌صفحه */
    var quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    /* ذرات: [شعاع حلقه، زاویهٔ شروع، سرعت، تصادفی] */
    var COUNT = M.isMobile() ? 420 : 900;
    var data = new Float32Array(COUNT * 4);
    for (var i = 0; i < COUNT; i++) {
      var inBand = Math.random() < 0.6;
      var rad, speed;
      if (inBand) {                       /* حلقهٔ اصلی دور ماه */
        rad = 1.22 + Math.random() * 0.34;
        speed = (0.14 + Math.random() * 0.1) / Math.sqrt(rad);
      } else {                            /* غبار شناور (+۱۰ یعنی نوع غبار) */
        rad = 10 + 1.45 + Math.pow(Math.random(), 1.3) * 1.5;
        speed = (Math.random() - 0.5) * 0.14;
      }
      data[i * 4] = rad;
      data[i * 4 + 1] = Math.random() * Math.PI * 2;
      data[i * 4 + 2] = speed;
      data[i * 4 + 3] = Math.random();
    }
    var pbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    function loc(pr, name) { return gl.getUniformLocation(pr, name); }
    var U = {
      moon: { res: loc(moonProg, 'uRes'), time: loc(moonProg, 'uTime'), mouse: loc(moonProg, 'uMouse'), center: loc(moonProg, 'uCenter'), radius: loc(moonProg, 'uRadius'), dpr: loc(moonProg, 'uDpr') },
      part: { res: loc(partProg, 'uRes'), time: loc(partProg, 'uTime'), mouse: loc(partProg, 'uMouse'), center: loc(partProg, 'uCenter'), radius: loc(partProg, 'uRadius'), dpr: loc(partProg, 'uDpr') }
    };
    var aPosMoon = gl.getAttribLocation(moonProg, 'aPos');
    var aData = gl.getAttribLocation(partProg, 'aData');

    /* وضعیت */
    var S = { w: 1, h: 1, dpr: 1, cx: 0, cy: 0, r: 100, mx: 0, my: 0, tx: 0, ty: 0 };
    var t0 = performance.now() / 1000;
    var lastChipX = 0, lastChipY = 0;

    function layout() {
      var dpr = Math.min(window.devicePixelRatio || 1, M.isMobile() ? 1.5 : 2);
      var w = hero.clientWidth || 1;
      var h = hero.clientHeight || 1;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);

      var mobile = w < 768;
      var R = mobile ? Math.min(w * 0.3, 140) : Math.min(h * 0.33, w * 0.19, 300);
      var cx = mobile ? w * 0.5 : w * 0.3;
      var fromTop = mobile ? Math.min(h * 0.3, 230) : h * 0.5;

      S.w = canvas.width; S.h = canvas.height; S.dpr = dpr;
      S.cx = cx * dpr; S.cy = (h - fromTop) * dpr; S.r = R * dpr;
    }

    function draw(t) {
      gl.disable(gl.BLEND);
      gl.useProgram(moonProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(aPosMoon);
      gl.vertexAttribPointer(aPosMoon, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(U.moon.res, S.w, S.h);
      gl.uniform1f(U.moon.time, t);
      gl.uniform2f(U.moon.mouse, S.mx, S.my);
      gl.uniform2f(U.moon.center, S.cx, S.cy);
      gl.uniform1f(U.moon.radius, S.r);
      gl.uniform1f(U.moon.dpr, S.dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(aPosMoon);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.useProgram(partProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
      gl.enableVertexAttribArray(aData);
      gl.vertexAttribPointer(aData, 4, gl.FLOAT, false, 0, 0);
      gl.uniform2f(U.part.res, S.w, S.h);
      gl.uniform1f(U.part.time, t);
      gl.uniform2f(U.part.mouse, S.mx, S.my);
      gl.uniform2f(U.part.center, S.cx, S.cy);
      gl.uniform1f(U.part.radius, S.r);
      gl.uniform1f(U.part.dpr, S.dpr);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      gl.disableVertexAttribArray(aData);
    }

    function tick(now) {
      var t = now - t0;
      S.mx += (S.tx - S.mx) * 0.06;
      S.my += (S.ty - S.my) * 0.06;
      draw(t);

      if (chips) {
        var px = S.mx * 14, py = -S.my * 10;
        if (Math.abs(px - lastChipX) > 0.15 || Math.abs(py - lastChipY) > 0.15) {
          chips.style.setProperty('--px', px.toFixed(2));
          chips.style.setProperty('--py', py.toFixed(2));
          lastChipX = px; lastChipY = py;
        }
      }
    }

    layout();
    var loop = M.visibleLoop(hero, function (now) { tick(now); });

    /* ورودی نشانگر */
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      S.tx = M.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      S.ty = M.clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1, 1);
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { S.tx = 0; S.ty = 0; });

    /* تغییر اندازه */
    var onResize = M.debounce(function () {
      layout();
      if (!loop.isRunning()) draw(2.0);
    }, 120);
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(hero);
    else window.addEventListener('resize', onResize);

    /* از دست رفتن کانتکست گرافیکی */
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      loop.stop();
      hero.classList.add('no-webgl');
    });

    if (M.prefersReduced) draw(2.0);
    else loop.start();
  });
})();
