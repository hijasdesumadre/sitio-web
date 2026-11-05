HIJAS DE SU MADRE — SITIO WEB
==============================

Qué es cada cosa
- index.html            La tienda (página principal)
- nosotras.html         Nosotros
- ingredientes.html     Ingredientes + advertencias
- envios.html           Envíos y preguntas
- que-hija-eres.html    El test
- config.js             ← EL ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA OPERAR LA TIENDA
                          (precios, links de Mercado Pago, textos de productos,
                          preguntas del test, códigos de descuento, agotados, contacto)
- styles.css / site.js  Diseño y lógica. No hace falta tocarlos.
- img/ y fonts/         Imágenes y tipografías.

Cómo cambiar algo
1. Abre config.js con cualquier editor de texto (TextEdit en modo texto plano, VS Code, etc.).
2. Cambia el valor entre comillas. Respeta las comillas y las comas.
3. Guarda y sube el cambio a GitHub; Netlify publica solo en un minuto.

Cobro (Mercado Pago)
- El carrito manda el pedido a netlify/functions/checkout.js, que crea el cobro
  en Mercado Pago con los precios de config.js y redirige al cliente a pagar.
- El Access Token de Mercado Pago vive en Netlify → Environment variables →
  MP_ACCESS_TOKEN. Para cambiar de cuenta de Mercado Pago, cambia ese valor.
- Envío y códigos de descuento: sección "envios" y "codigos" de config.js.

Envío (Envia.com)
- El carrito cotiza en vivo con Envia.com cuando el cliente escribe su C.P.
  (netlify/functions/cotizar.js) y vuelve a cotizar en el servidor al pagar.
- La API Key vive en Netlify → Environment variables → ENVIA_API_KEY.
- Dirección de origen, peso por frasco y tamaños de caja: sección "envios" de config.js.
- Si Envia no responde, se cobra "respaldo" (config.js) y el envío se arma a mano.
- Envío gratis a partir de "gratisDesde".

Agotado
- agotado: true  → el botón dice "Agotado" y el producto no sale en el test.
