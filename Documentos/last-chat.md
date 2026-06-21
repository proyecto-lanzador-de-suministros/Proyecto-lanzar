# Máquina de Estados de la Solicitud — Versión Corregida

Basado en la tabla canónica y los CU-08 a CU-20 de `Documentos/`.

## Estados Canónicos (11)

```
Creada, Aprobada, Rechazada, Asignada, En Preparación, Listo,
En Camino, Lanzada, Completada, Cancelada, Anulada
```

## Tabla de Transiciones Canónica

| Desde | Hacia | Quién ejecuta |
|---|---|---|
| *(ninguno)* | **Creada** | Solicitante, Admin |
| **Creada** | **Aprobada** | Sistema (stock suficiente) |
| **Creada** | **Rechazada** | Sistema (stock insuficiente) |
| **Creada** | **Cancelada** | Solicitante, Admin |
| **Aprobada** | **Asignada** | Sistema o Admin (asigna remitente) |
| **Aprobada** | **Cancelada** | Solicitante, Admin |
| **Asignada** | **Cancelada** | Solicitante, Admin |
| **Asignada** | **En Preparación** | Remitente |
| **Asignada** | **Anulada** | Admin, Remitente |
| **En Preparación** | **Listo** | Remitente |
| **En Preparación** | **Anulada** | Admin, Remitente |
| **Listo** | **En Camino** | Remitente, Admin |
| **Listo** | **Anulada** | Admin, Remitente |
| **En Camino** | **Lanzada** | Remitente, Admin |
| **En Camino** | **Anulada** | Admin, Remitente |
| **Lanzada** | **Completada** | Solicitante, Admin |
| **Lanzada** | **Anulada** | Admin, Remitente |

## Estados Terminales (sin transiciones salientes)

**Completada, Cancelada, Rechazada, Anulada**

## Diagrama de Flujo Canónico

```
Creada ──→ Aprobada ──→ Asignada ──→ En Preparación ──→ Listo ──→ En Camino ──→ Lanzada ──→ Completada
    │            │            │              │              │            │             │
    │            │            ├── Cancelada  │              │            │             ├── Anulada
    │            ├── Cancelada│              ├── Anulada    ├── Anulada  ├── Anulada   │
    ├── Rechazada│            │              │              │            │             │
    │            │            │              │              │            │             │
    └── Cancelada┘            └──────────────┴──────────────┴────────────┴─────────────┘
                              (Anulada desde Asignada en adelante, ejecutado por Admin/Remitente)
```

## Resumen de Correcciones Aplicadas

| CU | Cambio |
|---|---|
| **CU-09** | Separado el flujo en dos pasos: Creada → Aprobada (stock suficiente), y opcionalmente Aprobada → Asignada (asignación de remitente). Corregida notificación: va al solicitante, no al remitente. |
| **CU-10** | Ampliada excepción E1 para listar explícitamente todos los estados no cancelables. |
| **CU-11** | Precondición 3 acotada: solo anulable desde Asignada, En Preparación, Listo, En Camino o Lanzada. Excepciones actualizadas para cubrir Creada, Aprobada y Rechazada. |
| **CU-19** | Sin cambios — ya describía correctamente "Aprobada" como estado pendiente de asignación. |
| **CU-20** | Comentario expandido: incluye el flujo canónico y los estados terminales. |
