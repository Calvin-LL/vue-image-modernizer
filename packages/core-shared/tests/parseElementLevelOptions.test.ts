import parseElementLevelOptions from "../src/parseElementLevelOptions";

const optionStringResultPair = [
  ["", {}],
  ["compressOnly", { compressOnly: true }],
  ["compressOnly onlyUseImg", { compressOnly: true, onlyUseImg: true }],
  ['imageFormats=["webp", "original"]', { imageFormats: ["webp", "original"] }],
  [
    'imageFormats =["webp", "original"]',
    { imageFormats: ["webp", "original"] },
  ],
  [
    'imageFormats = ["webp", "original"]',
    { imageFormats: ["webp", "original"] },
  ],
  [
    'imageFormats= ["webp", "original"]',
    { imageFormats: ["webp", "original"] },
  ],
  [
    'sizes=["480w", "1024w", "1920w", "2560w", "original"]',
    { sizes: ["480w", "1024w", "1920w", "2560w", "original"] },
  ],

  [
    'quality={ "jpeg": 80, "webp": 80, "png": 100 }',
    { quality: { jpeg: 80, webp: 80, png: 100 } },
  ],
  [
    'compressOnly quality={ "jpeg": 80, "webp": 80, "png": 100 }',
    { compressOnly: true, quality: { jpeg: 80, webp: 80, png: 100 } },
  ],
  [
    'compressOnly quality={ "jpeg": 80, "webp": 80, "png": 100 } imageFormats = ["webp", "original"]',
    {
      compressOnly: true,
      quality: { jpeg: 80, webp: 80, png: 100 },
      imageFormats: ["webp", "original"],
    },
  ],
  [
    'sizes=["480w", "1024w", "1920w", "2560w", "original"] imageFormats = ["webp", "avif", "original"]',
    {
      sizes: ["480w", "1024w", "1920w", "2560w", "original"],
      imageFormats: ["webp", "avif", "original"],
    },
  ],
] as const;

optionStringResultPair.forEach(([optionString, result]) => {
  it(`should return ${JSON.stringify(result)} given ${optionString}`, () => {
    expect(parseElementLevelOptions(optionString)).toMatchObject(result);
  });
});

it("should throw when given invalid JSON", () => {
  expect(() =>
    parseElementLevelOptions("quality={ jpeg: 80 }")
  ).toThrowErrorMatchingInlineSnapshot(
    `"Invalid value for quality Unexpected token j in JSON at position 2"`
  );
});
