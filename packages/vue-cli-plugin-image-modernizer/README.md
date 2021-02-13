# @vue-image-modernizer/vue-cli-plugin-image-modernizer

[![npm](https://img.shields.io/npm/v/@vue-image-modernizer/vue-cli-plugin-image-modernizer?style=flat)](https://www.npmjs.com/package/@vue-image-modernizer/vue-cli-plugin-image-modernizer) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](https://opensource.org/licenses/MIT)

A Vue plugin to turn your `<img>` tags into `<picture>` tags with `srcset` automatically. This plugin resize and compress the images for you.

[Read more about responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

## Install

```sh
# in an existing Vue CLI project
vue add @vue-image-modernizer/vue-cli-plugin-image-modernizer
```

## Usage

```html
<img src="./assets/image.png" modernize />
```

will be turned into

```html
<picture>
  <source
    type="image/webp"
    srcset="
      /img/image.96ca2a6b.webp  480w,
      /img/image.b8d83ae0.webp 1024w,
      /img/image.2e087cdd.webp
    "
  />
  <source
    type="image/png"
    srcset="
      /img/image.36182eec.png  480w,
      /img/image.2e9b78f9.png 1024w,
      /img/image.fca0d5a2.png
    "
  />
  <!-- note that the src image is compressed -->
  <img src="/img/image.fca0d5a2.png" loading="lazy" />
</picture>
```

or with the `onlyUseImg` option

```html
<!-- note that the src image is compressed -->
<img
  src="/img/image.8ca0d54c.png"
  srcset="
    /img/image.fee0513b.png  480w,
    /img/image.47cb13c3.png 1024w,
    /img/image.469969ed.png 1920w,
    /img/image.de3644eb.png 2560w,
    /img/image.8ca0d54c.png
  "
  loading="lazy"
/>
```

or with the `compressOnly` option

```html
<!-- note that the src image is compressed -->
<img src="/img/image.8ca0d54c.png" loading="lazy" />
```

## Options

### Usage

#### In element

```html
<img src="./assets/image.png" modernize="/* options go here */" />
```

##### format:

`[key]=[value in json]`

if no value is provided, value is `true`

##### example:

```html
<img
  src="./assets/image.png"
  modernize='onlyUseImg noLazy sizes=["original"] quality={ "jpeg": 100, "webp": 100, "png": 100 }'
/>
```

#### In `vue.config.js`

```javascript
module.exports = {
  // ...
  pluginOptions: {
    imageModernizer: {
      quality: {
        // options go here
      },
    },
  },
};
```

### List of options

| Name                                                              | Type       | Default                                           | Description                                                                                                                                          |
| ----------------------------------------------------------------- | ---------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`compressOnly`](#compressonly)**                               | `boolean`  | `false`                                           | only compress the image and transform to <pre lang=html>`<img src="..." loading="lazy">`</pre>                                                       |
| **[`onlyUseImg`](#onlyuseimg)**                                   | `boolean`  | `false`                                           | only transform to <pre lang=html>`<img src="..." srcset="..." loading="lazy">`</pre>                                                                 |
| **[`noLazy`](#nolazy)**                                           | `boolean`  | `false`                                           | to not add `loading="lazy"`                                                                                                                          |
| **[`attributeName`](#attributename)**                             | `string`   | `"modernize"`                                     | attribute to look for                                                                                                                                |
| **[`imageFormats`](#imageformats)**                               | `string[]` | `["webp", "original"]`                            | image formats to add `<source>` elements for                                                                                                         |
| **[`sizes`](#sizes)**                                             | `string[]` | `["480w", "1024w", "1920w", "2560w", "original"]` | sizes in srcset                                                                                                                                      |
| **[`quality`](#quality)**                                         | `object`   | `{ jpeg: 80, webp: 80, png: 100 }`                | resulting image qualities                                                                                                                            |
| **[`compressFilePathTransformer`](#compressfilepathtransformer)** | `function` | [`see below`](#compressfilepathtransformer)       | function to generate the path of the compressed image                                                                                                |
| **[`srcSetFilePathTransformer`](#srcsetfilepathtransformer)**     | `function` | [`see below`](#srcsetfilepathtransformer)         | function to generate the srcset string                                                                                                               |
| **[`imageResizeLoaderOptions`](#imageresizeloaderoptions)**       | `object`   | `{}`                                              | additional options for [`webpack-image-resize-loader`](https://github.com/Calvin-LL/webpack-image-resize-loader), only available in `vue.config.js`  |
| **[`imageSrcsetLoaderOptions`](#imagesrcsetloaderoptions)**       | `object`   | `{}`                                              | additional options for [`webpack-image-srcset-loader`](https://github.com/Calvin-LL/webpack-image-srcset-loader) , only available in `vue.config.js` |

### `compressOnly`

**default:** `false`

Without any of the fancy stuff, just compress the image.

##### Transforms to

```html
<img src="..." loading="lazy" />
```

The `src` value is generated by [`compressFilePathTransformer`](#compressfilepathtransformer)

### `onlyUseImg`

**default:** `false`

Without any of the fancy stuff, just compress the image in `src` and add `srcset` to the `<img>` tag. The images in `srcset` will be the same format as the original in `src`.

##### Transforms to

```html
<img src="..." srcset="..." loading="lazy" />
```

The `src` value is generated by [`compressFilePathTransformer`](#compressfilepathtransformer)

The `srcset` value is generated by [`srcSetFilePathTransformer`](#srcsetfilepathtransformer)

### `noLazy`

**default:** `false`

Do not add `loading="lazy"`.

### `attributeName`

**default:** `"modernize"`

Attribute to look for to trigger the specify transformations.

### `imageFormats`

**default:** `["webp", "original"]`

Image formats to add `<source>` elements for. The possible values in the array are `"jpeg"`, `"png"`, `"webp"`, or `"original"`.

The `<source>` elements will be placed in the `<picture>` elements in the order specified in the array.

Each value is passed to [`webpack-image-resize-loader`](https://github.com/Calvin-LL/webpack-image-resize-loader)'s `format` option.

### `sizes`

**default:** `["480w", "1024w", "1920w", "2560w", "original"]`

Sizes to include in `srcset`. The possible values are `"${number}w"`, `"${number}x"`, or `"original"`. `srcset` string will be added in the order specified in the array.

If the specified width is greater than the width of the image, that size will not be added to the srcset. Unless if [`imageSrcsetLoaderOptions`](#imagesrcsetloaderoptions)'s `scaleUp` is specified.

This is passed to [`webpack-image-srcset-loader`](https://github.com/Calvin-LL/webpack-image-srcset-loader)'s `sizes` option.

### `quality`

**default:** `{ jpeg: 80, webp: 80, png: 100 }`

The resulting image qualities after compression.

The value for each format is passed to [`webpack-image-resize-loader`](https://github.com/Calvin-LL/webpack-image-resize-loader)'s `quality` option.

### `compressFilePathTransformer`

**default:** [see `index.ts`](https://github.com/Calvin-LL/vue-image-modernizer/blob/main/packages/vue-cli-plugin-image-modernizer/src/index.ts)

The function to call to generate the values for `src` attributes. The function should return `"[filename].[ext]"` with or without inline webpack loaders.

### `srcSetFilePathTransformer`

**default:** [see `index.ts`](https://github.com/Calvin-LL/vue-image-modernizer/blob/main/packages/vue-cli-plugin-image-modernizer/src/index.ts)

The function to call to generate the values for `srcset` attributes. The function should return `"[filename].[ext] [size], ..., [filename].[ext]"` with or without inline webpack loaders, where `[size]` are the values in [`sizes`](#sizes).

### `imageResizeLoaderOptions`

**default:** `{}`

Additional options for [`webpack-image-resize-loader`](https://github.com/Calvin-LL/webpack-image-resize-loader), only available in `vue.config.js`

### `imageSrcsetLoaderOptions`

**default:** `{}`

Additional options for [`webpack-image-srcset-loader`](https://github.com/Calvin-LL/webpack-image-srcset-loader) , only available in `vue.config.js`
