# Diagramas de secuencia del sistema SUMI
 + generados a partir de los casos de uso especificados
## 1. Ciclo de vida principal de la solicitud
```mermaid
sequenceDiagram
    actor S as Solicitante
    participant Sys as Sistema
    actor R as Remitente

    %% CU-08 y CU-09
    S->>Sys: Crea solicitud (Coordenada, suministros)
    activate Sys
    Sys->>Sys: Controla stock (CU-09)
    alt Stock suficiente
        Sys->>Sys: Asigna Remitente
        Sys-->>S: Notifica aprobación
        Sys-->>R: Notifica asignación
    else Stock insuficiente
        Sys-->>S: Notifica rechazo (Falta stock)
    end
    deactivate Sys

    %% CU-12
    R->>Sys: Selecciona solicitud asignada
    activate Sys
    R->>Sys: Presiona "Comenzar Preparación"
    Sys->>Sys: Cambia estado a "En preparación"
    Sys-->>S: Notifica preparación en curso
    deactivate Sys

    %% CU-13
    R->>Sys: Ingresa cantidad de cajas y marca "Lista"
    activate Sys
    Sys->>Sys: Cambia estado a "Listo"
    Sys-->>S: Notifica solicitud lista para envío
    deactivate Sys

    %% CU-14
    R->>Sys: Registra envío del paquete
    activate Sys
    Sys->>Sys: Cambia estado a "En Camino"
    Sys-->>S: Notifica solicitud en camino
    deactivate Sys

    %% CU-15
    R->>Sys: Registra lanzamiento
    activate Sys
    Sys->>Sys: Calcula coordenada de caída (CARP)
    Sys->>Sys: Cambia estado a "Lanzada"
    Sys-->>S: Notifica lanzamiento
    deactivate Sys

    %% CU-16
    S->>Sys: Confirma recepción del paquete
    activate Sys
    Sys->>Sys: Cambia estado a "Completada"
    Sys-->>R: Notifica recepción al remitente
    deactivate Sys
```
## 2. Interrupciones del Flujo (Cancelaciones & Anulaciones)
```mermaid
sequenceDiagram
    actor S as Solicitante
    actor A as Admin/Remitente
    participant Sys as Sistema

    %% CU-10 Cancelación
    rect rgb(255, 235, 235)
    note right of S: CU-10: Cancelar Solicitud (Estados tempranos)
    S->>Sys: Solicita cancelar (Ingresa motivo opcional)
    activate Sys
    Sys->>Sys: Verifica estado válido
    Sys->>Sys: Estado: "Cancelada" y libera stock
    Sys-->>S: Confirma cancelación exitosa
    Sys-->>A: Notifica al remitente asignado
    deactivate Sys
    end

    %% CU-11 Anulación
    rect rgb(255, 245, 238)
    note right of A: CU-11: Anular Solicitud (Flujo avanzado)
    A->>Sys: Solicita anular solicitud activa
    activate Sys
    Sys->>Sys: Valida que no esté completada
    Sys->>Sys: Estado: "Anulada" y registra motivo
    Sys-->>A: Confirma anulación correcta
    Sys-->>S: Notifica anulación de solicitud
    deactivate Sys
    end
```
## 3. Registro y Autenticación de Cuentas (Enfoque Remitente)
```mermaid
sequenceDiagram
    actor U as Usuario (Remitente)
    participant Sys as Sistema
    actor A as Administrador

    %% CU-01
    U->>Sys: Completa campos de registro
    activate Sys
    Sys->>Sys: Valida información
    Sys-->>U: Confirma creación (Pendiente de aprobación)
    deactivate Sys

    %% CU-02
    A->>Sys: Revisa cuentas pendientes
    activate Sys
    Sys-->>A: Muestra información del usuario
    A->>Sys: Aprueba cuenta
    Sys->>Sys: Estado: "Aprobada"
    Sys-->>U: Notifica cuenta aprobada
    deactivate Sys

    %% CU-06
    U->>Sys: Ingresa credenciales de Login
    activate Sys
    Sys->>Sys: Valida credenciales e identifica rol
    Sys-->>U: Inicia sesión y muestra el panel
    deactivate Sys
```
## 4. Gestión independiente de Stock
```mermaid
sequenceDiagram
    actor R as Remitente / Admin
    participant Sys as Sistema

    %% CU-17
    R->>Sys: Accede a gestión de stock
    activate Sys
    Sys-->>R: Muestra stock por tipo de suministro
    deactivate Sys

    %% CU-18
    R->>Sys: Ingresa nuevas cantidades
    activate Sys
    Sys->>Sys: Valida que sean números positivos
    Sys->>Sys: Actualiza stock y registra historial
    Sys-->>R: Muestra mensaje de confirmación
    deactivate Sys
```
