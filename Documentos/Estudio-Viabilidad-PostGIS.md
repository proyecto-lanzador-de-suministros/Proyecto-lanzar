# Estudio de Viabilidad: Manejo de Datos Espaciales y Geolocalización (PostGIS)

## 1. Descripción del componente

**Problema a resolver:**
El sistema requiere gestionar y calcular variables espaciales complejas, como la definición de zonas de exclusión (polígonos) y el cálculo de áreas de caída libre (puntos y radios) para los paquetes. Originalmente, esto se iba a delegar al motor de base de datos relacional mediante la extensión espacial PostGIS.

**Datos que consume y produce:**
Consume coordenadas geográficas (latitud y longitud) provenientes del Frontend (mapas) y del motor de cálculo de trayectorias. Produce confirmaciones de validez espacial (ej. "el punto de caída está dentro de una zona permitida") y cálculos de distancias.

**Integración con la arquitectura:**
Se integra directamente en la capa de Persistencia de Datos (Base de Datos PostgreSQL alojada en Neon) y debe comunicarse bidireccionalmente con el Backend (Monolito Node.js) a través del ORM establecido para el proyecto (Prisma).

**Criticidad:**
Es un componente de criticidad media-alta. Si bien el cálculo es vital para la logística física, temporalmente se puede mitigar delegando la carga matemática a la memoria del servidor (Backend) en lugar de la base de datos.

---

## 2. Alternativas exploradas

Durante el desarrollo, consideramos tres alternativas para resolver el manejo de las coordenadas geográficas:

* **Alternativa A: PostgreSQL con extensión PostGIS (Solución ideal descartada temporalmente)**
    * **¿Qué es?:** Extender nuestra base de datos PostgreSQL actual (Neon) con PostGIS para obtener tipos de datos nativos como `Geometry` y funciones de cálculo de distancias integradas.
    * **¿Por qué es válida?:** Es el estándar de la industria para sistemas relacionales con necesidades geoespaciales. Garantiza alta precisión y rendimiento en consultas complejas.
    * **¿Por qué se descarta?:** Prisma ORM no soporta tipos `Geometry`/`Geography` de PostGIS de forma nativa. Implementarlo obligaría a escribir migraciones manuales en SQL puro y reemplazar los repositorios type-safe por raw queries, rompiendo la seguridad de tipos y el patrón de adaptadores de la arquitectura hexagonal. A esto se suma que Neon (serverless PostgreSQL) tiene soporte limitado de extensiones en su capa gratuita.

* **Alternativa B: String JSON en PostgreSQL + Cálculo en Backend (Solución implementada)**
    * **¿Qué es?:** Almacenar la latitud y longitud como un `String` con formato JSON (`{"lat": -38.71, "lng": -62.26}`) en las tablas actuales, realizando los cálculos de distancias usando la fórmula de Haversine directamente en los servicios de Node.js. El dominio trabaja con el tipo `PuntoGeometria` (GeoJSON) y los adaptadores de repositorio se encargan de serializar/deserializar.
    * **¿Por qué es válida?:** Es 100% compatible de forma nativa con el ORM Prisma, no requiere configurar extensiones en la infraestructura de Neon, permite cumplir con el plazo de entrega y mantiene el tipo `PuntoGeometria` como interfaz del dominio, lo que facilita una migración futura a PostGIS sin modificar los casos de uso.

* **Alternativa C: Base de datos NoSQL externa orientada a documentos (ej. MongoDB con GeoJSON)**
    * **¿Qué es?:** Levantar un microservicio separado apoyado en una base documental que soporte nativamente índices geoespaciales (GeoJSON).
    * **¿Por qué es válida?:** Delega la complejidad a un motor diseñado para manejar objetos JSON complejos y polígonos sin fricción de esquemas.
    * **¿Por qué se descarta?:** Rompe la base relacional del modelo de dominio (ver ADR-002) e introduce un nuevo servicio con su propia infraestructura, aumentando la complejidad operativa y el costo.

---

## 3. Criterios de evaluación

Para comparar las alternativas, utilizamos los siguientes criterios técnicos y de gestión:

* **Factibilidad técnica:** Qué tan viable es implementarlo dadas las herramientas del stack actual (Prisma ORM, Neon DB, Node.js).
* **Factibilidad temporal:** Probabilidad de completar el desarrollo, migraciones y pruebas exhaustivas antes de la fecha límite (hoy).
* **Integración con la arquitectura:** Compatibilidad con nuestro patrón de Monolito Modular y persistencia relacional.
* **Complejidad de mantenimiento:** Facilidad para que el equipo entienda, modifique o depure el código a futuro.
* **Escalabilidad futura:** Capacidad para soportar miles de consultas geográficas simultáneas o polígonos complejos.
* **Costo / dependencia externa:** Necesidad de contratar o depender de infraestructuras de terceros o servidores adicionales.

---

## 4. Tabla comparativa

| Criterio | Alternativa A (PostGIS) | Alternativa B (String JSON + Backend) | Alternativa C (MongoDB GeoJSON) |
| :--- | :--- | :--- | :--- |
| **Factibilidad técnica** | Baja (Prisma sin soporte nativo; raw queries riesgosas) | Alta | Alta |
| **Factibilidad temporal** | Baja | Alta | Baja |
| **Compatibilidad con ORM (Prisma)** | Baja (requiere rodear con SQL puro) | Alta (tipo String nativo) | N/A (otro motor) |
| **Aislamiento del dominio (Hexagonal)** | Media (el adaptador debería llamar raw SQL) | Alta (el dominio usa PuntoGeometria, el adaptador serializa) | Baja (nuevo servicio externo) |
| **Integración con la arquitectura** | Alta | Alta | Baja (rompe el monolito BD) |
| **Complejidad de mantenimiento** | Alta (requiere Raw Queries) | Baja | Alta |
| **Escalabilidad futura** | Alta | Media (Haversine en backend escala ok para volumen actual) | Alta |
| **Costo / dependencia externa** | Baja | Baja | Alta (nuevo servidor/servicio) |

---

## 5. Conclusión y decisión

**¿Qué alternativa elegiría el grupo si tuviera más tiempo para implementarla? ¿Por qué?**
Elegiríamos la **Alternativa A (PostGIS)**. Es la solución más robusta y performante a largo plazo. Delegar la carga de validaciones espaciales masivas (ej. verificar cruces de polígonos climáticos) al motor de base de datos evita sobrecargar la memoria y CPU de nuestro entorno en Node.js, manteniendo las latencias de respuesta al mínimo (cumpliendo mejor nuestros requerimientos no funcionales de rendimiento).

**¿Qué obstáculos concretos impidieron la implementación en esta instancia?**
El obstáculo crítico fue la incompatibilidad entre nuestro ORM (Prisma) y los tipos de datos espaciales. Prisma no soporta de forma nativa la creación y mutación de campos `Geometry` o `Geography`. Si bien la base de datos subyacente (Neon DB) sí lo soporta, forzar la integración requería:
1. Escribir migraciones manuales en SQL puro, rompiendo la filosofía de automatización del ORM.
2. Reemplazar todos nuestros repositorios seguros (Type-safe) por *Raw Queries* extensas.
Afrontar este cambio estructural a horas de la entrega presentaba un riesgo inaceptable de romper la integridad del sistema actual.

**¿Cómo se integraría esta alternativa en la arquitectura a futuro?**
En una futura iteración (Sprint), la integración requeriría modificar el pipeline de datos. Mantendríamos Prisma para las operaciones CRUD relacionales estándar, pero incorporaríamos un cliente ligero adicional (como `pg` básico o *Kysely*) configurado exclusivamente para conectarse a Neon y ejecutar las consultas espaciales nativas mediante PostGIS, encapsulando esto dentro de un adaptador específico en nuestra arquitectura hexagonal para no contaminar el resto del dominio. Los datos `Float` actuales se migrarían a columnas espaciales mediante un script de transición.