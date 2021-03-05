(function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi @webreflection ISC */
  (function () {

    var Lie = typeof Promise === 'function' ? Promise : function (fn) {
      var queue = [],
          resolved = 0,
          value;
      fn(function ($) {
        value = $;
        resolved = 1;
        queue.splice(0).forEach(then);
      });
      return {
        then: then
      };

      function then(fn) {
        return resolved ? setTimeout(fn, 0, value) : queue.push(fn), this;
      }
    };

    var attributesObserver = function attributesObserver(whenDefined, MutationObserver) {
      var attributeChanged = function attributeChanged(records) {
        for (var i = 0, length = records.length; i < length; i++) {
          dispatch(records[i]);
        }
      };

      var dispatch = function dispatch(_ref) {
        var target = _ref.target,
            attributeName = _ref.attributeName,
            oldValue = _ref.oldValue;
        target.attributeChangedCallback(attributeName, oldValue, target.getAttribute(attributeName));
      };

      return function (target, is) {
        var attributeFilter = target.constructor.observedAttributes;

        if (attributeFilter) {
          whenDefined(is).then(function () {
            new MutationObserver(attributeChanged).observe(target, {
              attributes: true,
              attributeOldValue: true,
              attributeFilter: attributeFilter
            });

            for (var i = 0, length = attributeFilter.length; i < length; i++) {
              if (target.hasAttribute(attributeFilter[i])) dispatch({
                target: target,
                attributeName: attributeFilter[i],
                oldValue: null
              });
            }
          });
        }

        return target;
      };
    };

    var _self = self,
        document = _self.document,
        MutationObserver = _self.MutationObserver,
        Set = _self.Set,
        WeakMap = _self.WeakMap;

    var elements = function elements(element) {
      return 'querySelectorAll' in element;
    };

    var filter = [].filter;

    var qsaObserver = function qsaObserver(options) {
      var live = new WeakMap();

      var callback = function callback(records) {
        var query = options.query;

        if (query.length) {
          for (var i = 0, length = records.length; i < length; i++) {
            loop(filter.call(records[i].addedNodes, elements), true, query);
            loop(filter.call(records[i].removedNodes, elements), false, query);
          }
        }
      };

      var drop = function drop(elements) {
        for (var i = 0, length = elements.length; i < length; i++) {
          live["delete"](elements[i]);
        }
      };

      var flush = function flush() {
        callback(observer.takeRecords());
      };

      var loop = function loop(elements, connected, query) {
        var set = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Set();

        var _loop = function _loop(_selectors, _element, i, length) {
          // guard against repeated elements within nested querySelectorAll results
          if (!set.has(_element = elements[i])) {
            set.add(_element);

            if (connected) {
              for (var q, m = matches(_element), _i = 0, _length = query.length; _i < _length; _i++) {
                if (m.call(_element, q = query[_i])) {
                  if (!live.has(_element)) live.set(_element, new Set());
                  _selectors = live.get(_element); // guard against selectors that were handled already

                  if (!_selectors.has(q)) {
                    _selectors.add(q);

                    options.handle(_element, connected, q);
                  }
                }
              }
            } // guard against elements that never became live
            else if (live.has(_element)) {
                _selectors = live.get(_element);
                live["delete"](_element);

                _selectors.forEach(function (q) {
                  options.handle(_element, connected, q);
                });
              }

            loop(querySelectorAll(_element), connected, query, set);
          }

          selectors = _selectors;
          element = _element;
        };

        for (var selectors, element, i = 0, length = elements.length; i < length; i++) {
          _loop(selectors, element, i);
        }
      };

      var matches = function matches(element) {
        return element.matches || element.webkitMatchesSelector || element.msMatchesSelector;
      };

      var parse = function parse(elements) {
        var connected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        loop(elements, connected, options.query);
      };

      var querySelectorAll = function querySelectorAll(root) {
        return query.length ? root.querySelectorAll(query) : query;
      };

      var observer = new MutationObserver(callback);
      var root = options.root || document;
      var query = options.query;
      observer.observe(root, {
        childList: true,
        subtree: true
      });
      parse(querySelectorAll(root));
      return {
        drop: drop,
        flush: flush,
        observer: observer,
        parse: parse
      };
    };

    var _self$1 = self,
        document$1 = _self$1.document,
        Map = _self$1.Map,
        MutationObserver$1 = _self$1.MutationObserver,
        Object = _self$1.Object,
        Set$1 = _self$1.Set,
        WeakMap$1 = _self$1.WeakMap,
        Element = _self$1.Element,
        HTMLElement = _self$1.HTMLElement,
        Node = _self$1.Node,
        Error = _self$1.Error,
        TypeError = _self$1.TypeError,
        Reflect = _self$1.Reflect;
    var Promise$1 = self.Promise || Lie;
    var defineProperty = Object.defineProperty,
        keys = Object.keys,
        getOwnPropertyNames = Object.getOwnPropertyNames,
        setPrototypeOf = Object.setPrototypeOf;
    var legacy = !self.customElements;

    var expando = function expando(element) {
      var key = keys(element);
      var value = [];
      var length = key.length;

      for (var i = 0; i < length; i++) {
        value[i] = element[key[i]];
        delete element[key[i]];
      }

      return function () {
        for (var _i = 0; _i < length; _i++) {
          element[key[_i]] = value[_i];
        }
      };
    };

    if (legacy) {
      var HTMLBuiltIn = function HTMLBuiltIn() {
        var constructor = this.constructor;
        if (!classes.has(constructor)) throw new TypeError('Illegal constructor');
        var is = classes.get(constructor);
        if (override) return augment(override, is);
        var element = createElement.call(document$1, is);
        return augment(setPrototypeOf(element, constructor.prototype), is);
      };

      var createElement = document$1.createElement;
      var classes = new Map();
      var defined = new Map();
      var prototypes = new Map();
      var registry = new Map();
      var query = [];

      var handle = function handle(element, connected, selector) {
        var proto = prototypes.get(selector);

        if (connected && !proto.isPrototypeOf(element)) {
          var redefine = expando(element);
          override = setPrototypeOf(element, proto);

          try {
            new proto.constructor();
          } finally {
            override = null;
            redefine();
          }
        }

        var method = "".concat(connected ? '' : 'dis', "connectedCallback");
        if (method in proto) element[method]();
      };

      var _qsaObserver = qsaObserver({
        query: query,
        handle: handle
      }),
          parse = _qsaObserver.parse;

      var override = null;

      var whenDefined = function whenDefined(name) {
        if (!defined.has(name)) {
          var _,
              $ = new Lie(function ($) {
            _ = $;
          });

          defined.set(name, {
            $: $,
            _: _
          });
        }

        return defined.get(name).$;
      };

      var augment = attributesObserver(whenDefined, MutationObserver$1);
      defineProperty(self, 'customElements', {
        configurable: true,
        value: {
          define: function define(is, Class) {
            if (registry.has(is)) throw new Error("the name \"".concat(is, "\" has already been used with this registry"));
            classes.set(Class, is);
            prototypes.set(is, Class.prototype);
            registry.set(is, Class);
            query.push(is);
            whenDefined(is).then(function () {
              parse(document$1.querySelectorAll(is));
            });

            defined.get(is)._(Class);
          },
          get: function get(is) {
            return registry.get(is);
          },
          whenDefined: whenDefined
        }
      });
      defineProperty(HTMLBuiltIn.prototype = HTMLElement.prototype, 'constructor', {
        value: HTMLBuiltIn
      });
      defineProperty(self, 'HTMLElement', {
        configurable: true,
        value: HTMLBuiltIn
      });
      defineProperty(document$1, 'createElement', {
        configurable: true,
        value: function value(name, options) {
          var is = options && options.is;
          var Class = is ? registry.get(is) : registry.get(name);
          return Class ? new Class() : createElement.call(document$1, name);
        }
      }); // in case ShadowDOM is used through a polyfill, to avoid issues
      // with builtin extends within shadow roots

      if (!('isConnected' in Node.prototype)) defineProperty(Node.prototype, 'isConnected', {
        configurable: true,
        get: function get() {
          return !(this.ownerDocument.compareDocumentPosition(this) & this.DOCUMENT_POSITION_DISCONNECTED);
        }
      });
    } else {
      try {
        var LI = function LI() {
          return self.Reflect.construct(HTMLLIElement, [], LI);
        };

        LI.prototype = HTMLLIElement.prototype;
        var is = 'extends-li';
        self.customElements.define('extends-li', LI, {
          'extends': 'li'
        });
        legacy = document$1.createElement('li', {
          is: is
        }).outerHTML.indexOf(is) < 0;
        var _self$customElements = self.customElements,
            get = _self$customElements.get,
            _whenDefined = _self$customElements.whenDefined;
        defineProperty(self.customElements, 'whenDefined', {
          configurable: true,
          value: function value(is) {
            var _this = this;

            return _whenDefined.call(this, is).then(function (Class) {
              return Class || get.call(_this, is);
            });
          }
        });
      } catch (o_O) {
        legacy = !legacy;
      }
    }

    if (legacy) {
      var parseShadow = function parseShadow(element) {
        var _shadowRoots$get = shadowRoots.get(element),
            parse = _shadowRoots$get.parse,
            root = _shadowRoots$get.root;

        parse(root.querySelectorAll(this), element.isConnected);
      };

      var customElements = self.customElements;
      var attachShadow = Element.prototype.attachShadow;
      var _createElement = document$1.createElement;
      var define = customElements.define,
          _get = customElements.get;

      var _ref = Reflect || {
        construct: function construct(HTMLElement) {
          return HTMLElement.call(this);
        }
      },
          construct = _ref.construct;

      var shadowRoots = new WeakMap$1();
      var shadows = new Set$1();

      var _classes = new Map();

      var _defined = new Map();

      var _prototypes = new Map();

      var _registry = new Map();

      var shadowed = [];
      var _query = [];

      var getCE = function getCE(is) {
        return _registry.get(is) || _get.call(customElements, is);
      };

      var _handle = function _handle(element, connected, selector) {
        var proto = _prototypes.get(selector);

        if (connected && !proto.isPrototypeOf(element)) {
          var redefine = expando(element);
          _override = setPrototypeOf(element, proto);

          try {
            new proto.constructor();
          } finally {
            _override = null;
            redefine();
          }
        }

        var method = "".concat(connected ? '' : 'dis', "connectedCallback");
        if (method in proto) element[method]();
      };

      var _qsaObserver2 = qsaObserver({
        query: _query,
        handle: _handle
      }),
          _parse = _qsaObserver2.parse;

      var _qsaObserver3 = qsaObserver({
        query: shadowed,
        handle: function handle(element, connected) {
          if (shadowRoots.has(element)) {
            if (connected) shadows.add(element);else shadows["delete"](element);
            if (_query.length) parseShadow.call(_query, element);
          }
        }
      }),
          parseShadowed = _qsaObserver3.parse;

      var _whenDefined2 = function _whenDefined2(name) {
        if (!_defined.has(name)) {
          var _,
              $ = new Promise$1(function ($) {
            _ = $;
          });

          _defined.set(name, {
            $: $,
            _: _
          });
        }

        return _defined.get(name).$;
      };

      var _augment = attributesObserver(_whenDefined2, MutationObserver$1);

      var _override = null;
      getOwnPropertyNames(self).filter(function (k) {
        return /^HTML/.test(k);
      }).forEach(function (k) {
        var HTMLElement = self[k];

        function HTMLBuiltIn() {
          var constructor = this.constructor;
          if (!_classes.has(constructor)) throw new TypeError('Illegal constructor');

          var _classes$get = _classes.get(constructor),
              is = _classes$get.is,
              tag = _classes$get.tag;

          if (is) {
            if (_override) return _augment(_override, is);

            var element = _createElement.call(document$1, tag);

            element.setAttribute('is', is);
            return _augment(setPrototypeOf(element, constructor.prototype), is);
          } else return construct.call(this, HTMLElement, [], constructor);
        }

        defineProperty(HTMLBuiltIn.prototype = HTMLElement.prototype, 'constructor', {
          value: HTMLBuiltIn
        });
        defineProperty(self, k, {
          value: HTMLBuiltIn
        });
      });
      defineProperty(document$1, 'createElement', {
        configurable: true,
        value: function value(name, options) {
          var is = options && options.is;

          if (is) {
            var Class = _registry.get(is);

            if (Class && _classes.get(Class).tag === name) return new Class();
          }

          var element = _createElement.call(document$1, name);

          if (is) element.setAttribute('is', is);
          return element;
        }
      });
      if (attachShadow) defineProperty(Element.prototype, 'attachShadow', {
        configurable: true,
        value: function value() {
          var root = attachShadow.apply(this, arguments);

          var _qsaObserver4 = qsaObserver({
            query: _query,
            root: root,
            handle: _handle
          }),
              parse = _qsaObserver4.parse;

          shadowRoots.set(this, {
            root: root,
            parse: parse
          });
          return root;
        }
      });
      defineProperty(customElements, 'get', {
        configurable: true,
        value: getCE
      });
      defineProperty(customElements, 'whenDefined', {
        configurable: true,
        value: _whenDefined2
      });
      defineProperty(customElements, 'define', {
        configurable: true,
        value: function value(is, Class, options) {
          if (getCE(is)) throw new Error("'".concat(is, "' has already been defined as a custom element"));
          var selector;
          var tag = options && options["extends"];

          _classes.set(Class, tag ? {
            is: is,
            tag: tag
          } : {
            is: '',
            tag: is
          });

          if (tag) {
            selector = "".concat(tag, "[is=\"").concat(is, "\"]");

            _prototypes.set(selector, Class.prototype);

            _registry.set(is, Class);

            _query.push(selector);
          } else {
            define.apply(customElements, arguments);
            shadowed.push(selector = is);
          }

          _whenDefined2(is).then(function () {
            if (tag) {
              _parse(document$1.querySelectorAll(selector));

              shadows.forEach(parseShadow, [selector]);
            } else parseShadowed(document$1.querySelectorAll(selector));
          });

          _defined.get(is)._(Class);
        }
      });
    }
  })();

  var Lie = typeof Promise === 'function' ? Promise : function (fn) {
    var queue = [],
        resolved = 0,
        value;
    fn(function ($) {
      value = $;
      resolved = 1;
      queue.splice(0).forEach(then);
    });
    return {
      then: then
    };

    function then(fn) {
      return resolved ? setTimeout(fn, 0, value) : queue.push(fn), this;
    }
  };

  var info$1 = null,
      schedule = new Set();

  var invoke = function invoke(effect) {
    var $ = effect.$,
        r = effect.r,
        h = effect.h;

    if (isFunction(r)) {
      fx.get(h)["delete"](effect);
      r();
    }

    if (isFunction(effect.r = $())) fx.get(h).add(effect);
  };

  var runSchedule = function runSchedule() {
    var previous = schedule;
    schedule = new Set();
    previous.forEach(function (_ref) {
      var h = _ref.h,
          c = _ref.c,
          a = _ref.a,
          e = _ref.e;
      // avoid running schedules when the hook is
      // re-executed before such schedule happens
      if (e) h.apply(c, a);
    });
  };

  var fx = new WeakMap();
  var effects = [];
  var layoutEffects = [];
  function different(value, i) {
    return value !== this[i];
  }
  var dropEffect = function dropEffect(hook) {
    var effects = fx.get(hook);
    if (effects) wait.then(function () {
      effects.forEach(function (effect) {
        effect.r();
        effect.r = null;
      });
      effects.clear();
    });
  };
  var getInfo = function getInfo() {
    return info$1;
  };
  var hasEffect = function hasEffect(hook) {
    return fx.has(hook);
  };
  var isFunction = function isFunction(f) {
    return typeof f === 'function';
  };
  var hooked = function hooked(callback) {
    var current = {
      h: hook,
      c: null,
      a: null,
      e: 0,
      i: 0,
      s: []
    };
    return hook;

    function hook() {
      var prev = info$1;
      info$1 = current;
      current.e = current.i = 0;

      try {
        return callback.apply(current.c = this, current.a = arguments);
      } finally {
        info$1 = prev;
        if (effects.length) wait.then(effects.forEach.bind(effects.splice(0), invoke));
        if (layoutEffects.length) layoutEffects.splice(0).forEach(invoke);
      }
    }
  };
  var reschedule = function reschedule(info) {
    if (!schedule.has(info)) {
      info.e = 1;
      schedule.add(info);
      wait.then(runSchedule);
    }
  };
  var wait = new Lie(function ($) {
    return $();
  });

  var createContext = function createContext(value) {
    return {
      _: new Set(),
      provide: provide,
      value: value
    };
  };
  var useContext = function useContext(_ref) {
    var _ = _ref._,
        value = _ref.value;

    _.add(getInfo());

    return value;
  };

  function provide(newValue) {
    var _ = this._,
        value = this.value;

    if (value !== newValue) {
      this._ = new Set();
      this.value = newValue;

      _.forEach(function (_ref2) {
        var h = _ref2.h,
            c = _ref2.c,
            a = _ref2.a;
        h.apply(c, a);
      });
    }
  }

  var useCallback = function useCallback(fn, guards) {
    return useMemo(function () {
      return fn;
    }, guards);
  };
  var useMemo = function useMemo(memo, guards) {
    var info = getInfo();
    var i = info.i,
        s = info.s;
    if (i === s.length || !guards || guards.some(different, s[i]._)) s[i] = {
      $: memo(),
      _: guards
    };
    return s[info.i++].$;
  };

  var createEffect = function createEffect(stack) {
    return function (callback, guards) {
      var info = getInfo();
      var i = info.i,
          s = info.s,
          h = info.h;
      var call = i === s.length;
      info.i++;

      if (call) {
        if (!fx.has(h)) fx.set(h, new Set());
        s[i] = {
          $: callback,
          _: guards,
          r: null,
          h: h
        };
      }

      if (call || !guards || guards.some(different, s[i]._)) stack.push(s[i]);
      s[i].$ = callback;
      s[i]._ = guards;
    };
  };

  var useEffect = createEffect(effects);
  var useLayoutEffect = createEffect(layoutEffects);

  var getValue = function getValue(value, f) {
    return isFunction(f) ? f(value) : f;
  };

  var useReducer = function useReducer(reducer, value, init) {
    var info = getInfo();
    var i = info.i,
        s = info.s;
    if (i === s.length) s.push({
      $: isFunction(init) ? init(value) : getValue(void 0, value),
      set: function set(value) {
        s[i].$ = reducer(s[i].$, value);
        reschedule(info);
      }
    });
    var _s$info$i = s[info.i++],
        $ = _s$info$i.$,
        set = _s$info$i.set;
    return [$, set];
  };
  var useState = function useState(value) {
    return useReducer(getValue, value);
  };

  var useRef = function useRef(current) {
    var info = getInfo();
    var i = info.i,
        s = info.s;
    if (i === s.length) s.push({
      current: current
    });
    return s[info.i++];
  };

  

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  var umap = (function (_) {
    return {
      // About: get: _.get.bind(_)
      // It looks like WebKit/Safari didn't optimize bind at all,
      // so that using bind slows it down by 60%.
      // Firefox and Chrome are just fine in both cases,
      // so let's use the approach that works fast everywhere 👍
      get: function get(key) {
        return _.get(key);
      },
      set: function set(key, value) {
        return _.set(key, value), value;
      }
    };
  });

  var attr = /([^\s\\>"'=]+)\s*=\s*(['"]?)$/;
  var empty = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;
  var node = /<[a-z][^>]+$/i;
  var notNode = />[^<>]*$/;
  var selfClosing = /<([a-z]+[a-z0-9:._-]*)([^>]*?)(\/>)/ig;
  var trimEnd = /\s+$/;

  var isNode = function isNode(template, i) {
    return 0 < i-- && (node.test(template[i]) || !notNode.test(template[i]) && isNode(template, i));
  };

  var regular = function regular(original, name, extra) {
    return empty.test(name) ? original : "<".concat(name).concat(extra.replace(trimEnd, ''), "></").concat(name, ">");
  };

  var instrument = (function (template, prefix, svg) {
    var text = [];
    var length = template.length;

    var _loop = function _loop(i) {
      var chunk = template[i - 1];
      text.push(attr.test(chunk) && isNode(template, i) ? chunk.replace(attr, function (_, $1, $2) {
        return "".concat(prefix).concat(i - 1, "=").concat($2 || '"').concat($1).concat($2 ? '' : '"');
      }) : "".concat(chunk, "<!--").concat(prefix).concat(i - 1, "-->"));
    };

    for (var i = 1; i < length; i++) {
      _loop(i);
    }

    text.push(template[length - 1]);
    var output = text.join('').trim();
    return svg ? output : output.replace(selfClosing, regular);
  });

  var isArray = Array.isArray;
  var _ref = [],
      indexOf = _ref.indexOf,
      slice = _ref.slice;

  var ELEMENT_NODE = 1;
  var nodeType = 111;

  var remove = function remove(_ref) {
    var firstChild = _ref.firstChild,
        lastChild = _ref.lastChild;
    var range = document.createRange();
    range.setStartAfter(firstChild);
    range.setEndAfter(lastChild);
    range.deleteContents();
    return firstChild;
  };

  var diffable = function diffable(node, operation) {
    return node.nodeType === nodeType ? 1 / operation < 0 ? operation ? remove(node) : node.lastChild : operation ? node.valueOf() : node.firstChild : node;
  };
  var persistent = function persistent(fragment) {
    var childNodes = fragment.childNodes;
    var length = childNodes.length;
    if (length < 2) return length ? childNodes[0] : fragment;
    var nodes = slice.call(childNodes, 0);
    var firstChild = nodes[0];
    var lastChild = nodes[length - 1];
    return {
      ELEMENT_NODE: ELEMENT_NODE,
      nodeType: nodeType,
      firstChild: firstChild,
      lastChild: lastChild,
      valueOf: function valueOf() {
        if (childNodes.length !== length) {
          var i = 0;

          while (i < length) {
            fragment.appendChild(nodes[i++]);
          }
        }

        return fragment;
      }
    };
  };

  /**
   * ISC License
   *
   * Copyright (c) 2020, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */

  /**
   * @param {Node} parentNode The container where children live
   * @param {Node[]} a The list of current/live children
   * @param {Node[]} b The list of future children
   * @param {(entry: Node, action: number) => Node} get
   * The callback invoked per each entry related DOM operation.
   * @param {Node} [before] The optional node used as anchor to insert before.
   * @returns {Node[]} The same list of future children.
   */
  var udomdiff = (function (parentNode, a, b, get, before) {
    var bLength = b.length;
    var aEnd = a.length;
    var bEnd = bLength;
    var aStart = 0;
    var bStart = 0;
    var map = null;

    while (aStart < aEnd || bStart < bEnd) {
      // append head, tail, or nodes in between: fast path
      if (aEnd === aStart) {
        // we could be in a situation where the rest of nodes that
        // need to be added are not at the end, and in such case
        // the node to `insertBefore`, if the index is more than 0
        // must be retrieved, otherwise it's gonna be the first item.
        var node = bEnd < bLength ? bStart ? get(b[bStart - 1], -0).nextSibling : get(b[bEnd - bStart], 0) : before;

        while (bStart < bEnd) {
          parentNode.insertBefore(get(b[bStart++], 1), node);
        }
      } // remove head or tail: fast path
      else if (bEnd === bStart) {
          while (aStart < aEnd) {
            // remove the node only if it's unknown or not live
            if (!map || !map.has(a[aStart])) parentNode.removeChild(get(a[aStart], -1));
            aStart++;
          }
        } // same node: fast path
        else if (a[aStart] === b[bStart]) {
            aStart++;
            bStart++;
          } // same tail: fast path
          else if (a[aEnd - 1] === b[bEnd - 1]) {
              aEnd--;
              bEnd--;
            } // The once here single last swap "fast path" has been removed in v1.1.0
            // https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
            // reverse swap: also fast path
            else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
                // this is a "shrink" operation that could happen in these cases:
                // [1, 2, 3, 4, 5]
                // [1, 4, 3, 2, 5]
                // or asymmetric too
                // [1, 2, 3, 4, 5]
                // [1, 2, 3, 5, 6, 4]
                var _node = get(a[--aEnd], -1).nextSibling;
                parentNode.insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling);
                parentNode.insertBefore(get(b[--bEnd], 1), _node); // mark the future index as identical (yeah, it's dirty, but cheap 👍)
                // The main reason to do this, is that when a[aEnd] will be reached,
                // the loop will likely be on the fast path, as identical to b[bEnd].
                // In the best case scenario, the next loop will skip the tail,
                // but in the worst one, this node will be considered as already
                // processed, bailing out pretty quickly from the map index check

                a[aEnd] = b[bEnd];
              } // map based fallback, "slow" path
              else {
                  // the map requires an O(bEnd - bStart) operation once
                  // to store all future nodes indexes for later purposes.
                  // In the worst case scenario, this is a full O(N) cost,
                  // and such scenario happens at least when all nodes are different,
                  // but also if both first and last items of the lists are different
                  if (!map) {
                    map = new Map();
                    var i = bStart;

                    while (i < bEnd) {
                      map.set(b[i], i++);
                    }
                  } // if it's a future node, hence it needs some handling


                  if (map.has(a[aStart])) {
                    // grab the index of such node, 'cause it might have been processed
                    var index = map.get(a[aStart]); // if it's not already processed, look on demand for the next LCS

                    if (bStart < index && index < bEnd) {
                      var _i = aStart; // counts the amount of nodes that are the same in the future

                      var sequence = 1;

                      while (++_i < aEnd && _i < bEnd && map.get(a[_i]) === index + sequence) {
                        sequence++;
                      } // effort decision here: if the sequence is longer than replaces
                      // needed to reach such sequence, which would brings again this loop
                      // to the fast path, prepend the difference before a sequence,
                      // and move only the future list index forward, so that aStart
                      // and bStart will be aligned again, hence on the fast path.
                      // An example considering aStart and bStart are both 0:
                      // a: [1, 2, 3, 4]
                      // b: [7, 1, 2, 3, 6]
                      // this would place 7 before 1 and, from that time on, 1, 2, and 3
                      // will be processed at zero cost


                      if (sequence > index - bStart) {
                        var _node2 = get(a[aStart], 0);

                        while (bStart < index) {
                          parentNode.insertBefore(get(b[bStart++], 1), _node2);
                        }
                      } // if the effort wasn't good enough, fallback to a replace,
                      // moving both source and target indexes forward, hoping that some
                      // similar node will be found later on, to go back to the fast path
                      else {
                          parentNode.replaceChild(get(b[bStart++], 1), get(a[aStart++], -1));
                        }
                    } // otherwise move the source forward, 'cause there's nothing to do
                    else aStart++;
                  } // this node has no meaning in the future list, so it's more than safe
                  // to remove it, and check the next live node out instead, meaning
                  // that only the live list index should be forwarded
                  else parentNode.removeChild(get(a[aStart++], -1));
                }
    }

    return b;
  });

  var aria = function aria(node) {
    return function (values) {
      for (var key in values) {
        var name = key === 'role' ? key : "aria-".concat(key);
        var value = values[key];
        if (value == null) node.removeAttribute(name);else node.setAttribute(name, value);
      }
    };
  };
  var attribute = function attribute(node, name) {
    var oldValue,
        orphan = true;
    var attributeNode = document.createAttributeNS(null, name);
    return function (newValue) {
      if (oldValue !== newValue) {
        oldValue = newValue;

        if (oldValue == null) {
          if (!orphan) {
            node.removeAttributeNode(attributeNode);
            orphan = true;
          }
        } else {
          attributeNode.value = newValue;

          if (orphan) {
            node.setAttributeNodeNS(attributeNode);
            orphan = false;
          }
        }
      }
    };
  };

  var _boolean = function _boolean(node, key, oldValue) {
    return function (newValue) {
      if (oldValue !== !!newValue) {
        // when IE won't be around anymore ...
        // node.toggleAttribute(key, oldValue = !!newValue);
        if (oldValue = !!newValue) node.setAttribute(key, '');else node.removeAttribute(key);
      }
    };
  };
  var data = function data(_ref) {
    var dataset = _ref.dataset;
    return function (values) {
      for (var key in values) {
        var value = values[key];
        if (value == null) delete dataset[key];else dataset[key] = value;
      }
    };
  };
  var event = function event(node, name) {
    var oldValue,
        type = name.slice(2);
    if (!(name in node) && name.toLowerCase() in node) type = type.toLowerCase();
    return function (newValue) {
      var info = isArray(newValue) ? newValue : [newValue, false];

      if (oldValue !== info[0]) {
        if (oldValue) node.removeEventListener(type, oldValue, info[1]);
        if (oldValue = info[0]) node.addEventListener(type, oldValue, info[1]);
      }
    };
  };
  var ref = function ref(node) {
    var oldValue;
    return function (value) {
      if (oldValue !== value) {
        oldValue = value;
        if (typeof value === 'function') value(node);else value.current = node;
      }
    };
  };
  var setter = function setter(node, key) {
    return key === 'dataset' ? data(node) : function (value) {
      node[key] = value;
    };
  };
  var text = function text(node) {
    var oldValue;
    return function (newValue) {
      if (oldValue != newValue) {
        oldValue = newValue;
        node.textContent = newValue == null ? '' : newValue;
      }
    };
  };

  /*! (c) Andrea Giammarchi - ISC */
  var createContent = function (document) {

    var FRAGMENT = 'fragment';
    var TEMPLATE = 'template';
    var HAS_CONTENT = ('content' in create(TEMPLATE));
    var createHTML = HAS_CONTENT ? function (html) {
      var template = create(TEMPLATE);
      template.innerHTML = html;
      return template.content;
    } : function (html) {
      var content = create(FRAGMENT);
      var template = create(TEMPLATE);
      var childNodes = null;

      if (/^[^\S]*?<(col(?:group)?|t(?:head|body|foot|r|d|h))/i.test(html)) {
        var selector = RegExp.$1;
        template.innerHTML = '<table>' + html + '</table>';
        childNodes = template.querySelectorAll(selector);
      } else {
        template.innerHTML = html;
        childNodes = template.childNodes;
      }

      append(content, childNodes);
      return content;
    };
    return function createContent(markup, type) {
      return (type === 'svg' ? createSVG : createHTML)(markup);
    };

    function append(root, childNodes) {
      var length = childNodes.length;

      while (length--) {
        root.appendChild(childNodes[0]);
      }
    }

    function create(element) {
      return element === FRAGMENT ? document.createDocumentFragment() : document.createElementNS('http://www.w3.org/1999/xhtml', element);
    } // it could use createElementNS when hasNode is there
    // but this fallback is equally fast and easier to maintain
    // it is also battle tested already in all IE


    function createSVG(svg) {
      var content = create(FRAGMENT);
      var template = create('div');
      template.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
      append(content, template.firstChild.childNodes);
      return content;
    }
  }(document);

  var reducePath = function reducePath(_ref, i) {
    var childNodes = _ref.childNodes;
    return childNodes[i];
  }; // from a fragment container, create an array of indexes
  // related to its child nodes, so that it's possible
  // to retrieve later on exact node via reducePath

  var createPath = function createPath(node) {
    var path = [];
    var _node = node,
        parentNode = _node.parentNode;

    while (parentNode) {
      path.push(indexOf.call(parentNode.childNodes, node));
      node = parentNode;
      parentNode = node.parentNode;
    }

    return path;
  };
  var _document = document,
      createTreeWalker = _document.createTreeWalker,
      importNode = _document.importNode;

  var isImportNodeLengthWrong = importNode.length != 1; // IE11 and old Edge discard empty nodes when cloning, potentially
  // resulting in broken paths to find updates. The workaround here
  // is to import once, upfront, the fragment that will be cloned
  // later on, so that paths are retrieved from one already parsed,
  // hence without missing child nodes once re-cloned.

  var createFragment = isImportNodeLengthWrong ? function (text, type, normalize) {
    return importNode.call(document, createContent(text, type, normalize), true);
  } : createContent; // IE11 and old Edge have a different createTreeWalker signature that
  // has been deprecated in other browsers. This export is needed only
  // to guarantee the TreeWalker doesn't show warnings and, ultimately, works

  var createWalker = isImportNodeLengthWrong ? function (fragment) {
    return createTreeWalker.call(document, fragment, 1 | 128, null, false);
  } : function (fragment) {
    return createTreeWalker.call(document, fragment, 1 | 128);
  };

  var diff = function diff(comment, oldNodes, newNodes) {
    return udomdiff(comment.parentNode, // TODO: there is a possible edge case where a node has been
    //       removed manually, or it was a keyed one, attached
    //       to a shared reference between renders.
    //       In this case udomdiff might fail at removing such node
    //       as its parent won't be the expected one.
    //       The best way to avoid this issue is to filter oldNodes
    //       in search of those not live, or not in the current parent
    //       anymore, but this would require both a change to uwire,
    //       exposing a parentNode from the firstChild, as example,
    //       but also a filter per each diff that should exclude nodes
    //       that are not in there, penalizing performance quite a lot.
    //       As this has been also a potential issue with domdiff,
    //       and both lighterhtml and hyperHTML might fail with this
    //       very specific edge case, I might as well document this possible
    //       "diffing shenanigan" and call it a day.
    oldNodes, newNodes, diffable, comment);
  }; // if an interpolation represents a comment, the whole
  // diffing will be related to such comment.
  // This helper is in charge of understanding how the new
  // content for such interpolation/hole should be updated


  var handleAnything = function handleAnything(comment) {
    var oldValue,
        text,
        nodes = [];

    var anyContent = function anyContent(newValue) {
      switch (typeof(newValue)) {
        // primitives are handled as text content
        case 'string':
        case 'number':
        case 'boolean':
          if (oldValue !== newValue) {
            oldValue = newValue;
            if (!text) text = document.createTextNode('');
            text.data = newValue;
            nodes = diff(comment, nodes, [text]);
          }

          break;
        // null, and undefined are used to cleanup previous content

        case 'object':
        case 'undefined':
          if (newValue == null) {
            if (oldValue != newValue) {
              oldValue = newValue;
              nodes = diff(comment, nodes, []);
            }

            break;
          } // arrays and nodes have a special treatment


          if (isArray(newValue)) {
            oldValue = newValue; // arrays can be used to cleanup, if empty

            if (newValue.length === 0) nodes = diff(comment, nodes, []); // or diffed, if these contains nodes or "wires"
            else if (typeof(newValue[0]) === 'object') nodes = diff(comment, nodes, newValue); // in all other cases the content is stringified as is
              else anyContent(String(newValue));
            break;
          } // if the new value is a DOM node, or a wire, and it's
          // different from the one already live, then it's diffed.
          // if the node is a fragment, it's appended once via its childNodes
          // There is no `else` here, meaning if the content
          // is not expected one, nothing happens, as easy as that.


          if ('ELEMENT_NODE' in newValue && oldValue !== newValue) {
            oldValue = newValue;
            nodes = diff(comment, nodes, newValue.nodeType === 11 ? slice.call(newValue.childNodes) : [newValue]);
          }

          break;

        case 'function':
          anyContent(newValue(comment));
          break;
      }
    };

    return anyContent;
  }; // attributes can be:
  //  * ref=${...}      for hooks and other purposes
  //  * aria=${...}     for aria attributes
  //  * ?boolean=${...} for boolean attributes
  //  * .dataset=${...} for dataset related attributes
  //  * .setter=${...}  for Custom Elements setters or nodes with setters
  //                    such as buttons, details, options, select, etc
  //  * onevent=${...}  to automatically handle event listeners
  //  * generic=${...}  to handle an attribute just like an attribute


  var handleAttribute = function handleAttribute(node, name
  /*, svg*/
  ) {
    switch (name[0]) {
      case '?':
        return _boolean(node, name.slice(1), false);

      case '.':
        return setter(node, name.slice(1));

      case 'o':
        if (name[1] === 'n') return event(node, name);
    }

    switch (name) {
      case 'ref':
        return ref(node);

      case 'aria':
        return aria(node);
    }

    return attribute(node, name
    /*, svg*/
    );
  }; // each mapped update carries the update type and its path
  // the type is either node, attribute, or text, while
  // the path is how to retrieve the related node to update.
  // In the attribute case, the attribute name is also carried along.


  function handlers(options) {
    var type = options.type,
        path = options.path;
    var node = path.reduceRight(reducePath, this);
    return type === 'node' ? handleAnything(node) : type === 'attr' ? handleAttribute(node, options.name
    /*, options.svg*/
    ) : text(node);
  }

  // that contain the related unique id. In the attribute cases
  // isµX="attribute-name" will be used to map current X update to that
  // attribute name, while comments will be like <!--isµX-->, to map
  // the update to that specific comment node, hence its parent.
  // style and textarea will have <!--isµX--> text content, and are handled
  // directly through text-only updates.

  var prefix = 'isµ'; // Template Literals are unique per scope and static, meaning a template
  // should be parsed once, and once only, as it will always represent the same
  // content, within the exact same amount of updates each time.
  // This cache relates each template to its unique content and updates.

  var cache$2 = umap(new WeakMap()); // a RegExp that helps checking nodes that cannot contain comments

  var textOnly = /^(?:plaintext|script|style|textarea|title|xmp)$/i;
  var createCache = function createCache() {
    return {
      stack: [],
      // each template gets a stack for each interpolation "hole"
      entry: null,
      // each entry contains details, such as:
      //  * the template that is representing
      //  * the type of node it represents (html or svg)
      //  * the content fragment with all nodes
      //  * the list of updates per each node (template holes)
      //  * the "wired" node or fragment that will get updates
      // if the template or type are different from the previous one
      // the entry gets re-created each time
      wire: null // each rendered node represent some wired content and
      // this reference to the latest one. If different, the node
      // will be cleaned up and the new "wire" will be appended

    };
  }; // the entry stored in the rendered node cache, and per each "hole"

  var createEntry = function createEntry(type, template) {
    var _mapUpdates = mapUpdates(type, template),
        content = _mapUpdates.content,
        updates = _mapUpdates.updates;

    return {
      type: type,
      template: template,
      content: content,
      updates: updates,
      wire: null
    };
  }; // a template is instrumented to be able to retrieve where updates are needed.
  // Each unique template becomes a fragment, cloned once per each other
  // operation based on the same template, i.e. data => html`<p>${data}</p>`


  var mapTemplate = function mapTemplate(type, template) {
    var text = instrument(template, prefix, type === 'svg');
    var content = createFragment(text, type); // once instrumented and reproduced as fragment, it's crawled
    // to find out where each update is in the fragment tree

    var tw = createWalker(content);
    var nodes = [];
    var length = template.length - 1;
    var i = 0; // updates are searched via unique names, linearly increased across the tree
    // <div isµ0="attr" isµ1="other"><!--isµ2--><style><!--isµ3--</style></div>

    var search = "".concat(prefix).concat(i);

    while (i < length) {
      var node = tw.nextNode(); // if not all updates are bound but there's nothing else to crawl
      // it means that there is something wrong with the template.

      if (!node) throw "bad template: ".concat(text); // if the current node is a comment, and it contains isµX
      // it means the update should take care of any content

      if (node.nodeType === 8) {
        // The only comments to be considered are those
        // which content is exactly the same as the searched one.
        if (node.data === search) {
          nodes.push({
            type: 'node',
            path: createPath(node)
          });
          search = "".concat(prefix).concat(++i);
        }
      } else {
        // if the node is not a comment, loop through all its attributes
        // named isµX and relate attribute updates to this node and the
        // attribute name, retrieved through node.getAttribute("isµX")
        // the isµX attribute will be removed as irrelevant for the layout
        // let svg = -1;
        while (node.hasAttribute(search)) {
          nodes.push({
            type: 'attr',
            path: createPath(node),
            name: node.getAttribute(search) //svg: svg < 0 ? (svg = ('ownerSVGElement' in node ? 1 : 0)) : svg

          });
          node.removeAttribute(search);
          search = "".concat(prefix).concat(++i);
        } // if the node was a style, textarea, or others, check its content
        // and if it is <!--isµX--> then update tex-only this node


        if (textOnly.test(node.tagName) && node.textContent.trim() === "<!--".concat(search, "-->")) {
          node.textContent = '';
          nodes.push({
            type: 'text',
            path: createPath(node)
          });
          search = "".concat(prefix).concat(++i);
        }
      }
    } // once all nodes to update, or their attributes, are known, the content
    // will be cloned in the future to represent the template, and all updates
    // related to such content retrieved right away without needing to re-crawl
    // the exact same template, and its content, more than once.


    return {
      content: content,
      nodes: nodes
    };
  }; // if a template is unknown, perform the previous mapping, otherwise grab
  // its details such as the fragment with all nodes, and updates info.


  var mapUpdates = function mapUpdates(type, template) {
    var _ref = cache$2.get(template) || cache$2.set(template, mapTemplate(type, template)),
        content = _ref.content,
        nodes = _ref.nodes; // clone deeply the fragment


    var fragment = importNode.call(document, content, true); // and relate an update handler per each node that needs one

    var updates = nodes.map(handlers, fragment); // return the fragment and all updates to use within its nodes

    return {
      content: fragment,
      updates: updates
    };
  }; // as html and svg can be nested calls, but no parent node is known
  // until rendered somewhere, the unroll operation is needed to
  // discover what to do with each interpolation, which will result
  // into an update operation.


  var unroll = function unroll(info, _ref2) {
    var type = _ref2.type,
        template = _ref2.template,
        values = _ref2.values;
    var length = values.length; // interpolations can contain holes and arrays, so these need
    // to be recursively discovered

    unrollValues(info, values, length);
    var entry = info.entry; // if the cache entry is either null or different from the template
    // and the type this unroll should resolve, create a new entry
    // assigning a new content fragment and the list of updates.

    if (!entry || entry.template !== template || entry.type !== type) info.entry = entry = createEntry(type, template);
    var _entry = entry,
        content = _entry.content,
        updates = _entry.updates,
        wire = _entry.wire; // even if the fragment and its nodes is not live yet,
    // it is already possible to update via interpolations values.

    for (var i = 0; i < length; i++) {
      updates[i](values[i]);
    } // if the entry was new, or representing a different template or type,
    // create a new persistent entity to use during diffing.
    // This is simply a DOM node, when the template has a single container,
    // as in `<p></p>`, or a "wire" in `<p></p><p></p>` and similar cases.


    return wire || (entry.wire = persistent(content));
  }; // the stack retains, per each interpolation value, the cache
  // related to each interpolation value, or null, if the render
  // was conditional and the value is not special (Array or Hole)

  var unrollValues = function unrollValues(_ref3, values, length) {
    var stack = _ref3.stack;

    for (var i = 0; i < length; i++) {
      var hole = values[i]; // each Hole gets unrolled and re-assigned as value
      // so that domdiff will deal with a node/wire, not with a hole

      if (hole instanceof Hole) values[i] = unroll(stack[i] || (stack[i] = createCache()), hole); // arrays are recursively resolved so that each entry will contain
      // also a DOM node or a wire, hence it can be diffed if/when needed
      else if (isArray(hole)) unrollValues(stack[i] || (stack[i] = createCache()), hole, hole.length); // if the value is nothing special, the stack doesn't need to retain data
        // this is useful also to cleanup previously retained data, if the value
        // was a Hole, or an Array, but not anymore, i.e.:
        // const update = content => html`<div>${content}</div>`;
        // update(listOfItems); update(null); update(html`hole`)
        else stack[i] = null;
    }

    if (length < stack.length) stack.splice(length);
  };
  /**
   * Holds all details wrappers needed to render the content further on.
   * @constructor
   * @param {string} type The hole type, either `html` or `svg`.
   * @param {string[]} template The template literals used to the define the content.
   * @param {Array} values Zero, one, or more interpolated values to render.
   */


  function Hole(type, template, values) {
    this.type = type;
    this.template = template;
    this.values = values;
  }

  var create$2 = Object.create,
      defineProperties$2 = Object.defineProperties; // both `html` and `svg` template literal tags are polluted
  // with a `for(ref[, id])` and a `node` tag too

  var tag = function tag(type) {
    // both `html` and `svg` tags have their own cache
    var keyed = umap(new WeakMap()); // keyed operations always re-use the same cache and unroll
    // the template and its interpolations right away

    var fixed = function fixed(cache) {
      return function (template) {
        for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          values[_key - 1] = arguments[_key];
        }

        return unroll(cache, {
          type: type,
          template: template,
          values: values
        });
      };
    };

    return defineProperties$2( // non keyed operations are recognized as instance of Hole
    // during the "unroll", recursively resolved and updated
    function (template) {
      for (var _len2 = arguments.length, values = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      return new Hole(type, template, values);
    }, {
      "for": {
        // keyed operations need a reference object, usually the parent node
        // which is showing keyed results, and optionally a unique id per each
        // related node, handy with JSON results and mutable list of objects
        // that usually carry a unique identifier
        value: function value(ref, id) {
          var memo = keyed.get(ref) || keyed.set(ref, create$2(null));
          return memo[id] || (memo[id] = fixed(createCache()));
        }
      },
      node: {
        // it is possible to create one-off content out of the box via node tag
        // this might return the single created node, or a fragment with all
        // nodes present at the root level and, of course, their child nodes
        value: function value(template) {
          for (var _len3 = arguments.length, values = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            values[_key3 - 1] = arguments[_key3];
          }

          return unroll(createCache(), {
            type: type,
            template: template,
            values: values
          }).valueOf();
        }
      }
    });
  }; // each rendered node gets its own cache


  var cache$1 = umap(new WeakMap()); // rendering means understanding what `html` or `svg` tags returned
  // and it relates a specific node to its own unique cache.
  // Each time the content to render changes, the node is cleaned up
  // and the new new content is appended, and if such content is a Hole
  // then it's "unrolled" to resolve all its inner nodes.

  var render = function render(where, what) {
    var hole = typeof what === 'function' ? what() : what;
    var info = cache$1.get(where) || cache$1.set(where, createCache());
    var wire = hole instanceof Hole ? unroll(info, hole) : hole;

    if (wire !== info.wire) {
      info.wire = wire;
      where.textContent = ''; // valueOf() simply returns the node itself, but in case it was a "wire"
      // it will eventually re-append all nodes to its fragment so that such
      // fragment can be re-appended many times in a meaningful way
      // (wires are basically persistent fragments facades with special behavior)

      where.appendChild(wire.valueOf());
    }

    return where;
  };

  var html = tag('html');
  var svg = tag('svg');

  function css (t) {
    for (var s = t[0], i = 1, l = arguments.length; i < l; i++) {
      s += arguments[i] + t[i];
    }

    return s;
  }

  var defineProperties$1 = Object.defineProperties,
      keys$2 = Object.keys;

  var accessor = function accessor(all, shallow, hook, value, update) {
    return {
      configurable: true,
      get: function get() {
        return value;
      },
      set: function set(_) {
        if (all || _ !== value || shallow && typeof(_) === 'object' && _) {
          value = _;
          if (hook) update.call(this, value);else update.call(this);
        }
      }
    };
  };

  var loop = function loop(props, get, all, shallow, useState, update) {
    var desc = {};
    var hook = useState !== noop$1;
    var args = [all, shallow, hook];

    for (var ke = keys$2(props), y = 0; y < ke.length; y++) {
      var value = get(props, ke[y]);
      var extras = hook ? useState(value) : [value, useState];
      if (update) extras[1] = update;
      desc[ke[y]] = accessor.apply(null, args.concat(extras));
    }

    return desc;
  };

  var noop$1 = function noop() {};

  var dom = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$all = _ref.all,
        all = _ref$all === void 0 ? false : _ref$all,
        _ref$shallow = _ref.shallow,
        shallow = _ref$shallow === void 0 ? true : _ref$shallow,
        _ref$useState = _ref.useState,
        useState = _ref$useState === void 0 ? noop$1 : _ref$useState,
        _ref$getAttribute = _ref.getAttribute,
        getAttribute = _ref$getAttribute === void 0 ? function (element, key) {
      return element.getAttribute(key);
    } : _ref$getAttribute;

    return function (element, props, update) {
      var value = function value(props, key) {
        var result = props[key],
            type = typeof(result);

        if (element.hasOwnProperty(key)) {
          result = element[key];
          delete element[key];
        } else if (element.hasAttribute(key)) {
          result = getAttribute(element, key);
          if (type == 'number') result = +result;else if (type == 'boolean') result = !/^(?:false|0|)$/.test(result);
        }

        return result;
      };

      var desc = loop(props, value, all, shallow, useState, update);
      return defineProperties$1(element, desc);
    };
  });

  var reactive = dom({
    dom: true
  });
  var CE = customElements;
  var defineCustomElement = CE.define;
  var create$1 = Object.create,
      defineProperties = Object.defineProperties,
      getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
      keys$1 = Object.keys;
  var element = 'element';
  var constructors = umap(new Map([[element, {
    c: HTMLElement,
    e: element
  }]]));

  var el = function el(name) {
    return document.createElement(name);
  };

  var info = function info(e) {
    return constructors.get(e) || constructors.set(e, {
      c: el(e).constructor,
      e: e
    });
  };

  var define = function define(tagName, definition) {
    var attachShadow = definition.attachShadow,
        attributeChanged = definition.attributeChanged,
        bound = definition.bound,
        connected = definition.connected,
        disconnected = definition.disconnected,
        handleEvent = definition.handleEvent,
        init = definition.init,
        observedAttributes = definition.observedAttributes,
        props = definition.props,
        render = definition.render,
        style = definition.style;
    var initialized = new WeakMap();
    var statics = {};
    var proto = {};
    var listeners = [];
    var retype = create$1(null);

    var bootstrap = function bootstrap(element, key, value) {
      if (!initialized.has(element)) {
        initialized.set(element, 0);
        defineProperties(element, {
          html: {
            configurable: true,
            value: content.bind(attachShadow ? element.attachShadow(attachShadow) : element)
          }
        });

        for (var i = 0; i < length; i++) {
          var _listeners$i = listeners[i],
              type = _listeners$i.type,
              options = _listeners$i.options;
          element.addEventListener(type, element, options);
        }

        if (bound) bound.forEach(bind, element);
        if (props) reactive(element, props, render);
        if (init || render) (init || render).call(element);
        if (key) element[key] = value;
      }
    };

    for (var k = keys$1(definition), i = 0, _length = k.length; i < _length; i++) {
      var key = k[i];

      if (/^on./.test(key) && !/Options$/.test(key)) {
        var options = definition[key + 'Options'] || false;
        var lower = key.toLowerCase();
        var type = lower.slice(2);
        listeners.push({
          type: type,
          options: options
        });
        retype[type] = key;

        if (lower !== key) {
          type = lower.slice(2, 3) + key.slice(3);
          retype[type] = key;
          listeners.push({
            type: type,
            options: options
          });
        }
      }

      switch (key) {
        case 'attachShadow':
        case 'constructor':
        case 'observedAttributes':
        case 'style':
          break;

        default:
          proto[key] = getOwnPropertyDescriptor(definition, key);
      }
    }

    var length = listeners.length;
    if (length && !handleEvent) proto.handleEvent = {
      value: function value(event) {
        this[retype[event.type]](event);
      }
    }; // [props]

    if (props !== null) {
      if (props) {
        var _loop = function _loop(_k, _i) {
          var key = _k[_i];
          proto[key] = {
            get: function get() {
              bootstrap(this);
              return props[key];
            },
            set: function set(value) {
              bootstrap(this, key, value);
            }
          };
        };

        for (var _k = keys$1(props), _i = 0; _i < _k.length; _i++) {
          _loop(_k, _i);
        }
      } else {
        proto.props = {
          get: function get() {
            var props = {};

            for (var attributes = this.attributes, _length2 = attributes.length, _i2 = 0; _i2 < _length2; _i2++) {
              var _attributes$_i = attributes[_i2],
                  name = _attributes$_i.name,
                  value = _attributes$_i.value;
              props[name] = value;
            }

            return props;
          }
        };
      }
    } // [/props]


    if (observedAttributes) statics.observedAttributes = {
      value: observedAttributes
    };
    proto.attributeChangedCallback = {
      value: function value() {
        bootstrap(this);
        if (attributeChanged) attributeChanged.apply(this, arguments);
      }
    };
    proto.connectedCallback = {
      value: function value() {
        bootstrap(this);
        if (connected) connected.call(this);
      }
    };
    if (disconnected) proto.disconnectedCallback = {
      value: disconnected
    };

    var _info = info(definition["extends"] || element),
        c = _info.c,
        e = _info.e;

    var MicroElement = /*#__PURE__*/function (_c) {
      _inherits(MicroElement, _c);

      var _super = _createSuper(MicroElement);

      function MicroElement() {
        _classCallCheck(this, MicroElement);

        return _super.apply(this, arguments);
      }

      return MicroElement;
    }(c);
    defineProperties(MicroElement, statics);
    defineProperties(MicroElement.prototype, proto);
    var args = [tagName, MicroElement];
    if (e !== element) args.push({
      "extends": e
    });
    defineCustomElement.apply(CE, args);
    constructors.set(tagName, {
      c: MicroElement,
      e: e
    });
    if (style) document.head.appendChild(el('style')).textContent = style(e === element ? tagName : e + '[is="' + tagName + '"]');
    return MicroElement;
  };
  /* istanbul ignore else */

  if (!CE.get('uce-lib')) // theoretically this could be just class { ... }
    // however, if there is for whatever reason a <uce-lib>
    // element on the page, it will break once the registry
    // will try to upgrade such element so ... HTMLElement it is.
    CE.define('uce-lib', /*#__PURE__*/function (_info$c) {
      _inherits(_class, _info$c);

      var _super2 = _createSuper(_class);

      function _class() {
        _classCallCheck(this, _class);

        return _super2.apply(this, arguments);
      }

      _createClass(_class, null, [{
        key: "define",
        get: function get() {
          return define;
        }
      }, {
        key: "render",
        get: function get() {
          return render;
        }
      }, {
        key: "html",
        get: function get() {
          return html;
        }
      }, {
        key: "svg",
        get: function get() {
          return svg;
        }
      }, {
        key: "css",
        get: function get() {
          return css;
        }
      }]);

      return _class;
    }(info(element).c));

  function bind(method) {
    this[method] = this[method].bind(this);
  }

  function content() {
    return render(this, html.apply(null, arguments));
  }

  var value = function value(props, key) {
    return props[key];
  };

  var state = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$all = _ref.all,
        all = _ref$all === void 0 ? false : _ref$all,
        _ref$shallow = _ref.shallow,
        shallow = _ref$shallow === void 0 ? true : _ref$shallow,
        _ref$useState = _ref.useState,
        useState = _ref$useState === void 0 ? noop$1 : _ref$useState;

    return function (props, update) {
      return defineProperties$1({}, loop(props, value, all, shallow, useState, update));
    };
  });

  var stateHandler = (function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return (options.dom ? dom : state)(options);
  });

  var _self = self,
      document$1 = _self.document,
      MutationObserver = _self.MutationObserver,
      Set$1 = _self.Set,
      WeakMap$1 = _self.WeakMap;

  var elements = function elements(element) {
    return 'querySelectorAll' in element;
  };

  var filter = [].filter;
  var QSAO = (function (options) {
    var live = new WeakMap$1();

    var callback = function callback(records) {
      var query = options.query;

      if (query.length) {
        for (var i = 0, length = records.length; i < length; i++) {
          loop(filter.call(records[i].addedNodes, elements), true, query);
          loop(filter.call(records[i].removedNodes, elements), false, query);
        }
      }
    };

    var drop = function drop(elements) {
      for (var i = 0, length = elements.length; i < length; i++) {
        live["delete"](elements[i]);
      }
    };

    var flush = function flush() {
      callback(observer.takeRecords());
    };

    var loop = function loop(elements, connected, query) {
      var set = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Set$1();

      var _loop = function _loop(_selectors, _element, i, length) {
        // guard against repeated elements within nested querySelectorAll results
        if (!set.has(_element = elements[i])) {
          set.add(_element);

          if (connected) {
            for (var q, m = matches(_element), _i = 0, _length = query.length; _i < _length; _i++) {
              if (m.call(_element, q = query[_i])) {
                if (!live.has(_element)) live.set(_element, new Set$1());
                _selectors = live.get(_element); // guard against selectors that were handled already

                if (!_selectors.has(q)) {
                  _selectors.add(q);

                  options.handle(_element, connected, q);
                }
              }
            }
          } // guard against elements that never became live
          else if (live.has(_element)) {
              _selectors = live.get(_element);
              live["delete"](_element);

              _selectors.forEach(function (q) {
                options.handle(_element, connected, q);
              });
            }

          loop(querySelectorAll(_element), connected, query, set);
        }

        selectors = _selectors;
        element = _element;
      };

      for (var selectors, element, i = 0, length = elements.length; i < length; i++) {
        _loop(selectors, element, i);
      }
    };

    var matches = function matches(element) {
      return element.matches || element.webkitMatchesSelector || element.msMatchesSelector;
    };

    var parse = function parse(elements) {
      var connected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      loop(elements, connected, options.query);
    };

    var querySelectorAll = function querySelectorAll(root) {
      return query.length ? root.querySelectorAll(query) : query;
    };

    var observer = new MutationObserver(callback);
    var root = options.root || document$1;
    var query = options.query;
    observer.observe(root, {
      childList: true,
      subtree: true
    });
    parse(querySelectorAll(root));
    return {
      drop: drop,
      flush: flush,
      observer: observer,
      parse: parse
    };
  });

  if (!Lie.all) Lie.all = function (list) {
    return new Lie(function ($) {
      var length = list.length;
      if (!length) $();
      var i = 0;

      while (i < length) {
        list[i++].then(update);
      }

      i = 0;

      function update() {
        if (++i === length) $();
      }
    });
  };
  var create = Object.create,
      defineProperty = Object.defineProperty,
      keys = Object.keys;
  var lazyModules = [];
  var strict = '"use strict;"\n';

  var $require = function $require(module) {
    return cache[module];
  };

  var cache = create(null);
  var waiting = {};
  var asCJS = function asCJS(esm, require) {
    var exports = [];
    var imports = [];
    var cjs = esm.replace(/(^|[\r\n])\s*import\s*((['|"])[^\3]+?\3)/g, function (_, $1, $2) {
      return $1 + 'require(' + $2 + ')';
    }).replace(/(^|[\r\n])\s*import\s*([^\3]+?)(\s*from\s*)((['|"])[^\5]+?\5)/g, function (_, $1, $2, $, $3) {
      return $1 + 'const ' + $2.replace(/\s+as\s+/g, ':') + ' = require(' + $3 + ')';
    }).replace(/^\s*export\s+default(\s*)/mg, 'exports.default =$1').replace(/(^|[\r\n])\s*export\s*\{([^}]+?)\}[^\n]*/g, function (_, $, $1) {
      $1.trim().split(/\s*,\s*/).forEach(function (name) {
        exports.push("exports.".concat(name, " = ").concat(name, ";"));
      });
      return $;
    }).replace(/(^|[\r\n])\s*export\s+(const|let|var|function)(\s+)(\w+)/g, function (_, $, $1, $2, $3) {
      exports.push("exports.".concat($3, " = ").concat($3, ";"));
      return $ + $1 + $2 + $3;
    }).concat('\n', exports.join('\n')).replace(/require\s*\(\s*(['"])([^\1]+?)\1\s*\)/g, function ($, _, module) {
      imports.push(module);
      return $;
    });

    if (require) {
      imports.forEach(function (key) {
        if (!(key in cache)) {
          lazyModules.push(new Lie(function ($) {
            var module = waiting;

            if (/^(?:[./]|https?:)/.test(key)) {
              cache[key] = module;
              var xhr = new XMLHttpRequest();
              xhr.open('get', key, true);
              xhr.send(null);

              xhr.onload = function () {
                $(cache[key] = loader(xhr.responseText));
              };
            } else {
              defineProperty(cache, key, {
                get: function get() {
                  return module;
                },
                set: function set(value) {
                  $(module = value);
                }
              });
            }
          }));
        }
      });
      return new Lie(function ($) {
        Lie.all(lazyModules).then(function () {
          return $(cjs);
        });
      });
    }

    return cjs;
  };
  var cjs = function cjs(extras) {
    var args = keys(extras || {});
    var values = args.map(function (k) {
      return extras[k];
    }).concat($require);
    args.push('require');
    return function (code) {
      var exports = {};
      var module = {
        exports: exports
      };
      var params = args.concat('module', 'exports', strict + asCJS(code));
      var fn = Function.apply(null, params);
      fn.apply(null, values.concat(module, exports));
      var result = module.exports;
      var k = keys(result);
      return k.length === 1 && k[0] === 'default' ? result["default"] : result;
    };
  };
  var loader = cjs();

  var partial = (function (html) {
    var template = [];
    var values = [];
    var length = html.length;
    var s = 0,
        e = 0,
        p = 0;

    while (s < length && -1 < (s = html.indexOf('{{', p)) && -1 < (e = html.indexOf('}}', s + 2))) {
      template.push(html.slice(p, s));
      values.push(html.slice(s + 2, e));
      p = e + 2;
    }

    template.push(html.slice(p));
    var args = [template];
    var rest = Function('return function(){with(arguments[0])return[' + values + ']}')();
    return function (object) {
      return args.concat(rest.call(this, object));
    };
  });

  var domHandler = stateHandler({
    dom: true,
    useState: useState
  });
  var query = [];

  var _QSAO = QSAO({
    query: query,
    handle: function handle(element, _, selector) {
      drop([element]);

      if (toBeDefined.has(selector)) {
        var _define = toBeDefined.get(selector);

        toBeDefined["delete"](selector);
        query.splice(query.indexOf(selector), 1);

        _define();
      }
    }
  }),
      drop = _QSAO.drop,
      parseQSAO = _QSAO.parse;
  var resolve = function resolve(name, module) {
    if (name in cache && cache[name] !== waiting) console.warn('duplicated ' + name);
    cache[name] = module;
  };
  var parse = function parse(parts) {
    var template = new Template();
    template.innerHTML = parts;
    return template;
  };
  var toBeDefined = new Map();
  var wrapSetup = ['module.exports=function(module,exports){"use strict";', '}'];

  var noop = function noop() {};

  var badTemplate = function badTemplate() {
    throw new Error('bad template');
  };

  var get = function get(child, name) {
    return child.getAttribute(name);
  };

  var has = function has(child, name) {
    return child.hasAttribute(name);
  };

  var lazySetup = function lazySetup(fn, self, props, exports) {
    var module = {
      exports: exports
    };
    fn.call(self, module, exports);
    var result = module.exports;
    var out = result["default"] || result;
    if (props) domHandler(self, out.props);
    return out;
  };

  var queryHelper = function queryHelper(attr, arr) {
    return function (element) {
      return [].reduce.call(element.querySelectorAll('[' + attr + ']'), function (slot, node) {
        var parentNode = node.parentNode;

        do {
          if (parentNode === element) {
            var name = get(node, attr);
            slot[name] = arr ? [].concat(slot[name] || [], node) : node;
            break;
          } else if (/-/.test(parentNode.tagName) || get(parentNode, 'is')) break;
        } while (parentNode = parentNode.parentNode);

        return slot;
      }, {});
    };
  }; // preloaded imports


  var virtualNameSpace = {
    define: define,
    render: render,
    html: html,
    svg: svg,
    css: css,
    reactive: stateHandler({
      useState: useState
    }),
    ref: queryHelper('ref', false),
    slot: queryHelper('slot', true)
  }; // deprecated? namespace

  resolve('@uce/reactive', virtualNameSpace.reactive);
  resolve('@uce/slot', virtualNameSpace.slot); // virtual namespace

  resolve('@uce', virtualNameSpace);
  resolve('uce', virtualNameSpace); // extra/useful modules

  var hooks = {
    augmentor: hooked,
    hooked: hooked,
    useState: useState,
    useRef: useRef,
    useContext: useContext,
    createContext: createContext,
    useCallback: useCallback,
    useMemo: useMemo,
    useReducer: useReducer,
    useEffect: useEffect,
    useLayoutEffect: useLayoutEffect
  };
  resolve('augmentor', hooks);
  resolve('uhooks', hooks);
  resolve('qsa-observer', QSAO);
  resolve('reactive-props', stateHandler);
  resolve('@webreflection/lie', Lie); // <template is="uce-template" />

  var Template = define('uce-template', {
    "extends": 'template',
    props: null,
    init: init
  });
  Template.resolve = resolve;
  Template.from = parse;

  function init(tried) {
    var defineComponent = function defineComponent($) {
      var params = partial(template.replace(/(<!--(\{\{)|(\}\})-->)/g, '$2$3'));
      var component = script && loader(isSetup ? wrapSetup.join($) : $) || {};
      var observedAttributes = component.observedAttributes,
          props = component.props,
          setup = component.setup;
      var hasTemplate = !!template.trim();
      var apply = isSetup || hasTemplate || !!setup;
      var hooks = new WeakMap();
      var definition = {
        props: null,
        "extends": as ? name : 'element',
        init: function init() {
          var self = this;
          var html = self.html;
          var init = true;
          var update = noop;
          var render = hooked(function () {
            if (init) {
              init = !init;

              if (apply) {
                self.render = render;
                if (props) domHandler(self, props);
                var values = isSetup ? lazySetup(component, self, isProps, {}) : setup && component.setup(self);

                if (hasTemplate) {
                  var args = params.bind(self, values || {});

                  update = function update() {
                    html.apply(self, args());
                  };
                }
              }
            }

            update();
          });
          render();
          if (hasEffect(render)) hooks.set(self, render);
        }
      };
      if (css) definition.style = function () {
        return css;
      };
      if (shadow) definition.attachShadow = {
        mode: shadow
      };

      if (observedAttributes) {
        definition.observedAttributes = observedAttributes;

        var aC = definition.attributeChanged = function () {
          var attributeChanged = this.attributeChanged;
          if (attributeChanged !== aC) attributeChanged.apply(this, arguments);
        };
      }

      if (script) {
        var c = definition.connected = function () {
          var connected = this.connected;
          if (connected !== c) connected.call(this);
        };

        var d = definition.disconnected = function () {
          var disconnected = this.disconnected;
          if (hooks.has(this)) dropEffect(hooks.get(this));
          if (disconnected !== d) disconnected.call(this);
        };
      }

      for (var key in component) {
        if (!(key in definition)) definition[key] = component[key];
      }

      define(as || name, definition);
    };

    var content = this.content,
        ownerDocument = this.ownerDocument,
        parentNode = this.parentNode;

    var _ref = content || createContent(this.innerHTML),
        childNodes = _ref.childNodes;

    var styles = []; // drop this element in IE11before its content is live

    if (parentNode && this instanceof HTMLUnknownElement) parentNode.removeChild(this);
    var later = defineComponent;
    var isSetup = false;
    var isProps = false;
    var as = '';
    var css = '';
    var name = '';
    var script = '';
    var shadow = '';
    var template = '';

    for (var i = 0; i < childNodes.length; i++) {
      var child = childNodes[i];

      if (child.nodeType === 1) {
        var tagName = child.tagName;
        var is = has(child, 'is');
        if (/^style$/i.test(tagName)) styles.push(child);else if (is || /-/i.test(tagName)) {
          if (name) badTemplate();
          name = tagName.toLowerCase();
          template = child.innerHTML;
          if (is) as = get(child, 'is').toLowerCase();
          if (has(child, 'shadow')) shadow = get(child, 'shadow') || 'open';
        } else if (/^script$/i.test(tagName)) {
          if (script) badTemplate();
          isSetup = has(child, 'setup');
          isProps = isSetup && get(child, 'setup') === 'props';
          script = child.textContent;

          later = function later() {
            asCJS(script, true).then(defineComponent);
          };
        }
      }
    }

    var selector = as ? name + '[is="' + as + '"]' : name;
    if (!selector) return setTimeout(tried ? badTemplate : init.bind(this), 0, true);

    for (var _i = styles.length; _i--;) {
      var _child = styles[_i];
      var textContent = _child.textContent;
      if (has(_child, 'shadow')) template = '<style>' + textContent + '</style>' + template;else if (has(_child, 'scoped')) {
        (function () {
          var def = [];
          css += textContent.replace(/\{([^}]+?)\}/g, function (_, $1) {
            return '\x01' + def.push($1) + ',';
          }).split(',').map(function (s) {
            return s.trim() ? selector + ' ' + s.trim() : '';
          }).join(',\n').replace(/\x01(\d+),/g, function (_, $1) {
            return '{' + def[--$1] + '}';
          }).replace(/(,\n)+/g, ',\n');
        })();
      } else css += textContent;
    }

    if (has(this, 'lazy')) {
      toBeDefined.set(selector, later);
      query.push(selector);
      parseQSAO(ownerDocument.querySelectorAll(query));
    } else later();
  }

  exports.parse = parse;
  exports.resolve = resolve;

  return exports;

}({}));
