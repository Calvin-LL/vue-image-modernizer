module.exports = (api) => {
  api.extendPackage({
    devDependencies: {
      "webpack-image-srcset-loader": "^5.0.0",
      "webpack-image-resize-loader": "^4.0.0",
    },
  });
};
