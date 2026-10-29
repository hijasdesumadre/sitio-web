/* Lógica de la tienda. No hace falta editar esto: todo sale de config.js */
(function () {
  var C = window.HDSM;
  var mxn = function (n) { return "$" + Number(n).toLocaleString("es-MX"); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };
  var page = document.body.getAttribute("data-page") || "";

  /* ---- Header ---- */
  var links = [
    ["index.html", "Tienda", "tienda"],
    ["nosotras.html", "Nosotros", "nosotras"],
    ["ingredientes.html", "Ingredientes", "ingredientes"],
    ["que-hija-eres.html", "¿Qué hija eres?", "test"],
    ["envios.html", "Envíos", "envios"]
  ];
  var header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<div class="wrap">' +
        '<a class="logo" href="index.html" aria-label="' + esc(C.marca) + '"><img class="logo-img" src="img/mano-chancla.webp" alt="" width="700" height="700"><span class="logo-txt">' + esc(C.marca) + '</span></a>' +
        '<button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav">Menú</button>' +
        '<nav class="nav" id="nav">' +
          links.map(function (l) {
            return '<a href="' + l[0] + '"' + (l[2] === page ? ' aria-current="page"' : "") + ">" + l[1] + "</a>";
          }).join("") +
        "</nav>" +
      "</div>";
    var t = document.getElementById("nav-toggle"), nav = document.getElementById("nav");
    t.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      t.setAttribute("aria-expanded", open ? "true" : "false");
      t.textContent = open ? "Cerrar" : "Menú";
    });
  }

  /* ---- Footer ---- */
  var footer = document.getElementById("site-footer");
  if (footer) {
    var ig = C.contacto.instagram ? '<a href="https://instagram.com/' + esc(C.contacto.instagram) + '" target="_blank" rel="noopener">@' + esc(C.contacto.instagram) + "</a>" : "";
    var wa = C.contacto.whatsapp ? '<a href="https://wa.me/' + esc(C.contacto.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>' : "";
    footer.innerHTML =
      '<div class="wrap">' +
        '<span class="marca">' + esc(C.marca) + " · " + new Date().getFullYear() + "</span>" +
        "<span>" + [esc(C.contacto.email), ig, wa].filter(Boolean).join(" · ") + "</span>" +
      "</div>";
  }

  /* ---- Botón de compra: agrega al carrito ---- */
  function buyButton(p, extraClass) {
    if (p.agotado || !p.precio) {
      return '<button class="btn agotado ' + (extraClass || "") + '" type="button" disabled>Agotado</button>';
    }
    return '<button class="btn ' + (extraClass || "") + '" type="button" data-add="' + esc(p.id) + '">Agregar</button>';
  }

  /* ---- Tienda ---- */
  var grid = document.getElementById("productos");
  if (grid) {
    var lema = document.getElementById("lema"); if (lema) lema.textContent = C.lema;
    grid.innerHTML = C.productos.map(function (p) {
      var media = p.imagen
        ? '<img src="' + esc(p.imagen) + '" alt="' + esc(p.nombre) + '" style="--escala:' + (p.escala || 1) + '">'
        : '<div class="ph">' + esc(p.nombre) + "</div>";
      return (
        '<article class="product" id="p-' + esc(p.id) + '">' +
          '<div class="product-media">' + media + "</div>" +
          '<div class="product-body">' +
            "<h2>" + esc(p.nombre) + "</h2>" +
            '<div class="size">' + esc(p.tamano) + "</div>" +
            '<p class="desc">' + esc(p.descripcion) + "</p>" +
            '<div class="row">' +
              '<div class="price">' + (p.precio ? mxn(p.precio) + "<small>MXN</small>" : "<small>Precio pendiente</small>") + "</div>" +
              buyButton(p) +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    var strip = document.getElementById("strip");
    if (strip) {
      var items = ["<span><strong>" + esc(C.envios.linea) + "</strong></span>"];
      if (!C.envios.costo) items.push("<span>Envío gratis</span>");
      else if (C.envios.gratisDesde) items.push("<span>Envío gratis desde " + mxn(C.envios.gratisDesde) + "</span>");
      items.push("<span>Pago seguro con Mercado Pago</span>");
      strip.innerHTML = items.join("");
    }
    var hook = document.getElementById("hook-pct"); if (hook) hook.textContent = C.descuento.porcentaje + "%";
  }

  /* ---- Advertencias ---- */
  var adv = document.getElementById("advertencias");
  if (adv && C.advertencias) {
    var A = C.advertencias;
    var dl = function (rows) { return "<dl>" + rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl>"; };
    adv.innerHTML =
      '<div class="prospecto">' +
        '<div class="prospecto-head"><span>Léase antes de abrir</span><span>Hijas de Su Madre · Salsa macha</span></div>' +
        '<div class="prospecto-cols">' +
          "<section><h3>Dosis</h3>" + dl(A.dosis) + "</section>" +
          "<section><h3>Síntomas</h3><p>" + esc(A.sintomasIntro) + "</p>" + dl(A.sintomas) + "</section>" +
          "<section><h3>Efectos secundarios</h3><ul>" + A.efectos.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul></section>" +
        "</div>" +
      "</div>";
  }

  /* ---- Test ---- */
  var quiz = document.getElementById("quiz");
  if (quiz) {
    var i = 0, score = { mustia: 0, miserable: 0, canija: 0, buena: 0 };
    var total = C.preguntas.length;
    function award(o) { (o.hijas || [o.hija]).forEach(function (h) { if (h in score) score[h]++; }); }

    function renderQ() {
      var q = C.preguntas[i];
      quiz.innerHTML =
        '<div class="progress">Pregunta ' + (i + 1) + " de " + total + "</div>" +
        '<div class="bar"><i style="width:' + Math.round((i / total) * 100) + '%"></i></div>' +
        '<h2 class="q">' + esc(q.texto) + "</h2>" +
        '<div class="options">' +
          q.opciones.map(function (o, k) {
            return '<button class="opt" type="button" data-k="' + k + '">' + esc(o.texto) + "</button>";
          }).join("") +
        "</div>";
      quiz.querySelectorAll(".opt").forEach(function (b) {
        b.addEventListener("click", function () {
          award(q.opciones[+b.getAttribute("data-k")]);
          i++;
          if (i < total) renderQ(); else renderResult();
          window.scrollTo({ top: 0 });
        });
      });
    }

    function renderResult() {
      var tres = ["canija", "miserable", "mustia"];
      var top = Math.max.apply(null, tres.map(function (k) { return score[k]; }));
      var lideres = tres.filter(function (k) { return score[k] === top; });
      var win = score.buena > top ? "buena" : (lideres.length > 1 ? "hdsm" : lideres[0]);
      var h = C.hijas[win];
      var sinDesc = !!h.sinDescuento;
      if (window.HDSMCart) window.HDSMCart.setCode(sinDesc ? "" : (h.codigo || C.descuento.codigo));
      quiz.innerHTML =
        '<div class="result">' +
          '<div class="eyebrow">Confesaste. Eres</div>' +
          '<div class="name">' + esc(h.nombre) + "</div>" +
          '<p class="frase">' + esc(h.frase) + "</p>" +
          '<p class="detalle">' + esc(h.detalle) + "</p>" +
          (sinDesc ? "" :
            '<div class="code"><span>Usa el código</span><b>' + esc(h.codigo || C.descuento.codigo) + "</b></div>" +
            '<p class="cierre">' + esc(h.cierre || ("Y obtén el " + C.descuento.porcentaje + "% de descuento en tu compra.")) + "</p>") +
          '<div class="shop">' +
            C.productos.filter(function (p) { return !p.agotado && p.precio; }).map(function (p) {
              var precio = " · " + mxn(sinDesc ? p.precio : Math.round(p.precio * (1 - C.descuento.porcentaje / 100)));
              return '<button class="btn block" type="button" data-add="' + esc(p.id) + '"><span>' + esc(p.nombre) + precio + "</span><span>Agregar</span></button>";
            }).join("") +
          "</div>" +
          '<button class="again" type="button" id="again">Volver a empezar</button>' +
        "</div>";
      document.getElementById("again").addEventListener("click", function () {
        i = 0; score = { mustia: 0, miserable: 0, canija: 0, buena: 0 }; renderQ();
      });
    }

    document.getElementById("start").addEventListener("click", function () {
      document.getElementById("quiz-intro").hidden = true;
      quiz.hidden = false;
      renderQ();
    });
  }
})();
