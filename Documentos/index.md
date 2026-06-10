# Documentación del Proyecto "Lanzar Suministros"

Esta carpeta contiene toda la documentación del proyecto.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `api.yaml` | Especificación OpenAPI 3.0.3 del contrato REST del sistema (autenticación, solicitudes, bases/stock) |
| `apiswaggerscreenshot.png` | Captura de pantalla del Swagger UI de la API |
| `cu-01-05.md` | Casos de uso 1 a 5: Gestión de usuarios y cuentas (crear, aprobar, cambiar info. login, cambiar info. cuenta, eliminar cuenta) |
| `cu-06-10.md` | Casos de uso 6 a 10: Sesión y solicitudes (iniciar/cerrar sesión, crear/controlar/cancelar solicitud) |
| `cu-11-15.md` | Casos de uso 11 a 15: Logística de solicitudes (anular, preparación, listo, en camino, lanzamiento) |
| `cu-12-20.md` | Casos de uso 16 a 20: Finalización y gestión (confirmar recibida, consultar/actualizar stock, consultar solicitudes pendientes/estado) |
| `Decisiones Arquitectónicas (ADRs).md` | ADR-001 a ADR-007: decisiones arquitectónicas (estilo backend, BD, notificaciones, infraestructura, caché, autenticación, trayectoria) |
| `Diagrama-ER.md` | Diagrama entidad-relación del modelo de datos en Mermaid |
| `Diagramas-de-Secuencia.md` | Diagramas de secuencia UML del flujo de solicitudes, cancelaciones, autenticación y gestión de stock |
| `Modelo relacional.md` | Modelo relacional con tablas, claves primarias y foráneas del esquema de base de datos |
| `Pipeline de Datos.md` | Pipeline de datos: cálculo de trayectoria de caída libre y reserva/gestión de stock |
