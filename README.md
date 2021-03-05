# <em>µ</em>ce-template

[![Downloads](https://img.shields.io/npm/dm/uce-template.svg)](https://www.npmjs.com/package/uce-template) [![CSP friendly](https://webreflection.github.io/csp/friendly.svg)](https://webreflection.github.io/csp/#-csp-friendly)

![winter sky](./test/uce-template-head.jpg)

<sup>**Social Media Photo by [Federico Bottos](https://unsplash.com/@landscapeplaces) on [Unsplash](https://unsplash.com/)**</sup>

A tiny toolless library with tools included. **[Live demo](https://webreflection.github.io/uce-template/test/)**

- - -

### 📣 Community Announcement

Please ask questions in the [dedicated discussions repository](https://github.com/WebReflection/discussions), to help the community around this project grow ♥

---

Inspired by [Vue 3 "_One Piece_"](https://github.com/vuejs/vue-next/releases/tag/v3.0.0), _uce-template_ provides a custom builtin `<template>` element to define components in a _Vue_ fashion.

```html
<template is="uce-template">

  <style scoped>
  span { color: green }
  </style>

  <the-green>
    The <span>{{thing}}</span> is green
  </the-green>

  <script type="module">
  export default {
    setup() {
      return {thing: 'world'}
    }
  }
  </script>

</template>
```

Add this library to the equation, and [see it bootstrapping](https://codepen.io/WebReflection/pen/xxVMgZx?editors=1000) all defined components.

- - -

## Getting Started

<details>
  <summary><strong>Features</strong></summary>
  <div>

  * **SSR** compatibility out of the box: components definitions land *once* so no duplicated templates are needed in both layout and *JS*
  * a simple **CLI** that converts any html page or component into its minified version and, optionally, *Babel* transpilation
  * **Custom Elements** based, including builtin extends, so that *IE11*, *Safari*, or any other browser, will work right away
  * optionally **lazy** `<template lazy>` component, to resolve their definition only when live
  * optionally **shadow**ed `<custom-element shadow>` components, and optionally shadowed `<style shadow>` styles
  * a variety of pre-defined modules to import, including a virtual `@uce` module, to create reactive *UIs* and more
  * a runtime *ESM -> CommonJS* **module** system, where relative dependencies are [resolved (once) lazily](./extra-details.md#the-lazy-js-environment), but any imported [module can be pre-defined](./extra-details.md#the-module-js-environment) through the `resolve(name, module)` exported utility
  * everything pre-bundled fits into *10K* gzipped budget, or *9K* via brotli, but it's only *7K* gzip, and *6.5K* brotli in its *no-polyfills* version 🦄

#### Goals

  * demonstrate that tools and tooling can be optional, thanks to the current state of the *Web*
  * avoid any debate regarding duplicated code and re-hydration cost: each component can be served through static pages or dynamic *SSR*, without needing duplicated code around
  * being ahead of time providing the long discussed partial templates already, improving the previous *HTML Imports* idea, which has been dropped anyway, and simplifying scoped styles via auto prefixes or shadow dom
  * being extremely developer friendly with a script anyone can add on any page to start with, with the optional tooling offered by the module itself to optimize stand alone components, or even whole *HTML* pages

  </div>
</details>

<details>
  <summary><strong>CLI</strong></summary>
  <div>

While it's suggested to install the *CLI* globally, due some not-super-light dependency, it's still an `npx` command away:

```sh
# check all options and usage
npx uce-template --help

# works with files
npx uce-template my-component.html

# works with stdin
cat my-component.html | uce-template
```

That's it, but of course we should be sure that produced layout still works as expected 👍

  </div>
</details>

<details>
  <summary><strong>&lt;template&gt;</strong></summary>
  <div>

Any template that extends `uce-template` *must* contain at least a custom element in it, either regular, or built-in extend:

```html
<!-- register regular-element -->
<template is="uce-template">
  <regular-element>
    regular
  </regular-element>
</template>

<!-- register builtin-element as div -->
<template is="uce-template">
  <div is="builtin-element">
    builtin
  </div>
</template>
```

Any template *might* contain a single `<script>` tag, and/or one or more `<style>` definitions.


#### &lt;slot&gt;

If a component contains `{{slot.name}}` definitions, nodes from the living *HTML*, before the component gets upgraded, will be placed in there once live.

See this [live example](https://codepen.io/WebReflection/pen/OJNdZPB?editors=1000) to understand more.

  </div>
</details>

<details>
  <summary><strong>&lt;custom-element&gt;</strong></summary>
  <div>

Each "*component*" might define itself with, or without, its own static, or dynamic, content.

Such *content* will be used to render each custom element once "*mounted*" (live) and per each reactive state change, but *only* if the template is not an empty one.

All **dynamic parts** must be wrapped within `{{dynamic}}` curly brackets as shown here:

```html
<my-counter>
  <button onclick={{dec}}> - </button>
  <span>{{state.count}}</span>
  <button onclick={{inc}}> + </button>
</my-counter>
```

The `state`, `dec`, and `inc` references will be passed along through the script node, if any.

Whenever the component is rendered, its update callback is invoked providing the element itself as a **context**.

```html
<button is="my-button">
  I am a {{this.tagName}}
</button>
```

Regarding **ShadowDOM**, its polyfill is not included in this project but it's possible to define a component through its *shadow root* by adding a *shadow* attribute:

```html
<my-counter shadow>
  <!-- this content will be in the shadowRoot -->
  <button onclick={{dec}}> - </button>
  <span>{{state.count}}</span>
  <button onclick={{inc}}> + </button>
</my-counter>
```

The `shadow` attribute is `open` by default, but it can also be specified as `shadow=closed`.

Regarding `{{JS}}`, if attribute, and you'd like to use `{{ JS }}` spaces around, the attribute *must* be in quotes, otherwise the *HTML* template breaks the layout in unexpected ways.

```html
<!-- OK -->
<my-counter>
  <button onClick={{dec}}> - </button>
</my-counter>

<!-- OK -->
<my-counter>
  <button onClick="{{ dec }}"> - </button>
</my-counter>

<!-- IT BREAKS!!! -->
<my-counter>
  <button onClick={{ dec }}> - </button>
</my-counter>
```

### The curious `<!--{{interpolation}}-->` case

As everything in here is mostly based on standard *HTML* behavior, there are cases where an interpolation should be wrapped as comment.

The rule of thumb is that if you don't see the layout, or you read some *Bad template* error, it is possible that your interpolation could've been swallowed by the *template* element.

This happens mostly with elements such as **table**, **select**, and other elements that accept only a specific type of child node, but not text.

```html
<!-- 👎 this won't work as expected -->
<table is="my-table">
  <tbody>{{rows}}</tbody>
</table>

<!-- 👍 this works 🎉 -->
<table is="my-table">
  <tbody><!--{{rows}}--></tbody>
</table>
```

In the first case, the `<tbody>` would ignore any node that is not a `<tr>` *except for comments*, because comments don't get swallowed, or lost, in the process.

You can see the [dbmonster.html](./test/dbmonster.html) file definition for both the custom `<table>` and the custom `<tr>` component.


  </div>
</details>

<details>
  <summary><strong>&lt;style&gt;</strong></summary>
  <div>

A component can have *one or more* styles in it, within a specific *scope*:

  * a generic `<style>` will apply its content globally, useful to address `my-counter + my-counter {...}` cases, as example
  * a `<style scoped>` will apply its content prefixed with the Custom Element name (i.e. `my-counter span, my-counter button {...}`)
  * a `<style shadow>` will apply its content on top of the *shadowRoot*, assuming the component is defined with a `shadow` attribute

There is nothing special to consider here, except that *global* styles might interfere with *IE11* if too obtrusive, as once again *IE11* doesn't understand the `<template>` element purpose and behavior.

  </div>
</details>

<details>
  <summary><strong>&lt;script&gt;</strong></summary>
  <div>

A definition can contain only *one script tag* in it, and such *script* will be virtually handled like a *module*.

Since *IE11* is *not* compatible with `<template>` elements, if the `type` is not specified, *IE11* will try to evaluate all scripts on the page right-away.

Accordingly, the `type` attribute can really have any value, as it's completely irrelevant for this library, but such value must not be IE11 compatible, and `module` is just one value that *IE11* would ignore.

The script *might* contain a `default export`, or even a `module.exports = ...`, where such export *might* have a `setup(element) { ... }` method that returns what the *dynamic* parts of the component expect:

```html
<script type="module">
import {reactive} from '@uce';
export default {
  setup(element) {
    const state = reactive({ count: 0 });
    const inc = () => { state.count++ };
    const dec = () => { state.count-- };
    return {state, inc, dec};
  }
};
</script>
```

The `@uce` *reactive* helper makes it possible to automatically update the view whenever one of its properties changes.

To know more about reactive changes, please [read this Medium post](https://medium.com/@WebReflection/reactive-state-for-data-dom-78332ddafd0e).

### The `setup` attribute

If a `<script type="module" setup>` is found, the content of the script is invoked with the element itself as context.

[Live demo](https://webreflection.github.io/uce-template/test/setup.html)

```html
<x-clock></x-clock>
<template is="uce-template">
  <x-clock>{{time}}</x-clock>
  <script type="module" setup>
    let id = 0;
    export default {
      get time() {
        return (new Date).toISOString();
      }
    };
    this.connected = e => id = setInterval(this.render, 1000 / 30);
    this.disconnected = e => clearInterval(id);
  </script>
</template>
```

This shortcut is specially handy for components that don't need to setup *observedAttributes* but might need to setup *props*, and for the latter case, the `setup` attribute should contain `props`.

```html
<script type="module" setup="props">
  // props are defined as key => defaultValue pairs
  export const props = {
    name: this.name || 'anonymous',
    age: +this.age || 0
  };
</script>
```

  </div>
</details>

- - -

## How to / Examples

This section goal is to showcase basic to complex examples via *uce-template*, where some example might use the `.uce` extension to confine components within their own files.

<details>
  <summary><strong>View <code>.uce</code> files as HTML</strong></summary>
  <div>

If you are using VS Code, you can *Ctrl+Shift+p*, type *settings JSON*, choose *Open Settings (JSON)*, and add the following to such file in order to highlight `.uce` files as *HTML*:

```js
{
  "other-settings": "...",

  "files.associations": {
    "*.uce": "html"
  }
}
```

  </div>
</details>

<details>
  <summary><strong>Lazy Loaded Components</strong></summary>
  <div>

If we define components as `view/my-component.uce` we might as well decide to include these lazily, or better, only when these are found in the current page.

This approach simplifies a lot bundles, dependencies, unnecessary bloat, and it can be done by including just `uce-template` and the tiny <sup><sub>(364 bytes)</sub></sup> [uce-loader](https://github.com/WebReflection/uce-loader#readme) as bootstrap, eventually defining extra dependencies used across components.

```js
import {parse, resolve} from 'uce-template';
import loader from 'uce-loader';

// optional components dependencies
import something from 'cool';
resolve('cool', something);

// bootstrap the loader
loader({
  on(component) {
    // ignore uce-template itself
    if (component !== 'uce-template')
      fetch(`view/${component}.uce`)
        .then(body => body.text())
        .then(definition => {
          document.body.appendChild(
            parse(definition)
          );
        });
  }
});
```

The same technique could be used directly on any *HTML* page, writing some code that might be compatible with *IE11* too.

```html
<!doctype html>
<html>
  <head>
    <script defer src="//unpkg.com/uce-template"></script>
    <script defer src="//unpkg.com/uce-loader"></script>
    <script defer>
    addEventListener(
      'DOMContentLoaded',
      function () {
        uceLoader({
          Template: customElements.get('uce-template'),
          on: function (name) {
            if (name !== 'uce-template') {
              var xhr = new XMLHttpRequest;
              var Template = this.Template;
              xhr.open('get', name + '.uce', true);
              xhr.send(null);
              xhr.onload = function () {
                document.body.appendChild(
                  Template.from(xhr.responseText)
                );
              };
            }
          }
        });
      },
      {once: true}
    );
    </script>
  </head>
  <body>
    <my-component>
      <p slot="content">
        Some content to show in <code>my-component</code>
      </p>
    </my-component>
  </body>
</html>
```

  </div>
</details>

<details>
  <summary><strong>Lazy Loaded <code>uce-template</code></strong></summary>
  <div>

If the majority of our pages don't use components at all, adding 7K+ of *JS* on top of each page might be undesired.

However, we can follow the very same *Lazy Loaded Components* approach, except our loader will be in charge of bringing in also the *uce-template* library, either when an *uce-template* itself is found, or any other component.

```js
import loader from 'uce-loader';
loader({
  on(component) {
    // first component found, load uce-template
    if (!this.q) {
      this.q = [component];
      const script = document.createElement('script');
      script.src = '//unpkg.com/uce-template';
      document.body.appendChild(script).onload = () => {
        // get the uce-template class to use its .from(...)
        this.Template = customElements.get('uce-template');
        // load all queued components
        for (var q = this.q.splice(0), i = 0; i < q.length; i++)
          this.on(q[i]);
      };
    }
    // when uce-template is loaded
    else if (this.Template) {
      // ignore loading uce-template itself
      if (component !== 'uce-template') {
        // load the component on demand
        fetch(`view/${component}.uce`)
          .then(body => body.text())
          .then(definition => {
            document.body.appendChild(
              this.Template.from(definition)
            );
          });
      }
    }
    // if uce-template is not loaded yet
    // add the component to the queue
    else
      this.q.push(component);
  }
});
```

Using this technique, our *JS* payload per page would be now reduced to less than *0.5K* once above code gets bundled and minified, while everything else will happen automatically only if there are components somewhere in the page.

  </div>
</details>


<details>
  <summary><strong>Lazy loaded expected components</strong></summary>
  <div>

As the page could contain other custom elements from third party and libraries, it might be a good idea to predefine a well known *Set* of expected components, as opposite of trying to load any possible custom elements via the `view/${...}.uce` request.

Previous lazy loading techniques would work just fine already, but instead of checking that the component name is not `uce-template`, we could use a *Set*:

```js
loader({
  known: new Set(['some-comp', 'some-other']),
  on(component) {
    if (this.known.has(component))
      fetch(`view/${component}.uce`)
        .then(body => body.text())
        .then(definition => {
          document.body.appendChild(
            parse(definition)
          );
        });
  }
});
```

The advantage of this technique is that the `known` *Set* could be dynamically generated through the list of `view/*.uce` files so that nothing would break if the found component is not part of the *uce-template* family.

  </div>
</details>


<details>
  <summary><strong>CSP &amp; integrity/nonce</strong></summary>
  <div>

`uce-template` inevitably needs to use `Function` to evaluate either [template partials](https://github.com/WebReflection/tag-params#caveats) or in-script *require(...)*.

It is recommended to increase security using either the __nonce__ `UdViHMqz84lHe6IIfu6LVoQwP0AlQyvLpqZD8Cyopac=` or the *integrity* attribute, trusting via [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) only scripts that comes from our own domain.

```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval'">
<script defer src="/js/uce-template.js"
        integrity="sha256-UdViHMqz84lHe6IIfu6LVoQwP0AlQyvLpqZD8Cyopac="
        crossorigin="anonymous">
</script>
```

Please note that these values **change on every release** so please be sure you have the latest version (this README reflects the latest).

  </div>
</details>

<details>
  <summary><strong>Component own events</strong> <sup><sub>( without props )</sub></sup></summary>
  <div>

As it is for [uce](https://github.com/WebReflection/uce#readme), if the definition contains `onEvent(){...}` methods, these will be used to define the component.

However, since states are usually decoupled from the component itself, it's a good idea to use a *WeakMap* to relate any component with its state and ... don't worry, *WeakMap* is natively supported in *IE11* too!

[Live demo](https://codepen.io/WebReflection/pen/KKzERew?editors=1000)

```html
<button is="my-btn">
  Clicked {{times}} times!
</button>
<script type="module">
  const states = new WeakMap;
  export default {
    setup(element) {
      const state = {times: 0};
      states.set(element, state);
      return state;
    },
    onClick() {
      states.get(this).times++;
      // update the current view if the
      // state is not reactive
      this.render();
    }
  };
</script>
```

Please note this example covers any *state* VS *component* use case, as using the *WeakMap* is a recommendation.

  </div>
</details>

<details>
  <summary><strong>Component own events</strong> <sup><sub>( with props )</sub></sup></summary>
  <div>

If `props` object is defined, and since *props** update the view automatically once changed, we might not need a *WeakMap* to relate the component's state.

[Live demo](https://codepen.io/WebReflection/pen/XWdGqxp?editors=1000)

```html
<button is="my-btn"></button>
<template is="uce-template">
  <button is="my-btn">
    Clicked {{this.times}} times!
  </button>
  <script type="module">
    export default {
      props: {times: 0},
      onClick() {
        this.times++;
      }
    };
  </script>
</template>
```

The advantage of using props is that it's possible to define an initial state through attributes, or via direct setting it when rendered through the `html` utility, so that having a button with `times="3"`, as example, would be rendered showing *Clicked 3 times!* right away.

```html
<button is="my-btn" times="3"></button>
```

  </div>
</details>

<details>
  <summary><strong>Multiple refs</strong></summary>
  <div>

The `import {ref} from '@uce'` helper simplifies retrieval of node by `ref="name"` attribute.

```html
<element-details>
  <span ref="name"></span>
  <span ref="description"></span>
</element-details>

<template is="uce-template">
  <element-details></element-details>
  <script type="module" setup>
    import {ref} from '@uce';
    const {name, description} = ref(this);
    name.textContent = 'element name';
    description.textContent = 'element description';
  </script>
</template>
```

  </div>
</details>

<details>
  <summary><strong>Multiple, dynamic, slots</strong></summary>
  <div>

The `import {slot} from '@uce'` helper simplifies retrieval of slots by name, returning an *array* of elements grouped through the same name.

This can be used either to place single slots in interpolations, as [shown in this example](https://codepen.io/WebReflection/pen/OJNdZPB?editors=1000), or to place multiple slots within the same node.

[Live demo](https://codepen.io/WebReflection/pen/NWNJVLR?editors=1000)

```html
<filter-list>
  Loading filter ...
  <ul>
    <li slot="list">some</li>
    <li slot="list">searchable</li>
    <li slot="list">text</li>
  </ul>
</filter-list>

<template is="uce-template">
  <filter-list>
    <div>
      <input placeholder=filter oninput={{filter}}>
    </div>
    <ul>
      {{list}}
    </ul>
  </filter-list>
  <script type="module">
    import {slot} from '@uce';
    export default {
      setup(element) {
        const list = slot(element).list || [];
        return {
          list,
          filter({currentTarget: {value}}) {
            for (const li of list)
              li.style.display =
                li.textContent.includes(value) ? null : 'none';
          }
        };
      }
    };
  </script>
</template>
```

**However**, in cases where the same-name slots order is not necessarily visualized sequentially, it is always possible to pass an array of nodes instead.

That is, any interpolation value can be a DOM node, some value, or an Array of nodes, same way [µhtml](https://github.com/WebReflection/uhtml#readme) works.

[Live demo](https://codepen.io/WebReflection/pen/JjXzqww?editors=1000)

```html
<howto-tabs>
  <p>Loading tabs ...</p>
  <howto-tab role="heading" slot="tab">Tab 1</howto-tab>
  <howto-panel role="region" slot="panel">Content 1</howto-panel>
  <howto-tab role="heading" slot="tab">Tab 2</howto-tab>
  <howto-panel role="region" slot="panel">Content 2</howto-panel>
</howto-tabs>

<template is="uce-template">
  <howto-tabs>
    {{tabs}}
  </howto-tabs>
  <script type="module">
    import {slot} from '@uce';
    export default {
      setup(element) {
        const {tab, panel} = slot(element);
        const tabs = tab.reduce(
          (tabs, tab, i) => tabs.concat(tab, panel[i]),
          []
        );
        return {tabs};
      }
    };
  </script>
</template>
```

  </div>
</details>

<details>
  <summary><strong>Provide yor own modules / dependencies</strong></summary>
  <div>

The *module system* provided by *uce-template* is extremely simple and fully extendible, so that each component can `import any from 'thing';` as long as `thing` has been provided/resolved via the library.

#### Resolve at build time

If we are going to define a single bundle entry point, and we know that each component would need one or more dependency, we can do the following:

```js
import {resolve} from 'uce-template';

import moduleA from '3rd-party';
const moduleB = {any: 'value'};

resolve('module-a', moduleA);
resolve('module-b', moduleB);
```

Once this build lands as single Web page entry point, all components would be able to *import* right away all base/default modules, plus all those pre-resolved.

[Live demo](https://codepen.io/WebReflection/pen/XWdGByv?editors=1001) <sup><sub>(see both HTML and JS panel + console)</sub></sup>

```html
<my-comp></my-comp>
<script type="module">
  import moduleA from 'module-a';
  import moduleB from 'module-a';
  export default {
    setup() {
      console.log(moduleA, moduleB);
    }
  }
</script>
```

#### Resolve lazily / on demand

In case the defined component *imports* something from an external file, like `import module from './js/module.js'` would do, such import would be lazily resolved, together with any other module that is not known yet, meaning that `./js/module.js` file could contain something like this:

```js
// a file used to bootstrap uce-template component
// dependencies can always use the uce-template class
const {resolve} = customElements.get('uce-template');

// resolve one to many modules
resolve('quite-big-module', {...});
```

A component script can then import this file and access its exported modules right after.

[Live demo](https://webreflection.github.io/uce-template/test/resolve.html)

```html
<script type="module">
  import './js/module.js';
  import quiteBigModule from 'quite-big-module';
  export default {
    setup() {
      console.log(quiteBigModule);
    }
  }
</script>
```

Together with *lazy loaded component*, this approach makes it possible to ship components that are fully based on an external `vue/comp.uce` file definition, where any of these components can also share one or more `.js` files able to *resolve* any module needed here or there (shared dependencies in one file, as opposite of dependencies per each shipped components).

  </div>
</details>

- - -

## F.A.Q.

<details>
  <summary><strong>Why is the polyfill included?</strong></summary>
  <div>

As standalone file, my [Custom Elements](https://github.com/ungap/custom-elements#readme) size is around *2.1K*, but since it's share almost every library *uce* uses too, bundling it together looked like the best way to go, resulting in just *1K* extra for a module that fits in roughly *7K* to *10K* budget.

On the other hand, because the polyfill is not obtrusive and based on runtime features detections, this means that nobody should care about bringing any other polyfill ever, but also *Chrome*, *Firefox*, and *Edge*, will be untouched, so that every custom element will run natively, either builtin extend or regular.

In the *Safari* case, or *WebKit* based, only custom elements builtin are provided, while in *IE11* and the old *MS Edge*, both builtin extends and regular elements are patched.

That's it: don't worry about any polyfill, because everything is already included in here!

  </div>
</details>


<details>
  <summary><strong>What if I target modern browsers only?</strong></summary>
  <div>

If you are targeting browsers you know already provide native Custom Elements V1, you can use [this ESM version](https://unpkg.com/uce-template@latest/es.js) that excludes all polyfills and include only the logic.

The current `es.js` bundle is indeed *~7K* gzipped and *~6.5K* brotli, so that it's possible to save even extra bandwidth in your project.

#### But my browser is Safari/WebKit ...

Well, in such case if that's the only target browser, the [@webreflection/custom-elements-builtin](https://github.com/WebReflection/custom-elements-builtin#readme) module must be included *before* the *uce-template* module lands on the page.

```html
<script defer src="//unpkg.com/@webreflection/custom-elements-builtin"></script>
<script defer src="//unpkg.com/uce-template"></script>
```

This will ensure both regular and builtin extends will work as expected.

  </div>
</details>

<details>
  <summary><strong>Why there's no ShadowDOM polyfill?</strong></summary>
  <div>

Unfortunately *ShadowDOM* is one of those specifications impossible to polyfill, but the good news is that you'll rarely need *ShadowDOM* in *uce-template*, but if your browser is compatible, you can use *ShadowDOM* as much as you like.

*However*, there are at least two possible partial polyfills to consider: [attachshadow](https://github.com/WebReflection/attachshadow#readme), which is minimalistic and lightweight, and [ShadyDOM](https://github.com/webcomponents/polyfills/tree/master/packages/shadydom#readme), which is closer to standards, but definitively heavier, although both polyfills can, and should, be injected *only* if the current browser needs it, so sticking this code on top of your *HTML* page would bring *ShadowDOM* to IE11 too, or others.

```html
<!-- this must be done before uce-template -->
<script>
if(!document.documentElement.attachShadow)
  document.write('<script src="//unpkg.com/attachshadow"><\x2fscript>');
</script>
<script defer src="//unpkg.com/uce-template"></script>
```

As every modern browser will have `document.documentElement.attachShadow`, the `document.write` will happen *only* in *IE11* without ever compromise, or penalize, Mobile and modern Desktop browsers.

**P.S.** the `<\x2fscript>` is not a typo, it's needed to not have a broken layout due closing *script* tag

  </div>
</details>

<details>
  <summary><strong>Why using <code>{{...}}</code> instead of <code>${...}</code>?</strong></summary>
  <div>

As much as I would've loved to have `${...}` interpolation boundaries, *IE11* would break if an element in the DOM contains `${...}` as attribute.

Because `{{...}}` is a well established alternative, I've decided to avoid monkey-patching possible *IE11* issues and simply stick with a de-facto standard alternative.

It is also worth considering that *Vue* uses `{{...}}` too, and so do many other template based engines.

  </div>
</details>

<details>
  <summary><strong>Why is <code>Function</code> necessary?</strong></summary>
  <div>

As explained in the "*CSP & integrity/nonce*" part of the [how to/examples](#how-to--examples), it is necessary to use `Function` for at least two reasons:

  * it's the only way to opt out from `"use strict";` directive and pass through a `with(object)` statement, needed to understand interpolations without creating a whole JS engine from the scratch
  * it's the only way to provide at runtime a CJS like `require` functionality within `<script type="module">` content

But even if there was no `Function` in the equation, parsing and executing a `<script>` tag to define custom elements would've been the exact same equivalent of using `Function`, because *CSP* would've needed special rules anyway, since the operation is basically an *eval* call in the global context.

As summary, instead of tricking the browser with practices that are as safe, or as unsafe, as a `Function` call, I've simply used `Function` instead, keeping the code size reasonable.

  </div>
</details>

<details>
  <summary><strong>What about performance?</strong></summary>
  <div>

This project is *as-performant-as* native Custom Elements could be, except for the definition cost, which is a *one-off* operation per each unique custom element *Class*, hence irrelevant in the long run, and there's an insignificant overhead within the initial template parsing logic, but its repeated execution is as fast as *uhtml* can be, and if you [check the latest status](https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html) you'll find it's one of the fastest of its kind.

You can check the classic [DBMonster demo here](https://webreflection.github.io/uce-template/test/dbmonster.html), and see that it performs just well.

  </div>
</details>

<details>
  <summary><strong>Are there blocking requests with modules?</strong></summary>
  <div>

Nothing in this library is blocking, and modules are resolved *once* only, even relative path imports.

The logic is pretty simple: if the module name has not been resolved and it's a relative import, an asynchronous request will be made and evaluated later, while if the module is not resolved, and it's a qualified name, it will be resolved only once some code provides it.

All this, plus the *import* to *require* resolution, is handled by the [uce-require](https://github.com/WebReflection/uce-require) helper, purposely not coupled with this module itself, as it could hopefully inspire, and be used by, other projects too.

  </div>
</details>

- - -

## Live Demos

  * a [todo app](https://github.com/WebReflection/uce-template-todo-2020) forked from the *Vue* version of [this post](https://medium.com/javascript-in-plain-english/i-created-the-exact-same-app-in-react-and-vue-here-are-the-differences-2019-edition-42ba2cab9e56)
  * the classic [DB Monster](https://webreflection.github.io/uce-template/test/dbmonster.html) demo
  * a *Custom Element in uce-template* example, either [via getters](https://codepen.io/WebReflection/pen/MWyRGbd?editors=1000), or via the [component context itself](https://codepen.io/WebReflection/pen/BaKEPJR?editors=1000)

- - -


## ... and more!

If you'd like to understand more about `uce-template` and how does it work, please check [this page](./extra-details.md) out.
