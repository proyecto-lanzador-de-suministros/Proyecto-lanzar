# Diagrama Entidad Relación
(basado en el original hecho por nacho)
 + **Herencia de Usuario** — `Remitente`, `Administrador` y `Solicitante` heredan de `Usuario` mediante una relación uno a uno opcional, tal como indica la nota del diagrama original.
 + **Historial de Estado con usuario** — incluí la relación de `HISTORIAL_ESTADO` con `USUARIO` para poder saber quién realizó cada cambio de estado
 + **Notificación** — la incluí y la vinculé tanto a `SOLICITUD` como a `USUARIO`, para que se pueda recuperar el historial de actualizaciones al volver a la sesión.
 + **Lanzamiento ↔ Remitente** — el lanzamiento sale del remitente, por lo que el stock se descuenta desde ahí. No tracé una línea directa entre `Remitente` y `Lanzamiento` como alternativa separada, sino que la relación queda clara mediante la FK.
 + **Entidad `Avion`** — la omití por el momento hasta confirmar su integración. Si la confirman, se puede agregar fácilmente como entidad relacionada a `Vuelo`.
 + **Stock-Base** — la mantuve vinculada tanto a `Producto` como a `Contenedor`, representando el inventario físico por contenedor.


```mermaid
erDiagram
  USUARIO {
    int id PK
    string nombre
    string email
    string password
  }
  REMITENTE {
    int id PK
    int usuario_id FK
  }
  ADMINISTRADOR {
    int id PK
    int usuario_id FK
  }
  SOLICITANTE {
    int id PK
    int usuario_id FK
  }
  SOLICITUD {
    int id PK
    int solicitante_id FK
    int administrador_id FK
    int lanzamiento_id FK
    datetime fecha
    string estado
  }
  HISTORIAL_ESTADO {
    int id PK
    int solicitud_id FK
    int usuario_id FK
    string estado_anterior
    string estado_nuevo
    datetime fecha
  }
  NOTIFICACION {
    int id PK
    int solicitud_id FK
    int usuario_id FK
    string mensaje
    datetime fecha
    boolean leida
  }
  LANZAMIENTO {
    int id PK
    int remitente_id FK
    int vuelo_id FK
    datetime fecha
    int stock_disponible
  }
  VUELO {
    int id PK
    int contenedor_id FK
    string codigo
    datetime fecha_vuelo
  }
  CONTENEDOR {
    int id PK
    string descripcion
    int capacidad
  }
  DETALLE_SOLICITUD {
    int id PK
    int solicitud_id FK
    int producto_id FK
    int cantidad
  }
  PRODUCTO {
    int id PK
    int tipo_id FK
    string nombre
    string descripcion
  }
  TIPO {
    int id PK
    string nombre
  }
  STOCK_BASE {
    int id PK
    int producto_id FK
    int contenedor_id FK
    int cantidad
  }

  USUARIO ||--o{ REMITENTE : "es"
  USUARIO ||--o{ ADMINISTRADOR : "es"
  USUARIO ||--o{ SOLICITANTE : "es"
  SOLICITANTE ||--o{ SOLICITUD : "realiza"
  ADMINISTRADOR ||--o{ SOLICITUD : "gestiona"
  LANZAMIENTO ||--o{ SOLICITUD : "contiene"
  SOLICITUD ||--o{ HISTORIAL_ESTADO : "tiene"
  USUARIO ||--o{ HISTORIAL_ESTADO : "registra"
  SOLICITUD ||--o{ NOTIFICACION : "genera"
  USUARIO ||--o{ NOTIFICACION : "recibe"
  SOLICITUD ||--o{ DETALLE_SOLICITUD : "incluye"
  PRODUCTO ||--o{ DETALLE_SOLICITUD : "aparece en"
  REMITENTE ||--o{ LANZAMIENTO : "origina"
  VUELO ||--o{ LANZAMIENTO : "asocia"
  CONTENEDOR ||--|| VUELO : "transporta"
  PRODUCTO ||--o{ STOCK_BASE : "almacenado en"
  CONTENEDOR ||--o{ STOCK_BASE : "contiene"
  TIPO ||--o{ PRODUCTO : "clasifica"
```
