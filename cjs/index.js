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

customElements.whenDefined('uce-require').then(uce => {
  const modules = uce || customElements.get('uce-require');
  customElements.whenDefined('uce-lib').then(uce => {
    const {define, html, svg} = uce || customElements.get('uce-lib');
    define('uce-template', {
      extends: 'template',
      init() {
        const {children} = this.content || createContent(this.innerHTML);
        let script = null;
        let is = '';
        let name = '';
        let shadow = '';
        let style = '';
        let template = [];
        modules.load.then(require => {
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const {nodeName} = child;
            if (/-/i.test(nodeName)) {
              name = nodeName.toLowerCase();
              template = partial(child.innerHTML);
              if (child.hasAttribute('is'))
                is = child.getAttribute('is').toLowerCase();
              if (child.hasAttribute('shadow'))
                shadow = child.getAttribute('shadow') || 'open';
            }
            else if (/script/i.test(nodeName)) {
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
            else if (/style/i.test(nodeName))
              style = child.textContent;
          }
          const callbacks = new WeakMap;
          const {observedAttributes} = script;
          define(is || name, {
            observedAttributes,
            extends: is ? name : 'element',
            attachShadow: shadow ? {mode: shadow} : void 0,
            attributeChanged: observedAttributes && function () {
              const {attributeChanged} = callbacks.get(this);
              if (attributeChanged)
                attributeChanged.apply(this, arguments);
            },
            connected() {
              const {connected} = callbacks.get(this);
              if (connected)
                connected.apply(this, arguments);
            },
            disconnected() {
              const {disconnected} = callbacks.get(this);
              if (disconnected)
                disconnected.apply(this, arguments);
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
                    callbacks.set(self, script.callbacks || {});
                    data = script.setup();
                  }
                  html.apply(null, template(data));
                })();
              }
            }
          });
        });
      }
    });
  });
});
