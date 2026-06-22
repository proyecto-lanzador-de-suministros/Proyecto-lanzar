import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  confirmarRecibidaUseCase,
  historialRepository,
  registrarEnCaminoUseCase,
  registrarEnPreparacionUseCase,
  registrarLanzadaUseCase,
  registrarListaUseCase,
  solicitudRepository,
} from "@/src/container";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "admin" && rol !== "remitente")) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Acceso denegado." } },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { nuevoEstado, cantidad_cajas } = body as {
      nuevoEstado: EstadoSolicitud;
      cantidad_cajas?: number;
    };

    if (!nuevoEstado) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "nuevoEstado es requerido.",
          },
        },
        { status: 400 },
      );
    }

    if (nuevoEstado === EstadoSolicitud.Lista && (!cantidad_cajas || cantidad_cajas <= 0)) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "cantidad_cajas es requerido y debe ser mayor a cero cuando el estado es Lista.",
          },
        },
        { status: 400 },
      );
    }

    const solicitud = await solicitudRepository.buscarPorId(id);
    if (!solicitud) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Solicitud no encontrada." } },
        { status: 404 },
      );
    }

    if (rol === "remitente" && solicitud.id_base !== userId) {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "No tienes permiso para modificar esta solicitud.",
          },
        },
        { status: 403 },
      );
    }

    if (nuevoEstado === EstadoSolicitud.EnPreparacion) {
      await registrarEnPreparacionUseCase.ejecutar({
        solicitudId: id,
        actorId: userId,
        rol: rol as "admin" | "remitente",
      });
      return NextResponse.json({ id, estado: EstadoSolicitud.EnPreparacion });
    }

    if (nuevoEstado === EstadoSolicitud.Lista) {
      await registrarListaUseCase.ejecutar({
        solicitudId: id,
        actorId: userId,
        rol: rol as "admin" | "remitente",
        cantidad_cajas: cantidad_cajas!,
      });
      return NextResponse.json({ id, estado: EstadoSolicitud.Lista });
    }

    if (nuevoEstado === EstadoSolicitud.EnCamino) {
      await registrarEnCaminoUseCase.ejecutar({
        solicitudId: id,
        actorId: userId,
        rol: rol as "admin" | "remitente",
      });
      return NextResponse.json({ id, estado: EstadoSolicitud.EnCamino });
    }

    if (nuevoEstado === EstadoSolicitud.Lanzada) {
      await registrarLanzadaUseCase.ejecutar({
        solicitudId: id,
        actorId: userId,
        rol: rol as "admin" | "remitente",
      });
      return NextResponse.json({ id, estado: EstadoSolicitud.Lanzada });
    }

    if (nuevoEstado === EstadoSolicitud.Completada && rol === "admin") {
      await confirmarRecibidaUseCase.ejecutar({
        solicitudId: id,
        actorId: userId,
        rol: "admin",
      });
      return NextResponse.json({ id, estado: EstadoSolicitud.Completada });
    }

    if (nuevoEstado === EstadoSolicitud.Completada && rol !== "admin") {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Solo un admin puede confirmar la recepción.",
          },
        },
        { status: 403 },
      );
    }

    const estadoAnterior = solicitud.estado;
    solicitud.avanzarEstado(nuevoEstado);
    await solicitudRepository.actualizarEstado(id, solicitud.estado);
    await historialRepository.registrar({
      solicitudId: id,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId: userId,
    });

    return NextResponse.json({
      id: solicitud.id_solicitud,
      estado: solicitud.estado,
    });
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json(
      { error: { code, message } },
      { status: httpStatus },
    );
  }
}
