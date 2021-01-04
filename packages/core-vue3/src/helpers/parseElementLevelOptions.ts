import { VIMNodeTransformOptions } from "../createVIMNodeTransformWithOptions";

interface ElementLevelOptions {
  compressOnly?: VIMNodeTransformOptions["compressOnly"];
  onlyUseImg?: VIMNodeTransformOptions["onlyUseImg"];
  noLazy?: VIMNodeTransformOptions["noLazy"];
  imageFormats?: VIMNodeTransformOptions["imageFormats"];
  sizes?: VIMNodeTransformOptions["sizes"];
  quality?: VIMNodeTransformOptions["quality"];
  imageSrcsetLoaderOptions?: VIMNodeTransformOptions["imageSrcsetLoaderOptions"];
  imageResizeLoaderOptions?: VIMNodeTransformOptions["imageResizeLoaderOptions"];
}

/**
 * @description parse the options given at the element level. examples: "compressOnly onlyUseImg"
 */
export default function parseElementLevelOptions(
  optionString: string
): ElementLevelOptions {
  const optionStringTokens = optionString
    .split(/\s+/)
    .map((s) => s.toLowerCase());

  const result: ElementLevelOptions = {};

  const valueTypes: Readonly<
    Record<keyof ElementLevelOptions, "object" | "array" | "boolean">
  > = {
    compressOnly: "boolean",
    onlyUseImg: "boolean",
    noLazy: "boolean",
    imageFormats: "array",
    sizes: "array",
    quality: "object",
    imageSrcsetLoaderOptions: "object",
    imageResizeLoaderOptions: "object",
  };

  for (const key in valueTypes) {
    extractValueFor(
      result,
      optionString,
      optionStringTokens,
      key,
      valueTypes[key as keyof typeof valueTypes]
    );
  }

  return result;
}

function extractBooleanValueFor(
  target: Record<string, any>,
  optionStringTokens: string[],
  key: string
): void {
  if (optionStringTokens.includes(key.toLowerCase())) target[key] = true;
}

function extractValueFor(
  target: Record<string, any>,
  optionString: string,
  optionStringTokens: string[],
  key: string,
  type: "object" | "array" | "boolean"
): void {
  if (type === "boolean")
    extractBooleanValueFor(target, optionStringTokens, key);

  const imageFormatsMatches =
    type === "array"
      ? matchArrayWithKey(optionString, key)
      : matchObjectWithKey(optionString, key);

  if (imageFormatsMatches) {
    try {
      target[key] = JSON.parse(imageFormatsMatches[1]);
    } catch (e) {
      throw new Error(`Invalid value for ${key} ${e.message}`);
    }
  }
}

function matchArrayWithKey(
  s: string,
  key: string
): ReturnType<typeof String.prototype.match> {
  return s.match(new RegExp(`${key}\\s*=\\s*(\\[.*\\])`, "i"));
}

function matchObjectWithKey(
  s: string,
  key: string
): ReturnType<typeof String.prototype.match> {
  return s.match(new RegExp(`${key}\\s*=\\s*(\\{.*\\})`, "i"));
}
