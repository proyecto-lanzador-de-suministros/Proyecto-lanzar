-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Solicitante" (
    "id_solicitante" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,

    CONSTRAINT "Solicitante_pkey" PRIMARY KEY ("id_solicitante")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id_admin" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "permisos_rol" TEXT,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "Remitente" (
    "id_remitente" TEXT NOT NULL,
    "nombre_base" TEXT NOT NULL,
    "latitud_base" DOUBLE PRECISION,
    "longitud_base" DOUBLE PRECISION,
    "ubicacion_gis" geometry(Point, 4326),
    "capacidad_pista" TEXT,

    CONSTRAINT "Remitente_pkey" PRIMARY KEY ("id_remitente")
);

-- CreateTable
CREATE TABLE "Tipo" (
    "id_tipo" TEXT NOT NULL,
    "nombre_categoria" TEXT NOT NULL,
    "peso_prioridad" INTEGER NOT NULL,

    CONSTRAINT "Tipo_pkey" PRIMARY KEY ("id_tipo")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id_producto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "peso_unitario" DOUBLE PRECISION NOT NULL,
    "id_tipo" TEXT NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "Stock_Base" (
    "id_stock" TEXT NOT NULL,
    "id_remitente" TEXT NOT NULL,
    "id_producto" TEXT NOT NULL,
    "cantidad_disponible" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_Base_pkey" PRIMARY KEY ("id_stock")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id_solicitud" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_actual" TEXT NOT NULL DEFAULT 'creada',
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "latitud_destino" DOUBLE PRECISION NOT NULL,
    "longitud_destino" DOUBLE PRECISION NOT NULL,
    "ubicacion_gis" geometry(Point, 4326),
    "id_solicitante" TEXT NOT NULL,
    "id_admin" TEXT,
    "id_remitente" TEXT,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "Detalle_Solicitud" (
    "id_detalle" TEXT NOT NULL,
    "id_solicitud" TEXT NOT NULL,
    "id_producto" TEXT NOT NULL,
    "cantidad_pedida" INTEGER NOT NULL,

    CONSTRAINT "Detalle_Solicitud_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "Historial_Estado" (
    "id_historial" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_anterior" TEXT,
    "estado_nuevo" TEXT NOT NULL,
    "id_solicitud" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "Historial_Estado_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id_notificacion" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_solicitud" TEXT NOT NULL,
    "id_usuario_destino" TEXT NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateTable
CREATE TABLE "Vuelo" (
    "id_vuelo" TEXT NOT NULL,
    "matricula_avion" TEXT NOT NULL,
    "piloto" TEXT NOT NULL,
    "combustible_estimado" DOUBLE PRECISION NOT NULL,
    "id_remitente" TEXT NOT NULL,

    CONSTRAINT "Vuelo_pkey" PRIMARY KEY ("id_vuelo")
);

-- CreateTable
CREATE TABLE "Lanzamiento" (
    "id_lanzamiento" TEXT NOT NULL,
    "latitud_calculada" DOUBLE PRECISION NOT NULL,
    "longitud_calculada" DOUBLE PRECISION NOT NULL,
    "punto_carp_gis" geometry(Point, 4326),
    "altitud" DOUBLE PRECISION NOT NULL,
    "datos_clima_api" JSONB NOT NULL,
    "id_vuelo" TEXT NOT NULL,
    "id_solicitud" TEXT NOT NULL,
    "id_remitente" TEXT NOT NULL,

    CONSTRAINT "Lanzamiento_pkey" PRIMARY KEY ("id_lanzamiento")
);

-- CreateTable
CREATE TABLE "Contenedor" (
    "id_contenedor" TEXT NOT NULL,
    "tipo_paracaidas" TEXT NOT NULL,
    "peso_maximo" DOUBLE PRECISION NOT NULL,
    "estado_mecanico" TEXT NOT NULL,
    "id_lanzamiento" TEXT NOT NULL,

    CONSTRAINT "Contenedor_pkey" PRIMARY KEY ("id_contenedor")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_Base_id_remitente_id_producto_key" ON "Stock_Base"("id_remitente", "id_producto");

-- AddForeignKey
ALTER TABLE "Solicitante" ADD CONSTRAINT "Solicitante_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remitente" ADD CONSTRAINT "Remitente_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "Tipo"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock_Base" ADD CONSTRAINT "Stock_Base_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Remitente"("id_remitente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock_Base" ADD CONSTRAINT "Stock_Base_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "Solicitante"("id_solicitante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "Administrador"("id_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Remitente"("id_remitente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle_Solicitud" ADD CONSTRAINT "Detalle_Solicitud_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "Solicitud"("id_solicitud") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle_Solicitud" ADD CONSTRAINT "Detalle_Solicitud_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Estado" ADD CONSTRAINT "Historial_Estado_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "Solicitud"("id_solicitud") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Estado" ADD CONSTRAINT "Historial_Estado_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "Solicitud"("id_solicitud") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_usuario_destino_fkey" FOREIGN KEY ("id_usuario_destino") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vuelo" ADD CONSTRAINT "Vuelo_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Remitente"("id_remitente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lanzamiento" ADD CONSTRAINT "Lanzamiento_id_vuelo_fkey" FOREIGN KEY ("id_vuelo") REFERENCES "Vuelo"("id_vuelo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lanzamiento" ADD CONSTRAINT "Lanzamiento_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "Solicitud"("id_solicitud") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lanzamiento" ADD CONSTRAINT "Lanzamiento_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Remitente"("id_remitente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenedor" ADD CONSTRAINT "Contenedor_id_lanzamiento_fkey" FOREIGN KEY ("id_lanzamiento") REFERENCES "Lanzamiento"("id_lanzamiento") ON DELETE RESTRICT ON UPDATE CASCADE;
