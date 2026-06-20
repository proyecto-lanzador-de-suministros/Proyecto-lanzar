# **Decisiones Arquitectónicas (ADRs) \- Entregable 4**

Este documento contiene las Decisiones Arquitectónicas (ADRs) consolidadas para el sistema de entrega de provisiones con paracaídas, siguiendo la plantilla y lineamientos de la cátedra de Arquitectura y Diseño de Sistemas.

## **ADR-001: Elección del estilo arquitectónico para el Backend**

| ID | Título | Estado | Fecha |
| :---- | :---- | :---- | :---- |
| ADR-001 | Elección del estilo arquitectónico para el Backend | Aceptada | 03/06/2026 |

### **1\. Contexto**

El sistema requiere gestionar solicitudes de usuarios, control de inventario y el cálculo físico de trayectorias de caída libre consultando APIs externas (Clima y Mapas). Todo esto debe responder en menos de 3 segundos (RNF1) y permitir el trabajo concurrente de múltiples usuarios (RNF2). Se debe decidir cómo estructurar los componentes internos del backend para mantener un equilibrio entre facilidad de desarrollo, mantenibilidad (RNF18) y rendimiento.

### **2\. Alternativas consideradas**

| Alternativa | Ventaja principal en este contexto | Desventaja / Motivo de descarte |
| :---- | :---- | :---- |
| Microservicios (ej. Servicio de Usuarios, Servicio de Cálculo, Servicio de Stock) | Escalabilidad independiente (ej. escalar solo el calculador de trayectorias si hay muchas peticiones). | Exceso de complejidad operativa para un volumen estimado de solo 10 solicitudes concurrentes (RNF2). Añade latencia de red entre servicios que podría poner en riesgo el RNF1. |
| Funciones Serverless (AWS Lambda / Vercel Functions) | Escalado automático a cero y bajo costo inicial. Ideal para picos de tráfico esporádicos. | El "Cold start" (tiempo de arranque) puede superar los 3 segundos (violando el RNF1). Dificulta mantener conexiones persistentes estables con la base de datos relacional. |
| Monolito Modular | Baja complejidad de despliegue, llamadas a funciones en memoria (cero latencia de red interna) y clara separación lógica. | A medida que crecen las integraciones externas (clima, mapas, notificaciones), los módulos tienden a acoplarse directamente a SDKs y librerías concretas, dificultando el testing y el reemplazo de proveedores (RNF18)  |
| **Monolito Modular \+ Arquitectura Hexagonal (Elegida)** | Despliegue simple combinado con aislamiento explícito del dominio respecto a servicios externos |  |

### **3\. Decisión tomada**

Se decide implementar el backend bajo una **arquitectura de Monolito Modular con organización interna Hexagonal (Ports & Adapters)** en Node.js/Express.

El monolito modular define la forma de despliegue: un único proceso con módulos lógicamente separados (Usuarios, Solicitudes, Stock, Trayectoria). La arquitectura hexagonal define la organización interna de cada módulo: el dominio (entidades y casos de uso) queda aislado de toda infraestructura externa mediante puertos (interfaces) y adaptadores (implementaciones concretas).  
Bajo esta organización, cada servicio externo queda encapsulado en su propio adaptador:

* WeatherAdapter implementa el puerto forGettingWeather — el dominio no conoce qué API de clima se usa  
* TrajectoryCalculator implementa el puerto forCalculatingTrajectory — la fórmula física puede cambiar sin tocar los casos de uso  
* NotificationAdapter implementa el puerto forNotifying — el mecanismo de entrega (email, push, cola) es transparente al dominio  
* SolicitudRepository implementa el puerto forManagingSolicitudes — la base de datos es un detalle de infraestructura

**Fundamentación:**

* El volumen de transacciones estimado (RNF2) no justifica la complejidad operativa de microservicios. El monolito garantiza cumplir el RNF1 al eliminar la latencia de red interna.

* La incorporación de hexagonal responde a una necesidad concreta del proyecto: la cantidad de integraciones externas volátiles. Sin esta separación, el módulo de solicitudes terminaría importando directamente el SDK de clima, el de notificaciones y el de mapas, acoplando la lógica de negocio a decisiones de infraestructura y dificultando el testing (RNF18).

* Con hexagonal, los casos de uso pueden testearse con adaptadores en memoria sin levantar servicios externos, y cualquier cambio de proveedor (por ejemplo, reemplazar la API de clima) se limita a reescribir un único adaptador sin modificar el dominio.

### **4\. Consecuencias**

| Consecuencias positivas | Trade-offs / costos |
| :---- | :---- |
| Despliegue simple y rápido en un único contenedor o servidor independiente. | Si el módulo de "Calculador de Trayectoria" consume demasiada CPU por la carga matemática, afectará el rendimiento global del servidor (incluyendo el módulo de autenticación). |
| Facilita mantener la consistencia transaccional estricta (ACID) al compartir la misma conexión a la base de datos común. | Escalar el sistema ante picos puntuales implica duplicar todo el monolito en infraestructura, no solo la sección bajo estrés. |
| El dominio puede testearse sin dependencias externas reales (mocks de adaptadores) | Requiere disciplina del equipo para respetar los límites entre dominio e infraestructura |
| Reemplazar un proveedor externo (clima, notificaciones, mapas) implica modificar únicamente su adaptador, sin tocar casos de uso ni entidades | Curva de aprendizaje inicial mayor respecto a un monolito sin estructura interna explícita. El equipo se puede apoyar en documentación interna para mitigar la curva. |
| Los límites explícitos entre módulos facilitan distribuir el trabajo entre integrantes del equipo | \- |

## **ADR-002: Persistencia de Datos**

| ID | Título | Estado | Fecha |
| :---- | :---- | :---- | :---- |
| ADR-002 | Elección de motor de base de datos principal | Aceptada | 03/06/2026 |

### **1\. Contexto**

El sistema maneja entidades fuertemente acopladas de un modelo relacional: Usuarios, Solicitudes, Envíos, Contenedores y Stock. Es crítico garantizar que la creación de una solicitud descuente el stock correctamente y registre el cambio en el historial sin inconsistencias transaccionales (RNF16). Además, las consultas requerirán unir múltiples tablas para reportes de trazabilidad (ver el historial de estado de un envío junto con los datos del remitente y el producto).

### **2\. Alternativas consideradas**

| Alternativa | Ventaja principal en este contexto | Desventaja / Motivo de descarte |
| :---- | :---- | :---- |
| MongoDB (NoSQL Documental) | Flexibilidad en el esquema para guardar datos estructurados del paquete y variables del clima en un solo documento JSON. | No está optimizado para relaciones complejas y uniones masivas de datos. Mantener la consistencia del stock ante concurrencia requeriría lógica manual compleja en el backend, arriesgando el RNF16. |
| MySQL | Gran ecosistema comunitario y soporte robusto para transacciones relacionales estándar. | Menor soporte nativo integrado para tipos de datos geográficos y espaciales avanzados requeridos a futuro para el mapa de zonas de caída y trayectorias. |
| **PostgreSQL con extensión PostGIS (Elegida)** | Transacciones ACID robustas de motor, excelente soporte JSON para respuestas de APIs externas y soporte geoespacial avanzado nativo. | (Esta fue la elegida) |

### **3\. Decisión tomada**

**Se decide:** Utilizar PostgreSQL como base de datos relacional principal para la persistencia transaccional del sistema, incorporando la extensión PostGIS para resolver necesidades de geolocalización.  
**Fundamentación:**

* El modelo de dominio es puramente relacional (conforme al Diagrama de Entidad-Relación de la Entrega 3), por lo que un motor SQL es el ajuste natural.  
* Las transacciones ACID de PostgreSQL garantizan que si falla el descuento de stock, la solicitud completa haga un rollback automático, previniendo estados inconsistentes en cumplimiento estricto del RNF16.  
* La extensión PostGIS permite manipular de manera nativa coordenadas de las zonas de exclusión y de caída libre.

### **4\. Consecuencias**

| Consecuencias positivas | Trade-offs / costos |
| :---- | :---- |
| Consistencia y validez de datos garantizada a nivel de motor de almacenamiento. | Esquema rígido: cualquier cambio estructurado en el modelo de datos requerirá la creación y ejecución de scripts de migración formales. |
| Las consultas complejas de reportes y trazabilidad se resuelven eficientemente con SQL estándar sin sobrecargar el servidor Node.js. | Lecturas pesadas, masivas o concurrentes sobre el clima o trayectorias pueden requerir la adición estratégica de un caché en memoria (ver ADR-005). |

## **ADR-003: Comunicación entre Componentes (Notificaciones)**

| ID | Título | Estado | Fecha |
| :---- | :---- | :---- | :---- |
| ADR-003 | Estrategia de comunicación para el sistema de notificaciones | Aceptada | 03/06/2026 |

### **1\. Contexto**

El sistema debe enviar notificaciones al Solicitante y Remitente en diversos cambios de estado (creación, asignación, en camino, entrega, anulación) con un 95% de probabilidad de éxito (RNF17). Realizar el envío de un correo electrónico o SMS de forma síncrona durante la petición HTTP entrante del usuario puede demorar más de 3 segundos ante lentitudes de red externas, lo cual violaría directamente el RNF1 de rendimiento de respuesta de la API.

### **2\. Alternativas consideradas**

| Alternativa | Ventaja principal en este contexto | Desventaja / Motivo de descarte |
| :---- | :---- | :---- |
| Llamada Síncrona a API Externa | Implementación extremadamente simple mediante una petición HTTP directa desde el controlador del backend. | Bloquea el hilo único de ejecución de Node.js. Si el proveedor de correos experimenta degradación, el usuario percibe una falla masiva en los tiempos. Alto riesgo de pérdida de datos ante desconexiones. |
| Polling de Base de Datos (Cron Job) | No requiere infraestructura adicional externa; un proceso programado lee una tabla de eventos en la base relacional cada 1 minuto. | Introduce retrasos artificiales inaceptables en las alertas críticas en tiempo real y genera un consumo constante de I/O en PostgreSQL de forma innecesaria. |
| **Cola de Mensajes Asíncrona (Message Broker) (Elegida)** | Desacoplamiento total del flujo de la API. El controlador responde inmediatamente y un worker procesa el envío en segundo plano con reintentos automáticos. | (Esta fue la elegida) |

### **3\. Decisión tomada**

**Se decide:** Implementar la comunicación con el sistema externo de notificaciones mediante un patrón asíncrono basado en un Message Broker, utilizando Redis con la librería BullMQ en Node.js.  
**Fundamentación:**

* Garantiza de forma sistemática que el RNF1 se cumpla, ya que la API del Monolito solo registra la tarea en el Broker y devuelve inmediatamente un código HTTP 202 Accepted.  
* Asegura la resiliencia definida en el RNF17, dado que los sistemas de colas permiten programar estrategias de reintentos con backoff exponencial si el proveedor externo de correos falla temporalmente.

### **4\. Consecuencias**

| Consecuencias positivas | Trade-offs / costos |
| :---- | :---- |
| El usuario experimenta una velocidad óptima de interfaz sin esperar hilos bloqueantes de red. | Introduce consistencia eventual: el usuario recibe confirmación inmediata en la pantalla, pero el correo físico de confirmación puede arribar unos segundos más tarde. |
| Mayor tolerancia a fallos: si el proveedor externo de correos se cae por horas, los mensajes quedan retenidos de forma segura en la cola en memoria sin perderse. | Incrementa la complejidad técnica del despliegue en infraestructura, requiriendo inicializar un proceso separado de background (worker) y administrar una instancia activa de Redis. |

## **ADR-004: Infraestructura y Despliegue**

| ID | Título | Estado | Fecha |
| :---- | :---- | :---- | :---- |
| ADR-004 | Estrategia de alojamiento (Hosting) para Frontend y Backend | Aceptada | 03/06/2026 |

### **1\. Contexto**

El sistema cuenta con una arquitectura distribuida (Nivel 2 del Modelo C4 de Contenedores) dividida lógicamente en una Single-Page Application (SPA construida en React) y una API REST (Node.js). Se requiere garantizar un 99% de disponibilidad general (RNF4) y una recuperación completa ante desastres o caídas en menos de 10 minutos (RNF5) minimizando al máximo la carga operativa de infraestructura, dado que el equipo no dispone de un ingeniero DevOps dedicado.

### **2\. Alternativas consideradas**

| Alternativa | Ventaja principal en este contexto | Desventaja / Motivo de descarte |
| :---- | :---- | :---- |
| Servidor Privado Virtual (VPS ej. AWS EC2 o DigitalOcean) | Control total de bajo nivel sobre las capas del sistema operativo, redes y configuraciones internas del kernel. Costo fijo predecible a largo plazo. | Exige configuración e implementación manual de proxies inversos, renovación de SSL y scripts de monitoreo. Si el servidor físico cae, el tiempo de recuperación puede violar el RNF5 por falta de automatización. |
| Contenedores Orquestados (Kubernetes) | Escalabilidad elástica infinita frente a demanda masiva y mecanismos nativos avanzados de auto-reparación e inyección de dependencias. | Complejidad de gestión inmensa (overhead arquitectónico). Curva de aprendizaje extrema que desenfocaría al equipo de desarrollo de la lógica de negocio central del paracaídas. |
| **Plataformas como Servicio (PaaS) y CDN (Elegida)** | Despliegues automatizados basados en Git (CI/CD nativo), gestión transparente de certificados SSL y reinicios automáticos gestionados por salud de contenedor. | (Esta fue la elegida) |

### **3\. Decisión tomada**

**Se decide:** Desplegar el Frontend (SPA de React) en una Red de Distribución de Contenidos global optimizada (ej. Vercel) y el Backend (Monolito en Node.js) en una Plataforma como Servicio administrada (PaaS ej. Render o Railway).  
**Fundamentación:**

* Los proveedores PaaS modernos implementan políticas automáticas de Live Checking y Health Probes. Ante una excepción no controlada en el código Node.js, la plataforma aprovisiona un nuevo contenedor en segundos, asegurando la recuperación menor a 10 minutos (RNF5).  
* Delega la gestión de seguridad básica, firewalls perimetrales y balanceo de carga al proveedor cloud, permitiendo mitigar la ausencia de un rol DevOps.  
* La CDN garantiza alta disponibilidad global (99% conforme al RNF4) para servir los archivos estáticos de la interfaz web y capas visuales del mapa.

### **4\. Consecuencias**

| Consecuencias positivas | Trade-offs / costos |
| :---- | :---- |
| Ciclo de Integración Continua (CI/CD) completamente transparente; cada merge a la rama principal se compila y distribuye sin intervención manual. | Pérdida de control de grano fino sobre los parámetros del sistema operativo base y dependencia de precios elásticos según consumo (riesgo limitado de vendor lock-in). |
| Los reinicios imprevistos de la plataforma no destruirán sesiones activas de usuarios debido a nuestra estrategia de diseño de autenticación (ver ADR-006). | Los entornos PaaS en planes básicos o gratuitos pueden colocar las instancias en estado suspendido ("dormir") tras inactividad, inyectando latencia alta en la primera petición del día. |

## **ADR-005: Estrategia de Caché**

| ID | Título | Estado | Fecha |
| :---- | :---- | :---- | :---- |
| ADR-005 | Estrategia de almacenamiento en caché para integraciones externas | Aceptada | 03/06/2026 |

### **1\. Contexto**

El sistema debe realizar el cálculo de trayectorias físicas de caída libre consumiendo variables climáticas de un proveedor externo de forma mandatoria. Este cálculo complejo debe ocurrir y retornar una respuesta en menos de 3 segundos (RNF1), garantizando la alta disponibilidad del servicio (RNF4). Consultar la API externa en cada petición síncrona satura los tiempos de espera y expone al sistema a cortes del proveedor. Dado que las variables meteorológicas generales en un cuadrante geográfico delimitado no cambian segundo a segundo, se identifica una oportunidad de optimización de datos mediante almacenamiento temporal.

### **2\. Alternativas consideradas**

| Alternativa | Ventaja principal en este contexto | Desventaja / Motivo de descarte |
| :---- | :---- | :---- |
| Sin Caché (Llamada HTTP directa mandatoria) | Garantiza precisión absoluta en tiempo real de cada ráfaga de viento o cambio de clima al momento exacto de la consulta. | Compromete críticamente el RNF1 si la API externa experimenta latencia o cortes de red. Incrementa significativamente los costos operativos de facturación de la API externa por volumen de consultas redundantes. |
| Caché a nivel de Persistencia (PostgreSQL) | Reutiliza la base relacional ya aprobada en el sistema (ver ADR-002) evitando agregar componentes a la infraestructura física. | PostgreSQL está optimizado para flujos transaccionales y de negocio con persistencia a disco duro. El manejo de datos altamente volátiles con tiempos de expiración cortos inyecta sobrecarga innecesaria sobre el motor de stock. |
| **Caché en memoria indexada (Redis) (Elegida)** | Tiempos de acceso y recuperación sub-milisegundo. Incorpora soporte integrado de TTL (Time-To-Live) para invalidar llaves automáticamente. | (Esta fue la elegida) |

### **3\. Decisión tomada**

**Se decide:** Implementar una capa de caché de alto rendimiento en memoria utilizando Redis, almacenando las respuestas climáticas estructuradas bajo llaves geo-indexadas por un tiempo máximo de expiración (TTL) de 7 minutos.  
**Fundamentación:**

* Desacopla el flujo de cómputo del rendimiento del proveedor de clima, garantizando respuestas inmediatas de caché ("cache hit") que aseguran cumplir holgadamente el umbral de 3 segundos del RNF1.  
* Presenta una óptima coherencia y sinergia de arquitectura, reutilizando de forma directa la instancia de servidor de Redis requerida obligatoriamente para las colas asíncronas de notificaciones (\*\*ver ADR-003\*\*), evitando costos o componentes extras de infraestructura.  
* Provee resiliencia (RNF4): ante caídas de la API de clima, el sistema puede seguir operando cálculos válidos usando el último estado del caché.  
* Se establece un TTL estricto de 7 minutos porque representa el intervalo mínimo de actualización de la API de clima externa. Este valor equilibra la precisión de los datos para la seguridad operativa y la optimización de las cuotas de peticiones. 

### **4\. Consecuencias**

| Consecuencias positivas | Trade-offs / costos |
| :---- | :---- |
| Latencia de lectura de datos drásticamente reducida y optimización en los costos de consumo de servicios web externos. | Riesgo menor de asimetría de información: si ocurre un evento climático severo súbito dentro de la ventana de los 7 minutos de la caché, el sistema usará datos previos hasta que expire la llave. |
| Aislamiento total del Monolito Modular frente a la intermitencia de redes públicas externas. | Aumenta la complejidad lógica del backend en Node.js, obligando a codificar el flujo tradicional de validación de caché ("Cache-Aside Pattern": verificar existencia, leer, retornar o en su defecto consultar origen y escribir en Redis). |

## **ADR-006: Autenticación y Seguridad**

| ID | Título | Estado | Fecha |
| :---- | :---- | :---- | :---- |
| ADR-006 | Estrategia de gestión de sesiones y autenticación de usuarios | Aceptada | 03/06/2026 |

### **1\. Contexto**

El sistema posee múltiples roles de acceso (Remitentes, Solicitantes, Administradores de Stock) que deben autenticarse y autorizarse de forma segura para consumir las rutas privadas de la API REST del Monolito. Dado que se decidió hospedar el backend en un entorno PaaS administrado (\*\*ver ADR-004\*\*) que opera bajo políticas dinámicas de reinicios de contenedores o suspensión por baja actividad, se requiere implementar una estrategia de sesiones segura que sea completamente agnóstica al estado en memoria física del servidor (diseño "stateless"), sin degradar el rendimiento por petición.

### **2\. Alternativas consideradas**

| Alternativa | Ventaja principal en este contexto | Desventaja / Motivo de descarte |
| :---- | :---- | :---- |
| Sesiones tradicionales en memoria de Servidor (Stateful) | Manejo nativo y directo en el servidor de Express. Permite invalidar y destruir de forma inmediata la sesión de un usuario de manera centralizada en tiempo real. | Estructura "Stateful" inviable para la nube PaaS elegida (\*\*ADR-004\*\*). Si la plataforma Render o Railway destruye o reinicia el contenedor para auto-repararse ante caídas (RNF5), todos los usuarios en línea sufrirían un deslogueo imprevisto instantáneo. |
| **Identity Provider (IdP) de Terceros: Clerk (Elegida)** | Delega toda la complejidad de seguridad, gestión de perfiles y flujos de login a un servicio especializado. | (Esta fue la elegida) |
| JSON Web Tokens \- JWT autogestionados  | Arquitectura "Stateless" (sin estado). Las credenciales se cifran y firman con llave privada del servidor, viajando directo del lado del cliente. | Alta complejidad y riesgo de seguridad ("reinventar la rueda"). Requiere desarrollar manualmente el cifrado, revocación de tokens, etc |

### **3\. Decisión tomada**

Se decide: **Delegar la autenticación, autorización y gestión integral de usuarios a un Identity Provider (IdP) de terceros, específicamente utilizando Clerk.** El backend y frontend se integrarán con sus SDKs, y el backend simplemente verificará la validez de los tokens emitidos por Clerk a través de un middleware. 

**Fundamentación:**

* Se prioriza mitigar los riesgos críticos de seguridad asociados a desarrollar y mantener una solución de autenticación propia (tales como vulnerabilidades en el cifrado, fugas de tokens o ataques XSS/CSRF). Al delegar la gestión de identidades a Clerk, el sistema adopta estándares de seguridad de nivel industrial respaldados por expertos, reduciendo drásticamente la superficie de ataque.   
* Por último, la naturaleza *stateless* de los tokens manejados por el IdP se alinea de forma nativa con la infraestructura PaaS elegida (**ADR-004**), garantizando que la sesión de los usuarios sobreviva sin problemas a los reinicios dinámicos de los contenedores. 

### **4\. Consecuencias**

| Consecuencias positivas | Trade-offs / costos |
| :---- | :---- |
| Ahorro de tiempo: Reduce drásticamente las horas de desarrollo y testing en flujos críticos de seguridad. | Dependencia de un tercero (Vendor Lock-in): El sistema queda atado a la disponibilidad de Clerk; si el servicio experimenta una caída global, el ingreso al sistema queda bloqueado. |
| Mayor seguridad: Garantía de cumplir con estándares robustos de la industria respaldados por un equipo especializado. | Modelo de costos: Si bien ofrece una capa gratuita generosa para el desarrollo, escalar a un volumen masivo de usuarios a futuro implicará un costo operativo mensual. |

## **ADR-007: Procesamiento para cálculo de trayectoria**

| ID | Título | Estado | Fecha |
| :---- | :---- | :---- | :---- |
| ADR-007 | Estrategia de procesamiento para cálculo de trayectoria | Aceptada | 04/06/2026 |

### **1\. Contexto**

El sistema debe calcular las coordenadas exactas de lanzamiento de un paquete desde una aeronave, procesando el peso de la carga y las condiciones climáticas actuales. Este proceso es crítico para la logística física. Se requiere que este cálculo con datos climáticos se complete en menos de 5 segundos (RNF3). Se debe definir qué patrón de procesamiento de datos utilizar para ejecutar el motor de física, considerando la dependencia de una API de clima externa y la necesidad de evitar retrasos en el flujo de trabajo del Remitente 

### **2\. Alternativas consideradas**

| Alternativa | Ventaja principal en este contexto | Desventaja / Motivo de descarte |
| :---- | :---- | :---- |
| Procesamiento Batch (Por lotes programado)  | Desacopla totalmente el cálculo del flujo de la interfaz web, procesando todos los envíos del día en una ventana de bajo tráfico nocturno.  | Altamente inexacto e inviable para el dominio. El clima cambia constantemente; un cálculo de viento hecho horas antes del vuelo resultaría en un lanzamiento fallido y pérdida de carga.  |
| Event-Driven Asíncrono (Cola de mensajes)  | El Remitente recibe una respuesta instantánea (en submilisegundos) al hacer clic, y el cálculo se procesa en segundo plano sin bloquear el hilo del servidor.  | Introduce consistencia eventual indeseada. Si el cálculo falla (ej. por tormenta severa o caída de la API), el Remitente ya creería que el paquete está "preparado" pero no tendría coordenadas reales, rompiendo la trazabilidad física.  |
| **Event-Driven Síncrono (Elegida)**  | Garantiza que el paquete no avance de estado en el sistema si no existe un cálculo de caída seguro y válido en ese preciso instante.  | (Esta fue la elegida) |

### **3\. Decisión tomada**

**Se decide:** Implementar el pipeline del cálculo de trayectoria mediante un enfoque orientado a eventos (*Event-driven*) de ejecución síncrona. El procesamiento se disparará en el momento exacto en que el Remitente cambie el estado del envío a "En preparación", y la petición HTTP se mantendrá abierta hasta que el cálculo finalice.

**Fundamentación:**

1. Garantiza la integridad operativa: la logística requiere que las coordenadas estén disponibles de inmediato para la tripulación. Procesar esto de forma síncrona evita que un paquete avance en el diagrama de estados sin tener su trayectoria definida y validada por el motor de física.  
2. El requerimiento de rendimiento RNF3 establece un límite de 5 segundos para este cálculo, tiempo suficiente para realizar el procesamiento síncrono y retornar el resultado en la misma petición al cliente web sin degradar severamente la experiencia de usuario.

### **4\. Consecuencias**

| Consecuencias positivas | Trade-offs / costos |
| :---- | :---- |
| **Feedback inmediato:** Si la velocidad del viento supera el límite operativo, el sistema bloquea la transición de estado y alerta al Remitente en el acto sobre las "Condiciones No Seguras".  | **Acoplamiento fuerte en tiempo de ejecución:** Si la API del clima no responde, el proceso de envíos se detiene momentáneamente, ya que la precisión es vital.  |
| **Garantía de datos:** Todo envío que logre llegar al estado "En preparación" o "Listo" tiene el 100% de garantía de poseer coordenadas válidas para el lanzamiento.  | **Bloqueo temporal:** Bloquea el hilo de respuesta de la petición HTTP durante los milisegundos o segundos que toma consultar la API del clima y resolver la balística.  |

