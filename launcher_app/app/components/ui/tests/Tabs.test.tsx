import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Tabs from "../Tabs";

describe("Tabs", () => {
  const items = [
    { label: "First", value: "first" },
    { label: "Second", value: "second", disabled: true },
  ];

  it("renders tab labels", () => {
    const html = renderToStaticMarkup(
      <Tabs items={items} value="first" onValueChange={() => null} />
    );

    expect(html).toContain("First");
    expect(html).toContain("Second");
  });

  it("marks the active tab as selected", () => {
    const html = renderToStaticMarkup(
      <Tabs items={items} value="first" onValueChange={() => null} />
    );

    expect(html).toContain("aria-selected=\"true\"");
    expect(html).toContain("bg-[var(--color-interactive)]");
  });
});
