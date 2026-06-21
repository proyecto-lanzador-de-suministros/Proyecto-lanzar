export interface Envio {
  id_envio: string;
  id_solicitud: string;
  id_base: string;
  fecha_hora_programada: Date | null;
  estado_envio: string;
  matricula_avion: string | null;
  piloto: string | null;
}

export interface Contenedor {
  id_contenedor: string;
  tipo_paracaidas: string;
  peso_maximo: number;
  estado_mecanico: string;
  id_envio: string;
}

export type CrearContenedorInput = {
  tipo_paracaidas: string;
  peso_maximo: number;
  estado_mecanico: string;
};

export interface ForManagingEnvios {
  listarTodos(): Promise<Envio[]>;
  crear(envio: Omit<Envio, "id_envio">): Promise<Envio>;
  buscarPorId(id: string): Promise<Envio | null>;
  asignarContenedor(id_envio: string, contenedor: CrearContenedorInput): Promise<Contenedor>;
}
