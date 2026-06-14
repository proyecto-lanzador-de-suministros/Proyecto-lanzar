import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NavItem from "../NavItem";

describe("NavItem", () => {
  it("renders a link with the provided href and label", () => {
    const html = renderToStaticMarkup(
      <NavItem href="/dashboard" label="Dashboard" />
    );

    expect(html).toContain("href=\"/dashboard\"");
    expect(html).toContain(">Dashboard<");
  });

  it("renders a badge count when provided", () => {
    const html = renderToStaticMarkup(
      <NavItem href="/messages" label="Messages" badge={4} />
    );

    expect(html).toContain(">4<");
  });

  it("applies active styles when active is true", () => {
    const html = renderToStaticMarkup(
      <NavItem href="/home" label="Home" active />
    );

    expect(html).toContain("bg-[var(--color-interactive)]");
  });
});
