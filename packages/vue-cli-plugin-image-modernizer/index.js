const mime = require("mime");

const core = require("@vue-image-modernizer/core-vue3");

module.exports = (api, vueCliOptions) => {
  api.chainWebpack((config) => {
    const builtInImageLoader = config.module
      .rule("images")
      .use("url-loader")
      .get("loader");
    const builtInImageLoaderOptionsString = JSON.stringify(
      config.module.rule("images").use("url-loader").get("options")
    );

    function compressFilePathTransformer(path, options, type) {
      const imageMIMEType = mime.getType(path);
      const targetMIMEType = type ?? imageMIMEType;
      const format = core.IMAGE_FORMATS[targetMIMEType];

      const resizeLoaderOptions = {
        format: imageMIMEType === type ? undefined : format,
        quality: options.quality[core.IMAGE_FORMATS[targetMIMEType]],
        ...vueCliOptions?.imageModernizer?.imageResizeLoaderOptions,
      };
      const resizeLoaderOptionsString = JSON.stringify(resizeLoaderOptions);

      return `-!${builtInImageLoader}?${builtInImageLoaderOptionsString}!webpack-image-resize-loader?${resizeLoaderOptionsString}!${path}`;
    }

    function srcSetFilePathTransformer(path, options, type) {
      const imageMIMEType = mime.getType(path);
      const targetMIMEType = type ?? imageMIMEType;
      const format = core.IMAGE_FORMATS[targetMIMEType];

      const resizeLoaderOptions = {
        format: imageMIMEType === type ? undefined : format,
        quality: options.quality[core.IMAGE_FORMATS[targetMIMEType]],
        ...vueCliOptions?.imageModernizer?.imageSrcsetLoaderOptions,
      };
      const resizeLoaderOptionsString = JSON.stringify(resizeLoaderOptions);

      const srcsetLoaderOptions = {
        sizes: options.sizes,
        ...vueCliOptions?.imageModernizer?.imageResizeLoaderOptions,
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
          nodeTransforms: [
            core.createVIMNodeTransformWithOptions({
              compressFilePathTransformer,
              srcSetFilePathTransformer,
              ...vueCliOptions?.imageModernizer,
            }),
          ],
        },
      }));
  });
};
