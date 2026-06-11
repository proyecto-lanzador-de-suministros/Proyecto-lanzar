// Layout raíz de Next.js. Define la estructura HTML base y los providers globales de la aplicación.
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
