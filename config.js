/* =====================================================================
   HIJAS DE SU MADRE — CONFIGURACIÓN DE LA TIENDA
   Este es el único archivo que hay que tocar para operar la tienda:
   precios, envío, códigos de descuento, textos, agotados, test.
   El cobro lo hace Mercado Pago (token en Netlify → MP_ACCESS_TOKEN).
   ===================================================================== */

window.HDSM = {

  marca: "Hijas de Su Madre",
  lema: "Salsa macha hecha con 100% aceite de oliva.",

  contacto: {
    email: "las@hijasdesumadre.mx",
    instagram: "hijasdesumadre",          // sin @
    whatsapp: ""                           // ej. "525512345678" (con 52, sin + ni espacios). Vacío = no se muestra.
  },

  envios: {
    linea: "Enviamos a todo México. 2 a 6 días hábiles.",
    costo: 99,                              // costo de envío por pedido (MXN). 0 = envío gratis siempre.
    gratisDesde: 600                        // envío gratis si el subtotal llega a este monto. 0 = nunca.
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
      tamano: "PENDIENTE: qué incluye",
      precio: 0,                             // PENDIENTE: precio
      descripcion: "Para regalar. O para quedártelo; no juzgamos.",
      agotado: true,                         // true = botón "Agotado" en lugar de "Comprar"
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
