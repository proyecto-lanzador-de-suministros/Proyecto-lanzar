import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Avatar from "../Avatar";

describe("Avatar", () => {
  it("renders initials when no src is provided", () => {
    const html = renderToStaticMarkup(<Avatar alt="Juan Perez" />);

    expect(html).toContain("JP");
    expect(html).toContain("alt=\"Juan Perez\"");
  });

  it("renders an image when src is provided", () => {
    const html = renderToStaticMarkup(
      <Avatar src="/avatar.jpg" alt="User avatar" />
    );

    expect(html).toContain("src=\"/avatar.jpg\"");
    expect(html).toContain("alt=\"User avatar\"");
  });

  it("applies size classes for large avatars", () => {
    const html = renderToStaticMarkup(<Avatar size="lg" alt="Large user" />);

    expect(html).toContain("h-12 w-12");
  });
});
