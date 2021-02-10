import { IMAGE_FORMATS } from "./index";

export default function getMIMEFromImageFormat(
  imageFormat: typeof IMAGE_FORMATS[keyof typeof IMAGE_FORMATS]
): keyof typeof IMAGE_FORMATS {
  const keys = Object.keys(IMAGE_FORMATS) as (keyof typeof IMAGE_FORMATS)[];

  return keys.find((key) => IMAGE_FORMATS[key] === imageFormat)!;
}
