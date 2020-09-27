## How does uce-template work?

Based on [uce](https://github.com/WebReflection/uce#readme) and the latest [custom-elements polyfill](https://github.com/ungap/custom-elements#readme), this module glues most modern Web development patterns in a standard way that yet feels like magic.

The *HTML* content of each component is handled by [tag-params](https://github.com/WebReflection/tag-params#readme) *partial* utility, while the *JS* content is normalized as lightweight *CommonJS* environment, where anyone can feed the module system as they need.

As strawberry on top, *hooks* are provided behind the scene via the `@uce/reactive` utility and thanks to [augmentor](https://github.com/WebReflection/augmentor#readme).

The *JS* environment is likely the most complex part to grasp though, so here some extra detail on how it works.


### The module JS environment

The component script definition happens in a virtual `Function` sandbox, where all *imports* and *exports* are normalized as *CommonJS*, and a `require(module)` utility is provided.

Like it is for *CommonJS*, the `require` utility always returns the same module, once such module has been provided.

In the previous example, the `@uce/reactive` is virtually predefined in *uce-template*, but there are other modules too:

  * [augmentor](https://github.com/WebReflection/augmentor#readme) to create any *hooked* wizardry we like
  * [qsa-observer](https://github.com/WebReflection/qsa-observer#readme) to monitor nodes if needed
  * [reactive-props](https://github.com/WebReflection/reactive-props#readme) to create any reactive alchemy, even if this is provided already via `@uce/reactive`
  * [uce](https://github.com/WebReflection/uce#readme) to eventually import `html`, `svg`, or `render` utilities from [uhtml](https://github.com/WebReflection/uce#readme)
  * [@webreflection/lie](https://github.com/WebReflection/lie#readme) to have basic *Promise* support in IE11 (resolves only)

While `import {html} from 'uce'`, and *uce* in general, is very helpful to compose inner nodes of a defined component, every other module is there only because this library uses these modules to work, and it wouldn't make sense to not provide what's already included in *uce-template*.

However, it is possible to **define any module** using the `resolve(name, module)` utility:

```js
import {resolve} from 'uce-template';

import MyLibrary from 'MyLibrary';
resolve('my-library', MyLibrary);
```

Alternatively, it is also possible to define modules via the `uce-template` class itself:

```js
customElements.whenDefined('uce-template').then({resolve} => {
  resolve('my-utility', {any(){}, module: 'really'});
});
```

Please note that modules are unique so it is encouraged to use real module names to avoid clashing within third parts libraries.


### The lazy JS environment

Modules can also be **loaded at runtime**, but only if *relative* or if the *CDN* supports Cross Origin Requests.

```js
// provided by uce-template
import reactive from '@uce/reactive';

import doubleRainbow from './js/rainbow.js';

export default {
  setup(element) {
    const state = reactive({ count: 0 });
    const inc = () => { state.count++ };
    const dec = () => { state.count-- };
    console.log(doubleRainbow); // 🌈🌈
    return {state, inc, dec};
  }
};
```

The `js/rainbow.js` in example should be reachable, and contain some export either via *ESM* syntax, or *CJS*, so that `export default '🌈🌈'` or `module.exports = '🌈🌈'` would be both valid and accepted.

It is *our duty* to be sure that lazily loaded modules can run within our target browsers, so in case *IE11* is one of these targets, it's our duty to transpile those file in a compatible way via *Babel* or others, as the `require` utility only cares about *imports* and *exports*.

The **advantage** of having *lazy* modules resolution is that a component defined via `<template is="uce-template" lazy>` will *not* need to have all dependencies pre-defined/resolved, and it *will* download once these only when any instance of such component is spot live.

As it is for ESM and CommonJS, every module is granted to be downloaded once and persist across multiple *imports*.


### Inherited _µce_ features

If the *default export* contains `props`, or any `onevent` handler, all the features available via *uce* will be available within the component too:

```js
export default {
  observedAttributes: ['thing'],
  props: {test: 'default value'},
  onClick() {
    console.log('click');
  },
  setup(element) {
    // setup an own attributeChanged
    element.attributeChanged = (name, oldVal, newVal) => {
      // will log "thing" and the value
      console.log(name, newVal);
    };
    // log "default value"
    console.log(element.test);
  }
};
```

All `props` will automatically re-render the component, while `observedAttributes` must have an `attributeChanged` callback attached on setup.

This is because the whole *render* is hooked once, and all lifecycle events will belong to it.

To know more about _µce_ features, [please check its own repository](https://github.com/WebReflection/uce#readme).
