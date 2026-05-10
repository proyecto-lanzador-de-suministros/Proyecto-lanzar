# Esquema relacional

- **Usuario** (*id_usuario*, contraseña)

- **Solicitante** (*id_solicitante*, nombre, contacto)
  - FK Solicitante(id_solicitante) referencia a Usuario(id_usuario)

- **Administrador** (*id_admin*, nombre, usuario, permisos_rol)
  - FK Administrador(id_admin) referencia a Usuario(id_usuario)

- **Remitente** (*id_remitente*, nombre_base, latitud_base, longitud_base, capacidad_pista)
  - FK Remitente(id_remitente) referencia a Usuario(id_usuario)

- **Producto** (*id_producto*, nombre, descripcion, peso_unitario, *id_tipo*)
  - FK Producto(id_tipo) referencia a Tipo(id_tipo)

- **Tipo** (*id_tipo*, nombre_categoria, peso_prioridad)

- **Stock_Base** (*id_stock*, *id_remitente*, *id_producto*, cantidad_disponible)
  - FK Stock_Base(id_producto) referencia a Producto(id_producto)
  - FK Stock_Base(id_remitente) referencia a Remitente(id_remitente)

- **Solicitud** (*id_solicitud*, fecha_creacion, estado_actual, prioridad, latitud_destino, longitud_destino, *id_solicitante*, *id_admin*, *id_remitente*)
  - FK Solicitud(id_solicitante) referencia a Solicitante(id_solicitante)
  - FK Solicitud(id_admin) referencia a Administrador(id_admin)
  - FK Solicitud(id_remitente) referencia a Remitente(id_remitente)

- **Detalle_Solicitud** (*id_detalle*, *id_solicitud*, *id_producto*, cantidad_pedida)
  - FK Detalle_Solicitud(id_solicitud) referencia a Solicitud(id_solicitud)
  - FK Detalle_Solicitud(id_producto) referencia a Producto(id_producto)

- **Historial_Estado** (*id_historial*, fecha_hora, estado_anterior, estado_nuevo, *id_solicitud*, *id_usuario*)
  - FK Historial_Estado(id_usuario) referencia a Usuario(id_usuario)
  - FK Historial_Estado(id_solicitud) referencia a Solicitud(id_solicitud)

- **Notificacion** (*id_notificacion*, mensaje, fecha_hora, *id_solicitud*, *id_usuario_destino*)
  - FK Notificacion(id_solicitud) referencia a Solicitud(id_solicitud)
  - FK Notificacion(id_usuario_destino) referencia a Usuario(id_usuario)

- **Vuelo** (*id_vuelo*, matricula_avion, piloto, combustible_estimado, *id_remitente*)
  - FK Vuelo(id_remitente) referencia a Remitente(id_remitente)

- **Lanzamiento** (*id_lanzamiento*, latitud_calculada, longitud_calculada, altitud, datos_clima_api, *id_vuelo*, *id_solicitud*, *id_remitente*)
  - FK Lanzamiento(id_vuelo) referencia a Vuelo(id_vuelo)
  - FK Lanzamiento(id_solicitud) referencia a Solicitud(id_solicitud)
  - FK Lanzamiento(id_remitente) referencia a Remitente(id_remitente)

- **Contenedor** (*id_contenedor*, tipo_paracaidas, peso_maximo, estado_mecanico, *id_lanzamiento*)
  - FK Contenedor(id_lanzamiento) referencia a Lanzamiento(id_lanzamiento)

---

# Explicación de relaciones

## Los usuarios y el sistema

- **Usuario con Administrador / Solicitante / Remitente:** Es una relación de *herencia*. Significa que los tres "son" usuarios. Comparten los datos básicos (como email y contraseña para entrar al sistema), pero luego cada uno hace cosas distintas.

- **Usuario con Historial_Estado:** Esta línea es la cámara de seguridad. Permite saber exactamente *quién* (qué usuario con nombre y apellido) cambió el estado de un pedido, resolviendo la duda de saber quién canceló algo.

- **Usuario con Notificación:** Define al destinatario del aviso; le dice al sistema a qué pantalla mandarle el mensaje de alerta.

## Los pedidos (solicitudes)

- **Solicitante con Solicitud:** Un solicitante es el que "crea" la necesidad y arma el pedido.

- **Administrador con Solicitud:** El administrador actúa de filtro; es quien "revisa" y decide si aprueba o rechaza el pedido.

- **Remitente con Solicitud:** Al remitente (la base aérea logística) se le "asigna" el pedido para que junte las cosas.

- **Solicitud con Detalle_Solicitud:** La solicitud es la tapa de la carpeta, y los detalles son los "renglones" de la lista de compras (ej.: Renglón 1: 50 litros de agua, Renglón 2: 10 botiquines).

- **Detalle_Solicitud con Producto:** Conecta ese renglón escrito en el pedido con el artículo real que existe en el catálogo.

- **Producto con Tipo:** Sirve para organizar el catálogo (ej.: agrupa las vendas y gasas dentro de la categoría "Sanidad").

## El inventario

- **Remitente con Stock_Base:** Cada base aérea (remitente) tiene su propio depósito. Esto asocia la base con su galpón.

- **Stock_Base con Producto:** Es el conteo. Indica exactamente qué cantidad física hay de cada producto guardada en ese depósito.

## La logística y entrega

- **Remitente con Vuelo:** Indica de qué base aérea despega el avión.

- **Vuelo con Lanzamiento:** Un vuelo (el viaje completo del avión) puede hacer varias "paradas en el aire", es decir, múltiples lanzamientos en diferentes lugares.

- **Remitente con Lanzamiento:** Vincula el lanzamiento con la base que armó el paquete, permitiendo descontar el stock exactamente de ese lugar.

- **Solicitud con Lanzamiento:** Une el mundo de los papeles con el mundo real. Conecta el pedido original con el momento en que las cajas son arrojadas por la rampa.

- **Lanzamiento con Contenedor:** Un lanzamiento arroja físicamente uno o varios contenedores (los pallets atados con sus respectivos paracaídas).

## El seguimiento y trazabilidad

- **Solicitud con Historial_Estado:** Es la bitácora del pedido. Guarda toda su historia cronológica (Creado → Aprobado → En vuelo → Entregado).

- **Solicitud con Notificación:** Es el mensajero. Cuando la solicitud sufre un cambio, genera un aviso para que el usuario que lo pidió se entere al instante (o cuando recupere la conexión).
