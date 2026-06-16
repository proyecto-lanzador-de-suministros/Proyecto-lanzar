import { PrismaUsuarioRepository } from "./modules/usuarios/infrastructure/adapters/PrismaUsuarioRepository";
import { AprobarCuentaUseCase } from "./modules/usuarios/domain/use-cases/AprobarCuenta.usecase";
import { EliminarCuentaUseCase } from "./modules/usuarios/domain/use-cases/EliminarCuenta.usecase";
import { ListarUsuariosUseCase } from "./modules/usuarios/domain/use-cases/ListarUsuarios.usecase";

export const usuarioRepository = new PrismaUsuarioRepository();

// Casos de uso de Usuarios
export const aprobarCuentaUseCase = new AprobarCuentaUseCase(usuarioRepository);
export const eliminarCuentaUseCase = new EliminarCuentaUseCase(usuarioRepository);
export const listarUsuariosUseCase = new ListarUsuariosUseCase(usuarioRepository);