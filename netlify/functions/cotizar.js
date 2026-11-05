// Cotiza el envío para el carrito con Envia.com. El navegador la llama al escribir el código postal.
global.window = {};
require("../../config.js");
const C = global.window.HDSM;
const { cotizar } = require("./_envio.js");

const json = (status, body) => ({ statusCode: status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, body: JSON.stringify(body) });

function lineasDe(items) {
  const out = [];
  for (const it of items || []) {
    const p = C.productos.find((x) => x.id === it.id);
    const qty = Math.floor(Number(it.qty));
    if (p && !p.agotado && p.precio && qty >= 1 && qty <= 50) out.push({ id: p.id, precio: p.precio, qty });
  }
  return out;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Método no permitido" });
  let body; try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Solicitud inválida" }); }
  const lineas = lineasDe(body.items);
  const cp = String(body.cp || "").replace(/\D/g, "");
  if (lineas.length === 0) return json(400, { error: "Carrito vacío" });
  if (!/^\d{5}$/.test(cp)) return json(400, { error: "Código postal inválido" });

  const subtotal = lineas.reduce((s, l) => s + l.precio * l.qty, 0);
  const cod = String(body.codigo || "").toUpperCase().replace(/\s+/g, "");
  const pct = cod && C.codigos && C.codigos[cod] ? Number(C.codigos[cod]) : 0;
  const base = subtotal - Math.round(subtotal * pct) / 100;
  if (C.envios.gratisDesde && base >= C.envios.gratisDesde) {
    return json(200, { gratis: true, opciones: [{ id: "gratis", paqueteria: "Envío gratis", servicio: "Lo mandamos por nuestra cuenta", precio: 0, dias: "2 a 6 días hábiles" }] });
  }

  const token = process.env.ENVIA_API_KEY;
  const cliente = { cp, ciudad: body.ciudad, estado: body.estado, colonia: body.colonia };
  if (!token) return json(200, { respaldo: true, opciones: [{ id: "respaldo", paqueteria: "Envío estándar", servicio: "2 a 6 días hábiles", precio: C.envios.respaldo, dias: "" }] });
  try {
    const opciones = await cotizar(C, lineas, cliente, token);
    if (opciones.length === 0) throw new Error("sin opciones");
    return json(200, { opciones: opciones.slice(0, 3) });
  } catch (e) {
    console.error("cotizar", e.message);
    return json(200, { respaldo: true, opciones: [{ id: "respaldo", paqueteria: "Envío estándar", servicio: "2 a 6 días hábiles", precio: C.envios.respaldo, dias: "" }] });
  }
};
