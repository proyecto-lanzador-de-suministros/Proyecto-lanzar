# Máquina de Estados de la Solicitud — Versión Implementada

Basado en la tabla canónica de `Documentos/` y la implementación real en `Solicitud.ts`.

## Estados Canónicos (10)

```
Creada, Rechazada, Asignada, En Preparación, Listo,
En Camino, Lanzada, Completada, Cancelada, Anulada
```

> **Nota:** El estado `Aprobada` existía en la documentación original pero fue eliminado en la implementación. `ControlarSolicitud` (CU-09) salta directo de `Creada` → `Asignada` (o `Rechazada`) en un solo paso.

## Tabla de Transiciones Canónica

| Desde | Hacia | Quién ejecuta |
|---|---|---|
| *(ninguno)* | **Creada** | Solicitante, Admin |
| **Creada** | **Asignada** | Sistema (stock suficiente + asigna remitente) |
| **Creada** | **Rechazada** | Sistema (stock insuficiente) |
| **Creada** | **Cancelada** | Solicitante, Admin |
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
Creada ──→ Asignada ──→ En Preparación ──→ Listo ──→ En Camino ──→ Lanzada ──→ Completada
    │           │              │              │            │             │
    │           ├── Cancelada  │              │            │             ├── Anulada
    │           │              ├── Anulada    ├── Anulada  ├── Anulada   │
    ├── Rechazada              │              │            │             │
    │                          │              │            │             │
    └── Cancelada              └──────────────┴────────────┴──────────────┘
                               (Anulada desde Asignada en adelante, ejecutado por Admin/Remitente)
```

## Resumen de Cambios Respecto a la Documentación Original

| CU | Cambio |
|---|---|
| **CU-09** | Eliminado el estado intermedio `Aprobada`. El flujo unificado es: `Creada` → verifica stock → asigna remitente → `Asignada` (o `Rechazada`). |
| **CU-10** | `Aprobada` eliminado de los estados cancelables. Ahora solo `{Creada, Asignada}`. |
| **CU-11** | `Aprobada` eliminado de las precondiciones/excepciones. Solo anulable desde `{Asignada, En Preparación, Listo, En Camino, Lanzada}`. |
| **CU-19** | Cambiado filtro de `Aprobada` → `Asignada`. |
| **CU-20** | Actualizado listado de estados y flujo canónico. |
