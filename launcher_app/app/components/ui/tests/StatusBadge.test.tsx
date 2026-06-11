import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders children", () => {
    const html = renderToStaticMarkup(<StatusBadge>Active</StatusBadge>);

    expect(html).toContain("Active");
  });

  it("applies info styles", () => {
    const html = renderToStaticMarkup(<StatusBadge variant="info">Info</StatusBadge>);

    expect(html).toContain("bg-[var(--color-info)]");
    expect(html).toContain("text-white");
  });

  it("applies danger styles", () => {
    const html = renderToStaticMarkup(<StatusBadge variant="danger">Danger</StatusBadge>);

    expect(html).toContain("bg-[var(--color-danger)]");
    expect(html).toContain("text-white");
  });
});
