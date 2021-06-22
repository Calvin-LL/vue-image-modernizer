import prettier from "prettier";
import { CompiledResult, compile } from "vue-template-compiler";

import { VIMOptions } from "@vue-image-modernizer/core-shared";

import { createVIMModuleWithOptions } from "../src";

function compileWithVIMModule(
  template: string,
  options?: VIMOptions
): CompiledResult<string> & {
  formattedRender: string;
  formattedStaticRenderFns: string[];
  formattedLongestRender: string;
} {
  const vimModule = createVIMModuleWithOptions(options ?? {});
  const compiledResult = compile(template, { modules: [vimModule] });

  return {
    ...compiledResult,
    formattedRender: prettier.format(compiledResult.render, {
      parser: "babel",
    }),
    formattedStaticRenderFns: compiledResult.staticRenderFns.map((fn) =>
      prettier.format(fn, {
        parser: "babel",
      })
    ),
    // return the longest render function, usually is the correct render function
    get formattedLongestRender() {
      let longestSoFar = "";

      for (const formattedStaticRenderFn of [
        ...this.formattedStaticRenderFns,
        this.formattedRender,
      ]) {
        if (formattedStaticRenderFn.length > longestSoFar.length) {
          longestSoFar = formattedStaticRenderFn;
        }
      }

      return longestSoFar;
    },
  };
}

it("should transform src", () => {
  const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`);

  expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
        loading: \\"lazy\\",
      },
    }),
  ]);
}
"
`);
});

it("should pass `media` attribute to source elements", () => {
  const result = compileWithVIMModule(
    `<img src="./logo.png" media="(min-width: 800px)" modernize/>`
  );

  expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        media: \\"(min-width: 800px)\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        media: \\"(min-width: 800px)\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
        media: \\"(min-width: 800px)\\",
        loading: \\"lazy\\",
      },
    }),
  ]);
}
"
`);
});

it("should pass `sizes` attribute to source elements", () => {
  const result = compileWithVIMModule(
    `<img src="./logo.png" sizes="(min-width: 36em) 33.3vw, 100vw" modernize/>`
  );

  expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        sizes: \\"(min-width: 36em) 33.3vw, 100vw\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        sizes: \\"(min-width: 36em) 33.3vw, 100vw\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
        sizes: \\"(min-width: 36em) 33.3vw, 100vw\\",
        loading: \\"lazy\\",
      },
    }),
  ]);
}
"
`);
});

it("should keep loading value if one exists", () => {
  const result = compileWithVIMModule(
    `<img src="./logo.png" loading="auto" modernize/>`
  );

  expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
        loading: \\"auto\\",
      },
    }),
  ]);
}
"
`);
});

it(`should ignore if img element doesn't have "modernize"`, () => {
  const result = compileWithVIMModule(`<img src="./logo.png"/>`);

  expect(result.formattedLongestRender).toMatchInlineSnapshot(`
    "with (this) {
      return _c(\\"img\\", { attrs: { src: \\"./logo.png\\" } });
    }
    "
  `);
});

it("should ignore if img element doesn't have props", () => {
  const result = compileWithVIMModule("<img />");

  expect(result.formattedLongestRender).toMatchInlineSnapshot(`
    "with (this) {
      return _c(\\"img\\");
    }
    "
  `);
});

it("should ignore if element isn't <img>", () => {
  const result = compileWithVIMModule(`<image src="./logo.png" modernize/>`);

  expect(result.formattedLongestRender).toMatchInlineSnapshot(`
    "with (this) {
      return _c(\\"image\\", { attrs: { src: \\"./logo.png\\", modernize: \\"\\" } });
    }
    "
  `);
});

it("should throw if src is empty", () => {
  expect(() => {
    compileWithVIMModule(`<img src modernize/>`);
  }).toThrowErrorMatchingInlineSnapshot(
    `"src attribute does not have a value"`
  );
});

it("should throw if src doesn't exist", () => {
  expect(() => {
    compileWithVIMModule(`<img modernize/>`);
  }).toThrowErrorMatchingInlineSnapshot(`"src attribute not found"`);
});

describe("options", () => {
  it("should transform with compressOnly: true", () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      compressOnly: true,
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
      "with (this) {
        return _c(\\"img\\", {
          attrs: {
            src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
            loading: \\"lazy\\",
          },
        });
      }
      "
    `);
  });

  it("should transform with onlyUseImg: true", () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      onlyUseImg: true,
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"img\\", {
    attrs: {
      src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
      srcset:
        require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png')
          .default,
      loading: \\"lazy\\",
    },
  });
}
"
`);
  });

  it("should transform with noLazy: true", () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      noLazy: true,
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
      },
    }),
  ]);
}
"
`);
  });

  it("should transform with compressOnly: true, onlyUseImg: true", () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      compressOnly: true,
      onlyUseImg: true,
    });
    const expected = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      compressOnly: true,
    });

    expect(result.formattedLongestRender).toMatch(
      expected.formattedLongestRender
    );
  });

  it("should transform with compressOnly: true, noLazy: true", () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      compressOnly: true,
      noLazy: true,
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
      "with (this) {
        return _c(\\"img\\", {
          attrs: {
            src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
          },
        });
      }
      "
    `);
  });

  it("should transform with onlyUseImg: true, noLazy: true", () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      onlyUseImg: true,
      noLazy: true,
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"img\\", {
    attrs: {
      src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
      srcset:
        require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png')
          .default,
    },
  });
}
"
`);
  });

  it('should transform with attributeName:"test"', () => {
    const result = compileWithVIMModule(`<img src="./logo.png" test/>`, {
      attributeName: "test",
    });
    const expected = compileWithVIMModule(`<img src="./logo.png" modernize/>`);

    expect(result.formattedLongestRender).toMatch(
      expected.formattedLongestRender
    );
  });

  it('should transform with imageFormats: ["png", "original"]', () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      imageFormats: ["png", "original"],
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
        loading: \\"lazy\\",
      },
    }),
  ]);
}
"
`);
  });

  it('should transform with sizes: ["original"]', () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      sizes: ["original"],
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
        loading: \\"lazy\\",
      },
    }),
  ]);
}
"
`);
  });

  it("should transform with quality: { jpeg: 50, webp: 50, png: 50, avif: 50 }", () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      quality: {
        jpeg: 50,
        webp: 50,
        png: 50,
        avif: 50,
      },
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":50}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":50}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", {
      attrs: {
        src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":50}!./logo.png'),
        loading: \\"lazy\\",
      },
    }),
  ]);
}
"
`);
  });

  it('should transform with compressFilePathTransformer: () => "test"', () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      compressFilePathTransformer: () => "test",
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
"with (this) {
  return _c(\\"picture\\", {}, [
    _c(\\"source\\", {
      attrs: {
        type: \\"image/webp\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"format\\":\\"webp\\",\\"quality\\":80}!./logo.png')
            .default,
      },
    }),
    _c(\\"source\\", {
      attrs: {
        type: \\"image/png\\",
        srcset:
          require('-!webpack-image-srcset-loader?{\\"sizes\\":[\\"480w\\",\\"1024w\\",\\"1920w\\",\\"2560w\\",\\"original\\"]}!webpack-image-resize-loader?{\\"quality\\":100}!./logo.png')
            .default,
      },
    }),
    _c(\\"img\\", { attrs: { src: require(\\"test\\"), loading: \\"lazy\\" } }),
  ]);
}
"
`);
  });

  it('should transform with srcSetFilePathTransformer: () => "test"', () => {
    const result = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      srcSetFilePathTransformer: () => "test",
    });

    expect(result.formattedLongestRender).toMatchInlineSnapshot(`
      "with (this) {
        return _c(\\"picture\\", {}, [
          _c(\\"source\\", {
            attrs: { type: \\"image/webp\\", srcset: require(\\"test\\").default },
          }),
          _c(\\"source\\", {
            attrs: { type: \\"image/png\\", srcset: require(\\"test\\").default },
          }),
          _c(\\"img\\", {
            attrs: {
              src: require('-!webpack-image-resize-loader?{\\"format\\":\\"png\\",\\"quality\\":100}!./logo.png'),
              loading: \\"lazy\\",
            },
          }),
        ]);
      }
      "
    `);
  });
});

describe("inline options", () => {
  it('should transform with element level value "compressOnly"', () => {
    const result = compileWithVIMModule(
      `<img src="./logo.png" modernize="compressOnly"/>`
    );
    const expected = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      compressOnly: true,
    });

    expect(result.formattedLongestRender).toMatch(
      expected.formattedLongestRender
    );
  });

  it('should transform with element level value "onlyUseImg"', () => {
    const result = compileWithVIMModule(
      `<img src="./logo.png" modernize="onlyUseImg"/>`
    );
    const expected = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      onlyUseImg: true,
    });

    expect(result.formattedLongestRender).toMatch(
      expected.formattedLongestRender
    );
  });

  it('should transform with element level value "noLazy"', () => {
    const result = compileWithVIMModule(
      `<img src="./logo.png" modernize="noLazy"/>`
    );
    const expected = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      noLazy: true,
    });

    expect(result.formattedLongestRender).toMatch(
      expected.formattedLongestRender
    );
  });

  it('should transform with element level value "onlyUseImg noLazy"', () => {
    const result = compileWithVIMModule(
      `<img src="./logo.png" modernize="onlyUseImg noLazy"/>`
    );
    const expected = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      onlyUseImg: true,
      noLazy: true,
    });

    expect(result.formattedLongestRender).toMatch(
      expected.formattedLongestRender
    );
  });

  it('should transform with element level value "onlyUseImg noLazy sizes=["original"]"', () => {
    const result = compileWithVIMModule(
      `<img src="./logo.png" modernize='onlyUseImg noLazy sizes=["original"]'/>`
    );
    const expected = compileWithVIMModule(`<img src="./logo.png" modernize/>`, {
      onlyUseImg: true,
      noLazy: true,
      sizes: ["original"],
    });

    expect(result.formattedLongestRender).toMatch(
      expected.formattedLongestRender
    );
  });
});
