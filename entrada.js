/* Entrada a la tienda: "Para entrar, regaña a esta traviesa. ¡Atínale!" */
(function () {
  var root = document.getElementById("entrada");
  if (!root || document.documentElement.classList.contains("sin-entrada")) return;

  var nina = root.querySelector(".nina");
  var mama = root.querySelector(".mama");
  var ocupada = false;

  fetch("img/entrada/nina.svg").then(function (r) { return r.text(); }).then(function (t) { nina.innerHTML = t; });
  fetch("img/entrada/mama-nina.svg").then(function (r) { return r.text(); }).then(function (t) { mama.innerHTML = t; });
  new Image().src = "img/entrada/chancla.svg";

  function terminar() {
    try { sessionStorage.setItem("hdsm-entrada", "1"); } catch (e) {}
    root.classList.add("sale");
    document.documentElement.classList.remove("con-entrada");
    setTimeout(function () { root.remove(); }, 600);
  }
  root.querySelector(".entrada-saltar").addEventListener("click", function (e) { e.stopPropagation(); terminar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.isConnected) terminar(); });

  // Curva suave (Catmull-Rom) que pasa exactamente por cada punto.
  function curva(pts) {
    var P = [pts[0]].concat(pts, [pts[pts.length - 1]]), n = pts.length - 1;
    return function (t) {
      var seg = Math.min(n - 1, Math.floor(t * n)), u = t * n - seg;
      var p0 = P[seg], p1 = P[seg + 1], p2 = P[seg + 2], p3 = P[seg + 3];
      var u2 = u * u, u3 = u2 * u;
      function k(a, b, c, d) { return 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3); }
      return { x: k(p0.x, p1.x, p2.x, p3.x), y: k(p0.y, p1.y, p2.y, p3.y) };
    };
  }

  root.addEventListener("click", function (e) {
    if (ocupada || e.target.closest(".entrada-saltar")) return;
    ocupada = true;
    root.classList.add("tirando");

    var W = window.innerWidth, H = window.innerHeight;
    var click = { x: e.clientX, y: e.clientY };
    var nb = nina.getBoundingClientRect();
    var blanco = { x: nb.left + nb.width * 0.5, y: nb.top + nb.height * 0.3 };

    // La mamá sale del lado contrario al clic.
    var lado = click.x >= W / 2 ? "izq" : "der";
    var movil = W < 700;
    var mw = movil ? Math.min(W * 0.95, H * 0.55) : Math.min(H * 0.62, W * 0.36);
    mama.className = "mama " + lado;
    mama.style.setProperty("--mw", mw + "px");
    mama.style.setProperty("--mx", (-mw * (movil ? 0.18 : 0.12)) + "px");
    mama.style.setProperty("--my", (mw * (movil ? 0.22 : 0.12)) + "px");
    void mama.offsetWidth;
    mama.classList.add("aparece");                                    // 1. sale despacio

    setTimeout(function () {                                           // 2. la niña la ve
      nina.style.setProperty("--ojo-x", (lado === "izq" ? -2 : 2) + "px");
      nina.classList.add("asustada");
    }, 1100);

    setTimeout(function () { mama.classList.add("lanza"); }, 2500);    // 3. rápido: para atrás y ¡zas!
    setTimeout(lanzar, 2500 + 310);

    function lanzar() {
      var mano = mama.querySelector(".m-chancla") || mama;
      var mr = mano.getBoundingClientRect();
      var origen = { x: mr.left + mr.width / 2, y: mr.top + mr.height / 2 };
      mama.classList.add("solto");

      // La chancla va hasta donde picaste y de ahí se curvea a la traviesa.
      var cerca = Math.hypot(click.x - blanco.x, click.y - blanco.y) < nb.width * 0.55;
      var medio = cerca ? { x: (origen.x + blanco.x) / 2, y: Math.min(origen.y, blanco.y) - H * 0.18 } : click;
      var ruta = curva([origen, medio, blanco]);
      var largo = Math.hypot(medio.x - origen.x, medio.y - origen.y) + Math.hypot(blanco.x - medio.x, blanco.y - medio.y);
      var dur = Math.min(950, 380 + largo * 0.35);

      var size = Math.max(42, Math.min(W, H) * 0.09);
      var ch = document.createElement("div");
      ch.className = "chancla-vuela";
      ch.style.width = size + "px";
      ch.innerHTML = '<img src="img/entrada/chancla.svg" alt="">';
      root.appendChild(ch);

      var t0 = performance.now(), giros = (lado === "izq" ? 1 : -1) * 900;
      (function vuela(now) {
        var t = Math.min(1, (now - t0) / dur);
        var p = ruta(t);
        ch.style.transform = "translate(" + (p.x - size / 2) + "px," + (p.y - size / 2) + "px) rotate(" + (giros * t) + "deg) scale(" + (1.1 - 0.3 * t) + ")";
        if (t < 1) requestAnimationFrame(vuela); else pega(ch, p, 0.8, size);
      })(t0);
    }

    function pega(ch, p, s, size) {
      nina.classList.remove("asustada");
      nina.classList.add("ay");

      var t0 = performance.now(), vx = (lado === "izq" ? 1 : -1) * 3, vy = -6.5, x = p.x, y = p.y, r = 0;
      (function cae(now) {
        var dt = Math.min(2, (now - t0) / 16.7); t0 = now;
        vy += 0.55 * dt; x += vx * dt; y += vy * dt; r += 10 * dt * (lado === "izq" ? 1 : -1);
        ch.style.transform = "translate(" + (x - size / 2) + "px," + (y - size / 2) + "px) rotate(" + r + "deg) scale(" + s + ")";
        var o = Math.max(0, 1 - (y - p.y) / (H * 0.45)); ch.style.opacity = o;
        if (o > 0) requestAnimationFrame(cae); else ch.remove();
      })(t0);

      setTimeout(function () { mama.classList.add("sale-mama"); mama.classList.remove("aparece", "lanza"); }, 300);
      setTimeout(function () {
        var haciaIzq = lado === "der";
        nina.classList.add("corre");
        if (haciaIzq) { nina.classList.add("a-la-izq"); nina.querySelector("svg").style.scale = "-1 1"; }
        var polvo = document.createElement("div"); polvo.className = "polvo";
        polvo.style.left = (nb.left + nb.width * (haciaIzq ? 0.75 : 0.05)) + "px";
        polvo.style.top = (nb.bottom - 40) + "px";
        polvo.innerHTML = [0, 1, 2].map(function (i) { return '<i style="top:' + (i * 12) + 'px;width:' + (40 - i * 8) + 'px;--dx:' + (haciaIzq ? 60 : -60) + 'px"></i>'; }).join("");
        root.appendChild(polvo);
        nina.style.left = haciaIzq ? "-40%" : "140%";
      }, 700);
      setTimeout(terminar, 1500);
    }
  });
})();
