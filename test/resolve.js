const {resolve} = customElements.get('uce-template');

// let's pretend this is a polyfill
resolve('promise-helper', Promise);
