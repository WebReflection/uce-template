'use strict';
require('@ungap/custom-elements');
const Lie = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('@webreflection/lie'));

const {
  augmentor,
  useState,
  useRef,
  useContext,
  createContext,
  useCallback,
  useMemo,
  useReducer,
  useEffect,
  useLayoutEffect
} = require('augmentor');

const {define, render, html, svg, css} = require('uce');

const stateHandler = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('reactive-props'));
const domHandler = stateHandler({dom: true, useState});

const QSAO = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('qsa-observer'));
const query = [];
const {drop, parse: parseQSAO} = QSAO({
  query,
  handle(element, _, selector) {
    drop([element]);
    if (toBeDefined.has(selector)) {
      const define = toBeDefined.get(selector);
      toBeDefined.delete(selector);
      query.splice(query.indexOf(selector), 1);
      define();
    }
  }
});

const {asCJS, cache, loader, waiting} = require('uce-require');

// Note: rollup breaks es.js if this is imported on top
const createContent = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('@ungap/create-content'));

const partial = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./partial.js'));

const resolve = (name, module) => {
  if (name in cache && cache[name] !== waiting)
    console.warn('duplicated ' + name);
  cache[name] = module;
};
exports.resolve = resolve;

const parse = parts => {
  const template = new Template;
  template.innerHTML = parts;
  return template;
};
exports.parse = parse;

const toBeDefined = new Map;
const wrapSetup = [
  'module.exports=function(module,exports){"use strict";',
  '}'
];

const noop = () => {};

const badTemplate = () => {
  throw new Error('bad template');
};

const get = (child, name) => child.getAttribute(name);
const has = (child, name) => child.hasAttribute(name);

const lazySetup = (fn, self, props, exports) => {
  const module = {exports};
  fn.call(self, module, exports);
  const result = module.exports;
  const out = result.default || result;
  if (props)
    domHandler(self, out.props);
  return out;
};

// preloaded imports
const virtualNameSpace = {
  define, render, html, svg, css,
  reactive: stateHandler({useState}),
  slot: element => [].reduce.call(
    element.querySelectorAll('[slot]'),
    (slot, node) => {
      const name = get(node, 'slot');
      slot[name] = [].concat(slot[name] || [], node);
      return slot;
    },
    {}
  )
};

// deprecated? namespace
resolve('@uce/reactive', virtualNameSpace.reactive);
resolve('@uce/slot', virtualNameSpace.slot);

// virtual namespace
resolve('@uce', virtualNameSpace);
resolve('uce', virtualNameSpace);

// extra/useful modules
resolve('augmentor', {
  augmentor,
  useState, useRef,
  useContext, createContext,
  useCallback, useMemo, useReducer,
  useEffect, useLayoutEffect
});
resolve('qsa-observer', QSAO);
resolve('reactive-props', stateHandler);
resolve('@webreflection/lie', Lie);

// <template is="uce-template" />
const Template = define(
  'uce-template',
  {extends: 'template', props: null, init}
);

Template.resolve = resolve;
Template.from = parse;

function init(tried) {
  const defineComponent = $ => {
    const params = partial(
      template.replace(/(<!--(\{\{)|(\}\})-->)/g, '$2$3')
    );
    const component = script && loader(isSetup ? wrapSetup.join($) : $) || {};
    const {observedAttributes, props, setup} = component;
    const apply = isSetup || !!(setup || template);
    const definition = {
      props: null,
      extends: as ? name : 'element',
      init() {
        const self = this;
        const {html} = self;
        let init = true;
        let update = noop;
        const render = augmentor(() => {
          if (init) {
            init = !init;
            if (apply) {
              self.render = render;
              if (props)
                domHandler(self, props);
              const values = isSetup ?
                              lazySetup(component, self, isProps, {}) :
                              (setup && component.setup(self) || component);
              update = () => {
                html.apply(self, params(self, values));
              };
            }
          }
          update();
        });
        render();
      }
    };
    if (css)
      definition.style = () => css;
    if (shadow)
      definition.attachShadow = {mode: shadow};
    if (observedAttributes) {
      definition.observedAttributes = observedAttributes;
      definition.attributeChanged = function () {
        if (this.hasOwnProperty('attributeChanged'))
          this.attributeChanged.apply(this, arguments);
      };
    }
    if (script) {
      definition.connected = function () {
        if (this.hasOwnProperty('connected'))
          this.connected();
      };
      definition.disconnected = function () {
        if (this.hasOwnProperty('disconnected'))
          this.disconnected();
      };
    }
    for (const key in component) {
      if (!(key in definition))
        definition[key] = component[key];
    }
    define(as || name, definition);
  };

  const {content, ownerDocument, parentNode} = this;
  const {childNodes} = content || createContent(this.innerHTML);
  const styles = [];

  // drop this element in IE11before its content is live
  if (parentNode && this instanceof HTMLUnknownElement)
    parentNode.removeChild(this);

  let later = defineComponent;
  let isSetup = false;
  let isProps = false;
  let as = '';
  let css = '';
  let name = '';
  let script = '';
  let shadow = '';
  let template = '';
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];
    if (child.nodeType === 1) {
      const {tagName} = child;
      const is = has(child, 'is');
      if (/^style$/i.test(tagName))
        styles.push(child);
      else if (is || /-/i.test(tagName)) {
        if (name)
          badTemplate();
        name = tagName.toLowerCase();
        template = child.innerHTML;
        if (is)
          as = get(child, 'is').toLowerCase();
        if (has(child, 'shadow'))
          shadow = get(child, 'shadow') || 'open';
      }
      else if (/^script$/i.test(tagName)) {
        if (script)
          badTemplate();
        isSetup = has(child, 'setup');
        isProps = isSetup && get(child, 'setup') === 'props';
        script = child.textContent;
        later = () => {
          asCJS(script, true).then(defineComponent);
        };
      }
    }
  }
  const selector = as ? (name + '[is="' + as + '"]') : name;
  if (!selector)
    return setTimeout(tried ? badTemplate : init.bind(this), 0, true);
  for (let i = styles.length; i--;) {
    const child = styles[i];
    const {textContent} = child;
    if (has(child, 'shadow'))
      template = '<style>' + textContent + '</style>' + template;
    else if (has(child, 'scoped')) {
      const def = [];
      css += textContent.replace(
              /\{([^}]+?)\}/g,
              (_, $1) => '\x01' + def.push($1) + ','
            )
            .split(',')
            .map(s => (s.trim() ? (selector + ' ' + s.trim()) : ''))
            .join(',\n')
            .replace(/\x01(\d+),/g, (_, $1) => '{' + def[--$1] + '}')
            .replace(/(,\n)+/g, ',\n');
    }
    else
      css += textContent;
  }
  if (has(this, 'lazy')) {
    toBeDefined.set(selector, later);
    query.push(selector);
    parseQSAO(ownerDocument.querySelectorAll(query));
  }
  else
    later();
}
