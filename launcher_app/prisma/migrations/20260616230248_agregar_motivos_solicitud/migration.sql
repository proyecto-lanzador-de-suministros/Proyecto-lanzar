-- AlterTable
ALTER TABLE "Solicitud" ADD COLUMN     "motivo_anulacion" TEXT,
ADD COLUMN     "motivo_cancelacion" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "estado_cuenta" TEXT NOT NULL DEFAULT 'PENDIENTE';
