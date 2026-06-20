export interface ForManagingTestData {
  ensureSolicitanteExists(usuarioId: string): Promise<void>;
  ensureTestDataSeeded(): Promise<string>;
}
