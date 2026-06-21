-- CreateTable
CREATE TABLE "Historial_Stock" (
    "id_historial_stock" TEXT NOT NULL,
    "id_remitente" TEXT NOT NULL,
    "id_producto" TEXT NOT NULL,
    "cantidad_anterior" INTEGER NOT NULL,
    "cantidad_nueva" INTEGER NOT NULL,
    "id_usuario_actor" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historial_Stock_pkey" PRIMARY KEY ("id_historial_stock")
);

-- AddForeignKey
ALTER TABLE "Historial_Stock" ADD CONSTRAINT "Historial_Stock_id_remitente_fkey" FOREIGN KEY ("id_remitente") REFERENCES "Remitente"("id_remitente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Stock" ADD CONSTRAINT "Historial_Stock_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "Producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historial_Stock" ADD CONSTRAINT "Historial_Stock_id_usuario_actor_fkey" FOREIGN KEY ("id_usuario_actor") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
