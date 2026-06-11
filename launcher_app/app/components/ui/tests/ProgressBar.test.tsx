import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressBar from "../ProgressBar";

describe("ProgressBar", () => {
  it("renders the provided progress value", () => {
    const html = renderToStaticMarkup(<ProgressBar value={75} />);

    expect(html).toContain("75%");
    expect(html).toContain("aria-valuenow=\"75\"");
  });

  it("renders a success variant bar", () => {
    const html = renderToStaticMarkup(<ProgressBar value={100} variant="success" />);

    expect(html).toContain("bg-[var(--color-success)]");
  });
});
