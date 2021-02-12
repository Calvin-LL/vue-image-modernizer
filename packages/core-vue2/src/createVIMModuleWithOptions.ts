import mime from "mime";
import { ASTElement, ASTNode, ModuleOptions } from "vue-template-compiler";

import {
  IMAGE_FORMATS,
  VIMOptions,
  defaultVIMOptions,
  getMIMEFromImageFormat,
  parseElementLevelOptions,
} from "@vue-image-modernizer/core-shared";

interface ATTR {
  name: string;
  value: any;
  start?: number;
  end?: number;
}

type ASTElementWithAttr = ASTElement & Pick<Required<ASTElement>, "attrs">;

export function createVIMModuleWithOptions(options: VIMOptions): ModuleOptions {
  // @ts-expect-error vue typing mistake https://github.com/vuejs/vue/issues/10812
  return {
    postTransformNode: (node: ASTNode) => {
      transform(node, options);
    },
  };
}

export function transform(
  node: ASTNode,
  options: VIMOptions = defaultVIMOptions
): void {
  if (!("tag" in node)) return;
  if (node.attrsList.length === 0) return;
  if (node.tag.toLowerCase() !== "img") return;

  options = { ...defaultVIMOptions, ...options };

  const directiveAttrRaw = node.attrsList.find(
    (attr) => attr.name === options.attributeName
  );

  if (directiveAttrRaw === undefined) return;

  const elementLevelOptions = parseElementLevelOptions(directiveAttrRaw.value);

  const combinedOptions = {
    ...options,
    ...elementLevelOptions,
    quality: {
      ...options.quality,
      ...elementLevelOptions.quality,
    },
  } as Required<VIMOptions>;

  if (node.attrs === undefined) node.attrs = [];

  const srcAttrRaw = node.attrsList.find((attr) => attr.name === "src");
  const srcAttr = node.attrs.find((attr) => attr.name === "src");

  if (srcAttrRaw === undefined) throw new Error("src attribute not found");

  if (srcAttrRaw.value.length === 0)
    throw new Error("src attribute does not have a value");

  rewriteSrcAttr(
    node as ASTElementWithAttr,
    srcAttr,
    srcAttrRaw,
    combinedOptions
  );

  if (!combinedOptions.compressOnly && combinedOptions.onlyUseImg)
    addSrcSetAttr(node as ASTElementWithAttr, srcAttrRaw, combinedOptions);

  if (!combinedOptions.noLazy)
    addLoadingAttr(node as ASTElementWithAttr, directiveAttrRaw);

  // remove 'modernize' tag in most cases, don't want to render it
  removeAttr(node, combinedOptions.attributeName);

  if (!combinedOptions.compressOnly && !combinedOptions.onlyUseImg)
    transformIntoPicture(node, directiveAttrRaw, srcAttrRaw, combinedOptions);
}

function transformIntoPicture(
  node: ASTElement,
  directiveAttrRaw: ATTR,
  srcAttrRaw: ATTR,
  options: Required<VIMOptions>
): void {
  // used as the img tag inside picture
  const nodeClone: ASTElement = {
    ...node,
    attrsList: [...(node.attrsList ?? [])],
    attrsMap: { ...node.attrsMap },
    // @ts-expect-error vue typing error
    rawAttrsMap: { ...node.rawAttrsMap },
    // keep them out if they weren't there initially
    ...(node.attrs ? { attrs: [...node.attrs] } : {}),
    ...(node.props ? { props: [...node.props] } : {}),
    children: [],
    parent: node,
  };

  options.imageFormats.forEach((format) => {
    const mimeType =
      format === "original"
        ? (mime.getType(srcAttrRaw.value) as keyof typeof IMAGE_FORMATS)
        : getMIMEFromImageFormat(format);

    // skip if there is already a source with the same type
    if (
      node.children.some(
        (childNode) =>
          childNode.type === 1 &&
          childNode.attrs?.some(
            (attr) => attr.name === "type" && attr.value === `"${mimeType}"`
          )
      )
    )
      return;

    node.children.push(
      genSourceElement(node, srcAttrRaw, directiveAttrRaw, options, mimeType)
    );
  });

  node.children.push(nodeClone);
  node.tag = "picture";

  delete node.attrs;
  delete node.props;

  removeAttr(node, "src");
}

function genSourceElement(
  parent: ASTElement,
  srcAttrRaw: ATTR,
  directiveAttrRaw: ATTR,
  options: Required<VIMOptions>,
  format: keyof typeof IMAGE_FORMATS
): ASTElement {
  const sourceElement: ASTElementWithAttr = {
    type: 1,
    tag: "source",
    attrsList: [],
    attrsMap: {},
    parent,
    children: [],
    plain: false,
    attrs: [],
    ...(directiveAttrRaw.start !== undefined &&
    directiveAttrRaw.end !== undefined
      ? { start: directiveAttrRaw.start, end: directiveAttrRaw.end }
      : {}),
  };

  sourceElement.attrs!.push({
    ...directiveAttrRaw,
    name: "type",
    value: `"${format}"`,
    // @ts-expect-error vue's typing error
    dynamic: undefined,
  });

  addSrcSetAttr(sourceElement, srcAttrRaw, options, format);

  return sourceElement;
}

function rewriteSrcAttr(
  node: ASTElementWithAttr,
  srcAttr: ATTR | undefined,
  srcAttrRaw: ATTR,
  options: Required<VIMOptions>,
  format?: keyof typeof IMAGE_FORMATS
): void {
  if (srcAttr) {
    srcAttr.value = getSrcValue(srcAttrRaw.value, options, format);
  } else {
    node.attrs.push({
      ...srcAttrRaw,
      value: getSrcValue(srcAttrRaw.value, options, format),
      // @ts-expect-error vue's typing error
      dynamic: undefined,
    });
  }
}

function addSrcSetAttr(
  node: ASTElementWithAttr,
  srcAttrRaw: ATTR,
  options: Required<VIMOptions>,
  format?: keyof typeof IMAGE_FORMATS
): void {
  node.attrs.push({
    ...srcAttrRaw,
    name: "srcset",
    value: getSrcSetValue(srcAttrRaw.value, options, format),
    // @ts-expect-error vue's typing error
    dynamic: undefined,
  });
}

function addLoadingAttr(
  node: ASTElementWithAttr,
  directiveAttrRaw: ATTR
): void {
  if (node.attrs.some(({ name }) => name === "loading")) return;

  node.attrs.push({
    ...directiveAttrRaw,
    name: "loading",
    value: '"lazy"',
    // @ts-expect-error vue's typing error
    dynamic: undefined,
  });
}

function getSrcValue(
  path: string,
  options: Required<VIMOptions>,
  format?: keyof typeof IMAGE_FORMATS
): string {
  const compressedSrc = options.compressFilePathTransformer(
    path,
    options,
    format
  );

  return `require('${compressedSrc}')`;
}

function getSrcSetValue(
  path: string,
  options: Required<VIMOptions>,
  format?: keyof typeof IMAGE_FORMATS
): string {
  const srcSet = options.srcSetFilePathTransformer(path, options, format);

  return `require('${srcSet}').default`;
}

function removeAttr(el: ASTElement, name: string): void {
  const list = el.attrsList;
  for (let i = 0, l = list.length; i < l; i++) {
    if (list[i].name === name) {
      list.splice(i, 1);
      break;
    }
  }

  delete el.attrsMap[name];

  if (el.attrs) {
    const list = el.attrs;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }
}
