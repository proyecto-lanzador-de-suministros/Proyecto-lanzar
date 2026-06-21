import { ForManagingEnvios, Contenedor } from "../ports/forManagingEnvios.port";

export interface AsignarContenedorInput {
  id_envio: string;
  tipo_paracaidas: string;
  peso_maximo: number;
  estado_mecanico: string;
}

export class AsignarContenedorAEnvioUseCase {
  constructor(private readonly envioRepository: ForManagingEnvios) {}

  async ejecutar(input: AsignarContenedorInput): Promise<Contenedor> {
    const envio = await this.envioRepository.buscarPorId(input.id_envio);
    if (!envio) throw new Error("Envío no encontrado");

    return this.envioRepository.asignarContenedor(input.id_envio, {
      tipo_paracaidas: input.tipo_paracaidas,
      peso_maximo: input.peso_maximo,
      estado_mecanico: input.estado_mecanico,
    });
  }
}
