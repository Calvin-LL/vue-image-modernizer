import mime from "mime";

import core, {
  IMAGE_FORMATS,
  VIMNodeTransformOptions,
} from "@vue-image-modernizer/core-vue3";
import { PluginAPI, ProjectOptions } from "@vue/cli-service";

interface ImageModernizerOptions {
  imageResizeLoaderOptions: Record<string, any>;
  imageSrcsetLoaderOptions: Record<string, any>;
}

export default function (
  api: PluginAPI,
  vueCliOptions: ProjectOptions & {
    pluginOptions: { imageModernizer: ImageModernizerOptions };
  }
): void {
  api.chainWebpack((config) => {
    const builtInImageLoader = config.module
      .rule("images")
      .use("url-loader")
      .get("loader");
    const builtInImageLoaderOptionsString = JSON.stringify(
      config.module.rule("images").use("url-loader").get("options")
    );

    function compressFilePathTransformer(
      path: string,
      options: Omit<Required<VIMNodeTransformOptions>, "filePathTransformer">,
      type?: keyof typeof IMAGE_FORMATS
    ): string {
      const imageMIMEType = mime.getType(path) as keyof typeof IMAGE_FORMATS;
      const targetMIMEType = type ?? imageMIMEType;
      const format = core.IMAGE_FORMATS[targetMIMEType];

      const resizeLoaderOptions = {
        format: imageMIMEType === type ? undefined : format,
        quality: options.quality[core.IMAGE_FORMATS[targetMIMEType]],
        ...vueCliOptions.pluginOptions?.imageModernizer
          ?.imageResizeLoaderOptions,
      };
      const resizeLoaderOptionsString = JSON.stringify(resizeLoaderOptions);

      return `-!${builtInImageLoader}?${builtInImageLoaderOptionsString}!webpack-image-resize-loader?${resizeLoaderOptionsString}!${path}`;
    }

    function srcSetFilePathTransformer(
      path: string,
      options: Omit<Required<VIMNodeTransformOptions>, "filePathTransformer">,
      type?: keyof typeof IMAGE_FORMATS
    ): string {
      const imageMIMEType = mime.getType(path) as keyof typeof IMAGE_FORMATS;
      const targetMIMEType = type ?? imageMIMEType;
      const format = core.IMAGE_FORMATS[targetMIMEType];

      const resizeLoaderOptions = {
        format: imageMIMEType === type ? undefined : format,
        quality: options.quality[core.IMAGE_FORMATS[targetMIMEType]],
        ...vueCliOptions.pluginOptions?.imageModernizer
          ?.imageSrcsetLoaderOptions,
      };
      const resizeLoaderOptionsString = JSON.stringify(resizeLoaderOptions);

      const srcsetLoaderOptions = {
        sizes: options.sizes,
        ...vueCliOptions.pluginOptions?.imageModernizer
          ?.imageResizeLoaderOptions,
      };
      const srcsetLoaderOptionsString = JSON.stringify(srcsetLoaderOptions);

      return `-!webpack-image-srcset-loader?${srcsetLoaderOptionsString}!${builtInImageLoader}?${builtInImageLoaderOptionsString}!webpack-image-resize-loader?${resizeLoaderOptionsString}!${path}`;
    }

    config.module
      .rule("vue")
      .test(/\.vue$/)
      .use("vue-loader")
      .tap((options) => ({
        ...options,
        compilerOptions: {
          ...options?.compilerOptions,
          nodeTransforms: [
            ...(options?.compilerOptions?.nodeTransforms ?? []),
            core.createVIMNodeTransformWithOptions({
              compressFilePathTransformer,
              srcSetFilePathTransformer,
              ...vueCliOptions.pluginOptions?.imageModernizer,
            }),
          ],
        },
      }));

    config.module.rule("js").uses.delete("thread-loader");
  });
}
