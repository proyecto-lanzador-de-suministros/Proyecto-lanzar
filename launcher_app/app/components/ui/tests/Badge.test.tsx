import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Badge from "../Badge";

describe("Badge", () => {
  it("renders children", () => {
    const html = renderToStaticMarkup(<Badge>Solicitante</Badge>);

    expect(html).toContain("Solicitante");
  });

  it("applies solicitante styles", () => {
    const html = renderToStaticMarkup(
      <Badge variant="solicitante">Solicitante</Badge>
    );

    expect(html).toContain("bg-[var(--color-badge-solicitante-bg)]");
    expect(html).toContain("text-[var(--color-badge-solicitante-text)]");
  });

  it("applies remitente styles", () => {
    const html = renderToStaticMarkup(
      <Badge variant="remitente">Remitente</Badge>
    );

    expect(html).toContain("bg-[var(--color-badge-remitente-bg)]");
    expect(html).toContain("text-[var(--color-badge-remitente-text)]");
  });
});
