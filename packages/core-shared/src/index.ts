import compressWebpack from "./filePathTransformers/compressWebpack";
import srcSetWebpack from "./filePathTransformers/srcSetWebpack";

export { default as getMIMEFromImageFormat } from "./getMIMEFromImageFormat";
export { default as parseElementLevelOptions } from "./parseElementLevelOptions";

export const filePathTransformers = { compressWebpack, srcSetWebpack };

export const IMAGE_FORMATS = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export interface VIMOptions {
  /**
   * only transform to <img src="..." >
   */
  readonly compressOnly?: boolean;
  /**
   * only transform to <img src="..." srcset="..." >
   */
  readonly onlyUseImg?: boolean;
  /**
   * to not add loading="lazy"
   */
  readonly noLazy?: boolean;
  /**
   * attribute to look for
   */
  readonly attributeName?: string;
  /**
   * image formats to add sources for
   *
   * only the first format will be used if either `compressOnly` or `onlyUseImg` are true
   */
  readonly imageFormats?: (
    | typeof IMAGE_FORMATS[keyof typeof IMAGE_FORMATS]
    | "original"
  )[];
  /**
   * sizes in srcset
   */
  readonly sizes?: (`${number}w` | `${number}x` | "original")[];
  /**
   * resulting image qualities
   */
  readonly quality?: Record<
    typeof IMAGE_FORMATS[keyof typeof IMAGE_FORMATS],
    number
  >;
  readonly compressFilePathTransformer?: (
    path: string,
    options: Omit<Required<VIMOptions>, "filePathTransformer">,
    format?: keyof typeof IMAGE_FORMATS
  ) => string;
  readonly srcSetFilePathTransformer?: (
    path: string,
    options: Omit<Required<VIMOptions>, "filePathTransformer">,
    format?: keyof typeof IMAGE_FORMATS
  ) => string;
}

export const defaultVIMOptions: Required<VIMOptions> = {
  compressOnly: false,
  onlyUseImg: false,
  noLazy: false,
  attributeName: "modernize",
  imageFormats: ["webp", "original"],
  sizes: ["480w", "1024w", "1920w", "2560w", "original"],
  quality: {
    jpeg: 80,
    webp: 80,
    png: 100,
  },
  compressFilePathTransformer: compressWebpack,
  srcSetFilePathTransformer: srcSetWebpack,
};
