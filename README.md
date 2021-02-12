# vue-image-modernizer

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](https://opensource.org/licenses/MIT)

# Plugins

[vue-cli-plugin](https://github.com/Calvin-LL/vue-image-modernizer/tree/main/packages/vue-cli-plugin-image-modernizer)
vite(WIP)

# Introduction

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
  <img src="/img/Simple_Periodic_Table_Chart-en.fca0d5a2.png" loading="lazy" />
</picture>
```
