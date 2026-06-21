import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  crearSolicitudUseCase,
  listarSolicitudesUseCase,
} from "@/src/container";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";
import { PrioridadSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "No autenticado." } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { latDestino, lonDestino, prioridad, productos } = body;

    if (!latDestino || !lonDestino || !prioridad || !productos) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Faltan campos requeridos." } },
        { status: 400 },
      );
    }

    const resultado = await crearSolicitudUseCase.ejecutar({
      id_usuario: userId,
      ubicacion_destino: {
        type: "Point",
        coordinates: [lonDestino, latDestino],
      },
      prioridad: prioridad as PrioridadSolicitud,
      productos: productos.map((p: any) => ({
        productoId: p.productoId,
        cantidad: p.cantidad,
      })),
    });

    const response = {
      solicitud: {
        id: resultado.solicitud.id_solicitud,
        fechaSolicitada: resultado.solicitud.fecha_solicitada.toISOString(),
        estado: resultado.solicitud.estado,
        latDestino: resultado.solicitud.ubicacion_destino.coordinates[1],
        lonDestino: resultado.solicitud.ubicacion_destino.coordinates[0],
        detalles: resultado.solicitud.productos.map((p) => ({
          productoId: p.productoId,
          cantidadSolicitada: p.cantidad,
        })),
      },
      asignada: resultado.asignada,
      stockFaltante: resultado.stockFaltante,
    };

    return NextResponse.json(response, {
      status: 201,
      headers: { Location: `/api/v1/solicitudes/${resultado.solicitud.id_solicitud}` },
    });
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}

export async function GET(request: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "No autenticado." } }, { status: 401 });
  }

  try {
    const rol = sessionClaims?.metadata?.rol as "solicitante" | "remitente" | "admin";
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado") ?? undefined;

    const solicitudes = await listarSolicitudesUseCase.ejecutar({
      rol,
      idUsuario: userId,
      idBase: userId,
      estadoFiltro: estado as any,
    });

    const response = solicitudes.map((s) => ({
      id: s.id_solicitud,
      fechaSolicitada: s.fecha_solicitada.toISOString(),
      estado: s.estado,
      latDestino: s.ubicacion_destino.coordinates[1],
      lonDestino: s.ubicacion_destino.coordinates[0],
      detalles: s.productos.map((p) => ({
        productoId: p.productoId,
        cantidadSolicitada: p.cantidad,
      })),
    }));

    return NextResponse.json(response);
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}
