// Cotización de envío con Envia.com. Compartido por cotizar.js y checkout.js.
const ENVIA = "https://api.envia.com";

function paquete(C, lineas) {
  const n = lineas.reduce((s, l) => s + l.qty, 0);
  const peso = lineas.reduce((s, l) => s + (C.envios.pesoFrascoKg[l.id] || 0.4) * l.qty, 0);
  const caja = C.envios.cajas.find((c) => n <= c.hastaFrascos) || C.envios.cajas[C.envios.cajas.length - 1];
  const valor = lineas.reduce((s, l) => s + l.precio * l.qty, 0);
  return {
    type: "box",
    content: C.envios.contenido,
    amount: 1,
    declaredValue: Math.round(valor),
    lengthUnit: "CM",
    weightUnit: "KG",
    weight: Math.max(0.3, Math.round(peso * 100) / 100),
    dimensions: { length: caja.largo, width: caja.ancho, height: caja.alto }
  };
}

function origen(C) {
  const o = C.envios.origen;
  return { name: o.nombre, phone: o.telefono, street: o.calle, district: o.colonia, city: o.ciudad, state: o.estado, country: "MX", postalCode: o.cp };
}

// Envia usa códigos propios de 2 letras para estados. Mapa nombre → código.
const ESTADOS = {
  "aguascalientes": "AG", "baja california": "BC", "baja california sur": "BS", "campeche": "CM", "chiapas": "CS", "chihuahua": "CH",
  "ciudad de mexico": "CX", "cdmx": "CX", "coahuila": "CO", "colima": "CL", "durango": "DG", "estado de mexico": "MX", "mexico": "MX",
  "guanajuato": "GT", "guerrero": "GR", "hidalgo": "HG", "jalisco": "JA", "michoacan": "MI", "morelos": "MO", "nayarit": "NA",
  "nuevo leon": "NL", "oaxaca": "OA", "puebla": "PU", "queretaro": "QT", "quintana roo": "QR", "san luis potosi": "SL", "sinaloa": "SI",
  "sonora": "SO", "tabasco": "TB", "tamaulipas": "TM", "tlaxcala": "TL", "veracruz": "VE", "yucatan": "YU", "zacatecas": "ZA"
};
function codigoEstado(nombre) {
  const k = String(nombre || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  return ESTADOS[k] || (k.length === 2 ? k.toUpperCase() : "CX");
}

function destino(c) {
  return {
    name: c.nombre || "Cliente", phone: c.telefono || "5500000000", email: c.email || undefined,
    street: c.calle || "Por definir", district: c.colonia || undefined,
    city: c.ciudad || "Ciudad de México", state: codigoEstado(c.estado), country: "MX", postalCode: c.cp
  };
}

const NOMBRES = { fedex: "FedEx", dhl: "DHL", estafeta: "Estafeta", redpack: "Redpack", paquetexpress: "Paquetexpress", ups: "UPS", noventa9minutos: "99 minutos", "99minutos": "99 minutos", sendex: "Sendex", ampm: "AM PM", jtexpress: "J&T Express", treggo: "Treggo", ivoy: "iVoy", borzo: "Borzo", quiken: "Quiken" };

/* Devuelve opciones ordenadas por precio: [{ id, paqueteria, servicio, precio, dias }] */
async function cotizar(C, lineas, cliente, token) {
  const body = { origin: origen(C), destination: destino(cliente), packages: [paquete(C, lineas)], shipment: { type: 1 } };
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
  let r, data;
  try {
    r = await fetch(ENVIA + "/ship/rate/", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
    data = await r.json();
  } finally { clearTimeout(t); }
  if (!r.ok || !Array.isArray(data.data)) throw new Error("Envia: " + r.status + " " + JSON.stringify(data).slice(0, 300));
  const excl = (C.envios.paqueteriasExcluidas || []).map((x) => x.toLowerCase());
  return data.data
    .filter((o) => o.totalPrice && !excl.includes(String(o.carrier).toLowerCase()))
    .map((o) => ({
      id: `${o.carrier}|${o.service}`,
      paqueteria: NOMBRES[String(o.carrier).toLowerCase()] || o.carrier,
      servicio: o.serviceDescription || o.service,
      precio: Math.ceil(Number(o.totalPrice)),
      dias: o.deliveryEstimate || ""
    }))
    .sort((a, b) => a.precio - b.precio);
}

/* Genera la guía. Devuelve { tracking, etiqueta, rastreo, paqueteria, precio } */
async function generarGuia(C, lineas, cliente, opcionId, token) {
  const [carrier, service] = String(opcionId).split("|");
  const body = { origin: origen(C), destination: destino(cliente), packages: [paquete(C, lineas)], shipment: { type: 1, carrier, service }, settings: { printFormat: "PDF", printSize: "PAPER_7X4.75", currency: "MXN" } };
  const r = await fetch(ENVIA + "/ship/generate/", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await r.json();
  const g = Array.isArray(data.data) ? data.data[0] : null;
  if (!r.ok || !g || !g.trackingNumber) throw new Error("Envia generate: " + r.status + " " + JSON.stringify(data).slice(0, 400));
  return { tracking: g.trackingNumber, etiqueta: g.label, rastreo: g.trackUrl, paqueteria: NOMBRES[String(g.carrier).toLowerCase()] || g.carrier, precio: g.totalPrice };
}

module.exports = { cotizar, generarGuia, paquete, codigoEstado };
