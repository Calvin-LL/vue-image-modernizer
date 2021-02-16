# vue-image-modernizer

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](https://opensource.org/licenses/MIT)

## Plugins

- [vue-cli-plugin](https://github.com/Calvin-LL/vue-image-modernizer/tree/main/packages/vue-cli-plugin-image-modernizer)

- vite(WIP)

## Introduction

A Vue plugin to add `srcset` for your `<img>` tags.

vue-image-modernizer is designed to modernize `<img>` tags in Vue by compressing and generating smaller images for smaller devices and adding lazy loading.

Turns

```html
<img src="./assets/image.png" modernize />
```

into

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

or

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

or

```html
<!-- note that the src image is compressed -->
<img src="/img/image.8ca0d54c.png" loading="lazy" />
```
