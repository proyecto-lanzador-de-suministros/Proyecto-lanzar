// Puerto de salida. Define lo que el dominio necesita saber sobre el usuario autenticado.
export interface UsuarioAutenticado {
  id: string;
  email: string;
  rol?: "admin" | "remitente" | "solicitante";
}

export interface ForAuthenticating {
  obtenerUsuarioActual(req: Request): Promise<UsuarioAutenticado | null>;
  cerrarSesion(): Promise<void>;
}
