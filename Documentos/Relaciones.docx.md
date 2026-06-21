**RELACIONES EXPLICACIÓN** 

* ***Usuario ↔ Solicitud:*** Un usuario es quien "pide" cosas. Necesitas esta relación para saber a quién entregarle el pedido o a quién contactar si algo sale mal.  
    
* ***Usuario ↔ Base:*** Sirve para definir Gestionar. No todos los usuarios pueden ver el stock de todos los depósitos; solo el administrador o el Remitente de esa base.  
    
* ***Usuario ↔ Historial-Estado:*** Si un pedido cambia de estado necesitas saber qué usuario apretó el botón para tener trazabilidad.  
    
* ***Usuario ↔ Notificación:*** Simplemente para saber a quién le llega el aviso. El sistema busca el ID del usuario para enviarle el mensaje a su sesión o email.

* ***Solicitud ↔ Detalle-solicitud:*** Una solicitud es el "Titulo", pero el detalle es la lista de compras. Separarlas permite que una sola solicitud tenga muchos productos distintos.  
    
* ***Solicitud ↔ Historial-Estado:*** Permite ver la "línea de tiempo" de un pedido. Sin esto, solo verías el estado actual, pero no sabrías todos los cambios de estado del pedido  
    
* ***Solicitud ↔ Notificación:*** Para que la notificación sepa de qué pedido está hablando 

* ***Solicitud ↔ Envió:*** Una solicitud aprobada genera un envío. Es la transición de lo "administrativo" a lo "físico".  
    
* ***Envió ↔ Base:*** El origen. Indica de qué lugar físico va a salir la mercadería. Es vital para descontar el stock del lugar correcto.  
    
* ***Envió ↔ Vuelo:*** El medio de transporte. Vincula la carga con un plan de vuelo específico para saber cuándo sale y cuándo llega.  
    
* ***Envió ↔ Contenedor:*** La unidad de carga. Ayuda a la logística del avión para saber en qué caja o pallet va la mercadería de esa solicitud.

* ***Producto ↔ Detalle-solicitud:*** Para saber qué objeto específico está pidiendo el usuario.  
* ***Producto ↔ Tipo***: Organización. Sirve para filtrar y ver la prioridad de los tipos  
    
* ***Producto ↔ Stock-Base:*** Es la existencia real. Para modelar cuantos productos hay en cada base  
    
* ***Base ↔ Stock-Base:*** El dueño del estante. Básicamente para modelar a que base pertenece dicho stock

