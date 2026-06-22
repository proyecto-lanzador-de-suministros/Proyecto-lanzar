export type DatosTrayectoria = {
  punto_lanzamiento: { lat: number; lon: number };
  offset_norte_m: number;
  offset_este_m: number;
  timestamp_estimado: string;
  condiciones_seguras: boolean;
  condiciones_climaticas: {
    temperatura_c: number;
    velocidad_viento_ms: number;
    direccion_viento_grados: number;
  };
};

export interface Envio {
  id_envio: string;
  id_solicitud: string;
  id_base: string;
  fecha_hora_programada: Date | null;
  estado_envio: string;
  datos_trayectoria?: DatosTrayectoria;
}

export interface Contenedor {
  id_contenedor: string;
  tipo_paracaidas: string;
  peso_max: number;
  id_envio: string;
}

export type CrearContenedorInput = {
  tipo_paracaidas: string;
  peso_max: number;
};

export interface ForManagingEnvios {
  listarTodos(): Promise<Envio[]>;
  crear(envio: Omit<Envio, "id_envio">): Promise<Envio>;
  buscarPorId(id: string): Promise<Envio | null>;
  buscarPorIdSolicitud(id_solicitud: string): Promise<Envio | null>;
  asignarContenedor(id_envio: string, contenedor: CrearContenedorInput): Promise<Contenedor>;
  guardarDatosTrayectoria(id_envio: string, datos: DatosTrayectoria): Promise<void>;
}
