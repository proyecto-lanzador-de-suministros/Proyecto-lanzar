**Modelo Relacional**

* **USUARIO** (*id_usuario[key]*, nombre?, email?, contrasena?, estado_cuenta, *administradorId_admin?*)
  * FK usuario(administradorId_admin) referencia a ADMINISTRADOR(id_admin).
  * `nombre` y `email` opcionales: en producción vía Clerk (ADR-006), en seed/dev se pueden setear directo.

* **SOLICITANTE** (*id_solicitante[key]*, nombre, contacto)
  * FK solicitante(id_solicitante) referencia a USUARIO(id_usuario) (ON DELETE CASCADE).

* **ADMINISTRADOR** (*id_admin[key]*, nombre, usuario, permisos_rol)

* **REMITENTE** (*id_remitente[key]*, *id_base*)
  * FK remitente(id_remitente) referencia a USUARIO(id_usuario) (ON DELETE CASCADE).
  * FK remitente(id_base) referencia a BASE(id_base).

* **BASE** (*id_base[key]*, nombre, latitud, longitud, direccion, capacidad_pista)

* **SOLICITUD** (*id_solicitud[key]*, fecha_creacion, estado_actual, prioridad, latitud_destino, longitud_destino, motivo_cancelacion, motivo_anulacion, *id_solicitante*, *id_admin?*, *id_base?*)
  * FK solicitud(id_solicitante) referencia a SOLICITANTE(id_solicitante).
  * FK solicitud(id_admin) referencia a ADMINISTRADOR(id_admin).
  * FK solicitud(id_base) referencia a BASE(id_base).

* **ENVIO** (*id_envio[key]*, estado_envio, codigo_seguimiento, matricula_avion, piloto, latitud_calculada, longitud_calculada, altitud, datos_clima, fecha_hora, fecha_salida, entrega_real, *id_base*, *id_solicitud*)
  * FK envio(id_base) referencia a BASE(id_base).
  * FK envio(id_solicitud) referencia a SOLICITUD(id_solicitud).

* **CONTENEDOR** (*id_contenedor[key]*, tipo_paracaidas, peso_maximo, estado_mecanico, *id_envio*)
  * FK contenedor(id_envio) referencia a ENVIO(id_envio).

* **PRODUCTO** (*id_producto[key]*, nombre, descripcion, peso_unitario, categoria)

* **STOCK-BASE** (*id_stock[key]*, cantidad_disponible, cantidad_reservada, *id_base*, *id_producto*)
  * FK stock-base(id_base) referencia a BASE(id_base).
  * FK stock-base(id_producto) referencia a PRODUCTO(id_producto).

* **DETALLE-SOLICITUD** (*id_detalle[key]*, cantidad_pedida, *id_solicitud*, *id_producto*)
  * FK detalle-solicitud(id_solicitud) referencia a SOLICITUD(id_solicitud).
  * FK detalle-solicitud(id_producto) referencia a PRODUCTO(id_producto).

* **HISTORIAL-ESTADO** (*id_historial[key]*, fecha_hora, est_ant, est_nue, *id_solicitud*, *id_usuario*)
  * FK historial-estado(id_solicitud) referencia a SOLICITUD(id_solicitud).
  * FK historial-estado(id_usuario) referencia a USUARIO(id_usuario).

* **HISTORIAL-STOCK** (*id_historial_stock[key]*, cantidad_anterior, cantidad_nueva, fecha_hora, *id_base*, *id_producto*, *id_actor*)
  * FK historial-stock(id_base) referencia a BASE(id_base).
  * FK historial-stock(id_producto) referencia a PRODUCTO(id_producto).
  * FK historial-stock(id_actor) referencia a USUARIO(id_usuario).

* **NOTIFICACION** (*id_notificacion[key]*, mensaje, leida, fecha_hora, *id_solicitud?*, *id_usuario_destino*)
  * FK notificacion(id_solicitud) referencia a SOLICITUD(id_solicitud).
  * FK notificacion(id_usuario_destino) referencia a USUARIO(id_usuario).
