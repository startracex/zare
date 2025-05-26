import renderer from "../lib/core/renderer";
import { describe, it, expect } from "vitest";

describe("renderer", () => {

    it("should render", () => {

        const testCode = `serve (
            <h1>Tested Code</h1>
        )`
        const html = renderer(testCode, {}, "")
        expect(html).includes("<h1>Tested Code</h1>")
    });
});