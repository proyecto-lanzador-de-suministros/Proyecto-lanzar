**Modelo Relacional**

* **BASE** (*id\_base[key]*, nombre, latitud, longitud, dirección)  
    
* **USUARIO** (*id\_usuario[key]*, nombre, email, rol, Teléfono, *id\_base*)   
  * FK usuario(id\_base) referencia a BASE(id\_base).


* **SOLICITUD** (*id\_solicitud[key]*, fecha\_solicitada, fecha\_entrega, fecha\_estimada, estado, prioridad, ubicacion\_detino, *id\_usuario*)   
  *  FK solicitud(id\_usuario) referencia a USUARIO(id\_usuario).   
      
* **ENVIO** (*id\_envio[key]*, fecha\_hora, estado\_envio, clima, entrega\_real, cod\_seguimiento, fecha\_salida*, id\_base*, *id\_solicitud*)   
  * FK envio(id\_base) referencia a BASE(id\_base).  
  * FK envio(id\_solicitud) referencia a SOLICITUD(id\_solicitud).  
      
* **CONTENEDOR** (*id\_contenedor[key]*, tipo\_paracaidas, peso\_max, *id\_envio*)  
  *  FK contenedor(id\_envio) referencia a ENVIO(id\_envio).  
      
* **PRODUCTO** (*id\_producto[key]*, nombre, descripcion, peso\_kg, categoria)


* **STOCK-BASE** (*id\_stock[key]*, cantidad\_disponible, cantida\_reservada, *id\_base*, *id\_producto*)   
  *  FK stock-base(id\_base) referencia a BASE(id\_base).   
  *  FK stock-base(id\_producto) referencia a PRODUCTO(id\_producto).  
      
* **DETALLE-SOLICITUD** (*id\_detalle[key]*, cantidad\_aprobada, cantidad\_solicitada, *id\_solicitud*, *id\_producto*)   
  *  FK detalle-solicitud(id\_solicitud) referencia a SOLICITUD(id\_solicitud).   
  * FK detalle-solicitud(id\_producto) referencia a PRODUCTO(id\_producto).  
      
* **HISTORIAL-ESTADO** (*id\_historial[key]*, fecha\_hora, est\_ant, est\_nue, *id\_solicitud*, *id\_usuario*)   
  *  FK historial-estado(id\_solicitud) referencia a SOLICITUD(id\_solicitud).   
  *  FK historial-estado(id\_usuario) referencia a USUARIO(id\_usuario).   
      
* **NOTIFICACION** (*id\_notificacion[key]*, mensaje, fecha, leida, tipo, canal\_envio, enviada\_at, *id\_solicitud*, *id\_usuario*)   
  * FK notificacion(id\_solicitud) referencia a SOLICITUD(id\_solicitud).   
  *  FK notificacion(id\_usuario) referencia a USUARIO(id\_usuario). 

  