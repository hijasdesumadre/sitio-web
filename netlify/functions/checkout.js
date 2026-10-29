// Crea el cobro en Mercado Pago (Checkout Pro) a partir del carrito.
// Los precios, el envío y los códigos se toman de config.js (nunca del navegador).
// Necesita la variable de entorno MP_ACCESS_TOKEN en Netlify.

global.window = {};
require("../../config.js");
const C = global.window.HDSM;

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(body)
});

const limpiar = (s, max) => String(s || "").replace(/[<>]/g, "").trim().slice(0, max);

function calcular(items, codigo) {
  const lineas = [];
  for (const it of items || []) {
    const p = C.productos.find((x) => x.id === it.id);
    const qty = Math.floor(Number(it.qty));
    if (!p || p.agotado || !p.precio || !Number.isFinite(qty) || qty < 1 || qty > 50) continue;
    lineas.push({ id: p.id, nombre: p.nombre, tamano: p.tamano, precio: p.precio, qty });
  }
  const subtotal = lineas.reduce((s, l) => s + l.precio * l.qty, 0);
  const cod = String(codigo || "").toUpperCase().replace(/\s+/g, "");
  const pct = cod && C.codigos && C.codigos[cod] ? Number(C.codigos[cod]) : 0;
  const descuento = Math.round(subtotal * pct) / 100;
  const base = subtotal - descuento;
  const envio = !C.envios.costo || (C.envios.gratisDesde && base >= C.envios.gratisDesde) ? 0 : C.envios.costo;
  return { lineas, subtotal, codigo: pct ? cod : "", pct, descuento, envio, total: base + envio };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método no permitido" });
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return json(500, { error: "La tienda aún no tiene configurado el cobro. Escríbenos y te ayudamos." });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Carrito inválido" }); }

  const calc = calcular(body.items, body.codigo);
  if (calc.lineas.length === 0) return json(400, { error: "Tu carrito está vacío" });

  const c = body.cliente || {};
  const cliente = {
    nombre: limpiar(c.nombre, 80), email: limpiar(c.email, 120), telefono: limpiar(c.telefono, 20),
    calle: limpiar(c.calle, 120), colonia: limpiar(c.colonia, 80), cp: limpiar(c.cp, 5),
    ciudad: limpiar(c.ciudad, 80), estado: limpiar(c.estado, 60), referencias: limpiar(c.referencias, 200)
  };
  for (const k of ["nombre", "email", "telefono", "calle", "colonia", "cp", "ciudad", "estado"]) {
    if (!cliente[k]) return json(400, { error: "Falta un dato de envío: " + k });
  }
  if (!/^\S+@\S+\.\S+$/.test(cliente.email)) return json(400, { error: "Revisa tu correo" });

  const ref = "HDSM-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  const origen = (event.headers["x-forwarded-proto"] || "https") + "://" + event.headers.host;
  const direccion = `${cliente.calle}, ${cliente.colonia}, CP ${cliente.cp}, ${cliente.ciudad}, ${cliente.estado}` + (cliente.referencias ? ` (${cliente.referencias})` : "");

  // Un ítem por producto; el descuento se reparte proporcionalmente para que MP muestre precios reales.
  const factor = calc.subtotal ? (calc.subtotal - calc.descuento) / calc.subtotal : 1;
  const items = calc.lineas.map((l) => ({
    id: l.id,
    title: l.nombre + " · " + l.tamano,
    description: "Salsa macha Hijas de Su Madre",
    category_id: "food",
    quantity: l.qty,
    currency_id: "MXN",
    unit_price: Math.round(l.precio * factor * 100) / 100
  }));
  if (calc.envio > 0) items.push({ id: "envio", title: "Envío", category_id: "services", quantity: 1, currency_id: "MXN", unit_price: calc.envio });

  const [nombre, ...apellidos] = cliente.nombre.split(" ");
  const preference = {
    items,
    payer: {
      name: nombre, surname: apellidos.join(" ") || nombre, email: cliente.email,
      phone: { number: cliente.telefono },
      address: { zip_code: cliente.cp, street_name: `${cliente.calle}, ${cliente.colonia}, ${cliente.ciudad}, ${cliente.estado}` }
    },
    shipments: { receiver_address: { zip_code: cliente.cp, street_name: cliente.calle, city_name: cliente.ciudad, state_name: cliente.estado } },
    external_reference: ref,
    statement_descriptor: "HIJAS DE SU MADRE",
    back_urls: { success: origen + "/gracias.html", pending: origen + "/gracias.html", failure: origen + "/pago-fallido.html" },
    auto_return: "approved",
    binary_mode: false,
    metadata: {
      pedido: ref, cliente, direccion, codigo: calc.codigo, descuento: calc.descuento, envio: calc.envio, total: calc.total,
      productos: calc.lineas.map((l) => `${l.qty} x ${l.nombre}`).join(", ")
    }
  };

  let r, data;
  try {
    r = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", "X-Idempotency-Key": ref },
      body: JSON.stringify(preference)
    });
    data = await r.json();
  } catch (e) {
    return json(502, { error: "No pudimos conectar con Mercado Pago. Intenta de nuevo en un momento." });
  }
  if (!r.ok || !data.init_point) {
    console.error("MP error", r.status, JSON.stringify(data).slice(0, 500));
    return json(502, { error: "Mercado Pago rechazó la solicitud. Intenta de nuevo o escríbenos." });
  }
  return json(200, { url: data.init_point, pedido: ref, total: calc.total });
};

exports.calcular = calcular;
