import fs from "fs";
import mime from "mime";
import path from "path";
import { Compiler, Plugin, loader } from "webpack";

import { IMAGE_FORMATS, VIMOptions } from "@vue-image-modernizer/core-shared";
import { createVIMModuleWithOptions } from "@vue-image-modernizer/core-vue2";
import { createVIMNodeTransformWithOptions } from "@vue-image-modernizer/core-vue3";
import { PluginAPI, ProjectOptions } from "@vue/cli-service";
// @ts-expect-error @vue/cli-shared-utils doesn't have typing
import { loadModule, semver } from "@vue/cli-shared-utils";

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

/** delete all folders in cacheDirectory with names ending in "-loader", except for those in exceptions */
function deleteLoaderCache(cacheDirectory: string, exceptions: string[]): void {
  if (fs.existsSync(cacheDirectory)) {
    fs.readdirSync(cacheDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .filter((dirent) => dirent.name.endsWith("-loader"))
      .forEach((dirent) => {
        const cacheFolderPath = path.join(cacheDirectory, dirent.name);

        if (!exceptions.includes(cacheFolderPath)) {
          fs.rmSync(cacheFolderPath, { recursive: true, force: true });
        }
      });
  }
}

/** write cacheIdentifier to vimCachePath */
function writeVimCache(vimCachePath: string, data: Record<string, any>): void {
  const dirPath = path.dirname(vimCachePath);

  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

  fs.writeFileSync(vimCachePath, JSON.stringify(data));
}

export default function (
  api: PluginAPI,
  vueCliOptions: ProjectOptions & {
    pluginOptions: { imageModernizer: ImageModernizerOptions };
  }
): void {
  const vue = loadModule("vue", api.getCwd());
  const isVue3 = vue && semver.major(vue.version) === 3;

  const cacheDirectory = api.resolve("node_modules/.cache/");
  const vimCachePath = api.resolve(
    "node_modules/.cache/vue-image-modernizer.json"
  );
  // generate our own cacheIdentifier with our dependencies
  const { cacheIdentifier } = api.genCacheConfig("vue-image-modernizer", {
    "webpack-image-resize-loader": require("webpack-image-resize-loader/package.json")
      ?.version,
    "webpack-image-srcset-loader": require("webpack-image-srcset-loader/package.json")
      ?.version,
    "@vue-image-modernizer/core-vue3": require("@vue-image-modernizer/core-vue3/package.json")
      ?.version,
    "@vue-image-modernizer/vue-cli-plugin-image-modernizer": require("@vue-image-modernizer/vue-cli-plugin-image-modernizer/package.json")
      ?.version,
    config: vueCliOptions.pluginOptions?.imageModernizer,
  });

  // if cacheIdentifier has changed or doesn't exist, delete loader caches, then write our cacheIdentifier
  if (fs.existsSync(vimCachePath)) {
    const vimCacheContent = fs.readFileSync(vimCachePath).toString();
    const cachedCacheIdentifier = JSON.parse(vimCacheContent).cacheIdentifier;

    if (cachedCacheIdentifier !== cacheIdentifier) {
      deleteLoaderCache(cacheDirectory, [vimCachePath]);
      writeVimCache(vimCachePath, { cacheIdentifier });
    }
  } else {
    deleteLoaderCache(cacheDirectory, [vimCachePath]);
    writeVimCache(vimCachePath, { cacheIdentifier });
  }

  api.chainWebpack((config) => {
    const builtInImageLoader = config.module
      .rule("images")
      .use("url-loader")
      .get("loader");

    const builtInImageLoaderEscaped = builtInImageLoader
      .replace(/\\/g, "\\\\")
      .replace(/!/g, "\\x21");

    const builtInImageLoaderOptionsString = JSON.stringify(
      config.module.rule("images").use("url-loader").get("options")
    );

    const builtInImageLoaderOptionsStringEscaped = builtInImageLoaderOptionsString
      .replace(/\\/g, "\\\\")
      .replace(/!/g, "\\x21");

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
      options: Omit<Required<VIMOptions>, "filePathTransformer">,
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

      return `-!${builtInImageLoaderEscaped}?${builtInImageLoaderOptionsStringEscaped}!webpack-image-resize-loader?${resizeLoaderOptionsString}!${path}`;
    }

    function srcSetFilePathTransformer(
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
        fileLoader: "url-loader",
        fileLoaderOptionsGenerator,
        ...vueCliOptions.pluginOptions?.imageModernizer
          ?.imageResizeLoaderOptions,
      };
      const resizeLoaderOptionsString = JSON.stringify(resizeLoaderOptions);

      const srcsetLoaderOptions = {
        sizes: options.sizes,
        ...vueCliOptions.pluginOptions?.imageModernizer
          ?.imageSrcsetLoaderOptions,
      };
      const srcsetLoaderOptionsString = JSON.stringify(srcsetLoaderOptions);

      return `-!webpack-image-srcset-loader?${srcsetLoaderOptionsString}!${builtInImageLoaderEscaped}?${builtInImageLoaderOptionsStringEscaped}!webpack-image-resize-loader?${resizeLoaderOptionsString}!${path}`;
    }

    const vimOptions = {
      compressFilePathTransformer,
      srcSetFilePathTransformer,
      ...vueCliOptions.pluginOptions?.imageModernizer,
    };

    if (isVue3) {
      config.module
        .rule("vue")
        .test(/\.vue$/)
        .use("vue-loader")
        .tap((options) => ({
          ...options,
          // concat the original cacheIdentifier with our cacheIdentifier
          cacheIdentifier: (options.cacheIdentifier ?? "") + cacheIdentifier,
          compilerOptions: {
            ...options?.compilerOptions,
            nodeTransforms: [
              ...(options?.compilerOptions?.nodeTransforms ?? []),
              createVIMNodeTransformWithOptions(vimOptions),
            ],
          },
        }));
    } else {
      config.module
        .rule("vue")
        .test(/\.vue$/)
        .use("vue-loader")
        .tap((options) => ({
          ...options,
          // concat the original cacheIdentifier with our cacheIdentifier
          cacheIdentifier: (options.cacheIdentifier ?? "") + cacheIdentifier,
          compilerOptions: {
            ...options?.compilerOptions,
            modules: [
              ...(options?.compilerOptions?.modules ?? []),
              createVIMModuleWithOptions(vimOptions),
            ],
          },
        }));
    }

    config.plugin("vue-image-modernizer").use(VueImageModernizerWebpackPlugin);
  });
}
