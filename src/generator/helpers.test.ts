import { describe, it, expect } from "vitest";
import { svgText, svgLine, isSJL, escapeXml } from "./helpers.js";

describe("svgText", () => {
  it("generates a text element with default values", () => {
    const result = svgText("Hello", 100, 200, 16, "#000000");
    expect(result).toContain('x="100"');
    expect(result).toContain('y="200"');
    expect(result).toContain('font-size="16"');
    expect(result).toContain('fill="#000000"');
    expect(result).toContain('font-weight="normal"');
    expect(result).toContain('text-anchor="middle"');
    expect(result).toContain(">Hello<");
  });

  it("generates a text element with custom fontWeight and textAnchor", () => {
    const result = svgText("Hi", 0, 0, 12, "#fff", "bold", "start");
    expect(result).toContain('font-weight="bold"');
    expect(result).toContain('text-anchor="start"');
  });
});

describe("svgLine", () => {
  it("generates a line element with default values", () => {
    const result = svgLine(0, 0, 100, 100, "#ff0000");
    expect(result).toContain('x1="0"');
    expect(result).toContain('y1="0"');
    expect(result).toContain('x2="100"');
    expect(result).toContain('y2="100"');
    expect(result).toContain('stroke="#ff0000"');
    expect(result).toContain('stroke-width="2"');
  });

  it("generates a line element with a custom stroke width", () => {
    const result = svgLine(0, 0, 50, 50, "#000", 5);
    expect(result).toContain('stroke-width="5"');
  });
});

describe("isSJL", () => {
  it("returns true for LILLE SJ", () => {
    expect(isSJL("LILLE SJ VOLLEY")).toBe(true);
  });

  it("returns true for SPORT & JOIE", () => {
    expect(isSJL("SPORT & JOIE LILLE")).toBe(true);
  });

  it("returns true for AS SPORT ET JOIE", () => {
    expect(isSJL("AS SPORT ET JOIE")).toBe(true);
  });

  it("returns false for a non-SJL team", () => {
    expect(isSJL("VALENCIENNES VB")).toBe(false);
  });
});

describe("escapeXml", () => {
  it("escapes special XML characters", () => {
    expect(escapeXml("&")).toBe("&amp;");
    expect(escapeXml("<")).toBe("&lt;");
    expect(escapeXml(">")).toBe("&gt;");
    expect(escapeXml('"')).toBe("&quot;");
    expect(escapeXml("'")).toBe("&apos;");
  });

  it("escapes a string with multiple special characters", () => {
    expect(escapeXml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("returns the string as is if there are no special characters", () => {
    expect(escapeXml("hello world")).toBe("hello world");
  });
});
