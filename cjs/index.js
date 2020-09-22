'use strict';
require('uce');
require('uce-require');

const createContent = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('@ungap/create-content'));
const {partial} = require('tag-params');

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

customElements.whenDefined('uce-lib').then(uce => {
  const {define, html, svg} = uce || customElements.get('uce-lib');
  customElements.whenDefined('uce-require').then(uce => {
    const modules = uce || customElements.get('uce-require');
    define('uce-template', {
      extends: 'template',
      init() {
        const {children} = this.content || createContent(this.innerHTML);
        const styles = [];
        let script = null;
        let as = '';
        let name = '';
        let shadow = '';
        let css = '';
        let template = '';
        modules.load.then(require => {
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const {tagName} = child;
            const is = child.hasAttribute('is');
            if (/^style$/i.test(tagName))
              styles.push(child);
            else if (is || /-/i.test(tagName)) {
              if (name)
                throw new Error('too many components');
              name = tagName.toLowerCase();
              template = child.innerHTML;
              if (is)
                as = child.getAttribute('is').toLowerCase();
              if (child.hasAttribute('shadow'))
                shadow = child.getAttribute('shadow') || 'open';
            }
            else if (/^script$/i.test(tagName)) {
              if (script)
                throw new Error('a component should have one script');
              const exports = {};
              const module = {exports};
              Function(
                'require', 'module', 'exports',
                'html', 'svg',
                'useState', 'useRef',
                'useContext', 'createContext',
                'useCallback', 'useMemo', 'useReducer',
                'useEffect', 'useLayoutEffect',
                child.textContent
              )(
                require, module, exports,
                html, svg,
                useState, useRef,
                useContext, createContext,
                useCallback, useMemo, useReducer,
                useEffect, useLayoutEffect
              );
              script = module.exports;
            }
          }
          const selector = as ? (name + '[is="' + as + '"]') : name;
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
          const params = partial(template);
          const {observedAttributes} = script;
          define(as || name, {
            observedAttributes,
            style: css ? () => css : null,
            extends: as ? name : 'element',
            attachShadow: shadow ? {mode: shadow} : void 0,
            attributeChanged: observedAttributes && function () {
              if (this.hasOwnProperty('attributeChanged'))
                this.attributeChanged();
            },
            connected() {
              if (this.hasOwnProperty('connected'))
                this.connected();
            },
            disconnected() {
              if (this.hasOwnProperty('disconnected'))
                this.connected();
            },
            init() {
              const self = this;
              const {html} = self;
              if (script) {
                let init = true;
                let data = null;
                augmentor(() => {
                  if (init) {
                    init = false;
                    data = script.setup(self);
                  }
                  html.apply(null, params(data));
                })();
              }
            }
          });
        });
      }
    });
  });
});
