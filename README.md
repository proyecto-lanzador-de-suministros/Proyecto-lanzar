# Idea General

Aplicación (a definir si es web, mobile o desktop) que funciona como un sistema de solicitudes. La aplicación cuenta con dos paneles, uno destinado a los **remitentes** y otro a los **destinatarios**. Ambos paneles cuentan con un mapa interactivo de su zona.

El/los solicitantes pueden solicitar un paquete en una zona determinada (tal vez individualmente, tal vez en grupo) y un remitente aprobado de la organización puede decidir si aceptarla o no. Luego, tiene la responsabilidad de completar la encomienda.

Cada remitente tiene un stock propio que disminuye al hacer una solicitud, y debe indicar manualmente cuándo hizo restock.

## Validación de solicitudes

Al momento de hacer una solicitud, la aplicación chequea el stock de todos los posibles remitentes para verificar si la solicitud es posible. En caso de que no, es rechazada. Si es posible, la solicitud se crea exitosamente.  
Si no lo es, la aplicación o bien sugiere otro remitente o bien otra solicitud, especificando qué stock falta.

## Flujo de la solicitud aceptada

Con la solicitud creada, el remitente recibe información de la zona solicitada y ubicación designada. Luego, se calcula adónde debe ser lanzado y cuándo para que caiga en el lugar y momento preciso. Cada paquete tiene un paracaídas.

Para el cálculo se utiliza:
- Condiciones climáticas (API Clima)
- Peso (calculado o bien introducido manualmente)
- Altitud (tal vez constante)

## Notificaciones al solicitante

El sistema envía notificaciones al solicitante cuando:
- Se crea correctamente la solicitud
- La solicitud es asignada a un remitente
- Su paquete parte camino
- Su paquete está por llegar (mismo día, una hora, etc.)
- El paquete ha sido entregado
- Se anula la solicitud, indicando el motivo de anulación

## Notificaciones al remitente

El sistema envía notificaciones al remitente cuando:
- El sistema asigna una solicitud a dicho remitente
- Se cancela una solicitud asignada al mismo
- Se anula una solicitud asignada al mismo
- Un solicitante recibió correctamente una solicitud

## Usuarios

### Solicitantes
Mayoría de usuarios. Permite:
- Hacer solicitudes
- Cancelar solicitudes (mientras el pedido no esté en preparación)
- Consultar solicitudes propias

### Remitentes
Usuarios parte de la organización. Permite:
- Responder solicitudes y/o anularlas
- Actualizar su propio stock
- Consultar acerca de solicitudes asignadas al mismo

### Admin
Permite:
- Aprobar y eliminar cuentas de cualquier tipo
- Disparar toda acción que el solicitante y remitente realicen
