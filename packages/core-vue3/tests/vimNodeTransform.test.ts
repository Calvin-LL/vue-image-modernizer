import { VIMOptions } from "@vue-image-modernizer/core-shared";
import {
  CodegenResult,
  baseParse,
  generate,
  transform,
  transformBind,
  transformElement,
} from "@vue/compiler-core";
import { SFCTemplateCompileResults, compileTemplate } from "@vue/compiler-sfc";

import { createVIMNodeTransformWithOptions, vimNodeTransform } from "../src";

function compileWithVIMNodeTransform(
  template: string,
  options?: VIMOptions,
  useCompileTemplate = true
): CodegenResult | SFCTemplateCompileResults {
  const t = options
    ? createVIMNodeTransformWithOptions(options)
    : vimNodeTransform;

  if (useCompileTemplate)
    return compileTemplate({
      source: template,
      filename: "test.vue",
      id: "0",
      compilerOptions: { nodeTransforms: [t] },
    });

  const ast = baseParse(template);

  transform(ast, {
    nodeTransforms: [transformElement, t],
    directiveTransforms: {
      bind: transformBind,
    },
  });
  return generate(ast, { mode: "module" });
}

function compileWithVIMNodeTransformWithoutTransformAssetUrl(
  template: string,
  options?: VIMOptions
): CodegenResult | SFCTemplateCompileResults {
  return compileWithVIMNodeTransform(template, options, false);
}

describe("vimNodeTransform", () => {
  it("should transform src", () => {
    const result = compileWithVIMNodeTransform(
      `<img src="./logo.png" modernize/>`
    );

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
      import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
      import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
      import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


      const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
        type: \\"image/webp\\",
        srcset: _imports_0
      }, null, -1 /* HOISTED */)
      const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
        type: \\"image/png\\",
        srcset: _imports_1
      }, null, -1 /* HOISTED */)
      const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", {
        src: _imports_2,
        loading: \\"lazy\\"
      }, null, -1 /* HOISTED */)

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"picture\\", null, [
          _hoisted_1,
          _hoisted_2,
          _hoisted_3
        ]))
      }"
    `);
  });

  it("should keep loading value if one exists", () => {
    const result = compileWithVIMNodeTransform(
      `<img src="./logo.png" loading="auto" modernize/>`
    );
    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
      import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
      import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
      import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


      const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
        type: \\"image/webp\\",
        srcset: _imports_0
      }, null, -1 /* HOISTED */)
      const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
        type: \\"image/png\\",
        srcset: _imports_1
      }, null, -1 /* HOISTED */)
      const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", {
        src: _imports_2,
        loading: \\"auto\\"
      }, null, -1 /* HOISTED */)

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"picture\\", null, [
          _hoisted_1,
          _hoisted_2,
          _hoisted_3
        ]))
      }"
    `);
  });

  it(`should ignore if img element doesn't have "modernize"`, () => {
    const result = compileWithVIMNodeTransform(`<img src="./logo.png"/>`);

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
      import _imports_0 from './logo.png'


      const _hoisted_1 = { src: _imports_0 }

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"img\\", _hoisted_1))
      }"
    `);
  });

  it("should ignore if img element doesn't have props", () => {
    const result = compileWithVIMNodeTransform("<img />");

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"img\\"))
      }"
    `);
  });

  it("should ignore if element isn't <img>", () => {
    const result = compileWithVIMNodeTransform(
      `<image src="./logo.png" loading="auto" modernize/>`
    );

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"

      const _hoisted_1 = {
        src: \\"./logo.png\\",
        loading: \\"auto\\",
        modernize: \\"\\"
      }

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"image\\", _hoisted_1))
      }"
    `);
  });

  it("should throw if src is empty", () => {
    expect(() => {
      compileWithVIMNodeTransform(`<img src modernize/>`);
    }).toThrowErrorMatchingInlineSnapshot(
      `"src attribute does not have a value"`
    );
  });

  it("should throw if src doesn't exist", () => {
    expect(() => {
      compileWithVIMNodeTransform(`<img modernize/>`);
    }).toThrowErrorMatchingInlineSnapshot(`"src attribute not found"`);
  });

  describe("options", () => {
    it("should transform with compressOnly: true", () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          compressOnly: true,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = {
          src: _imports_0,
          loading: \\"lazy\\"
        }

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", _hoisted_1))
        }"
      `);
    });

    it("should transform with onlyUseImg: true", () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = {
          src: _imports_0,
          srcset: _imports_1,
          loading: \\"lazy\\"
        }

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", _hoisted_1))
        }"
      `);
    });

    it("should transform with noLazy: true", () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          noLazy: true,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/webp\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/png\\",
          srcset: _imports_1
        }, null, -1 /* HOISTED */)
        const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", { src: _imports_2 }, null, -1 /* HOISTED */)

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _hoisted_1,
            _hoisted_2,
            _hoisted_3
          ]))
        }"
      `);
    });

    it("should transform with compressOnly: true, onlyUseImg: true", () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        { compressOnly: true, onlyUseImg: true }
      );
      const expected = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        { compressOnly: true }
      );

      expect(result.code).toMatch(expected.code);
    });

    it("should transform with compressOnly: true, noLazy: true", () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        { compressOnly: true, noLazy: true }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = { src: _imports_0 }

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", _hoisted_1))
        }"
      `);
    });

    it("should transform with onlyUseImg: true, noLazy: true", () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        { onlyUseImg: true, noLazy: true }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = {
          src: _imports_0,
          srcset: _imports_1
        }

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", _hoisted_1))
        }"
      `);
    });

    it('should transform with attributeName:"test"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" test/>`,
        {
          attributeName: "test",
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/webp\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/png\\",
          srcset: _imports_1
        }, null, -1 /* HOISTED */)
        const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", {
          src: _imports_2,
          loading: \\"lazy\\"
        }, null, -1 /* HOISTED */)

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _hoisted_1,
            _hoisted_2,
            _hoisted_3
          ]))
        }"
      `);
    });

    it('should transform with imageFormats: ["png", "original"]', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          imageFormats: ["png", "original"],
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_1 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/png\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_2 = /*#__PURE__*/_createVNode(\\"img\\", {
          src: _imports_1,
          loading: \\"lazy\\"
        }, null, -1 /* HOISTED */)

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _hoisted_1,
            _hoisted_2
          ]))
        }"
      `);
    });

    it('should transform with sizes: ["original"]', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          sizes: ["original"],
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/webp\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/png\\",
          srcset: _imports_1
        }, null, -1 /* HOISTED */)
        const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", {
          src: _imports_2,
          loading: \\"lazy\\"
        }, null, -1 /* HOISTED */)

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _hoisted_1,
            _hoisted_2,
            _hoisted_3
          ]))
        }"
      `);
    });

    it("should transform with quality: { jpeg: 50, webp: 50, png: 50 }", () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          quality: {
            jpeg: 50,
            webp: 50,
            png: 50,
          },
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":50}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":50}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":50}!./logo.png'


        const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/webp\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/png\\",
          srcset: _imports_1
        }, null, -1 /* HOISTED */)
        const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", {
          src: _imports_2,
          loading: \\"lazy\\"
        }, null, -1 /* HOISTED */)

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _hoisted_1,
            _hoisted_2,
            _hoisted_3
          ]))
        }"
      `);
    });

    it('should transform with compressFilePathTransformer: () => "test"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          compressFilePathTransformer: () => "test",
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from 'test'


        const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/webp\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/png\\",
          srcset: _imports_1
        }, null, -1 /* HOISTED */)
        const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", {
          src: _imports_2,
          loading: \\"lazy\\"
        }, null, -1 /* HOISTED */)

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _hoisted_1,
            _hoisted_2,
            _hoisted_3
          ]))
        }"
      `);
    });

    it('should transform with srcSetFilePathTransformer: () => "test"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          srcSetFilePathTransformer: () => "test",
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, undefined as _undefined, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from 'test'
        import _imports_1 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        const _hoisted_1 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/webp\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_2 = /*#__PURE__*/_createVNode(\\"source\\", {
          type: \\"image/png\\",
          srcset: _imports_0
        }, null, -1 /* HOISTED */)
        const _hoisted_3 = /*#__PURE__*/_createVNode(\\"img\\", {
          src: _imports_1,
          loading: \\"lazy\\"
        }, null, -1 /* HOISTED */)

        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _hoisted_1,
            _hoisted_2,
            _hoisted_3
          ]))
        }"
      `);
    });
  });

  describe("inline options", () => {
    it('should transform with element level value "compressOnly"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize="compressOnly"/>`
      );
      const expected = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          compressOnly: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "onlyUseImg"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize="onlyUseImg"/>`
      );
      const expected = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "noLazy"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize="noLazy"/>`
      );
      const expected = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          noLazy: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "onlyUseImg noLazy"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize="onlyUseImg noLazy"/>`
      );
      const expected = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
          noLazy: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "onlyUseImg noLazy sizes=["original"]"', () => {
      const result = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize='onlyUseImg noLazy sizes=["original"]'/>`
      );
      const expected = compileWithVIMNodeTransform(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
          noLazy: true,
          sizes: ["original"],
        }
      );

      expect(result.code).toMatch(expected.code);
    });
  });
});

describe("vimNodeTransform without transformAssetUrl", () => {
  it("should transform src", () => {
    const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
      `<img src="./logo.png" modernize/>`
    );

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
      import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
      import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
      import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"picture\\", null, [
          _createVNode(\\"source\\", {
            type: \\"image/webp\\",
            srcset: _imports_0
          }),
          _createVNode(\\"source\\", {
            type: \\"image/png\\",
            srcset: _imports_1
          }),
          _createVNode(\\"img\\", {
            src: _imports_2,
            loading: \\"lazy\\"
          })
        ]))
      }"
    `);
  });

  it("should keep loading value if one exists", () => {
    const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
      `<img src="./logo.png" loading="auto" modernize/>`
    );
    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
      import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
      import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
      import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"picture\\", null, [
          _createVNode(\\"source\\", {
            type: \\"image/webp\\",
            srcset: _imports_0
          }),
          _createVNode(\\"source\\", {
            type: \\"image/png\\",
            srcset: _imports_1
          }),
          _createVNode(\\"img\\", {
            src: _imports_2,
            loading: \\"auto\\"
          })
        ]))
      }"
    `);
  });

  it(`should ignore if img element doesn't have "modernize"`, () => {
    const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
      `<img src="./logo.png"/>`
    );

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"img\\", { src: \\"./logo.png\\" }))
      }"
    `);
  });

  it("should ignore if img element doesn't have props", () => {
    const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
      "<img />"
    );

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"img\\"))
      }"
    `);
  });

  it("should ignore if element isn't <img>", () => {
    const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
      `<image src="./logo.png" loading="auto" modernize/>`
    );

    expect(result.code).toMatchInlineSnapshot(`
      "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"

      export function render(_ctx, _cache) {
        return (_openBlock(), _createBlock(\\"image\\", {
          src: \\"./logo.png\\",
          loading: \\"auto\\",
          modernize: \\"\\"
        }))
      }"
    `);
  });

  it("should throw if src is empty", () => {
    expect(() => {
      compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src modernize/>`
      );
    }).toThrowErrorMatchingInlineSnapshot(
      `"src attribute does not have a value"`
    );
  });

  describe("options", () => {
    it("should transform with compressOnly: true", () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          compressOnly: true,
        }
      );
      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", {
            src: _imports_0,
            loading: \\"lazy\\"
          }))
        }"
      `);
    });

    it("should transform with onlyUseImg: true", () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", {
            src: _imports_0,
            srcset: _imports_1,
            loading: \\"lazy\\"
          }))
        }"
      `);
    });

    it("should transform with noLazy: true", () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          noLazy: true,
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _createVNode(\\"source\\", {
              type: \\"image/webp\\",
              srcset: _imports_0
            }),
            _createVNode(\\"source\\", {
              type: \\"image/png\\",
              srcset: _imports_1
            }),
            _createVNode(\\"img\\", { src: _imports_2 })
          ]))
        }"
      `);
    });

    it("should transform with compressOnly: true, onlyUseImg: true", () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        { compressOnly: true, onlyUseImg: true }
      );
      const expected = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        { compressOnly: true }
      );

      expect(result.code).toMatch(expected.code);
    });

    it("should transform with compressOnly: true, noLazy: true", () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        { compressOnly: true, noLazy: true }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", { src: _imports_0 }))
        }"
      `);
    });

    it("should transform with onlyUseImg: true, noLazy: true", () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        { onlyUseImg: true, noLazy: true }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"img\\", {
            src: _imports_0,
            srcset: _imports_1
          }))
        }"
      `);
    });

    it('should transform with attributeName:"test"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" test/>`,
        {
          attributeName: "test",
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _createVNode(\\"source\\", {
              type: \\"image/webp\\",
              srcset: _imports_0
            }),
            _createVNode(\\"source\\", {
              type: \\"image/png\\",
              srcset: _imports_1
            }),
            _createVNode(\\"img\\", {
              src: _imports_2,
              loading: \\"lazy\\"
            })
          ]))
        }"
      `);
    });

    it('should transform with imageFormats: ["png", "original"]', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          imageFormats: ["png", "original"],
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_1 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _createVNode(\\"source\\", {
              type: \\"image/png\\",
              srcset: _imports_0
            }),
            _createVNode(\\"img\\", {
              src: _imports_1,
              loading: \\"lazy\\"
            })
          ]))
        }"
      `);
    });

    it('should transform with sizes: ["original"]', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          sizes: ["original"],
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _createVNode(\\"source\\", {
              type: \\"image/webp\\",
              srcset: _imports_0
            }),
            _createVNode(\\"source\\", {
              type: \\"image/png\\",
              srcset: _imports_1
            }),
            _createVNode(\\"img\\", {
              src: _imports_2,
              loading: \\"lazy\\"
            })
          ]))
        }"
      `);
    });

    it("should transform with quality: { jpeg: 50, webp: 50, png: 50 }", () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          quality: {
            jpeg: 50,
            webp: 50,
            png: 50,
          },
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":50}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":50}!./logo.png'
        import _imports_2 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":50}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _createVNode(\\"source\\", {
              type: \\"image/webp\\",
              srcset: _imports_0
            }),
            _createVNode(\\"source\\", {
              type: \\"image/png\\",
              srcset: _imports_1
            }),
            _createVNode(\\"img\\", {
              src: _imports_2,
              loading: \\"lazy\\"
            })
          ]))
        }"
      `);
    });

    it('should transform with compressFilePathTransformer: () => "test"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          compressFilePathTransformer: () => "test",
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png'
        import _imports_1 from '-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png'
        import _imports_2 from 'test'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _createVNode(\\"source\\", {
              type: \\"image/webp\\",
              srcset: _imports_0
            }),
            _createVNode(\\"source\\", {
              type: \\"image/png\\",
              srcset: _imports_1
            }),
            _createVNode(\\"img\\", {
              src: _imports_2,
              loading: \\"lazy\\"
            })
          ]))
        }"
      `);
    });

    it('should transform with srcSetFilePathTransformer: () => "test"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          srcSetFilePathTransformer: () => "test",
        }
      );

      expect(result.code).toMatchInlineSnapshot(`
        "import { createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from \\"vue\\"
        import _imports_0 from 'test'
        import _imports_1 from '-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'


        export function render(_ctx, _cache) {
          return (_openBlock(), _createBlock(\\"picture\\", null, [
            _createVNode(\\"source\\", {
              type: \\"image/webp\\",
              srcset: _imports_0
            }),
            _createVNode(\\"source\\", {
              type: \\"image/png\\",
              srcset: _imports_0
            }),
            _createVNode(\\"img\\", {
              src: _imports_1,
              loading: \\"lazy\\"
            })
          ]))
        }"
      `);
    });
  });

  describe("inline options", () => {
    it('should transform with element level value "compressOnly"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize="compressOnly"/>`
      );
      const expected = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          compressOnly: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "onlyUseImg"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize="onlyUseImg"/>`
      );
      const expected = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "noLazy"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize="noLazy"/>`
      );
      const expected = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          noLazy: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "onlyUseImg noLazy"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize="onlyUseImg noLazy"/>`
      );
      const expected = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
          noLazy: true,
        }
      );

      expect(result.code).toMatch(expected.code);
    });

    it('should transform with element level value "onlyUseImg noLazy sizes=["original"]"', () => {
      const result = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize='onlyUseImg noLazy sizes=["original"]'/>`
      );
      const expected = compileWithVIMNodeTransformWithoutTransformAssetUrl(
        `<img src="./logo.png" modernize/>`,
        {
          onlyUseImg: true,
          noLazy: true,
          sizes: ["original"],
        }
      );

      expect(result.code).toMatch(expected.code);
    });
  });
});
