# **Pipeline de Datos \- Entregable 4**

## **Pipeline: Cálculo de Trayectoria de Caída Libre**

Calcula las coordenadas exactas y el momento de lanzamiento de un paquete desde la aeronave, procesando el peso de la carga y las condiciones climáticas actuales en la zona de destino, para asegurar el aterrizaje en el punto solicitado.

### **PASO 1 \- ORIGEN DE LOS DATOS**

| ¿Qué datos? | Datos del envío: {id\_envio, peso\_kg (desde Producto/Detalle), latitud\_destino, longitud\_destino}. Datos meteorológicos: {velocidad\_viento, direccion\_viento, presion\_atmosferica, altitud\_terreno}. |
| :---- | :---- |
| **¿Desde dónde?** | Los datos del envío provienen de la Base de Datos (PostgreSQL, tablas SOLICITUD, DETALLE-SOLICITUD y PRODUCTO). Los datos meteorológicos provienen de la API Clima Externa. |
| **¿Con qué frecuencia llegan?** | Streaming / Event-driven. Se solicitan cuando un paquete pasa a "En preparación" (CU-12 — cálculo inicial) y nuevamente cuando pasa a "En camino" (CU-14 — recálculo con clima actualizado). |
| **¿Volumen estimado?** | Bajo/Moderado. Depende de la cantidad de paquetes por vuelo (ej. decenas de cálculos por plan de vuelo). Cada payload es de pocos kilobytes (JSON). |

### **PASO 2 \- DISPARADOR / TRIGGER**

| ¿Cuándo se ejecuta? | Tipo de procesamiento: Event-driven / Streaming. Se ejecuta **dos veces** en el ciclo de vida de la solicitud: 1) cuando el Remitente cambia el estado a "En preparación" (CU-12 — cálculo inicial de trayectoria), y 2) cuando el Remitente cambia el estado a "En camino" (CU-14 — recálculo con datos climáticos actualizados). No se ejecuta al lanzar (CU-15), ya que es solo el registro del evento. |
| :---- | :---- |
| **¿Quién lo dispara?** | El Requests Controller (o controlador de envíos) de la API Application (Backend Node.js) al recibir el request de cambio de estado desde la SPA del Remitente (PATCH /solicitudes/{id}/estado con nuevoEstado: "En preparación" o "En camino"). |

### **PASO 3 \- PROCESAMIENTO**

| ¿Qué componente lo ejecuta? | El componente Calculador de Trayectoria dentro de la API Application (Backend). |
| :---- | :---- |
| **Paso 1: Extracción** | El Backend consulta la BD (vía Integración BDD) para obtener la latitud/longitud de destino de la solicitud y sumarizar el peso total (kg) de los productos en el CONTENEDOR. |
| **Paso 2: Enriquecimiento** | El Calculador de Trayectoria invoca a la API Clima (vía la Fachada) pasándole la latitud y longitud de destino para obtener las condiciones actuales del viento. |
| **Paso 3: Cálculo Físico** | El motor aplica fórmulas de balística y resistencia aerodinámica usando el peso y el vector del viento para calcular el *offset* (desplazamiento). |
| **Paso 4: Validación de Seguridad** | Si la velocidad del viento supera el límite operativo máximo del paracaídas, se levanta un flag de "Condiciones No Seguras". |
| **¿Hay lógica de error?** | Sí. Si la API Clima no responde en un tiempo límite (timeout), se realiza un reintento (retry). Si continúa fallando, el estado de la solicitud no avanza y se alerta al Remitente indicando "Error al obtener datos meteorológicos". Si las condiciones son no seguras (ej. tormenta), se frena el cálculo y el envío se reprograma. |

### **PASO 4 \- SALIDA / DESTINO**

| ¿Qué se produce? | Un set de coordenadas (Latitud/Longitud) de lanzamiento offseteadas del destino real, un timestamp estimado y un flag de validación de seguridad. |
| :---- | :---- |
| **¿Dónde se guarda?** | Se actualiza el registro en la tabla ENVIO de la Base de Datos (PostgreSQL), específicamente en el campo `datos_clima` (JSON) que contiene el punto de lanzamiento (CARP), offsets, timestamp estimado, condiciones climáticas y flag de seguridad. |
| **¿Quién consume el resultado?** | El Remitente (o la tripulación de vuelo) mediante la Web Application (SPA) para saber en qué momento y coordenadas exactas deben soltar el paquete. |

### **PASO 5 \- DECISIÓN ARQUITECTÓNICA**

| ¿Por qué este enfoque? | El procesamiento debe ser "on-demand" y cercano a la hora de vuelo porque las condiciones climáticas son altamente volátiles; calcularlo por lotes (batch) el día anterior resultaría en paquetes perdidos. Se integra el cálculo en el backend principal porque debe completarse velozmente y el volumen actual no amerita un microservicio físico separado. |
| :---- | :---- |
| **Trade-offs aceptados** | Fuerte acoplamiento en tiempo de ejecución con la disponibilidad de la API del Clima: si la API externa cae, el proceso de envíos (central del negocio) se detiene momentáneamente, ya que la precisión del lanzamiento es vital. |

## 

## **Pipeline: Reserva & Gestión de Stock**

Evalúa la disponibilidad de inventario en tiempo real al recibir una solicitud, realizando la reserva preventiva de los paracaídas y provisiones para garantizar que no existan sobreventas o asignaciones sin stock físico.

### **PASO 1 \- ORIGEN DE LOS DATOS**

| ¿Qué datos? | Datos de la nueva solicitud de pedido: {lat\_dest, lon\_dest, productos: \[{id\_producto, cantidad}\]} |
| :---- | :---- |
| **¿Desde dónde?** | Ingresa a través del request HTTP POST /solicitudes enviado desde la SPA del Solicitante. |
| **¿Con qué frecuencia llegan?** | Event-driven. Se solicitan cada vez que un paquete pasa a la etapa de preparación previa al vuelo. |
| **¿Volumen estimado?** | Variable según demanda, preparado para picos de concurrencia de al menos 10 solicitudes simultáneas (RNF2). |

### **PASO 2 \- DISPARADOR / TRIGGER**

| ¿Cuándo se ejecuta? | Streaming / Event-driven. El sistema está siempre a la espera. Se dispara instantáneamente en tiempo real al recibir el request de creación de un pedido. El flujo de aprobación se suspende hasta que la evaluación de stock se resuelva. |
| :---- | :---- |
| **¿Quién lo dispara?** | El Requests Controller de la API Application al interceptar la petición del usuario. |

### **PASO 3 \- PROCESAMIENTO**

| ¿Qué componente lo ejecuta? | El Servicio de Gestión de Stock dentro del contenedor Backend (API Application). |
| :---- | :---- |
| **Paso 1: Busqueda geográfica** | Consulta las coordenadas (latitud/longitud) de las bases operativas registradas para determinar cuál es la más cercana al punto de destino solicitado. |
| **Paso 2: Verificación de Stock** | Consulta la tabla STOCK-BASE para confirmar si la cantidad\_disponible es mayor o igual a la solicitada para todos los productos requeridos en la base seleccionada.  |
| **Paso 3: Reserva** | Si hay disponibilidad, ejecuta una transacción (ACID) donde descuenta las unidades de cantidad\_disponible y las suma a cantidad\_reservada en la tabla STOCK-BASE. |
| **¿Hay lógica de error?** | Sí. Si la verificación del Paso 2 falla (no hay stock suficiente), el flujo se interrumpe. Se hace *rollback* de cualquier reserva parcial, la solicitud queda marcada como **Rechazada**, y se devuelve un error HTTP 409 Conflict al usuario con el detalle del inventario faltante. |

### **PASO 4 \- SALIDA / DESTINO**

| ¿Qué se produce? | La actualización de los valores de inventario y la persistencia de la SOLICITUD en estado Creada o Asignada. |
| :---- | :---- |
| **¿Dónde se guarda?** | En las tablas STOCK-BASE y SOLICITUD de la base de datos PostgreSQL principal. |
| **¿Quién consume el resultado?** | El Remitente de la base correspondiente, quien verá la nueva solicitud aprobada aparecer en su panel táctico como pendiente de preparación. |

### **PASO 5 \- DECISIÓN ARQUITECTÓNICA**

| ¿Por qué este enfoque? | El control de stock no puede resolverse de forma asíncrona ni diferida (batch) porque generaría falsas expectativas en el solicitante. Se procesa en *streaming* mediante eventos de negocio síncronos para garantizar la consistencia absoluta de los datos prevenir condiciones de carrera donde dos usuarios compren el último stock de un mismo producto |
| :---- | :---- |
| **Trade-offs aceptados** | Requiere mantener el servidor del backend activo las 24 horas del día. En momentos de nula o muy baja demanda (pocas solicitudes), la infraestructura sigue corriendo y generando costos fijos de mantenimiento operativo, a diferencia de un enfoque Serverles. Por otro lado, si entran muchas solicitudes simultáneas para una misma base operativa, se generará una fila de espera, incrementado la latencia del endpoint `POST /solicitudes`, haciendo que algunos usuarios experimenten tiempos de respuesta superiores a la media bajo escenarios de estrés masivo, así como dando lugar a condiciones de carrera. |

## 