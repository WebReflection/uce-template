(function () {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

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
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
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
    return function (value) {
      if (typeof value === 'function') value(node);else value.current = node;
    };
  };
  var setter = function setter(node, key) {
    return function (value) {
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

  var IE = importNode.length != 1; // IE11 and old Edge discard empty nodes when cloning, potentially
  // resulting in broken paths to find updates. The workaround here
  // is to import once, upfront, the fragment that will be cloned
  // later on, so that paths are retrieved from one already parsed,
  // hence without missing child nodes once re-cloned.

  var createFragment = IE ? function (text, type) {
    return importNode.call(document, createContent(text, type), true);
  } : createContent; // IE11 and old Edge have a different createTreeWalker signature that
  // has been deprecated in other browsers. This export is needed only
  // to guarantee the TreeWalker doesn't show warnings and, ultimately, works

  var createWalker = IE ? function (fragment) {
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
      switch (_typeof(newValue)) {
        // primitives are handled as text content
        case 'string':
        case 'number':
        case 'boolean':
          if (oldValue !== newValue) {
            oldValue = newValue;
            if (text) text.textContent = newValue;else text = document.createTextNode(newValue);
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
            else if (_typeof(newValue[0]) === 'object') nodes = diff(comment, nodes, newValue); // in all other cases the content is stringified as is
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

      }
    };

    return anyContent;
  }; // attributes can be:
  //  * ref=${...}      for hooks and other purposes
  //  * aria=${...}     for aria attributes
  //  * .dataset=${...} for dataset related attributes
  //  * .setter=${...}  for Custom Elements setters or nodes with setters
  //                    such as buttons, details, options, select, etc
  //  * onevent=${...}  to automatically handle event listeners
  //  * generic=${...}  to handle an attribute just like an attribute


  var handleAttribute = function handleAttribute(node, name
  /*, svg*/
  ) {
    if (name === 'ref') return ref(node);
    if (name === 'aria') return aria(node);
    if (name === '.dataset') return data(node);
    if (name.slice(0, 1) === '.') return setter(node, name.slice(1));
    if (name.slice(0, 2) === 'on') return event(node, name);
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

  var cache = umap(new WeakMap());
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
        if (node.textContent === search) {
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
        } // if the node was a style or a textarea one, check its content
        // and if it is <!--isµX--> then update tex-only this node


        if (/^(?:style|textarea)$/i.test(node.tagName) && node.textContent.trim() === "<!--".concat(search, "-->")) {
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
    var _ref = cache.get(template) || cache.set(template, mapTemplate(type, template)),
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

  var create = Object.create,
      defineProperties = Object.defineProperties; // both `html` and `svg` template literal tags are polluted
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

    return defineProperties( // non keyed operations are recognized as instance of Hole
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
          var memo = keyed.get(ref) || keyed.set(ref, create(null));
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

  var CE = customElements;
  var defineCustomElement = CE.define;
  var create$1 = Object.create,
      defineProperties$1 = Object.defineProperties,
      getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
      keys = Object.keys;
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
    var defaultProps = new Map();
    var statics = {};
    var proto = {};
    var listeners = [];
    var retype = create$1(null);

    var bootstrap = function bootstrap(element) {
      if (!initialized.has(element)) {
        initialized.set(element, 0);
        defineProperties$1(element, {
          html: {
            value: content.bind(attachShadow ? element.attachShadow(attachShadow) : element)
          }
        });

        for (var i = 0; i < length; i++) {
          var _listeners$i = listeners[i],
              type = _listeners$i.type,
              options = _listeners$i.options;
          element.addEventListener(type, element, options);
        }

        defaultProps.forEach(function (key, _) {
          var value = props[key]; // covered via test/pen.html, hard to test in NodeJS

          /* istanbul ignore if */

          if (element.hasOwnProperty(key)) {
            value = element[key];
            delete element[key];
          } else if (element.hasAttribute(key)) {
            value = element.getAttribute(key);
            element.removeAttribute(key);
          }

          _.set(element, value);
        });
        if (bound) bound.forEach(bind, element);
        if (init || render) (init || render).call(element);
      }
    };

    for (var k = keys(definition), i = 0, _length = k.length; i < _length; i++) {
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
    };

    if (props !== null) {
      if (props) {
        var _loop = function _loop(_k, _i) {
          var _ = new WeakMap();

          var key = _k[_i];
          defaultProps.set(_, key);
          proto[key] = {
            get: function get() {
              bootstrap(this);
              return _.get(this);
            },
            set: function set(value) {
              bootstrap(this);

              _.set(this, value);

              if (render) render.call(this);
            }
          };
        };

        for (var _k = keys(props), _i = 0; _i < _k.length; _i++) {
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
    }

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
        if (connected) connected.apply(this, arguments);
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
    defineProperties$1(MicroElement, statics);
    defineProperties$1(MicroElement.prototype, proto);
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

  var Promise$1 = typeof Promise === 'function' ? Promise : function (fn) {
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

  if (!Promise$1.all) Promise$1.all = function (list) {
    return new Promise$1(function ($) {
      var length = list.length;
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
  customElements.whenDefined('uce-lib').then(function (uce) {
    var _ref = uce || customElements.get('uce-lib'),
        define = _ref.define;

    var parse = JSON.parse;
    var create = Object.create,
        keys = Object.keys;
    var cache = create(null);
    var all = [];

    var resolve = function resolve(module) {
      return cache[module];
    };

    var load = function load(module, path) {
      return new Promise$1(function ($) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', path, true);
        xhr.send(null);

        xhr.onload = function () {
          var self = {};
          var script = xhr.responseText.replace(/^\s*var\s+/mg, 'self.');
          Function('self', 'window', 'global', 'globalThis', script)(self, self, self, self);
          var key = keys(self);
          if (key.length === 1) $(cache[module] = self[key[0]]["default"] || self[key[0]]);else $(cache[module] = self);
        };
      });
    };

    if (!customElements.get('uce-require')) define('uce-require', {
      "extends": 'script',
      init: function init() {
        var graph = parse(this.textContent.trim());
        keys(graph).forEach(function (key) {
          if (!(key in cache)) all.push(load(key, graph[key]));
        });
        this.constructor.load = new Promise$1(function ($) {
          Promise$1.all(all).then(function () {
            return $(resolve);
          });
        });
      }
    });
  });

  /**
   * @typedef {object} ParseResult an object with parsed results
   * @property {string[]} template - the list of chunks around interpolations
   * @property {string[]} values - interpolations as strings
   */

  /**
   * @typedef {[string[], ...any[]]} TagArguments an array to use as template
   *                                              literals tag arguments
   */

  /**
   * @callback Partial a callback that re-evaluate each time new data associated
   *                   to the same template-like array.
   * @param {object} [object] the optional data to evaluate as interpolated values
   * @returns {TagArguments} an array to use as template literals tag arguments
   */

  /**
  * The default `transform` callback
  * @param {string} value the interpolation value as string
  */
  var noop = function noop(value) {
    return value;
  };
  /**
   * The default "null" fallback when no object is passed to the Partial.
   */


  var fallback = Object.create(null);
  /**
   * Given a string and an optional function used to transform each value
   * found as interpolated content, returns an object with a `template` and
   * a `values` properties, as arrays, containing the template chunks,
   * and all its interpolations as strings.
   * @param {string} content the string to parse/convert as template chunks
   * @param {function} [transform] the optional function to modify string values
   * @returns {ParseResult} an object with `template` and `values` arrays.
   */

  var parse = function parse(content, transform) {
    var fn = transform || noop;
    var template = [];
    var values = [];
    var length = content.length;
    var i = 0;

    while (i <= length) {
      var open = content.indexOf('${', i);

      if (-1 < open) {
        template.push(content.slice(i, open));
        open = i = open + 2;
        var close = 1; // TODO: this *might* break if the interpolation has strings
        //       containing random `{}` chars ... but implementing
        //       a whole JS parser here doesn't seem worth it
        //       for such irrelevant edge-case ... or does it?

        while (0 < close && i < length) {
          var c = content[i++];
          close += c === '{' ? 1 : c === '}' ? -1 : 0;
        }

        values.push(fn(content.slice(open, i - 1)));
      } else {
        template.push(content.slice(i));
        i = length + 1;
      }
    }

    return {
      template: template,
      values: values
    };
  };
  /**
   * Given a string and an optional function used to transform each value
   * found as interpolated content, returns a callback that can be used to
   * repeatedly generate new content from the same template array.
   * @param {string} content the string to parse/convert as template chunks
   * @param {function} [transform] the optional function to modify string values
   * @returns {Partial} a function that accepts an optional object to generate
   *                    new content, through the same template, each time.
   */

  var partial = function partial(content, transform) {
    var _parse = parse(content, transform),
        template = _parse.template,
        values = _parse.values;

    var args = [template];
    var rest = Function('return function(){with(arguments[0])return[' + values + ']}')();
    return function (object) {
      return args.concat(rest(object || fallback));
    };
  };

  var compat = typeof cancelAnimationFrame === 'function';
  var cAF = compat ? cancelAnimationFrame : clearTimeout;
  var rAF = compat ? requestAnimationFrame : setTimeout;
  function reraf(limit) {
    var force, timer, callback, self, args;
    reset();
    return function reschedule(_callback, _self, _args) {
      callback = _callback;
      self = _self;
      args = _args;
      if (!timer) timer = rAF(invoke);
      if (--force < 0) stop(true);
      return stop;
    };

    function invoke() {
      reset();
      callback.apply(self, args || []);
    }

    function reset() {
      force = limit || Infinity;
      timer = compat ? 0 : null;
    }

    function stop(flush) {
      var didStop = !!timer;

      if (didStop) {
        cAF(timer);
        if (flush) invoke();
      }

      return didStop;
    }
  }

  /*! (c) Andrea Giammarchi - ISC */
  var state = null; // main exports

  var augmentor = function augmentor(fn) {
    var stack = [];
    return function hook() {
      var prev = state;
      var after = [];
      state = {
        hook: hook,
        args: arguments,
        stack: stack,
        i: 0,
        length: stack.length,
        after: after
      };

      try {
        return fn.apply(null, arguments);
      } finally {
        state = prev;

        for (var i = 0, length = after.length; i < length; i++) {
          after[i]();
        }
      }
    };
  };

  var updates = umap(new WeakMap());

  var hookdate = function hookdate(hook, ctx, args) {
    hook.apply(ctx, args);
  };

  var defaults = {
    async: false,
    always: false
  };

  var getValue = function getValue(value, f) {
    return typeof f == 'function' ? f(value) : f;
  };

  var useReducer = function useReducer(reducer, value, init, options) {
    var i = state.i++;
    var _state = state,
        hook = _state.hook,
        args = _state.args,
        stack = _state.stack,
        length = _state.length;
    if (i === length) state.length = stack.push({});
    var ref = stack[i];
    ref.args = args;

    if (i === length) {
      var fn = typeof init === 'function';

      var _ref = (fn ? options : init) || options || defaults,
          asy = _ref.async,
          always = _ref.always;

      ref.$ = fn ? init(value) : getValue(void 0, value);
      ref._ = asy ? updates.get(hook) || updates.set(hook, reraf()) : hookdate;

      ref.f = function (value) {
        var $value = reducer(ref.$, value);

        if (always || ref.$ !== $value) {
          ref.$ = $value;

          ref._(hook, null, ref.args);
        }
      };
    }

    return [ref.$, ref.f];
  }; // useState

  var useState = function useState(value, options) {
    return useReducer(getValue, value, void 0, options);
  }; // useContext

  var hooks = new WeakMap();

  var invoke = function invoke(_ref2) {
    var hook = _ref2.hook,
        args = _ref2.args;
    hook.apply(null, args);
  };

  var createContext = function createContext(value) {
    var context = {
      value: value,
      provide: provide
    };
    hooks.set(context, []);
    return context;
  };
  var useContext = function useContext(context) {
    var _state2 = state,
        hook = _state2.hook,
        args = _state2.args;
    var stack = hooks.get(context);
    var info = {
      hook: hook,
      args: args
    };
    if (!stack.some(update, info)) stack.push(info);
    return context.value;
  };

  function provide(value) {
    if (this.value !== value) {
      this.value = value;
      hooks.get(this).forEach(invoke);
    }
  }

  function update(_ref3) {
    var hook = _ref3.hook;
    return hook === this.hook;
  } // dropEffect, hasEffect, useEffect, useLayoutEffect


  var effects = new WeakMap();
  var fx = umap(effects);

  var stop = function stop() {};

  var createEffect = function createEffect(asy) {
    return function (effect, guards) {
      var i = state.i++;
      var _state3 = state,
          hook = _state3.hook,
          after = _state3.after,
          stack = _state3.stack,
          length = _state3.length;

      if (i < length) {
        var info = stack[i];
        var _update = info.update,
            values = info.values,
            _stop = info.stop;

        if (!guards || guards.some(different, values)) {
          info.values = guards;
          if (asy) _stop(asy);
          var clean = info.clean;

          if (clean) {
            info.clean = null;
            clean();
          }

          var _invoke = function _invoke() {
            info.clean = effect();
          };

          if (asy) _update(_invoke);else after.push(_invoke);
        }
      } else {
        var _update2 = asy ? reraf() : stop;

        var _info = {
          clean: null,
          update: _update2,
          values: guards,
          stop: stop
        };
        state.length = stack.push(_info);
        (fx.get(hook) || fx.set(hook, [])).push(_info);

        var _invoke2 = function _invoke2() {
          _info.clean = effect();
        };

        if (asy) _info.stop = _update2(_invoke2);else after.push(_invoke2);
      }
    };
  };
  var hasEffect = effects.has.bind(effects);
  var useEffect = createEffect(true);
  var useLayoutEffect = createEffect(false); // useMemo, useCallback

  var useMemo = function useMemo(memo, guards) {
    var i = state.i++;
    var _state4 = state,
        stack = _state4.stack,
        length = _state4.length;
    if (i === length) state.length = stack.push({
      $: memo(),
      _: guards
    });else if (!guards || guards.some(different, stack[i]._)) stack[i] = {
      $: memo(),
      _: guards
    };
    return stack[i].$;
  };
  var useCallback = function useCallback(fn, guards) {
    return useMemo(function () {
      return fn;
    }, guards);
  }; // useRef

  var useRef = function useRef(value) {
    var i = state.i++;
    var _state5 = state,
        stack = _state5.stack,
        length = _state5.length;
    if (i === length) state.length = stack.push({
      current: value
    });
    return stack[i];
  };

  function different(value, i) {
    return value !== this[i];
  }

  customElements.whenDefined('uce-lib').then(function (uce) {
    var _ref = uce || customElements.get('uce-lib'),
        define = _ref.define,
        html = _ref.html,
        svg = _ref.svg;

    customElements.whenDefined('uce-require').then(function (uce) {
      var modules = uce || customElements.get('uce-require');
      define('uce-template', {
        "extends": 'template',
        init: function init() {
          var _ref2 = this.content || createContent(this.innerHTML),
              childNodes = _ref2.childNodes;

          var styles = [];
          var script = null;
          var as = '';
          var name = '';
          var shadow = '';
          var css = '';
          var template = '';
          modules.load.then(function (require) {
            for (var i = 0; i < childNodes.length; i++) {
              var child = childNodes[i];

              if (child.nodeType === 1) {
                var tagName = child.tagName;
                var is = child.hasAttribute('is');
                if (/^style$/i.test(tagName)) styles.push(child);else if (is || /-/i.test(tagName)) {
                  if (name) throw new Error('too many components');
                  name = tagName.toLowerCase();
                  template = child.innerHTML.replace(/\{\{([^\2]+?)(\}\})/g, function (_, $1) {
                    return '${' + $1 + '}';
                  });
                  if (is) as = child.getAttribute('is').toLowerCase();
                  if (child.hasAttribute('shadow')) shadow = child.getAttribute('shadow') || 'open';
                } else if (/^script$/i.test(tagName)) {
                  if (script) throw new Error('a component should have one script');
                  var exports = {};
                  var module = {
                    exports: exports
                  };
                  Function('require', 'module', 'exports', 'html', 'svg', 'useState', 'useRef', 'useContext', 'createContext', 'useCallback', 'useMemo', 'useReducer', 'useEffect', 'useLayoutEffect', '"use strict";\n' + child.textContent)(require, module, exports, html, svg, useState, useRef, useContext, createContext, useCallback, useMemo, useReducer, useEffect, useLayoutEffect);
                  script = module.exports;
                }
              }
            }

            var selector = as ? name + '[is="' + as + '"]' : name;

            for (var _i = styles.length; _i--;) {
              var _child = styles[_i];
              var textContent = _child.textContent;
              if (_child.hasAttribute('shadow')) template = '<style>' + textContent + '</style>' + template;else if (_child.hasAttribute('scoped')) {
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

            var params = partial(template);
            var _script = script,
                observedAttributes = _script.observedAttributes;
            define(as || name, {
              observedAttributes: observedAttributes,
              style: css ? function () {
                return css;
              } : null,
              "extends": as ? name : 'element',
              attachShadow: shadow ? {
                mode: shadow
              } : void 0,
              attributeChanged: observedAttributes && function () {
                if (this.hasOwnProperty('attributeChanged')) this.attributeChanged();
              },
              connected: function connected() {
                if (this.hasOwnProperty('connected')) this.connected();
              },
              disconnected: function disconnected() {
                if (this.hasOwnProperty('disconnected')) this.connected();
              },
              init: function init() {
                var self = this;
                var html = self.html;

                if (script) {
                  var init = true;
                  var data = null;
                  augmentor(function () {
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

}());
