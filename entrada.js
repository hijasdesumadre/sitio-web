/* Entrada a la tienda: la mamá le avienta la chancla a la traviesa. */
(function () {
  var root = document.getElementById("entrada");
  if (!root || document.documentElement.classList.contains("sin-entrada")) return;

  var nina = root.querySelector(".nina");
  var mama = root.querySelector(".mama");
  var titulo = root.querySelector(".entrada-titulo");
  var ocupada = false;

  // Carga la niña como SVG en línea para poder animar sus partes.
  fetch("img/entrada/nina.svg").then(function (r) { return r.text(); }).then(function (t) { nina.innerHTML = t; });
  // Precarga a la mamá y la chancla para que el tiro no espere a la red.
  ["img/entrada/mama.svg", "img/entrada/chancla.svg", "img/entrada/movimiento.svg"].forEach(function (src) { var i = new Image(); i.src = src; });

  function terminar() {
    try { sessionStorage.setItem("hdsm-entrada", "1"); } catch (e) {}
    root.classList.add("sale");
    document.documentElement.classList.remove("con-entrada");
    setTimeout(function () { root.remove(); }, 600);
  }
  root.querySelector(".entrada-saltar").addEventListener("click", function (e) { e.stopPropagation(); terminar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.isConnected) terminar(); });

  function bezier(p0, p1, p2, t) {
    var u = 1 - t;
    return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
  }

  root.addEventListener("click", function (e) {
    if (ocupada || e.target.closest(".entrada-saltar")) return;
    ocupada = true;
    root.classList.add("tirando");

    var W = window.innerWidth, H = window.innerHeight;
    var click = { x: e.clientX, y: e.clientY };
    var nb = nina.getBoundingClientRect();
    var blanco = { x: nb.left + nb.width * 0.5, y: nb.top + nb.height * 0.33 };   // la cabeza

    // La mamá sale del lado contrario a donde picaron, para que avente "hacia" el clic.
    var lado = click.x >= W / 2 ? "izq" : "der";
    mama.className = "mama " + lado;
    var movil = W < 700;
    var mh = movil ? Math.min(H * 0.75, W * 1.55) : Math.min(H * 1.05, W * 0.9), mw = mh * 475 / 524;
    var mx = -mw * (movil ? 0.3 : 0.1);              // cuánto queda fuera de la pantalla
    var my = mh * (movil ? 0.5 : 0.45);                // se ve de la cintura para arriba
    mama.style.setProperty("--mx", mx + "px");
    mama.style.setProperty("--my", my + "px");
    void mama.offsetWidth;
    mama.classList.add("entra");

    // Dónde queda la mano al terminar de entrar.
    var manoX = lado === "izq" ? mx + mw * 0.935 : W - (mx + mw * 0.935);
    var manoY = H - mh + my + mh * 0.141;
    var origen = { x: manoX, y: manoY };

    // La chancla pasa por donde picaste, pero siempre termina en la traviesa.
    var ctrl = { x: 2 * click.x - 0.5 * (origen.x + blanco.x), y: 2 * click.y - 0.5 * (origen.y + blanco.y) };
    ctrl.x = Math.max(-0.2 * W, Math.min(1.2 * W, ctrl.x));
    ctrl.y = Math.max(-0.35 * H, Math.min(1.05 * H, ctrl.y));

    var ch = document.createElement("div");
    ch.className = "chancla-vuela";
    var size = Math.max(90, Math.min(W, H) * 0.26);
    ch.style.width = size + "px";
    ch.innerHTML = '<img src="img/entrada/chancla.svg" alt="">';
    if (lado === "der") ch.firstChild.style.transform = "scaleX(-1)";

    setTimeout(function () {
      root.appendChild(ch);
      var t0 = performance.now(), dur = 560, giros = lado === "izq" ? 720 : -720;
      (function vuela(now) {
        var t = Math.min(1, (now - t0) / dur);
        var p = bezier(origen, ctrl, blanco, t);
        var s = 1 - 0.35 * t;                              // se aleja: se hace chiquita
        ch.style.transform = "translate(" + (p.x - size / 2) + "px," + (p.y - size / 2) + "px) rotate(" + (giros * t) + "deg) scale(" + s + ")";
        if (t < 1) requestAnimationFrame(vuela); else pega(p, s);
      })(t0);
    }, 330);

    function pega(p, s) {
      nina.classList.add("ay");
      var b = document.createElement("div");
      b.className = "burbuja"; b.textContent = "¡AY!";
      b.style.left = (nb.left + nb.width * (lado === "izq" ? 0.85 : 0.15)) + "px";
      b.style.top = (nb.top + nb.height * 0.12) + "px";
      root.appendChild(b); void b.offsetWidth; b.classList.add("ve");

      // La chancla rebota y cae.
      var t0 = performance.now(), vx = (lado === "izq" ? 1 : -1) * 3.2, vy = -7, x = p.x, y = p.y, r = 0;
      (function cae(now) {
        var dt = Math.min(2, (now - t0) / 16.7); t0 = now;
        vy += 0.55 * dt; x += vx * dt; y += vy * dt; r += 9 * dt * (lado === "izq" ? 1 : -1);
        ch.style.transform = "translate(" + (x - size / 2) + "px," + (y - size / 2) + "px) rotate(" + r + "deg) scale(" + s + ")";
        ch.style.opacity = Math.max(0, 1 - (y - p.y) / (H * 0.5));
        if (y < H + size) requestAnimationFrame(cae); else ch.remove();
      })(t0);

      setTimeout(function () { mama.classList.remove("entra"); mama.classList.add("sale-mama"); }, 250);

      // Sale corriendo hacia el lado contrario de la mamá.
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
        b.style.transition = "opacity .3s"; b.style.opacity = "0";
      }, 700);

      setTimeout(terminar, 1450);
    }
  });
})();
