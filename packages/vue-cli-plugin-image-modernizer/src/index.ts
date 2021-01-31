import mime from "mime";
import { Compiler, Plugin, loader } from "webpack";

import {
  IMAGE_FORMATS,
  VIMNodeTransformOptions,
  createVIMNodeTransformWithOptions,
} from "@vue-image-modernizer/core-vue3";
import { PluginAPI, ProjectOptions } from "@vue/cli-service";

interface ImageModernizerOptions {
  imageResizeLoaderOptions: Record<string, any>;
  imageSrcsetLoaderOptions: Record<string, any>;
}

// need this plugin to remove thread-loader when using vue-loader,
// thread-loader does JSON.stringify to vue-loader's options
// which turns functions to `null`, including our nodeTransform function
class VueImageModernizerWebpackPlugin implements Plugin {
  apply(compiler: Compiler): void {
    const id = "vue-image-modernizer-plugin";

    function normalModuleLoaderHook(loaderContext: loader.LoaderContext): void {
      const vueLoader = loaderContext._module.loaders.find(
        ({ loader }: { loader: string }) => loader.includes("vue-loader")
      );

      if (vueLoader?.options !== undefined)
        loaderContext._module.loaders = loaderContext._module.loaders.filter(
          ({ loader }: { loader: string }) => !loader.includes("thread-loader")
        );
    }

    compiler.hooks.compilation.tap(id, (compilation) => {
      const NormalModule = require("webpack/lib/NormalModule");

      // in webpack 5 compilation.hooks.normalModuleLoader became
      // NormalModule.getCompilationHooks(compilation).loader
      if (NormalModule?.getCompilationHooks)
        NormalModule.getCompilationHooks(compilation).loader.tap(
          id,
          normalModuleLoaderHook
        );
      else compilation.hooks.normalModuleLoader.tap(id, normalModuleLoaderHook);
    });
  }
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
    const fileLoaderOptionsGenerator = `(options, existingOptions) => ({
      ...existingOptions,
      mimetype: require(\`mime\`).getType(options.format),
      fallback: {
        ...existingOptions.fallback,
        options: defaultFileLoaderOptionsGenerator(
          options,
          existingOptions.fallback.options
        ),
      },
    })`.replace(/\s/g, "");

    function compressFilePathTransformer(
      path: string,
      options: Omit<Required<VIMNodeTransformOptions>, "filePathTransformer">,
      type?: keyof typeof IMAGE_FORMATS
    ): string {
      const imageMIMEType = mime.getType(path) as keyof typeof IMAGE_FORMATS;
      const targetMIMEType = type ?? imageMIMEType;
      const format = IMAGE_FORMATS[targetMIMEType];

      const resizeLoaderOptions = {
        format: imageMIMEType === type ? undefined : format,
        quality: options.quality[IMAGE_FORMATS[targetMIMEType]],
        fileLoader: "url-loader",
        fileLoaderOptionsGenerator,
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
      const format = IMAGE_FORMATS[targetMIMEType];

      const resizeLoaderOptions = {
        format: imageMIMEType === type ? undefined : format,
        quality: options.quality[IMAGE_FORMATS[targetMIMEType]],
        fileLoader: "url-loader",
        fileLoaderOptionsGenerator,
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
            createVIMNodeTransformWithOptions({
              compressFilePathTransformer,
              srcSetFilePathTransformer,
              ...vueCliOptions.pluginOptions?.imageModernizer,
            }),
          ],
        },
      }));

    config.plugin("vue-image-modernizer").use(VueImageModernizerWebpackPlugin);
  });
}
