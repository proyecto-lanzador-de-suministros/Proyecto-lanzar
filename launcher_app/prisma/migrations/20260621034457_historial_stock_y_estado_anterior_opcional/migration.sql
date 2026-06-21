/*
  Warnings:

  - You are about to drop the column `id_usuario_actor` on the `Historial_Stock` table. All the data in the column will be lost.
  - Added the required column `id_actor` to the `Historial_Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Historial_Stock" DROP CONSTRAINT "Historial_Stock_id_usuario_actor_fkey";

-- AlterTable
ALTER TABLE "Historial_Stock" DROP COLUMN "id_usuario_actor",
ADD COLUMN     "id_actor" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Historial_Stock" ADD CONSTRAINT "Historial_Stock_id_actor_fkey" FOREIGN KEY ("id_actor") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
