import mime from "mime";

import { IMAGE_FORMATS, VIMOptions } from "../index";

export default function (
  path: string,
  options: Omit<Required<VIMOptions>, "filePathTransformer">,
  type?: keyof typeof IMAGE_FORMATS
): string {
  const imageMIMEType = mime.getType(path) as keyof typeof IMAGE_FORMATS;
  const targetMIMEType = type ?? imageMIMEType;
  const format = IMAGE_FORMATS[targetMIMEType];

  const resizeLoaderOptions = {
    format: imageMIMEType === type ? undefined : format,
    quality: options.quality[IMAGE_FORMATS[targetMIMEType]],
  };
  const resizeLoaderOptionsString = JSON.stringify(resizeLoaderOptions);

  const srcsetLoaderOptions = {
    sizes: options.sizes,
  };
  const srcsetLoaderOptionsString = JSON.stringify(srcsetLoaderOptions);

  return `-!webpack-image-srcset-loader?${srcsetLoaderOptionsString}!webpack-image-resize-loader?${resizeLoaderOptionsString}!${path}`;
}
