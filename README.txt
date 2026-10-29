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
3. Guarda y vuelve a subir la carpeta completa a Netlify (arrastrar y soltar).

Links de Mercado Pago
- linkPago:          link a precio normal.
- linkPagoDescuento: link con el 10% ya aplicado (lo usa el test).
- Mientras un link esté vacío (""), el botón muestra "link pendiente".
- Al crear cada link en Mercado Pago, activa "el comprador elige la cantidad".

Agotado
- agotado: true  → el botón dice "Agotado" y el producto no sale en el test.
