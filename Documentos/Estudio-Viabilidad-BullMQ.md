# Estudio de Viabilidad: Mensajería Asíncrona y Notificaciones (BullMQ + Redis)

## 1. Descripción del componente

**Problema a resolver:**
El sistema requiere enviar notificaciones por correo electrónico a los usuarios ante cambios de estado en las solicitudes (creación, asignación, finalización, cancelación). Originalmente, esto se iba a delegar a una cola de mensajería persistente utilizando BullMQ + Redis, desacoplando el envío del hilo de respuesta HTTP.

**Datos que consume y produce:**
Consume eventos del dominio de notificaciones (cambios de estado, creación de solicitudes) disparados desde los casos de uso. Produce registros en la tabla `Notificacion` de la base de datos y correos electrónicos enviados a través de SMTP.

**Integración con la arquitectura:**
BullMQ se integraría en la capa de infraestructura de notificaciones, comunicándose con Redis para persistir la cola de trabajos. Un worker separado procesaría los envíos en segundo plano. El adaptador `NotificationServiceAdapter` sería el punto de conexión entre el dominio y la cola.

**Criticidad:**
Es un componente de criticidad media. Si bien la entrega de correos electrónicos es importante para la experiencia del usuario, el sistema ya garantiza la persistencia de las notificaciones mediante el registro en base de datos. La pérdida eventual de un email no compromete la integridad del sistema.

---

## 2. Alternativas exploradas

Durante el desarrollo, consideramos tres alternativas para resolver el envío asíncrono de notificaciones:

* **Alternativa A: BullMQ + Redis (Solución ideal descartada temporalmente)**
    * **¿Qué es?:** Cola de mensajería persistente respaldada por Redis, con un worker dedicado que procesa los envíos en segundo plano. Incluye reintentos automáticos con backoff exponencial, priorización de jobs y monitoreo de colas.
    * **¿Por qué es válida?:** Es el estándar de la industria para trabajos asíncronos en Node.js. Desacopla completamente el envío de notificaciones del request loop, garantiza reintentos ante fallos del proveedor SMTP y permite escalar el procesamiento horizontalmente.
    * **¿Por qué se descarta?:** BullMQ hace que Redis pase de ser opcional (solo para caché de clima, con degradación graceful) a obligatorio, aumentando la fricción para nuevos desarrolladores y para el CI/testing. Requiere un worker separado corriendo 24/7, monitoreo de colas y gestión de reintentos, lo que agrega un punto de fallo y complejidad operativa que no se justifica para el volumen actual de notificaciones. A esto se suma el costo de infraestructura (Redis + worker) en un proyecto universitario sin financiamiento.

* **Alternativa B: Envío directo por SMTP + registro en DB (Solución implementada)**
    * **¿Qué es?:** El adaptador `NotificationServiceAdapter` envía el correo electrónico mediante Nodemailer en modo fire-and-forget (sin `await`) y registra la notificación en la tabla `Notificacion` de Prisma. Si el envío falla, se loguea el error pero no se reintenta automáticamente.
    * **¿Por qué es válida?:** No requiere infraestructura adicional más allá del servidor SMTP. El registro en DB garantiza que la notificación no se pierde (un proceso manual o futuro batch job podría re-enviar emails fallidos consultando `Notificacion` donde `canal_envio IS NULL`). El modo fire-and-forget evita bloquear la respuesta al usuario, manteniendo el cumplimiento del RNF1 (respuesta en menos de 3 segundos).

* **Alternativa C: Servicio externo de terceros (ej. SendGrid, Resend, Mailgun)**
    * **¿Qué es?:** Servicios cloud con API HTTP que incorporan cola de envíos, reintentos automáticos, plantillas y análisis de entregabilidad.
    * **¿Por qué es válida?:** Delega toda la infraestructura de correo a un proveedor especializado, eliminando la necesidad de administrar un servidor SMTP y reintentos manuales.
    * **¿Por qué se descarta?:** Introduce una dependencia externa paga y vendor lock-in. Para el volumen actual de notificaciones (decenas, no miles), Nodemailer + SMTP cumple sin costo adicional. Tampoco resuelve la necesidad de una cola de mensajería para otros posibles usos futuros.

---

## 3. Criterios de evaluación

Para comparar las alternativas, utilizamos los siguientes criterios técnicos y de gestión:

* **Factibilidad técnica:** Qué tan viable es implementarlo dadas las herramientas del stack actual (Next.js, Prisma, Neon DB, Nodemailer).
* **Factibilidad temporal:** Probabilidad de completar el desarrollo, configuración y pruebas antes de la fecha límite.
* **Integración con la arquitectura:** Compatibilidad con nuestro patrón de Monolito Modular y arquitectura hexagonal.
* **Complejidad de mantenimiento:** Facilidad para que el equipo entienda, modifique o depure el código a futuro.
* **Escalabilidad futura:** Capacidad para soportar un volumen creciente de notificaciones sin reescribir el módulo.
* **Costo / dependencia externa:** Necesidad de contratar o depender de infraestructuras de terceros o servidores adicionales.

---

## 4. Tabla comparativa

| Criterio | Alternativa A (BullMQ + Redis) | Alternativa B (SMTP directo + DB) | Alternativa C (Servicio externo) |
| :--- | :--- | :--- | :--- |
| **Factibilidad técnica** | Media (requiere Redis + worker separado) | Alta | Alta |
| **Factibilidad temporal** | Baja | Alta | Alta |
| **Redis obligatorio vs. opcional** | Baja (lo vuelve obligatorio) | Alta (no requiere Redis) | Alta (no requiere Redis) |
| **Aislamiento del dominio (Hexagonal)** | Alta (solo cambiaría el adaptador) | Alta (el adaptador envía directo) | Alta (API envuelta en adaptador) |
| **Integración con la arquitectura** | Alta | Alta | Media (dependencia externa) |
| **Complejidad de mantenimiento** | Alta (worker, colas, monitoreo) | Baja | Baja (delegada al proveedor) |
| **Escalabilidad futura** | Alta | Media (sin cola, el request loop escala hasta cierto punto) | Alta |
| **Costo / dependencia externa** | Media (Redis $5/mes + worker) | Baja (solo SMTP) | Alta (costo por volumen) |

---

## 5. Conclusión y decisión

**¿Qué alternativa elegiría el grupo si tuviera más tiempo para implementarla? ¿Por qué?**
Elegiríamos la **Alternativa A (BullMQ + Redis)**. Es la solución más robusta para el desacople de notificaciones a largo plazo. Delegar el envío de correos a un worker separado evita que la latencia del proveedor SMTP compita con el request loop de Next.js, y los reintentos automáticos con backoff exponencial garantizan la entrega incluso ante fallos temporales del servidor de correo. BullMQ también abre la puerta a otros procesamientos asíncronos futuros (tareas programadas, generación de reportes, etc.).

**¿Qué obstáculos concretos impidieron la implementación en esta instancia?**
El obstáculo crítico fue que BullMQ hace que Redis pase de ser **opcional** a **obligatorio**. En la arquitectura actual Redis solo se usa para caché de clima con degradación graceful (ver ADR-005); si Redis no está disponible, el sistema sigue funcionando sin caché. Con BullMQ, una caída de Redis detendría el envío de notificaciones. Además:
1. BullMQ requiere un worker separado corriendo 24/7, agregando un punto de fallo y complejidad operativa.
2. El costo de infraestructura (Redis + worker), si bien bajo, no está justificado para un proyecto universitario sin financiamiento.
3. El volumen actual de notificaciones (decenas, no miles) no demanda una cola persistente con reintentos automáticos — el registro en DB ya garantiza que la notificación no se pierde.

**¿Cómo se integraría esta alternativa en la arquitectura a futuro?**
En una futura iteración, la integración requeriría modificar únicamente el `NotificationServiceAdapter`. En lugar de llamar a `sendEmail()` de forma directa, el adaptador encolaría un job en BullMQ con los datos del destinatario y la plantilla del correo. Un worker separado consumiría la cola y ejecutaría el envío con reintentos automáticos. El resto del sistema (puertos, casos de uso, contenedor de dependencias) no cambiaría, ya que el contrato del puerto `forNotifying` se mantiene intacto. Esto es posible gracias a la arquitectura hexagonal, que aísla los detalles de infraestructura del dominio.

## Referencias

- ADR-003: Decisión original de cola asíncrona con BullMQ + Redis
- `justificacion-bullmq.md`: Documento interno de decisión y simulación actual
- `src/modules/notificaciones/infrastructure/adapters/NotificationServiceAdapter.ts`: Adaptador actual sin cola
- `src/modules/notificaciones/domain/ports/forNotifying.port.ts`: Puerto de notificaciones
