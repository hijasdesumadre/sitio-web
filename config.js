/* =====================================================================
   HIJAS DE SU MADRE — CONFIGURACIÓN DE LA TIENDA
   Este es el único archivo que hay que tocar para operar la tienda:
   precios, envío, códigos de descuento, textos, agotados, test.
   El cobro lo hace Mercado Pago (token en Netlify → MP_ACCESS_TOKEN).
   ===================================================================== */

window.HDSM = {

  marca: "Hijas de Su Madre",
  lema: "Salsas machas hechas con ingredientes 100% naturales.",

  contacto: {
    email: "las@hijasdesumadre.mx",
    instagram: "hijasdesumadre",          // sin @
    whatsapp: ""                           // ej. "525512345678" (con 52, sin + ni espacios). Vacío = no se muestra.
  },

  envios: {
    linea: "Enviamos a todo México. 2 a 6 días hábiles.",
    gratisDesde: 600,                       // envío gratis si el subtotal (con descuento) llega a este monto. 0 = nunca.
    respaldo: 120,                          // si Envia.com no responde, se cobra esto y el envío se cotiza a mano.

    /* Desde dónde sale el paquete (remitente en la guía). */
    origen: {
      nombre: "Hijas de Su Madre",          // PENDIENTE: nombre de quien entrega
      telefono: "5500000000",               // PENDIENTE
      calle: "PENDIENTE calle y número",
      colonia: "PENDIENTE",
      cp: "06000",                          // PENDIENTE
      ciudad: "Ciudad de México",
      estado: "CX"                          // código Envia (CX = CDMX, MX = Edo. Méx., JA = Jalisco, NL = Nuevo León…)
    },

    /* Cómo se empaca: la cotización usa el peso real y la caja según cuántos frascos van. */
    pesoFrascoKg: { chiquilla: 0.15, grande: 0.45, kit: 1.2 },   // PENDIENTE: pesar con vidrio y tapa
    cajas: [                                 // de menor a mayor; se elige la primera donde quepan
      { hastaFrascos: 2, largo: 15, ancho: 15, alto: 12 },
      { hastaFrascos: 6, largo: 25, ancho: 18, alto: 12 },
      { hastaFrascos: 12, largo: 35, ancho: 25, alto: 15 }
    ],
    contenido: "Salsa macha artesanal en frasco de vidrio",
    paqueteriasExcluidas: []                 // ej. ["dhl"] para no ofrecer alguna
  },

  /* ---------- FICHA DEL PRODUCTO (ventanilla al picar un producto) ----------
     Hoy todas las presentaciones son el mismo sabor, así que comparten esta ficha.
     La tabla está declarada para el frasco de 200 g; para otras presentaciones
     la columna "por envase" se calcula proporcional al gramaje del producto. */
  ficha: {
    porcionG: 20,
    tablaBaseG: 200,
    nutricion: [
      // [nombre, valor por 200 g, unidad, nivel (0 = principal, 1 = sub-renglón)]
      ["Contenido energético", 1296, "kcal", 0],
      ["Proteínas", 9.6, "g", 0],
      ["Grasas totales", 132.4, "g", 0],
      ["Grasas saturadas", 18.8, "g", 1],
      ["Grasas trans", 0, "g", 1],
      ["Hidratos de carbono", 16.4, "g", 0],
      ["Azúcares", 3.6, "g", 1],
      ["Fibra dietética", 8.2, "g", 0],
      ["Sodio", 2.136, "mg", 0]              // REVISAR: ¿2.136 mg o 2,136 mg?
    ],
    ingredientes: "Cacahuate tostado, chile de árbol, chile guajillo, ajo, ajonjolí, chile pasilla, pepita verde, almendras, sal, aceite de oliva.",
    alergenos: "Contiene cacahuate y almendra.",
    sellos: [
      ["img/sellos/s1.webp", "Sin conservadores"],
      ["img/sellos/s2.webp", "Sin aditivos"],
      ["img/sellos/s3.webp", "Ingredientes 100% naturales"],
      ["img/sellos/s4.webp", "Calidad premium"]
    ]
  },

  /* ---------- CÓDIGOS DE DESCUENTO ----------
     Cualquier código aquí aplica el porcentaje sobre el subtotal (no sobre el envío).
     Los del test se repiten abajo en "hijas"; mantenlos iguales. */
  codigos: {
    SOYUNAMOSCAMUERTA: 10,
    SOLOTEDOYUNA: 10,
    MLP: 10,
    HDSM10: 10
  },

  /* ---------- ADVERTENCIAS (con humor) ---------- */
  advertencias: {
    dosis: [
      ["Dosis recomendada", "Una cucharada pequeña sobre una quesadilla o un trozo de pan."],
      ["Si el uso ya es crónico", "Tenga siempre un frasco de reserva. Evita crisis de pánico."],
      ["Sobredosis", "Se reconoce por visión palpable, sudor en la frente e incapacidad de soltar la cuchara. No requiere intervención médica, solamente otra quesadilla."]
    ],
    sintomasIntro: "Reportados en sujetos que agotaron su frasco sin tener repuesto a la mano:",
    sintomas: [
      ["Insipidez aguda", "Toda comida sin salsa sabe a cartón. O a aire."],
      ["Rumiación visual", "El sujeto abre el refri una y otra vez, por si un frasco nuevo ya apareció."],
      ["Melancolía profunda", "Tristeza abismal al descubrir que solo queda el aceite y ya no hay semillas."]
    ],
    efectos: [
      "Hablar de esta salsa en todas sus reuniones sociales (evangelización compulsiva).",
      "Salivación involuntaria.",
      "Euforia auditiva.",
      "Necesidad compulsiva de lamer la cuchara."
    ]
  },

  descuento: {
    codigo: "HDSM10",
    porcentaje: 10
  },

  /* ---------- PRODUCTOS ----------
     agotado: true  → no se puede agregar al carrito.
     imagen: ruta del archivo de foto (ej. "img/chiquilla.jpg"). Vacío = se muestra un cuadro con el nombre.
  */
  productos: [
    {
      id: "chiquilla",
      nombre: "La Chiquilla",
      tamano: "56 g",
      precio: 60,
      descripcion: "Para los que no sabemos viajar sin salsa. Cabe en cualquier maleta y en ninguna conciencia.",
      imagen: "img/prod-chiquilla.webp",
      escala: 0.62                           // tamaño relativo al frasco grande (1 = grande)
    },
    {
      id: "grande",
      nombre: "Las Hijas de Su Madre",
      tamano: "200 g",
      precio: 200,
      descripcion: "La grande. La de la casa, la que siempre se acaba primero.",
      imagen: "img/prod-hijas.webp",
      escala: 1
    },
    {
      id: "kit",
      nombre: "El Kit",
      tamano: "Vuelve pronto",                 // PENDIENTE: qué incluye
      precio: 0,                             // PENDIENTE: precio
      descripcion: "Para regalar. O para quedártelo; no juzgamos.",
      agotado: true,                         // true = sello y botón "Sold out"
      imagen: ""
    }
  ],

  /* ---------- TEST: ¿QUÉ HIJA ERES? ----------
     Cada respuesta suma un punto a una hija. Gana la que más puntos tenga.
     Puedes cambiar preguntas y respuestas libremente; mantén las claves
     mustia / miserable / canija / hdsm.
  */
  hijas: {
    mustia: {
      nombre: "La Mustia", frase: "La mosca muerta.",
      detalle: "La que dice \"¿yo? Para nada\" con la misma cara con la que organizó todo. Experta en salir ilesa, maestra en el arte de no mancharse las manos. El caos tiene su firma, pero nunca su huella. Y cuando llegó la chancla, ya se había ido.",
      codigo: "SOYUNAMOSCAMUERTA",
      cierre: "Y obtén el 10% de descuento en tu compra."
    },
    miserable: {
      nombre: "La Miserable", frase: "La raspa.",
      detalle: "El cambio del súper en el cajón: desapareció. Las sobras del refri: desaparecieron. Las últimas gotas de salsa: desaparecieron. Nadie lo vio, nadie lo puede probar. Pero todas sabemos quién fue.",
      codigo: "SOLOTEDOYUNA",
      cierre: "Y obtén el 10% de descuento en tu compra, aprovechando que eres una miserable."
    },
    canija: {
      nombre: "La Canija", frase: "La mente maestra.",
      detalle: "La que pide perdón, nunca permiso. Y ese perdón ya lo ha pedido unas treinta veces. Se fue de pinta todo el año y aun así reprobó con estilo. Los maestros la odiaban, el grupo la seguía. No sigue las reglas: las reescribe.",
      codigo: "MLP",
      cierre: "Y obtén el 10% de descuento en tu compra."
    },
    hdsm: {
      nombre: "La HDSM", frase: "La hija de su madre.",
      detalle: "Mosca muerta, raspa y mente maestra, según el día. Tu mamá lo supo desde el principio.",
      codigo: "HDSM10",
      cierre: "Y obtén el 10% de descuento en tu compra."
    },
    buena: {
      nombre: "La Bien Portada", frase: "La que le hace caso a su mamá.",
      detalle: "Aquí no hay descuento. Solo hay descuentos para las hijas de su madre. Siempre puedes rehacer el test y repensarlo.",
      sinDescuento: true
    }
  },

  /* Cada opción suma un punto a una o varias hijas ("hija" o "hijas").
     "buena" es la que se porta bien: si gana, no hay descuento.
     Empate entre mustia, miserable y canija → La HDSM. */
  preguntas: [
    {
      texto: "Le pides permiso a tu mamá para ir a una fiesta y no te deja. ¿Qué haces?",
      opciones: [
        { texto: "Te escapas en su cara. Nadie te dice qué hacer.", hija: "canija" },
        { texto: "No le cuentas de la fiesta y le dices que vas a estudiar con tus amigas.", hija: "mustia" },
        { texto: "No vas, y acusas a tu hermana, que sí se escapó.", hija: "miserable" },
        { texto: "Le haces caso a tu mamá.", hija: "buena" }
      ]
    },
    {
      texto: "Vas al refri y queda poquita salsa en el frasco. ¿Qué haces?",
      opciones: [
        { texto: "Te la acabas toda sin pensarlo.", hijas: ["miserable", "canija"] },
        { texto: "Escondes el frasco en tu cuarto y acusas a tu hermana de habérsela acabado.", hija: "mustia" },
        { texto: "La compartes con tus hermanas.", hija: "buena" }
      ]
    },
    {
      texto: "En el salón de clases eres…",
      opciones: [
        { texto: "La que le avienta una bolita de papel al maestro y se hace la mensa.", hija: "mustia" },
        { texto: "La que se va de pinta porque nadie le dice qué hacer.", hija: "canija" },
        { texto: "La que le recuerda al maestro que falta revisar la tarea, para caerle bien.", hija: "miserable" },
        { texto: "La bien portada de la clase.", hija: "buena" }
      ]
    },
    {
      texto: "¿Quién eres en tu grupo de amigas?",
      opciones: [
        { texto: "La mala influencia.", hija: "canija" },
        { texto: "La mosca muerta.", hija: "mustia" },
        { texto: "La que no presta sus cosas.", hija: "miserable" },
        { texto: "La mejor amiga.", hija: "buena" }
      ]
    },
    {
      texto: "¿Qué le regalas a tu mamá?",
      opciones: [
        { texto: "Le compras una salsa y te la quedas tú.", hija: "miserable" },
        { texto: "Le pides dinero a tu papá para la salsa y le dices que fue de tus ahorros.", hija: "mustia" },
        { texto: "Le pides dinero a tu papá. Punto.", hija: "canija" },
        { texto: "Un regalo con tu dinero, bien ganado.", hija: "buena" }
      ]
    }
  ]
};
