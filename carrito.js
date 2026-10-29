/* Carrito de compras. Guarda el carrito en el navegador y cobra vía /.netlify/functions/checkout */
(function () {
  var C = window.HDSM;
  var mxn = function (n) { return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };
  var KEY = "hdsm-carrito";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var state = load(); state.items = state.items || {}; state.codigo = state.codigo || ""; state.cliente = state.cliente || {};

  function prod(id) { return C.productos.find(function (p) { return p.id === id; }); }
  function count() { return Object.keys(state.items).reduce(function (s, k) { return s + state.items[k]; }, 0); }
  function calcular() {
    var lineas = [], subtotal = 0;
    Object.keys(state.items).forEach(function (id) {
      var p = prod(id), q = state.items[id];
      if (!p || p.agotado || !p.precio || q < 1) { delete state.items[id]; return; }
      lineas.push({ p: p, q: q }); subtotal += p.precio * q;
    });
    var cod = state.codigo.toUpperCase().replace(/\s+/g, "");
    var pct = cod && C.codigos && C.codigos[cod] ? Number(C.codigos[cod]) : 0;
    var descuento = Math.round(subtotal * pct) / 100;
    var base = subtotal - descuento;
    var envio = !C.envios.costo || (C.envios.gratisDesde && base >= C.envios.gratisDesde) ? 0 : C.envios.costo;
    return { lineas: lineas, subtotal: subtotal, pct: pct, codigoValido: !!pct, descuento: descuento, envio: envio, total: base + envio };
  }

  /* ---- UI ---- */
  var root = document.createElement("div");
  root.id = "carrito-root";
  root.innerHTML =
    '<button class="cart-fab" id="cart-open" type="button" aria-label="Abrir carrito">' +
      '<span class="cart-fab-txt">Carrito</span><span class="cart-badge" id="cart-count" hidden>0</span>' +
    "</button>" +
    '<div class="cart-backdrop" id="cart-backdrop" hidden></div>' +
    '<aside class="cart" id="cart" aria-label="Carrito" hidden>' +
      '<div class="cart-head"><h2>Tu carrito</h2><button class="cart-close" id="cart-close" type="button" aria-label="Cerrar">×</button></div>' +
      '<div class="cart-body" id="cart-body"></div>' +
    "</aside>";
  document.body.appendChild(root);

  var fab = document.getElementById("cart-open"), panel = document.getElementById("cart"), backdrop = document.getElementById("cart-backdrop"), body = document.getElementById("cart-body");
  function open() { panel.hidden = false; backdrop.hidden = false; document.body.classList.add("cart-abierto"); render(); }
  function close() { panel.hidden = true; backdrop.hidden = true; document.body.classList.remove("cart-abierto"); }
  fab.addEventListener("click", open); backdrop.addEventListener("click", close); document.getElementById("cart-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });

  function badge() {
    var n = count(), b = document.getElementById("cart-count");
    b.textContent = n; b.hidden = n === 0;
  }

  var ESTADOS = ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"];

  function render() {
    var c = calcular(); save(state); badge();
    if (c.lineas.length === 0) {
      body.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<br>De por sí la salsa se acaba sola.</p>' +
        '<a class="btn block" href="index.html#productos">Ver las salsas</a>';
      return;
    }
    var cl = state.cliente;
    var field = function (name, label, extra) {
      return '<label class="f"><span>' + label + "</span><input name=\"" + name + '" value="' + esc(cl[name] || "") + '" ' + (extra || "") + "></label>";
    };
    body.innerHTML =
      '<div class="cart-lines">' +
        c.lineas.map(function (l) {
          return '<div class="cart-line">' +
            (l.p.imagen ? '<img src="' + esc(l.p.imagen) + '" alt="">' : "<i></i>") +
            '<div class="cart-line-info"><b>' + esc(l.p.nombre) + "</b><small>" + esc(l.p.tamano) + " · " + mxn(l.p.precio) + "</small></div>" +
            '<div class="qty"><button type="button" data-dec="' + l.p.id + '" aria-label="Menos">−</button><span>' + l.q + '</span><button type="button" data-inc="' + l.p.id + '" aria-label="Más">+</button></div>' +
            '<div class="cart-line-total">' + mxn(l.p.precio * l.q) + "</div>" +
          "</div>";
        }).join("") +
      "</div>" +
      '<form class="cart-code" id="cart-code"><input name="codigo" placeholder="Código de descuento" value="' + esc(state.codigo) + '" autocapitalize="characters"><button class="btn ghost" type="submit">Aplicar</button></form>' +
      (state.codigo && !c.codigoValido ? '<p class="cart-msg err">Ese código no existe. ¿Ya hiciste <a href="que-hija-eres.html">el test</a>?</p>' : "") +
      (c.codigoValido ? '<p class="cart-msg ok">Código aplicado: ' + c.pct + "% de descuento. Qué hija tan lista.</p>" : "") +
      '<div class="cart-sum">' +
        "<div><span>Subtotal</span><span>" + mxn(c.subtotal) + "</span></div>" +
        (c.descuento ? "<div><span>Descuento</span><span>−" + mxn(c.descuento) + "</span></div>" : "") +
        "<div><span>Envío</span><span>" + (c.envio ? mxn(c.envio) : "Gratis") + "</span></div>" +
        (C.envios.gratisDesde && c.envio ? '<div class="hint"><span>Envío gratis a partir de ' + mxn(C.envios.gratisDesde) + "</span><span></span></div>" : "") +
        '<div class="tot"><span>Total</span><span>' + mxn(c.total) + " MXN</span></div>" +
      "</div>" +
      '<form class="cart-form" id="cart-form" novalidate>' +
        "<h3>¿A dónde la mandamos?</h3>" +
        field("nombre", "Nombre completo", 'required autocomplete="name"') +
        '<div class="f2">' + field("email", "Correo", 'type="email" required autocomplete="email"') + field("telefono", "WhatsApp / teléfono", 'type="tel" required autocomplete="tel" inputmode="tel"') + "</div>" +
        field("calle", "Calle y número", 'required autocomplete="address-line1"') +
        '<div class="f2">' + field("colonia", "Colonia", 'required autocomplete="address-level3"') + field("cp", "Código postal", 'required inputmode="numeric" pattern="[0-9]{5}" maxlength="5" autocomplete="postal-code"') + "</div>" +
        '<div class="f2">' + field("ciudad", "Ciudad / municipio", 'required autocomplete="address-level2"') +
          '<label class="f"><span>Estado</span><select name="estado" required><option value="">Elige</option>' + ESTADOS.map(function (e) { return '<option' + (cl.estado === e ? " selected" : "") + ">" + e + "</option>"; }).join("") + "</select></label></div>" +
        field("referencias", "Referencias (opcional)", 'placeholder="Portón negro, entre Reforma y Juárez"') +
        '<button class="btn block pay" type="submit" id="cart-pay">Pagar ' + mxn(c.total) + " con Mercado Pago</button>" +
        '<p class="cart-msg err" id="cart-err" hidden></p>' +
        '<p class="cart-fine">Pagas en Mercado Pago con tarjeta, OXXO o transferencia, con o sin cuenta. Nosotros nunca vemos tus datos de pago.</p>' +
      "</form>";

    body.querySelectorAll("[data-inc]").forEach(function (b) { b.addEventListener("click", function () { state.items[b.getAttribute("data-inc")]++; render(); }); });
    body.querySelectorAll("[data-dec]").forEach(function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-dec"); state.items[id]--; if (state.items[id] < 1) delete state.items[id]; render(); }); });
    document.getElementById("cart-code").addEventListener("submit", function (e) { e.preventDefault(); state.codigo = this.codigo.value.trim(); render(); });
    var form = document.getElementById("cart-form");
    form.addEventListener("input", function () { var fd = new FormData(form); fd.forEach(function (v, k) { state.cliente[k] = v; }); save(state); });
    form.addEventListener("submit", pagar);
  }

  function pagar(e) {
    e.preventDefault();
    var form = e.target, err = document.getElementById("cart-err"), btn = document.getElementById("cart-pay");
    err.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var fd = new FormData(form), cliente = {}; fd.forEach(function (v, k) { cliente[k] = v; });
    state.cliente = cliente; save(state);
    var items = Object.keys(state.items).map(function (id) { return { id: id, qty: state.items[id] }; });
    btn.disabled = true; btn.textContent = "Preparando tu pago…";
    fetch("/.netlify/functions/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items, codigo: state.codigo, cliente: cliente }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.url) throw new Error(res.d.error || "No pudimos iniciar el pago.");
        try { sessionStorage.setItem("hdsm-pedido", JSON.stringify({ pedido: res.d.pedido, total: res.d.total, items: items })); } catch (x) {}
        window.location.href = res.d.url;
      })
      .catch(function (x) { err.textContent = x.message; err.hidden = false; btn.disabled = false; btn.textContent = "Pagar con Mercado Pago"; });
  }

  /* ---- API pública: botones "Agregar" ---- */
  window.HDSMCart = {
    add: function (id, qty) {
      var p = prod(id); if (!p || p.agotado || !p.precio) return;
      state.items[id] = (state.items[id] || 0) + (qty || 1); save(state); badge(); open();
    },
    setCode: function (code) { state.codigo = code || ""; save(state); badge(); },
    clear: function () { state.items = {}; state.codigo = ""; save(state); badge(); },
    open: open
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    e.preventDefault(); window.HDSMCart.add(b.getAttribute("data-add"), 1);
  });
  badge();
})();
