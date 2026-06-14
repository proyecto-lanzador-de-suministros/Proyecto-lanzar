import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import DropdownTrigger from "../DropdownTrigger";

describe("DropdownTrigger", () => {
  it("renders the trigger label and icon", () => {
    const html = renderToStaticMarkup(<DropdownTrigger>Open menu</DropdownTrigger>);

    expect(html).toContain("Open menu");
    expect(html).toContain("▼");
  });

  it("renders disabled state", () => {
    const html = renderToStaticMarkup(<DropdownTrigger disabled>Open</DropdownTrigger>);

    expect(html).toContain("disabled");
  });
});
