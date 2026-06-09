export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      rol?: "admin" | "remitente" | "solicitante";
    };
    email?: string;
  }
}
