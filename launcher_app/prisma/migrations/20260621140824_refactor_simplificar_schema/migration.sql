-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" TEXT NOT NULL,
    "contrasena" TEXT,
    "estado_cuenta" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "administradorId_admin" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Solicitante" (
    "id_solicitante" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,

    CONSTRAINT "Solicitante_pkey" PRIMARY KEY ("id_solicitante")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id_admin" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "permisos_rol" TEXT NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "Remitente" (
    "id_remitente" TEXT NOT NULL,
    "nombre_base" TEXT NOT NULL,
    "latitud_base" DOUBLE PRECISION NOT NULL,
    "longitud_base" DOUBLE PRECISION NOT NULL,
    "capacidad_pista" TEXT NOT NULL,

    CONSTRAINT "Remitente_pkey" PRIMARY KEY ("id_remitente")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id_producto" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "peso_unitario" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "Stock_Base" (
    "id_stock" TEXT NOT NULL,
    "id_remitente" TEXT NOT NULL,
    "id_producto" TEXT NOT NULL,
    "cantidad_disponible" INTEGER NOT NULL,
    "cantidad_reservada" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_Base_pkey" PRIMARY KEY ("id_stock")
);

-- CreateTable
CREATE TABLE "Historial_Stock" (
    "id_historial_stock" TEXT NOT NULL,
    "id_remitente" TEXT NOT NULL,
    "id_producto" TEXT NOT NULL,
    "cantidad_anterior" INTEGER NOT NULL,
    "cantidad_nueva" INTEGER NOT NULL,
    "id_actor" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historial_Stock_pkey" PRIMARY KEY ("id_historial_stock")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id_solicitud" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_actual" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL,
    "latitud_destino" DOUBLE PRECISION NOT NULL,
    "longitud_destino" DOUBLE PRECISION NOT NULL,
    "id_solicitante" TEXT NOT NULL,
    "id_admin" TEXT,
    "id_remitente" TEXT,
    "motivo_cancelacion" TEXT,
    "motivo_anulacion" TEXT,

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
    "id_solicitud" TEXT,
    "id_usuario_destino" TEXT NOT NULL,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateTable
CREATE TABLE "Base" (
    "id_base" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "Base_pkey" PRIMARY KEY ("id_base")
);

-- CreateTable
CREATE TABLE "Envio" (
    "id_envio" TEXT NOT NULL,
    "id_solicitud" TEXT NOT NULL,
    "id_base" TEXT NOT NULL,
    "matricula_avion" TEXT,
    "piloto" TEXT,
    "latitud_calculada" DOUBLE PRECISION,
    "longitud_calculada" DOUBLE PRECISION,
    "altitud" DOUBLE PRECISION,
    "datos_clima" JSONB,
    "estado_envio" TEXT NOT NULL DEFAULT 'programado',
    "codigo_seguimiento" TEXT,
    "fecha_hora" TIMESTAMP(3),
    "fecha_salida" TIMESTAMP(3),
    "entrega_real" TIMESTAMP(3),

    CONSTRAINT "Envio_pkey" PRIMARY KEY ("id_envio")
);

-- CreateTable
CREATE TABLE "Contenedor" (
    "id_contenedor" TEXT NOT NULL,
    "tipo_paracaidas" TEXT NOT NULL,
    "peso_maximo" DOUBLE PRECISION NOT NULL,
    "estado_mecanico" TEXT NOT NULL,
    "id_envio" TEXT NOT NULL,

    CONSTRAINT "Contenedor_pkey" PRIMARY KEY ("id_contenedor")
);

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_administradorId_admin_fkey" FOREIGN KEY ("administradorId_admin") REFERENCES "Administrador"("id_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitante" ADD CONSTRAINT "Solicitante_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remitente" ADD CONSTRAINT "Remitente_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock_Base" ADD CONSTRAINT "Stock_Base_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Remitente"("id_remitente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock_Base" ADD CONSTRAINT "Stock_Base_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Stock" ADD CONSTRAINT "Historial_Stock_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Remitente"("id_remitente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Stock" ADD CONSTRAINT "Historial_Stock_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Stock" ADD CONSTRAINT "Historial_Stock_id_actor_fkey" FOREIGN KEY ("id_actor") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_usuario_destino_fkey" FOREIGN KEY ("id_usuario_destino") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "Solicitud"("id_solicitud") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_id_base_fkey" FOREIGN KEY ("id_base") REFERENCES "Base"("id_base") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenedor" ADD CONSTRAINT "Contenedor_id_envio_fkey" FOREIGN KEY ("id_envio") REFERENCES "Envio"("id_envio") ON DELETE CASCADE ON UPDATE CASCADE;

