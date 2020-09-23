import {augmentor, useState} from 'augmentor';
/*
import {
  augmentor,
  useState, useRef,
  useContext, createContext,
  useCallback, useMemo, useReducer,
  useEffect, useLayoutEffect
} from 'augmentor';
*/

import createContent from '@ungap/create-content';

import stateHandler from 'reactive-props';

import {partial} from 'tag-params';

import {define, render, html, svg} from 'uce';

import {cjs} from 'uce-require';

customElements.whenDefined('uce-require').then(uce => {
  const modules = uce || customElements.get('uce-require');
  const reactive = stateHandler({useState});
  const domHandler = stateHandler({dom: true, useState});
  const module = cjs({reactive, render, html, svg});
  define('uce-template', {
    extends: 'template',
    init() {
      const {childNodes} = this.content || createContent(this.innerHTML);
      const styles = [];
      let script = null;
      let as = '';
      let css = '';
      let name = '';
      let shadow = '';
      let template = '';
      modules.load.then(() => {
        for (let i = 0; i < childNodes.length; i++) {
          const child = childNodes[i];
          if (child.nodeType === 1) {
            const {tagName} = child;
            const is = child.hasAttribute('is');
            if (/^style$/i.test(tagName))
              styles.push(child);
            else if (is || /-/i.test(tagName)) {
              if (name)
                throw new Error('bad template');
              name = tagName.toLowerCase();
              template = child.innerHTML.replace(
                          /\{\{([^\2]+?)(\}\})/g,
                          (_, $1) => '${' + $1 + '}'
                        );
              if (is)
                as = child.getAttribute('is').toLowerCase();
              if (child.hasAttribute('shadow'))
                shadow = child.getAttribute('shadow') || 'open';
            }
            else if (/^script$/i.test(tagName)) {
              if (script)
                throw new Error('bad template');
              script = module(child.textContent);
            }
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
        const {observedAttributes, props} = script;
        define(as || name, {
          observedAttributes,
          style: css ? () => css : null,
          extends: as ? name : 'element',
          attachShadow: shadow ? {mode: shadow} : null,
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
            let init = true;
            let context = null;
            (this.render = augmentor(() => {
              if (init) {
                init = false;
                if (props)
                  domHandler(self, props);
                context = script.setup(self);
              }
              html.apply(null, params(context));
            }))();
          }
        });
      });
    }
  });
});
