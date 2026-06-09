// Layout raíz de Next.js. Define la estructura HTML base y los providers globales de la aplicación.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}