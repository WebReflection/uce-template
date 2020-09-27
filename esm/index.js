import '@ungap/custom-elements';
import Lie from '@webreflection/lie';

import {
  augmentor,
  useState, useRef,
  useContext, createContext,
  useCallback, useMemo, useReducer,
  useEffect, useLayoutEffect
} from 'augmentor';

import {define, render, html, svg, css} from 'uce';

import stateHandler from 'reactive-props';
const domHandler = stateHandler({dom: true, useState});

import QSAO from 'qsa-observer';
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

import {asCJS, cache, cjs, waiting} from 'uce-require';
const {loader} = cjs;

// Note: rollup breaks es.js if this is imported on top
import createContent from '@ungap/create-content';

import partial from './partial.js';

export const resolve = (name, module) => {
  if (name in cache && cache[name] !== waiting)
    throw new Error('duplicated ' + name);
  cache[name] = module;
};

export const parse = parts => {
  const template = new Template;
  template.innerHTML = parts;
  return template;
};

const fallback = {setup: () => {}};
const toBeDefined = new Map;
const badTemplate = () => {
  throw new Error('bad template');
};

// preloaded imports
const virtualNameSpace = {
  define, render, html, svg, css,
  reactive: stateHandler({useState}),
  slot: element => [].reduce.call(
    element.querySelectorAll('[slot]'),
    (slot, node) => {
      slot[node.getAttribute('slot')] = node;
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
  const defineComponent = content => {
    const component = script ? loader(content) : fallback;
    const setup = component.setup || fallback.setup;
    const {observedAttributes, props} = component;
    const params = partial(template);
    const definition = {
      props: null,
      extends: as ? name : 'element',
      init() {
        const self = this;
        const {html} = self;
        let init = true;
        let context = null;
        (this.render = augmentor(() => {
          if (init) {
            init = false;
            if (props)
              domHandler(self, props);
            context = setup.call(component, self) || {};
          }
          html.apply(null, params.call(this, context));
        }))();
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
      const is = child.hasAttribute('is');
      if (/^style$/i.test(tagName))
        styles.push(child);
      else if (is || /-/i.test(tagName)) {
        if (name)
          badTemplate();
        name = tagName.toLowerCase();
        template = child.innerHTML;
        if (is)
          as = child.getAttribute('is').toLowerCase();
        if (child.hasAttribute('shadow'))
          shadow = child.getAttribute('shadow') || 'open';
      }
      else if (/^script$/i.test(tagName)) {
        if (script)
          badTemplate();
        script = child.textContent;
        later = () => {
          asCJS(script, true).then(defineComponent);
        };
      }
    }
  }
  const selector = as ? (name + '[is="' + as + '"]') : name;
  if (!selector && !tried)
    return setTimeout(init.bind(this), 0, true);
  for (let i = styles.length; i--;) {
    const child = styles[i];
    const {textContent} = child;
    if (child.hasAttribute('shadow'))
      template = '<style>' + textContent + '</style>' + template;
    else if (child.hasAttribute('scoped')) {
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
  if (this.hasAttribute('lazy')) {
    toBeDefined.set(selector, later);
    query.push(selector);
    parseQSAO(ownerDocument.querySelectorAll(query));
  }
  else
    later();
}
