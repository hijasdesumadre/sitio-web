/* Entrada a la tienda: "Para entrar, regaña a esta traviesa. ¡Atínale!" */
(function () {
  var root = document.getElementById("entrada");
  if (!root || document.documentElement.classList.contains("sin-entrada")) return;

  var nina = root.querySelector(".nina");
  var mama = root.querySelector(".mama");
  var ocupada = false;

  fetch("img/entrada/nina.svg").then(function (r) { return r.text(); }).then(function (t) { nina.innerHTML = t; });

  // La mamá en línea, con el brazo recortado como pieza aparte que gira desde el hombro.
  Promise.all(["img/entrada/mama.svg", "img/entrada/movimiento.svg"].map(function (u) { return fetch(u).then(function (r) { return r.text(); }); }))
    .then(function (t) {
      var d = (t[0].match(/ d="([^"]+)"/) || [])[1] || "";
      var mov = t[1].replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
      var brazo = "M306 92 L486 80 L486 182 L332 186 L306 176 Z";
      mama.innerHTML =
        '<svg viewBox="8 33 475 524" fill="#B93B20"><defs>' +
          '<path id="mama-trazo" d="' + d + '" fill-rule="evenodd"/>' +
          '<clipPath id="clip-cuerpo"><path clip-rule="evenodd" d="M0 0 H500 V600 H0 Z ' + brazo + '"/></clipPath>' +
          '<clipPath id="clip-brazo"><path d="' + brazo + '"/></clipPath>' +
        "</defs>" +
        '<g class="cuerpo"><use href="#mama-trazo" clip-path="url(#clip-cuerpo)"/>' +
          '<g class="brazo"><use href="#mama-trazo" clip-path="url(#clip-brazo)"/></g>' +
          '<g class="mov">' + mov + "</g></g></svg>";
    });
  new Image().src = "img/entrada/chancla.svg";

  function terminar() {
    try { sessionStorage.setItem("hdsm-entrada", "1"); } catch (e) {}
    root.classList.add("sale");
    document.documentElement.classList.remove("con-entrada");
    setTimeout(function () { root.remove(); }, 600);
  }
  root.querySelector(".entrada-saltar").addEventListener("click", function (e) { e.stopPropagation(); terminar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.isConnected) terminar(); });

  function cubica(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    };
  }

  // ¿Le atinó? Solo cuenta la niña (cabeza y vestido), no el aire alrededor.
  function leAtino(x, y) {
    var r = nina.getBoundingClientRect();
    var fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
    return fx > 0.22 && fx < 0.78 && fy > 0.18 && fy < 0.86;
  }

  root.addEventListener("click", function (e) {
    if (ocupada || e.target.closest(".entrada-saltar")) return;
    ocupada = true;
    root.classList.add("tirando");

    var W = window.innerWidth, H = window.innerHeight;
    var click = { x: e.clientX, y: e.clientY };
    var atino = leAtino(click.x, click.y);
    var nb = nina.getBoundingClientRect();
    var blanco = atino ? { x: nb.left + nb.width * 0.5, y: nb.top + nb.height * 0.3 } : click;

    var lado = click.x >= W / 2 ? "izq" : "der";
    var movil = W < 700;
    var mh = movil ? Math.min(H * 0.75, W * 1.55) : Math.min(H * 0.85, W * 0.7), mw = mh * 475 / 524;
    var mx = -mw * (movil ? 0.3 : 0.32);
    var my = mh * (movil ? 0.5 : 0.45);
    mama.className = "mama " + lado;
    mama.style.height = mh + "px";
    mama.style.setProperty("--mx", mx + "px");
    mama.style.setProperty("--my", my + "px");
    void mama.offsetWidth;
    mama.classList.add("entra");

    var manoX = lado === "izq" ? mx + mw * 0.935 : W - (mx + mw * 0.935);
    var manoY = H - mh + my + mh * 0.141;
    var origen = { x: manoX, y: manoY };

    // Curva exagerada: sube muy alto, se pasa tantito del blanco y cae sobre él.
    var dir = blanco.x >= origen.x ? 1 : -1;
    var dx = Math.abs(blanco.x - origen.x);
    var c1 = { x: origen.x + dir * dx * 0.05, y: Math.min(origen.y, blanco.y) - H * 0.95 };
    var c2 = { x: blanco.x + dir * Math.max(120, dx * 0.6), y: Math.min(origen.y, blanco.y) - H * 0.55 };

    var ch = document.createElement("div");
    ch.className = "chancla-vuela";
    var size = Math.max(90, Math.min(W, H) * 0.26);
    ch.style.width = size + "px";
    ch.innerHTML = '<img src="img/entrada/chancla.svg" alt="">';
    if (lado === "der") ch.firstChild.style.transform = "scaleX(-1)";
    ch.style.opacity = "0";
    root.appendChild(ch);

    var dur = atino ? 2000 : 1600, giros = (lado === "izq" ? 1 : -1) * (atino ? 1440 : 1080);
    setTimeout(function () {
      ch.style.opacity = "1";
      var t0 = performance.now(), avisada = false;
      (function vuela(now) {
        var t = Math.min(1, (now - t0) / dur);
        var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var p = cubica(origen, c1, c2, blanco, e);
        var s = 1.15 - 0.55 * e;
        ch.style.transform = "translate(" + (p.x - size / 2) + "px," + (p.y - size / 2) + "px) rotate(" + (giros * e) + "deg) scale(" + s + ")";
        if (atino && !avisada && t > 0.55) { avisada = true; nina.style.setProperty("--ojo-x", (p.x < blanco.x ? -2 : 2) + "px"); nina.classList.add("asustada"); }
        if (t < 1) requestAnimationFrame(vuela); else (atino ? pega : falla)(p, s);
      })(t0);
    }, 980);

    function rebota(p, s, fuerza) {
      var t0 = performance.now(), vx = (lado === "izq" ? 1 : -1) * 3.2 * fuerza, vy = -7 * fuerza, x = p.x, y = p.y, r = 0;
      (function cae(now) {
        var dt = Math.min(2, (now - t0) / 16.7); t0 = now;
        vy += 0.55 * dt; x += vx * dt; y += vy * dt; r += 9 * dt * (lado === "izq" ? 1 : -1);
        ch.style.transform = "translate(" + (x - size / 2) + "px," + (y - size / 2) + "px) rotate(" + r + "deg) scale(" + s + ")";
        var o = Math.max(0, 1 - (y - p.y) / (H * 0.5)); ch.style.opacity = o;
        if (y < H + size && o > 0) requestAnimationFrame(cae); else ch.remove();
      })(t0);
    }

    function falla(p, s) {
      rebota(p, s, 0.6);
      nina.classList.add("burla");
      var f = document.createElement("div");
      f.className = "fallaste"; f.textContent = "¡Fallaste! Otra vez";
      f.style.left = Math.min(W - 120, Math.max(120, p.x)) + "px"; f.style.top = Math.max(60, p.y - 40) + "px";
      root.appendChild(f);
      setTimeout(function () { mama.classList.remove("entra"); mama.classList.add("sale-mama"); }, 200);
      setTimeout(function () {
        nina.classList.remove("burla"); f.remove();
        root.classList.remove("tirando"); ocupada = false;
      }, 1500);
    }

    function pega(p, s) {
      nina.classList.remove("asustada");
      nina.classList.add("ay");
      var b = document.createElement("div");
      b.className = "burbuja"; b.textContent = "¡AY!";
      b.style.left = (nb.left + nb.width * (lado === "izq" ? 0.85 : 0.15)) + "px";
      b.style.top = (nb.top + nb.height * 0.12) + "px";
      root.appendChild(b); void b.offsetWidth; b.classList.add("ve");
      rebota(p, s, 1);
      setTimeout(function () { mama.classList.remove("entra"); mama.classList.add("sale-mama"); }, 250);
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
      setTimeout(terminar, 1500);
    }
  });
})();
