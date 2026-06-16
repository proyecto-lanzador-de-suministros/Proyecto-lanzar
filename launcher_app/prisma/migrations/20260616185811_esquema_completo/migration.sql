/*
  Warnings:

  - You are about to drop the column `punto_carp_gis` on the `Lanzamiento` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion_gis` on the `Remitente` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion_gis` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `fechaRegistro` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `usuario` to the `Administrador` table without a default value. This is not possible if the table is not empty.
  - Made the column `permisos_rol` on table `Administrador` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado_anterior` on table `Historial_Estado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latitud_base` on table `Remitente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitud_base` on table `Remitente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `capacidad_pista` on table `Remitente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contacto` on table `Solicitante` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Administrador" DROP CONSTRAINT "Administrador_id_admin_fkey";

-- DropForeignKey
ALTER TABLE "Contenedor" DROP CONSTRAINT "Contenedor_id_lanzamiento_fkey";

-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_id_usuario_destino_fkey";

-- DropIndex
DROP INDEX "Stock_Base_id_remitente_id_producto_key";

-- DropIndex
DROP INDEX "Usuario_email_key";

-- AlterTable
ALTER TABLE "Administrador" ADD COLUMN     "usuario" TEXT NOT NULL,
ALTER COLUMN "permisos_rol" SET NOT NULL;

-- AlterTable
ALTER TABLE "Historial_Estado" ALTER COLUMN "estado_anterior" SET NOT NULL;

-- AlterTable
ALTER TABLE "Lanzamiento" DROP COLUMN "punto_carp_gis";

-- AlterTable
ALTER TABLE "Remitente" DROP COLUMN "ubicacion_gis",
ALTER COLUMN "latitud_base" SET NOT NULL,
ALTER COLUMN "longitud_base" SET NOT NULL,
ALTER COLUMN "capacidad_pista" SET NOT NULL;

-- AlterTable
ALTER TABLE "Solicitante" ALTER COLUMN "contacto" SET NOT NULL;

-- AlterTable
ALTER TABLE "Solicitud" DROP COLUMN "ubicacion_gis",
ALTER COLUMN "estado_actual" DROP DEFAULT,
ALTER COLUMN "prioridad" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Stock_Base" ALTER COLUMN "cantidad_disponible" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "email",
DROP COLUMN "fechaRegistro",
ADD COLUMN     "administradorId_admin" TEXT,
ADD COLUMN     "contrasena" TEXT;

-- CreateTable
CREATE TABLE "AdministradorUsuario" (
    "id_usuario" TEXT NOT NULL,

    CONSTRAINT "AdministradorUsuario_pkey" PRIMARY KEY ("id_usuario")
);

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_administradorId_admin_fkey" FOREIGN KEY ("administradorId_admin") REFERENCES "Administrador"("id_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "AdministradorUsuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministradorUsuario" ADD CONSTRAINT "AdministradorUsuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_usuario_destino_fkey" FOREIGN KEY ("id_usuario_destino") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contenedor" ADD CONSTRAINT "Contenedor_id_lanzamiento_fkey" FOREIGN KEY ("id_lanzamiento") REFERENCES "Lanzamiento"("id_lanzamiento") ON DELETE CASCADE ON UPDATE CASCADE;
