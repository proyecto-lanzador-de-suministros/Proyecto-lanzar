**Modelo Relacional**

* **USUARIO** (*id_usuario[key]*, contrasena, estado_cuenta, *administradorId_admin*)
  * FK usuario(administradorId_admin) referencia a ADMINISTRADOR(id_admin).

* **SOLICITANTE** (*id_solicitante[key]*, nombre, contacto)
  * FK solicitante(id_solicitante) referencia a USUARIO(id_usuario) (ON DELETE CASCADE).

* **ADMINISTRADOR** (*id_admin[key]*, nombre, usuario, permisos_rol)

* **REMITENTE** (*id_remitente[key]*, nombre_base, latitud_base, longitud_base, capacidad_pista)
  * FK remitente(id_remitente) referencia a USUARIO(id_usuario) (ON DELETE CASCADE).

* **BASE** (*id_base[key]*, nombre, latitud, longitud, dirección)

* **SOLICITUD** (*id_solicitud[key]*, fecha_creacion, estado_actual, prioridad, latitud_destino, longitud_destino, motivo_cancelacion, motivo_anulacion, *id_solicitante*, *id_admin*, *id_remitente*)
  * FK solicitud(id_solicitante) referencia a SOLICITANTE(id_solicitante).
  * FK solicitud(id_admin) referencia a ADMINISTRADOR(id_admin).
  * FK solicitud(id_remitente) referencia a REMITENTE(id_remitente).

* **ENVIO** (*id_envio[key]*, estado_envio, codigo_seguimiento, matricula_avion, piloto, latitud_calculada, longitud_calculada, altitud, datos_clima, fecha_hora, fecha_salida, entrega_real, *id_base*, *id_solicitud*)
  * FK envio(id_base) referencia a BASE(id_base).
  * FK envio(id_solicitud) referencia a SOLICITUD(id_solicitud).

* **CONTENEDOR** (*id_contenedor[key]*, tipo_paracaidas, peso_maximo, estado_mecanico, *id_envio*)
  * FK contenedor(id_envio) referencia a ENVIO(id_envio).

* **PRODUCTO** (*id_producto[key]*, nombre, descripcion, peso_unitario, categoria)

* **STOCK-BASE** (*id_stock[key]*, cantidad_disponible, cantidad_reservada, *id_remitente*, *id_producto*)
  * FK stock-base(id_remitente) referencia a REMITENTE(id_remitente).
  * FK stock-base(id_producto) referencia a PRODUCTO(id_producto).
  * NOTA: Pendiente migrar FK de Remitente a Base.

* **DETALLE-SOLICITUD** (*id_detalle[key]*, cantidad_pedida, *id_solicitud*, *id_producto*)
  * FK detalle-solicitud(id_solicitud) referencia a SOLICITUD(id_solicitud).
  * FK detalle-solicitud(id_producto) referencia a PRODUCTO(id_producto).

* **HISTORIAL-ESTADO** (*id_historial[key]*, fecha_hora, est_ant, est_nue, *id_solicitud*, *id_usuario*)
  * FK historial-estado(id_solicitud) referencia a SOLICITUD(id_solicitud).
  * FK historial-estado(id_usuario) referencia a USUARIO(id_usuario).

* **HISTORIAL-STOCK** (*id_historial_stock[key]*, cantidad_anterior, cantidad_nueva, fecha_hora, *id_remitente*, *id_producto*, *id_actor*)
  * FK historial-stock(id_remitente) referencia a REMITENTE(id_remitente).
  * FK historial-stock(id_producto) referencia a PRODUCTO(id_producto).
  * FK historial-stock(id_actor) referencia a USUARIO(id_usuario).

* **NOTIFICACION** (*id_notificacion[key]*, mensaje, leida, fecha_hora, *id_solicitud*, *id_usuario_destino*)
  * FK notificacion(id_solicitud) referencia a SOLICITUD(id_solicitud).
  * FK notificacion(id_usuario_destino) referencia a USUARIO(id_usuario).
