
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"UI": function(exports, require, module) {(function() {
  var UI,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.UI = UI = new ((function() {
    function _Class() {
      this.handleWindowMouseUp = __bind(this.handleWindowMouseUp, this);
      this.handleWindowMouseMove = __bind(this.handleWindowMouseMove, this);
      this.dragging = null;
      this.autofocus = null;
      this.selectedFn = _.last(appRoot.fns);
      this.selectedChildFn = null;
      this.expandedPaths = {};
      this.registerEvents();
    }

    _Class.prototype.registerEvents = function() {
      window.addEventListener("mousemove", this.handleWindowMouseMove);
      return window.addEventListener("mouseup", this.handleWindowMouseUp);
    };

    _Class.prototype.preventDefault = function(e) {
      e.preventDefault();
      return util.selection.set(null);
    };

    _Class.prototype.handleWindowMouseMove = function(e) {
      var _ref;
      this.mousePosition = {
        x: e.clientX,
        y: e.clientY
      };
      return (_ref = this.dragging) != null ? typeof _ref.onMove === "function" ? _ref.onMove(e) : void 0 : void 0;
    };

    _Class.prototype.handleWindowMouseUp = function(e) {
      var _ref;
      if ((_ref = this.dragging) != null) {
        if (typeof _ref.onUp === "function") {
          _ref.onUp(e);
        }
      }
      this.dragging = null;
      if (this.hoverIsActive) {
        this.hoverData = null;
        return this.hoverIsActive = false;
      }
    };

    _Class.prototype.getElementUnderMouse = function() {
      var draggingOverlayEl, el;
      draggingOverlayEl = document.querySelector(".draggingOverlay");
      if (draggingOverlayEl != null) {
        draggingOverlayEl.style.pointerEvents = "none";
      }
      el = document.elementFromPoint(this.mousePosition.x, this.mousePosition.y);
      if (draggingOverlayEl != null) {
        draggingOverlayEl.style.pointerEvents = "";
      }
      return el;
    };

    _Class.prototype.getViewUnderMouse = function() {
      var el;
      el = this.getElementUnderMouse();
      el = el != null ? el.closest(function(el) {
        return el.dataFor != null;
      }) : void 0;
      return el != null ? el.dataFor : void 0;
    };

    _Class.prototype.selectFn = function(fn) {
      if (!(fn instanceof C.DefinedFn)) {
        return;
      }
      this.selectedFn = fn;
      return this.selectedChildFn = null;
    };

    _Class.prototype.selectChildFn = function(childFn) {
      return this.selectedChildFn = childFn;
    };

    _Class.prototype.addFn = function(appRoot) {
      var fn;
      fn = new C.DefinedFn();
      appRoot.fns.push(fn);
      return this.selectFn(fn);
    };

    _Class.prototype.addChildFn = function(fn) {
      var childFn;
      childFn = new C.ChildFn(fn);
      this.selectedFn.childFns.push(childFn);
      return this.selectChildFn(childFn);
    };

    _Class.prototype.removeChildFn = function(fn, childFnIndex) {
      var removedChildFn;
      removedChildFn = fn.childFns.splice(childFnIndex, 1)[0];
      if (this.selectedChildFn === removedChildFn) {
        return this.selectChildFn(null);
      }
    };

    _Class.prototype.getPathString = function(path) {
      var pathIds, pathString;
      pathIds = path.map(function(childFn) {
        return C.id(childFn);
      });
      return pathString = pathIds.join(",");
    };

    _Class.prototype.isPathExpanded = function(path) {
      var pathString;
      pathString = this.getPathString(path);
      if (this.expandedPaths[pathString] == null) {
        return true;
      }
      return this.expandedPaths[pathString];
    };

    _Class.prototype.setPathExpanded = function(path, expanded) {
      var pathString;
      pathString = this.getPathString(path);
      return this.expandedPaths[pathString] = expanded;
    };

    _Class.prototype.startVariableScrub = function(opts) {
      var cursor, onMove, variable;
      variable = opts.variable;
      cursor = opts.cursor;
      onMove = opts.onMove;
      return UI.dragging = {
        cursor: cursor,
        onMove: (function(_this) {
          return function(e) {
            var newValueString;
            newValueString = onMove(e);
            return variable.valueString = newValueString;
          };
        })(this)
      };
    };

    _Class.prototype.setAutoFocus = function(opts) {
      if (opts.descendantOf == null) {
        opts.descendantOf = [];
      }
      if (!_.isArray(opts.descendantOf)) {
        opts.descendantOf = [opts.descendantOf];
      }
      if (opts.props == null) {
        opts.props = {};
      }
      if (opts.location == null) {
        opts.location = "end";
      }
      return this.autofocus = opts;
    };

    _Class.prototype.attemptAutoFocus = function(textFieldView) {
      var el, matchesDescendantOf, matchesProps;
      if (!this.autofocus) {
        return;
      }
      matchesDescendantOf = _.every(this.autofocus.descendantOf, (function(_this) {
        return function(ancestorView) {
          return textFieldView.lookupView(ancestorView);
        };
      })(this));
      if (!matchesDescendantOf) {
        return;
      }
      matchesProps = _.every(this.autofocus.props, (function(_this) {
        return function(propValue, propName) {
          return textFieldView.lookup(propName) === propValue;
        };
      })(this));
      if (!matchesProps) {
        return;
      }
      el = textFieldView.getDOMNode();
      if (this.autofocus.location === "start") {
        util.selection.setAtStart(el);
      } else if (this.autofocus.location === "end") {
        util.selection.setAtEnd(el);
      }
      return this.autofocus = null;
    };

    return _Class;

  })());

}).call(this);
}, "config": function(exports, require, module) {(function() {
  var config;

  window.config = config = {
    storageName: "sinewaves",
    resolution: 0.5,
    mainLineWidth: 1.25,
    minGridSpacing: 90,
    hitTolerance: 10,
    snapTolerance: 7,
    outlineIndent: 16,
    gridColor: "204,194,163",
    style: {
      main: {
        strokeStyle: "#333",
        lineWidth: 1.25
      },
      "default": {
        strokeStyle: "#ccc",
        lineWidth: 1.25
      },
      selected: {
        strokeStyle: "#09c",
        lineWidth: 1.25
      }
    },
    color: {
      main: [0.2, 0.2, 0.2, 1],
      child: [0.8, 0.8, 0.8, 1],
      selected: [0, 0.6, 0.8, 1]
    },
    cursor: {
      text: "text",
      grab: "-webkit-grab",
      grabbing: "-webkit-grabbing",
      verticalScrub: "ns-resize",
      horizontalScrub: "ew-resize"
    }
  };

}).call(this);
}, "main": function(exports, require, module) {(function() {
  var eventName, json, refresh, refreshEventNames, refreshView, saveState, storageName, willRefreshNextFrame, _i, _len;

  require("./config");

  require("./util/util");

  require("./model/C");

  require("./view/R");

  storageName = config.storageName;

  window.reset = function() {
    delete window.localStorage[storageName];
    return location.reload();
  };

  if (json = window.localStorage[storageName]) {
    json = JSON.parse(json);
    window.appRoot = C.reconstruct(json);
  } else {
    window.appRoot = new C.AppRoot();
  }

  saveState = function() {
    json = C.deconstruct(appRoot);
    json = JSON.stringify(json);
    return window.localStorage[storageName] = json;
  };

  window.save = function() {
    return window.localStorage[storageName];
  };

  window.restore = function(jsonString) {
    if (!_.isString(jsonString)) {
      jsonString = JSON.stringify(jsonString);
    }
    window.localStorage[storageName] = jsonString;
    return location.reload();
  };

  require("./UI");

  willRefreshNextFrame = false;

  refresh = function() {
    if (willRefreshNextFrame) {
      return;
    }
    willRefreshNextFrame = true;
    return requestAnimationFrame(function() {
      refreshView();
      saveState();
      return willRefreshNextFrame = false;
    });
  };

  refreshView = function() {
    var appRootEl;
    appRootEl = document.querySelector("#AppRoot");
    return React.renderComponent(R.AppRootView({
      appRoot: appRoot
    }), appRootEl);
  };

  refreshEventNames = ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change", "wheel", "mousewheel"];

  for (_i = 0, _len = refreshEventNames.length; _i < _len; _i++) {
    eventName = refreshEventNames[_i];
    window.addEventListener(eventName, refresh);
  }

  refresh();

  if (location.protocol === "file:" && navigator.userAgent.indexOf("Firefox") === -1) {
    document.styleSheets.start_autoreload(1000);
  }

}).call(this);
}, "model/C": function(exports, require, module) {(function() {
  var C, className, constructor,
    __hasProp = {}.hasOwnProperty;

  window.C = C = {};

  require("./model");

  for (className in C) {
    if (!__hasProp.call(C, className)) continue;
    constructor = C[className];
    constructor.prototype.__className = className;
  }

  C._idCounter = 0;

  C._assignId = function(obj) {
    var id;
    this._idCounter++;
    id = "id" + this._idCounter + Date.now() + Math.floor(1e9 * Math.random());
    return obj.__id = id;
  };

  C.id = function(obj) {
    var _ref;
    return (_ref = obj.__id) != null ? _ref : C._assignId(obj);
  };

  C.deconstruct = function(object) {
    var objects, root, serialize;
    objects = {};
    serialize = (function(_this) {
      return function(object, force) {
        var entry, id, key, result, value, _i, _len;
        if (force == null) {
          force = false;
        }
        if (!force && (object != null ? object.__className : void 0)) {
          id = C.id(object);
          if (!objects[id]) {
            objects[id] = serialize(object, true);
          }
          return {
            __ref: id
          };
        }
        if (_.isArray(object)) {
          result = [];
          for (_i = 0, _len = object.length; _i < _len; _i++) {
            entry = object[_i];
            result.push(serialize(entry));
          }
          return result;
        }
        if (_.isObject(object)) {
          result = {};
          for (key in object) {
            if (!__hasProp.call(object, key)) continue;
            value = object[key];
            result[key] = serialize(value);
          }
          if (object.__className) {
            result.__className = object.__className;
          }
          return result;
        }
        return object != null ? object : null;
      };
    })(this);
    root = serialize(object);
    return {
      objects: objects,
      root: root
    };
  };

  C.reconstruct = function(_arg) {
    var constructObject, constructedObjects, derefObject, id, object, objects, root;
    objects = _arg.objects, root = _arg.root;
    constructedObjects = {};
    constructObject = (function(_this) {
      return function(object) {
        var classConstructor, constructedObject, key, value;
        className = object.__className;
        classConstructor = C[className];
        constructedObject = new classConstructor();
        for (key in object) {
          if (!__hasProp.call(object, key)) continue;
          value = object[key];
          if (key === "__className") {
            continue;
          }
          constructedObject[key] = value;
        }
        return constructedObject;
      };
    })(this);
    for (id in objects) {
      if (!__hasProp.call(objects, id)) continue;
      object = objects[id];
      constructedObjects[id] = constructObject(object);
    }
    derefObject = (function(_this) {
      return function(object) {
        var key, value, _results;
        if (!_.isObject(object)) {
          return;
        }
        _results = [];
        for (key in object) {
          if (!__hasProp.call(object, key)) continue;
          value = object[key];
          if (id = value != null ? value.__ref : void 0) {
            _results.push(object[key] = constructedObjects[id]);
          } else {
            _results.push(derefObject(value));
          }
        }
        return _results;
      };
    })(this);
    for (id in constructedObjects) {
      if (!__hasProp.call(constructedObjects, id)) continue;
      object = constructedObjects[id];
      derefObject(object);
    }
    return constructedObjects[root.__ref];
  };

}).call(this);
}, "model/model": function(exports, require, module) {(function() {
  var builtIn,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  C.Variable = (function() {
    function Variable(valueString) {
      this.valueString = valueString != null ? valueString : "0";
      this.valueString = this.valueString.toString();
      this.getValue();
    }

    Variable.prototype.getValue = function() {
      var value;
      value = this._lastWorkingValue;
      try {
        if (/^[-+]?[0-9]*\.?[0-9]+$/.test(this.valueString)) {
          value = parseFloat(this.valueString);
        } else {
          value = util.evaluate(this.valueString);
        }
      } catch (_error) {}
      this._lastWorkingValue = value;
      return value;
    };

    return Variable;

  })();

  C.Fn = (function() {
    function Fn() {}

    Fn.prototype.getExprString = function(parameter) {
      throw "Not implemented";
    };

    Fn.prototype.evaluate = function(x) {
      throw "Not implemented";
    };

    return Fn;

  })();

  C.BuiltInFn = (function(_super) {
    __extends(BuiltInFn, _super);

    function BuiltInFn(fnName, label) {
      this.fnName = fnName;
      this.label = label;
    }

    BuiltInFn.prototype.getExprString = function(parameter) {
      if (this.fnName === "identity") {
        return parameter;
      }
      return "" + this.fnName + "(" + parameter + ")";
    };

    BuiltInFn.prototype.evaluate = function(x) {
      return builtIn.fnEvaluators[this.fnName](x);
    };

    return BuiltInFn;

  })(C.Fn);

  C.CompoundFn = (function(_super) {
    __extends(CompoundFn, _super);

    function CompoundFn() {
      this.combiner = "sum";
      this.childFns = [];
    }

    CompoundFn.prototype.evaluate = function(x) {
      var childFn, reducer, _i, _len, _ref;
      if (this.combiner === "last") {
        if (this.childFns.length > 0) {
          return _.last(this.childFns).evaluate(x);
        } else {
          return [0, 0, 0, 0];
        }
      }
      if (this.combiner === "composition") {
        _ref = this.childFns;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          childFn = _ref[_i];
          x = childFn.evaluate(x);
        }
        return x;
      }
      if (this.combiner === "sum") {
        reducer = function(result, childFn) {
          return numeric.add(result, childFn.evaluate(x));
        };
        return _.reduce(this.childFns, reducer, [0, 0, 0, 0]);
      }
      if (this.combiner === "product") {
        reducer = function(result, childFn) {
          return numeric.mul(result, childFn.evaluate(x));
        };
        return _.reduce(this.childFns, reducer, [1, 1, 1, 1]);
      }
    };

    CompoundFn.prototype.getExprString = function(parameter) {
      var childExprStrings, childFn, exprString, _i, _len, _ref;
      if (this.combiner === "last") {
        if (this.childFns.length > 0) {
          return _.last(this.childFns).getExprString(parameter);
        } else {
          return util.glslString([0, 0, 0, 0]);
        }
      }
      if (this.combiner === "composition") {
        exprString = parameter;
        _ref = this.childFns;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          childFn = _ref[_i];
          exprString = childFn.getExprString(exprString);
        }
        return exprString;
      }
      childExprStrings = this.childFns.map((function(_this) {
        return function(childFn) {
          return childFn.getExprString(parameter);
        };
      })(this));
      if (this.combiner === "sum") {
        childExprStrings.unshift(util.glslString([0, 0, 0, 0]));
        return "(" + childExprStrings.join(" + ") + ")";
      }
      if (this.combiner === "product") {
        childExprStrings.unshift(util.glslString([1, 1, 1, 1]));
        return "(" + childExprStrings.join(" * ") + ")";
      }
    };

    return CompoundFn;

  })(C.Fn);

  C.DefinedFn = (function(_super) {
    __extends(DefinedFn, _super);

    function DefinedFn() {
      DefinedFn.__super__.constructor.call(this);
      this.combiner = "last";
      this.bounds = {
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5
      };
    }

    return DefinedFn;

  })(C.CompoundFn);

  C.ChildFn = (function(_super) {
    __extends(ChildFn, _super);

    function ChildFn(fn) {
      this.fn = fn;
      this.domainTranslate = [0, 0, 0, 0].map(function(v) {
        return new C.Variable(v);
      });
      this.domainTransform = numeric.identity(4).map(function(row) {
        return row.map(function(v) {
          return new C.Variable(v);
        });
      });
      this.rangeTranslate = [0, 0, 0, 0].map(function(v) {
        return new C.Variable(v);
      });
      this.rangeTransform = numeric.identity(4).map(function(row) {
        return row.map(function(v) {
          return new C.Variable(v);
        });
      });
    }

    ChildFn.prototype.getDomainTranslate = function() {
      return this.domainTranslate.map(function(v) {
        return v.getValue();
      });
    };

    ChildFn.prototype.getDomainTransform = function() {
      return this.domainTransform.map(function(row) {
        return row.map(function(v) {
          return v.getValue();
        });
      });
    };

    ChildFn.prototype.getRangeTranslate = function() {
      return this.rangeTranslate.map(function(v) {
        return v.getValue();
      });
    };

    ChildFn.prototype.getRangeTransform = function() {
      return this.rangeTransform.map(function(row) {
        return row.map(function(v) {
          return v.getValue();
        });
      });
    };

    ChildFn.prototype.evaluate = function(x) {
      var domainTransformInv, domainTranslate, rangeTransform, rangeTranslate;
      domainTranslate = this.getDomainTranslate();
      domainTransformInv = util.safeInv(this.getDomainTransform());
      rangeTranslate = this.getRangeTranslate();
      rangeTransform = this.getRangeTransform();
      x = numeric.dot(domainTransformInv, numeric.sub(x, domainTranslate));
      x = this.fn.evaluate(x);
      x = numeric.add(numeric.dot(rangeTransform, x), rangeTranslate);
      return x;
    };

    ChildFn.prototype.getExprString = function(parameter) {
      var domainTransformInv, domainTranslate, exprString, rangeTransform, rangeTranslate;
      domainTranslate = util.glslString(this.getDomainTranslate());
      domainTransformInv = util.glslString(util.safeInv(this.getDomainTransform()));
      rangeTranslate = util.glslString(this.getRangeTranslate());
      rangeTransform = util.glslString(this.getRangeTransform());
      exprString = "(" + domainTransformInv + " * (" + parameter + " - " + domainTranslate + "))";
      exprString = this.fn.getExprString(exprString);
      exprString = "(" + rangeTransform + " * " + exprString + " + " + rangeTranslate + ")";
      return exprString;
    };

    return ChildFn;

  })(C.Fn);

  C.AppRoot = (function() {
    function AppRoot() {
      this.fns = [new C.DefinedFn()];
    }

    return AppRoot;

  })();

  window.builtIn = builtIn = {};

  builtIn.fns = [new C.BuiltInFn("identity", "Line"), new C.BuiltInFn("abs", "Abs"), new C.BuiltInFn("fract", "Fract"), new C.BuiltInFn("floor", "Floor"), new C.BuiltInFn("sin", "Sine")];

  builtIn.fnEvaluators = {
    identity: function(x) {
      return x;
    },
    abs: numeric.abs,
    fract: function(x) {
      return numeric.sub(x, numeric.floor(x));
    },
    floor: numeric.floor,
    sin: numeric.sin
  };

}).call(this);
}, "util/canvas": function(exports, require, module) {(function() {
  var canvasBounds, clear, drawGrid, drawLine, getSpacing, lerp, ticks;

  lerp = util.lerp;

  canvasBounds = function(ctx) {
    var canvas;
    canvas = ctx.canvas;
    return {
      cxMin: 0,
      cxMax: canvas.width,
      cyMin: canvas.height,
      cyMax: 0,
      width: canvas.width,
      height: canvas.height
    };
  };

  clear = function(ctx) {
    var canvas;
    canvas = ctx.canvas;
    return ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  ticks = function(spacing, min, max) {
    var first, last, x, _i, _results;
    first = Math.ceil(min / spacing);
    last = Math.floor(max / spacing);
    _results = [];
    for (x = _i = first; first <= last ? _i <= last : _i >= last; x = first <= last ? ++_i : --_i) {
      _results.push(x * spacing);
    }
    return _results;
  };

  drawLine = function(ctx, _arg, _arg1) {
    var x1, x2, y1, y2;
    x1 = _arg[0], y1 = _arg[1];
    x2 = _arg1[0], y2 = _arg1[1];
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    return ctx.stroke();
  };

  getSpacing = function(opts) {
    var div, height, largeSpacing, minSpacing, smallSpacing, width, xMax, xMin, xMinSpacing, xSize, yMax, yMin, yMinSpacing, ySize, z, _ref, _ref1;
    xMin = opts.xMin, xMax = opts.xMax, yMin = opts.yMin, yMax = opts.yMax;
    width = (_ref = opts.width) != null ? _ref : config.mainPlotWidth;
    height = (_ref1 = opts.height) != null ? _ref1 : config.mainPlotHeight;
    xSize = xMax - xMin;
    ySize = yMax - yMin;
    xMinSpacing = (xSize / width) * config.minGridSpacing;
    yMinSpacing = (ySize / height) * config.minGridSpacing;
    minSpacing = Math.max(xMinSpacing, yMinSpacing);

    /*
    need to determine:
      largeSpacing = {1, 2, or 5} * 10^n
      smallSpacing = divide largeSpacing by 4 (if 1 or 2) or 5 (if 5)
    largeSpacing must be greater than minSpacing
     */
    div = 4;
    largeSpacing = z = Math.pow(10, Math.ceil(Math.log(minSpacing) / Math.log(10)));
    if (z / 5 > minSpacing) {
      largeSpacing = z / 5;
    } else if (z / 2 > minSpacing) {
      largeSpacing = z / 2;
      div = 5;
    }
    smallSpacing = largeSpacing / div;
    return {
      largeSpacing: largeSpacing,
      smallSpacing: smallSpacing
    };
  };

  drawGrid = function(ctx, opts) {
    var axesColor, axesOpacity, color, cx, cxMax, cxMin, cy, cyMax, cyMin, fromLocal, height, labelColor, labelDistance, labelOpacity, largeSpacing, majorColor, majorOpacity, minorColor, minorOpacity, smallSpacing, text, textHeight, toLocal, width, x, xMax, xMin, y, yMax, yMin, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    xMin = opts.xMin;
    xMax = opts.xMax;
    yMin = opts.yMin;
    yMax = opts.yMax;
    _ref = canvasBounds(ctx), cxMin = _ref.cxMin, cxMax = _ref.cxMax, cyMin = _ref.cyMin, cyMax = _ref.cyMax, width = _ref.width, height = _ref.height;
    _ref1 = getSpacing({
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax,
      width: width,
      height: height
    }), largeSpacing = _ref1.largeSpacing, smallSpacing = _ref1.smallSpacing;
    toLocal = function(_arg) {
      var cx, cy;
      cx = _arg[0], cy = _arg[1];
      return [lerp(cx, cxMin, cxMax, xMin, xMax), lerp(cy, cyMin, cyMax, yMin, yMax)];
    };
    fromLocal = function(_arg) {
      var x, y;
      x = _arg[0], y = _arg[1];
      return [lerp(x, xMin, xMax, cxMin, cxMax), lerp(y, yMin, yMax, cyMin, cyMax)];
    };
    labelDistance = 5;
    color = config.gridColor;
    minorOpacity = 0.075;
    majorOpacity = 0.1;
    axesOpacity = 0.25;
    labelOpacity = 1.0;
    textHeight = 12;
    minorColor = "rgba(" + color + ", " + minorOpacity + ")";
    majorColor = "rgba(" + color + ", " + majorOpacity + ")";
    axesColor = "rgba(" + color + ", " + axesOpacity + ")";
    labelColor = "rgba(" + color + ", " + labelOpacity + ")";
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = minorColor;
    _ref2 = ticks(smallSpacing, xMin, xMax);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      x = _ref2[_i];
      drawLine(ctx, fromLocal([x, yMin]), fromLocal([x, yMax]));
    }
    _ref3 = ticks(smallSpacing, yMin, yMax);
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      y = _ref3[_j];
      drawLine(ctx, fromLocal([xMin, y]), fromLocal([xMax, y]));
    }
    ctx.strokeStyle = majorColor;
    _ref4 = ticks(largeSpacing, xMin, xMax);
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      x = _ref4[_k];
      drawLine(ctx, fromLocal([x, yMin]), fromLocal([x, yMax]));
    }
    _ref5 = ticks(largeSpacing, yMin, yMax);
    for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
      y = _ref5[_l];
      drawLine(ctx, fromLocal([xMin, y]), fromLocal([xMax, y]));
    }
    ctx.strokeStyle = axesColor;
    drawLine(ctx, fromLocal([0, yMin]), fromLocal([0, yMax]));
    drawLine(ctx, fromLocal([xMin, 0]), fromLocal([xMax, 0]));
    ctx.font = "" + textHeight + "px verdana";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    _ref6 = ticks(largeSpacing, xMin, xMax);
    for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
      x = _ref6[_m];
      if (x !== 0) {
        text = parseFloat(x.toPrecision(12)).toString();
        _ref7 = fromLocal([x, 0]), cx = _ref7[0], cy = _ref7[1];
        cy += labelDistance;
        if (cy < labelDistance) {
          cy = labelDistance;
        }
        if (cy + textHeight + labelDistance > height) {
          cy = height - labelDistance - textHeight;
        }
        ctx.fillText(text, cx, cy);
      }
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    _ref8 = ticks(largeSpacing, yMin, yMax);
    for (_n = 0, _len5 = _ref8.length; _n < _len5; _n++) {
      y = _ref8[_n];
      if (y !== 0) {
        text = parseFloat(y.toPrecision(12)).toString();
        _ref9 = fromLocal([0, y]), cx = _ref9[0], cy = _ref9[1];
        cx += labelDistance;
        if (cx < labelDistance) {
          cx = labelDistance;
        }
        if (cx + ctx.measureText(text).width + labelDistance > width) {
          cx = width - labelDistance - ctx.measureText(text).width;
        }
        ctx.fillText(text, cx, cy);
      }
    }
    return ctx.restore();
  };

  util.canvas = {
    lerp: lerp,
    clear: clear,
    getSpacing: getSpacing,
    drawGrid: drawGrid
  };

}).call(this);
}, "util/evaluate": function(exports, require, module) {(function() {
  var PI, TAU, abs, add, ceil, cos, div, evaluate, evaluateFn, floor, fract, identity, max, min, mul, pow, sin, sqrt, sub;

  evaluate = function(jsString) {
    return eval(jsString);
  };

  evaluateFn = function(exprString) {
    return evaluate("(function (x) { return " + this.exprString + "; })");
  };

  identity = function(a) {
    return a;
  };

  add = function(a, b) {
    return a + b;
  };

  sub = function(a, b) {
    return a - b;
  };

  mul = function(a, b) {
    return a * b;
  };

  div = function(a, b) {
    return a / b;
  };

  abs = Math.abs;

  fract = function(a) {
    return a - Math.floor(a);
  };

  floor = Math.floor;

  ceil = Math.ceil;

  min = Math.min;

  max = Math.max;

  sin = Math.sin;

  cos = Math.cos;

  sqrt = Math.sqrt;

  pow = function(a, b) {
    return Math.pow(Math.abs(a), b);
  };

  PI = Math.PI;

  TAU = Math.PI * 2;

  util.evaluate = evaluate;

  util.evaluateFn = evaluateFn;

}).call(this);
}, "util/numeric": function(exports, require, module) {(function() {
  var normalize, num, reflectionMatrix, rotationMatrix, rotationScalingMatrix;

  num = numeric;

  normalize = function(a) {
    return num.div(a, num.norm2(a));
  };

  reflectionMatrix = function(n) {
    var I;
    I = num.identity(n.length);
    return num.sub(I, num.mul(2, num.dot(num.transpose([n]), [n])));
  };

  rotationMatrix = function(a, b) {
    var Rb, Rn, n;
    n = normalize(num.add(a, b));
    Rn = reflectionMatrix(n);
    Rb = reflectionMatrix(b);
    return num.dot(Rb, Rn);
  };

  rotationScalingMatrix = function(a, b) {
    var I, R, S, aUnit, bUnit, scaleFactor;
    aUnit = normalize(a);
    bUnit = normalize(b);
    scaleFactor = num.norm2(b) / num.norm2(a);
    I = num.identity(a.length);
    S = num.mul(scaleFactor, I);
    R = rotationMatrix(aUnit, bUnit);
    return num.dot(S, R);
  };

}).call(this);
}, "util/selection": function(exports, require, module) {(function() {
  var afterSelection, beforeSelection, findEditingHost, focusBody, get, getHost, isAtEnd, isAtStart, set, setAll, setAtEnd, setAtStart;

  get = function() {
    var range, selection;
    selection = window.getSelection();
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      return range;
    } else {
      return null;
    }
  };

  set = function(range) {
    var host, selection;
    selection = window.getSelection();
    if (range == null) {
      return selection.removeAllRanges();
    } else {
      host = findEditingHost(range.commonAncestorContainer);
      if (host != null) {
        host.focus();
      }
      selection.removeAllRanges();
      return selection.addRange(range);
    }
  };

  getHost = function() {
    var selectedRange;
    selectedRange = get();
    if (!selectedRange) {
      return null;
    }
    return findEditingHost(selectedRange.commonAncestorContainer);
  };

  beforeSelection = function() {
    var host, range, selectedRange;
    selectedRange = get();
    if (!selectedRange) {
      return null;
    }
    host = getHost();
    range = document.createRange();
    range.selectNodeContents(host);
    range.setEnd(selectedRange.startContainer, selectedRange.startOffset);
    return range;
  };

  afterSelection = function() {
    var host, range, selectedRange;
    selectedRange = get();
    if (!selectedRange) {
      return null;
    }
    host = getHost();
    range = document.createRange();
    range.selectNodeContents(host);
    range.setStart(selectedRange.endContainer, selectedRange.endOffset);
    return range;
  };

  isAtStart = function() {
    var _ref;
    if (!((_ref = get()) != null ? _ref.collapsed : void 0)) {
      return false;
    }
    return beforeSelection().toString() === "";
  };

  isAtEnd = function() {
    var _ref;
    if (!((_ref = get()) != null ? _ref.collapsed : void 0)) {
      return false;
    }
    return afterSelection().toString() === "";
  };

  setAtStart = function(el) {
    var range;
    range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    return set(range);
  };

  setAtEnd = function(el) {
    var range;
    range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    return set(range);
  };

  setAll = function(el) {
    var range;
    range = document.createRange();
    range.selectNodeContents(el);
    return set(range);
  };

  focusBody = function() {
    var body;
    body = document.body;
    if (!body.hasAttribute("tabindex")) {
      body.setAttribute("tabindex", "0");
    }
    return body.focus();
  };

  findEditingHost = function(node) {
    if (node == null) {
      return null;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return findEditingHost(node.parentNode);
    }
    if (!node.isContentEditable) {
      return null;
    }
    if (!node.parentNode.isContentEditable) {
      return node;
    }
    return findEditingHost(node.parentNode);
  };

  util.selection = {
    get: get,
    set: set,
    getHost: getHost,
    beforeSelection: beforeSelection,
    afterSelection: afterSelection,
    isAtStart: isAtStart,
    isAtEnd: isAtEnd,
    setAtStart: setAtStart,
    setAtEnd: setAtEnd,
    setAll: setAll
  };

}).call(this);
}, "util/util": function(exports, require, module) {(function() {
  var util, _base, _ref, _ref1;

  window.util = util = {};

  _.concatMap = function(array, fn) {
    return _.flatten(_.map(array, fn), true);
  };

  _.isShallowEqual = function(a, b) {
    if (a === b) {
      return true;
    }
    if (_.isArray(a) && _.isArray(b) && a.length === b.length) {
      return _.all(a, function(aValue, index) {
        return b[index] === aValue;
      });
    }
    return false;
  };

  if ((_base = Element.prototype).matches == null) {
    _base.matches = (_ref = (_ref1 = Element.prototype.webkitMatchesSelector) != null ? _ref1 : Element.prototype.mozMatchesSelector) != null ? _ref : Element.prototype.oMatchesSelector;
  }

  Element.prototype.closest = function(selector) {
    var fn, parent;
    if (_.isString(selector)) {
      fn = function(el) {
        return el.matches(selector);
      };
    } else {
      fn = selector;
    }
    if (fn(this)) {
      return this;
    } else {
      parent = this.parentNode;
      if ((parent != null) && parent.nodeType === Node.ELEMENT_NODE) {
        return parent.closest(fn);
      } else {
        return void 0;
      }
    }
  };

  Element.prototype.getMarginRect = function() {
    var rect, result, style;
    rect = this.getBoundingClientRect();
    style = window.getComputedStyle(this);
    result = {
      top: rect.top - parseInt(style["margin-top"], 10),
      left: rect.left - parseInt(style["margin-left"], 10),
      bottom: rect.bottom + parseInt(style["margin-bottom"], 10),
      right: rect.right + parseInt(style["margin-right"], 10)
    };
    result.width = result.right - result.left;
    result.height = result.bottom - result.top;
    return result;
  };

  Element.prototype.isOnScreen = function() {
    var horizontal, rect, screenHeight, screenWidth, vertical, _ref2, _ref3, _ref4, _ref5;
    rect = this.getBoundingClientRect();
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    vertical = (0 <= (_ref2 = rect.top) && _ref2 <= screenHeight) || (0 <= (_ref3 = rect.bottom) && _ref3 <= screenHeight);
    horizontal = (0 <= (_ref4 = rect.left) && _ref4 <= screenWidth) || (0 <= (_ref5 = rect.right) && _ref5 <= screenWidth);
    return vertical && horizontal;
  };

  util.lerp = function(x, dMin, dMax, rMin, rMax) {
    var ratio;
    ratio = (x - dMin) / (dMax - dMin);
    return ratio * (rMax - rMin) + rMin;
  };

  util.floatToString = function(value, precision, removeExtraZeros) {
    var digitPrecision, string;
    if (precision == null) {
      precision = 0.1;
    }
    if (removeExtraZeros == null) {
      removeExtraZeros = false;
    }
    if (precision < 1) {
      digitPrecision = -Math.round(Math.log(precision) / Math.log(10));
      string = value.toFixed(digitPrecision);
    } else {
      string = value.toFixed(0);
    }
    if (removeExtraZeros) {
      string = string.replace(/\.?0*$/, "");
    }
    if (/^-0(\.0*)?$/.test(string)) {
      string = string.slice(1);
    }
    return string;
  };

  util.glslString = function(value) {
    var col, length, row, string, strings, _i, _j;
    if (_.isNumber(value)) {
      string = value.toString();
      if (!/\./.test(string)) {
        string = string + ".";
      }
      return string;
    }
    if (_.isArray(value) && _.isNumber(value[0])) {
      length = value.length;
      if (length === 1) {
        return util.glslString(value[0]);
      }
      strings = value.map(util.glslString);
      string = "vec" + length + "(" + (strings.join(',')) + ")";
      return string;
    }
    if (_.isArray(value) && _.isArray(value[0])) {
      length = value.length;
      if (length === 1) {
        return util.glslString(value[0][0]);
      }
      strings = [];
      for (col = _i = 0; 0 <= length ? _i < length : _i > length; col = 0 <= length ? ++_i : --_i) {
        for (row = _j = 0; 0 <= length ? _j < length : _j > length; row = 0 <= length ? ++_j : --_j) {
          strings.push(util.glslString(value[row][col]));
        }
      }
      string = "mat" + length + "(" + (strings.join(',')) + ")";
      return string;
    }
  };

  util.safeInv = function(m) {
    try {
      return numeric.inv(m);
    } catch (_error) {
      return numeric.identity(m.length);
    }
  };

  util.onceDragConsummated = function(downEvent, callback, notConsummatedCallback) {
    var consummated, handleMove, handleUp, originalX, originalY, removeListeners;
    if (notConsummatedCallback == null) {
      notConsummatedCallback = null;
    }
    consummated = false;
    originalX = downEvent.clientX;
    originalY = downEvent.clientY;
    handleMove = function(moveEvent) {
      var d, dx, dy;
      dx = moveEvent.clientX - originalX;
      dy = moveEvent.clientY - originalY;
      d = Math.max(Math.abs(dx), Math.abs(dy));
      if (d > 3) {
        consummated = true;
        removeListeners();
        return typeof callback === "function" ? callback(moveEvent) : void 0;
      }
    };
    handleUp = function(upEvent) {
      if (!consummated) {
        if (typeof notConsummatedCallback === "function") {
          notConsummatedCallback(upEvent);
        }
      }
      return removeListeners();
    };
    removeListeners = function() {
      window.removeEventListener("mousemove", handleMove);
      return window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    return window.addEventListener("mouseup", handleUp);
  };

  require("./selection");

  require("./canvas");

  require("./evaluate");

}).call(this);
}, "view/AppRootView": function(exports, require, module) {(function() {
  R.create("AppRootView", {
    propTypes: {
      appRoot: C.AppRoot
    },
    refreshShaderOverlay: function() {
      return this.refs.shaderOverlay.draw();
    },
    componentDidMount: function() {
      return this.refreshShaderOverlay();
    },
    componentDidUpdate: function() {
      return this.refreshShaderOverlay();
    },
    render: function() {
      return R.div({}, R.DefinitionsView({
        appRoot: this.appRoot
      }), R.MainPlotView({
        fn: UI.selectedFn
      }), R.OutlineView({
        definedFn: UI.selectedFn
      }), R.DraggingView({}), R.ShaderOverlayView({
        ref: "shaderOverlay"
      }));
    }
  });

  R.create("DraggingView", {
    render: function() {
      var _ref;
      return R.div({}, ((_ref = UI.dragging) != null ? _ref.render : void 0) ? R.div({
        className: "DraggingObject",
        style: {
          left: UI.mousePosition.x - UI.dragging.offset.x,
          top: UI.mousePosition.y - UI.dragging.offset.y
        }
      }, UI.dragging.render()) : void 0, UI.dragging ? R.div({
        className: "DraggingOverlay"
      }) : void 0);
    }
  });

}).call(this);
}, "view/DefinitionsView": function(exports, require, module) {(function() {
  var defaultBounds;

  R.create("DefinitionsView", {
    propTypes: {
      appRoot: C.AppRoot
    },
    addFn: function() {
      return UI.addFn(this.appRoot);
    },
    render: function() {
      return R.div({
        className: "Definitions"
      }, builtIn.fns.map((function(_this) {
        return function(fn) {
          return R.DefinitionView({
            fn: fn
          });
        };
      })(this)), R.div({
        className: "Divider"
      }), this.appRoot.fns.map((function(_this) {
        return function(fn) {
          return R.DefinitionView({
            fn: fn
          });
        };
      })(this)), R.div({
        className: "AddDefinition"
      }, R.button({
        className: "AddButton",
        onClick: this.addFn
      })));
    }
  });

  defaultBounds = {
    xMin: -6,
    xMax: 6,
    yMin: -6,
    yMax: 6
  };

  R.create("DefinitionView", {
    propTypes: {
      fn: C.Fn
    },
    handleMouseDown: function(e) {
      var addChildFn, selectFn;
      UI.preventDefault(e);
      addChildFn = (function(_this) {
        return function() {
          return UI.addChildFn(_this.fn);
        };
      })(this);
      selectFn = (function(_this) {
        return function() {
          return UI.selectFn(_this.fn);
        };
      })(this);
      return util.onceDragConsummated(e, addChildFn, selectFn);
    },
    handleLabelInput: function(newValue) {
      return this.fn.label = newValue;
    },
    render: function() {
      var bounds, className, exprString, fnString;
      exprString = this.fn.getExprString("x");
      fnString = "(function (x) { return " + exprString + "; })";
      if (this.fn instanceof C.BuiltInFn) {
        bounds = defaultBounds;
      } else {
        bounds = this.fn.bounds;
      }
      className = R.cx({
        Definition: true,
        Selected: UI.selectedFn === this.fn
      });
      return R.div({
        className: className
      }, R.div({
        className: "PlotContainer",
        onMouseDown: this.handleMouseDown
      }, R.GridView({
        bounds: bounds
      }), R.ShaderCartesianView({
        bounds: bounds,
        plots: [
          {
            exprString: this.fn.getExprString("x"),
            color: config.color.main
          }
        ]
      })), this.fn instanceof C.BuiltInFn ? R.div({
        className: "Label"
      }, this.fn.label) : R.TextFieldView({
        className: "Label",
        value: this.fn.label,
        onInput: this.handleLabelInput
      }));
    }
  });

}).call(this);
}, "view/MainPlotView": function(exports, require, module) {(function() {
  R.create("MainPlotView", {
    propTypes: {
      fn: C.DefinedFn
    },
    getLocalMouseCoords: function() {
      var bounds, rect, x, y;
      bounds = this.fn.bounds;
      rect = this.getDOMNode().getBoundingClientRect();
      x = util.lerp(UI.mousePosition.x, rect.left, rect.right, bounds.xMin, bounds.xMax);
      y = util.lerp(UI.mousePosition.y, rect.bottom, rect.top, bounds.yMin, bounds.yMax);
      return {
        x: x,
        y: y
      };
    },
    changeSelection: function() {
      var bounds, childFn, distance, evaluated, found, pixelWidth, rect, x, y, _i, _len, _ref, _ref1;
      _ref = this.getLocalMouseCoords(), x = _ref.x, y = _ref.y;
      rect = this.getDOMNode().getBoundingClientRect();
      bounds = this.fn.bounds;
      pixelWidth = (bounds.xMax - bounds.xMin) / rect.width;
      found = null;
      _ref1 = this.fn.childFns;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        childFn = _ref1[_i];
        evaluated = childFn.evaluate([x, 0, 0, 0]);
        distance = Math.abs(y - evaluated[0]);
        if (distance < config.hitTolerance * pixelWidth) {
          found = childFn;
        }
      }
      return UI.selectChildFn(found);
    },
    startPan: function(e) {
      var originalBounds, originalX, originalY, rect, xScale, yScale;
      originalX = e.clientX;
      originalY = e.clientY;
      originalBounds = {
        xMin: this.fn.bounds.xMin,
        xMax: this.fn.bounds.xMax,
        yMin: this.fn.bounds.yMin,
        yMax: this.fn.bounds.yMax
      };
      rect = this.getDOMNode().getBoundingClientRect();
      xScale = (originalBounds.xMax - originalBounds.xMin) / rect.width;
      yScale = (originalBounds.yMax - originalBounds.yMin) / rect.height;
      UI.dragging = {
        cursor: config.cursor.grabbing,
        onMove: (function(_this) {
          return function(e) {
            var dx, dy;
            dx = e.clientX - originalX;
            dy = e.clientY - originalY;
            return _this.fn.bounds = {
              xMin: originalBounds.xMin - dx * xScale,
              xMax: originalBounds.xMax - dx * xScale,
              yMin: originalBounds.yMin + dy * yScale,
              yMax: originalBounds.yMax + dy * yScale
            };
          };
        })(this)
      };
      return util.onceDragConsummated(e, null, (function(_this) {
        return function() {
          return _this.changeSelection();
        };
      })(this));
    },
    handleMouseDown: function(e) {
      if (e.target.closest(".PointControl")) {
        return;
      }
      UI.preventDefault(e);
      return this.startPan(e);
    },
    handleWheel: function(e) {
      var bounds, scale, scaleFactor, x, y, _ref;
      e.preventDefault();
      _ref = this.getLocalMouseCoords(), x = _ref.x, y = _ref.y;
      bounds = this.fn.bounds;
      scaleFactor = 1.1;
      scale = e.deltaY > 0 ? scaleFactor : 1 / scaleFactor;
      return this.fn.bounds = {
        xMin: (bounds.xMin - x) * scale + x,
        xMax: (bounds.xMax - x) * scale + x,
        yMin: (bounds.yMin - y) * scale + y,
        yMax: (bounds.yMax - y) * scale + y
      };
    },
    render: function() {
      var childFn, plots, _i, _len, _ref;
      plots = [];
      _ref = this.fn.childFns;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        childFn = _ref[_i];
        plots.push({
          exprString: childFn.getExprString("x"),
          color: config.color.child
        });
      }
      plots.push({
        exprString: this.fn.getExprString("x"),
        color: config.color.main
      });
      if (UI.selectedChildFn) {
        plots.push({
          exprString: UI.selectedChildFn.getExprString("x"),
          color: config.color.selected
        });
      }
      return R.div({
        className: "MainPlot",
        onMouseDown: this.handleMouseDown,
        onWheel: this.handleWheel
      }, R.div({
        className: "PlotContainer"
      }, R.GridView({
        bounds: this.fn.bounds
      }), R.ShaderCartesianView({
        bounds: this.fn.bounds,
        plots: plots
      }), UI.selectedChildFn ? R.ChildFnControlsView({
        childFn: UI.selectedChildFn
      }) : void 0));
    }
  });

  R.create("ChildFnControlsView", {
    propTypes: {
      childFn: C.ChildFn
    },
    snap: function(value) {
      var bounds, container, digitPrecision, largeSpacing, nearestSnap, pixelWidth, precision, rect, smallSpacing, snapTolerance, _ref;
      container = this.getDOMNode().closest(".PlotContainer");
      rect = container.getBoundingClientRect();
      bounds = this.lookup("fn").bounds;
      pixelWidth = (bounds.xMax - bounds.xMin) / rect.width;
      _ref = util.canvas.getSpacing({
        xMin: bounds.xMin,
        xMax: bounds.xMax,
        yMin: bounds.yMin,
        yMax: bounds.yMax,
        width: rect.width,
        height: rect.height
      }), largeSpacing = _ref.largeSpacing, smallSpacing = _ref.smallSpacing;
      snapTolerance = pixelWidth * config.snapTolerance;
      nearestSnap = Math.round(value / largeSpacing) * largeSpacing;
      if (Math.abs(value - nearestSnap) < snapTolerance) {
        value = nearestSnap;
        digitPrecision = Math.floor(Math.log(largeSpacing) / Math.log(10));
        precision = Math.pow(10, digitPrecision);
        return util.floatToString(value, precision);
      }
      digitPrecision = Math.floor(Math.log(pixelWidth) / Math.log(10));
      precision = Math.pow(10, digitPrecision);
      return util.floatToString(value, precision);
    },
    handleTranslateChange: function(x, y) {
      this.childFn.domainTranslate[0].valueString = this.snap(x);
      return this.childFn.rangeTranslate[0].valueString = this.snap(y);
    },
    handleScaleChange: function(x, y) {
      this.childFn.domainTransform[0][0].valueString = this.snap(x - this.childFn.domainTranslate[0].getValue());
      return this.childFn.rangeTransform[0][0].valueString = this.snap(y - this.childFn.rangeTranslate[0].getValue());
    },
    render: function() {
      return R.span({}, R.PointControlView({
        x: this.childFn.domainTranslate[0].getValue(),
        y: this.childFn.rangeTranslate[0].getValue(),
        onChange: this.handleTranslateChange
      }), R.PointControlView({
        x: this.childFn.domainTranslate[0].getValue() + this.childFn.domainTransform[0][0].getValue(),
        y: this.childFn.rangeTranslate[0].getValue() + this.childFn.rangeTransform[0][0].getValue(),
        onChange: this.handleScaleChange
      }));
    }
  });

  R.create("PointControlView", {
    propTypes: {
      x: Number,
      y: Number,
      onChange: Function
    },
    getDefaultProps: function() {
      return {
        onChange: function() {}
      };
    },
    handleMouseDown: function(e) {
      var container, rect;
      UI.preventDefault(e);
      container = this.getDOMNode().closest(".PlotContainer");
      rect = container.getBoundingClientRect();
      return UI.dragging = {
        onMove: (function(_this) {
          return function(e) {
            var bounds, x, y;
            bounds = _this.lookup("fn").bounds;
            x = (e.clientX - rect.left) / rect.width;
            y = (e.clientY - rect.top) / rect.height;
            x = util.lerp(x, 0, 1, bounds.xMin, bounds.xMax);
            y = util.lerp(y, 1, 0, bounds.yMin, bounds.yMax);
            return _this.onChange(x, y);
          };
        })(this)
      };
    },
    style: function() {
      var bounds, left, top;
      bounds = this.lookup("fn").bounds;
      top = util.lerp(this.y, bounds.yMin, bounds.yMax, 100, 0) + "%";
      left = util.lerp(this.x, bounds.xMin, bounds.xMax, 0, 100) + "%";
      return {
        top: top,
        left: left
      };
    },
    render: function() {
      return R.div({
        className: "PointControl",
        style: this.style(),
        onMouseDown: this.handleMouseDown
      });
    }
  });

}).call(this);
}, "view/OutlineView": function(exports, require, module) {(function() {
  R.create("OutlineView", {
    propTypes: {
      definedFn: C.DefinedFn
    },
    addCompoundFn: function() {
      var fn;
      fn = new C.CompoundFn();
      return UI.addChildFn(fn);
    },
    render: function() {
      return R.div({
        className: "Outline"
      }, R.OutlineChildrenView({
        compoundFn: this.definedFn,
        path: []
      }), R.div({
        className: "TextButton",
        onClick: this.addCompoundFn
      }, "Add"), UI.selectedChildFn ? R.OutlineControlsView({
        fn: UI.selectedChildFn
      }) : void 0);
    }
  });

  R.create("OutlineChildrenView", {
    propTypes: {
      compoundFn: C.CompoundFn,
      path: Array
    },
    render: function() {
      var childFn;
      return R.div({
        className: "OutlineChildren"
      }, (function() {
        var _i, _len, _ref, _results;
        _ref = this.compoundFn.childFns;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          childFn = _ref[_i];
          _results.push(R.OutlineItemView({
            childFn: childFn,
            path: this.path.concat(childFn)
          }));
        }
        return _results;
      }).call(this));
    }
  });

  R.create("OutlineItemView", {
    propTypes: {
      childFn: C.ChildFn,
      path: Array
    },
    toggleExpanded: function() {
      var expanded;
      expanded = UI.isPathExpanded(this.path);
      return UI.setPathExpanded(this.path, !expanded);
    },
    handleMouseDown: function(e) {
      var childFn, el, myHeight, myWidth, offset, parentCompoundFn, path, rect;
      if (!e.target.classList.contains("OutlineRow")) {
        return;
      }
      UI.preventDefault(e);
      el = this.getDOMNode();
      rect = el.getMarginRect();
      myWidth = rect.width;
      myHeight = rect.height;
      offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      UI.dragging = {
        cursor: "-webkit-grabbing"
      };
      childFn = this.childFn;
      path = this.path;
      parentCompoundFn = this.lookup("compoundFn");
      return util.onceDragConsummated(e, (function(_this) {
        return function() {
          return UI.dragging = {
            cursor: "-webkit-grabbing",
            offset: offset,
            placeholderHeight: myHeight,
            childFn: childFn,
            render: function() {
              return R.div({
                style: {
                  width: myWidth,
                  height: myHeight,
                  overflow: "hidden",
                  "background-color": "#fff"
                }
              }, R.OutlineItemView({
                childFn: childFn,
                path: path,
                isDraggingCopy: true
              }));
            },
            onMove: function() {
              var bestDrop, bestQuadrance, checkFit, draggingPosition, droppedPosition, index, outlineChildrenEl, outlineChildrenEls, outlineItemEl, outlineItemEls, placeholderEl, _i, _j, _len, _len1;
              draggingPosition = {
                x: UI.mousePosition.x - offset.x,
                y: UI.mousePosition.y - offset.y
              };
              placeholderEl = document.querySelector(".Placeholder");
              if (placeholderEl != null) {
                placeholderEl.style.display = "none";
              }
              bestQuadrance = 40 * 40;
              bestDrop = null;
              checkFit = function(droppedPosition, outlineChildrenEl, index) {
                var dx, dy, quadrance;
                dx = draggingPosition.x - droppedPosition.x;
                dy = draggingPosition.y - droppedPosition.y;
                quadrance = dx * dx + dy * dy;
                if (quadrance < bestQuadrance) {
                  bestQuadrance = quadrance;
                  return bestDrop = {
                    outlineChildrenEl: outlineChildrenEl,
                    index: index
                  };
                }
              };
              outlineChildrenEls = document.querySelectorAll(".Outline .OutlineChildren");
              for (_i = 0, _len = outlineChildrenEls.length; _i < _len; _i++) {
                outlineChildrenEl = outlineChildrenEls[_i];
                outlineItemEls = _.filter(outlineChildrenEl.childNodes, function(el) {
                  return el.classList.contains("OutlineItem");
                });
                for (index = _j = 0, _len1 = outlineItemEls.length; _j < _len1; index = ++_j) {
                  outlineItemEl = outlineItemEls[index];
                  rect = outlineItemEl.getBoundingClientRect();
                  droppedPosition = {
                    x: rect.left,
                    y: rect.top
                  };
                  checkFit(droppedPosition, outlineChildrenEl, index);
                }
                rect = outlineChildrenEl.getBoundingClientRect();
                droppedPosition = {
                  x: rect.left,
                  y: rect.bottom
                };
                checkFit(droppedPosition, outlineChildrenEl, index);
              }
              if (placeholderEl != null) {
                placeholderEl.style.display = "";
              }
              if (parentCompoundFn) {
                index = parentCompoundFn.childFns.indexOf(childFn);
                parentCompoundFn.childFns.splice(index, 1);
                parentCompoundFn = null;
              }
              if (bestDrop) {
                parentCompoundFn = bestDrop.outlineChildrenEl.dataFor.compoundFn;
                return parentCompoundFn.childFns.splice(bestDrop.index, 0, childFn);
              }
            }
          };
        };
      })(this));
    },
    render: function() {
      var canHaveChildren, className, disclosureClassName, expanded, selected, _ref;
      if (!this.isDraggingCopy && this.childFn === ((_ref = UI.dragging) != null ? _ref.childFn : void 0)) {
        return R.div({
          className: "Placeholder",
          style: {
            height: UI.dragging.placeholderHeight
          }
        });
      }
      canHaveChildren = this.childFn.fn instanceof C.CompoundFn;
      expanded = UI.isPathExpanded(this.path);
      selected = this.childFn === UI.selectedChildFn;
      className = R.cx({
        OutlineItem: true,
        Selected: selected
      });
      disclosureClassName = R.cx({
        DisclosureTriangle: true,
        Expanded: expanded
      });
      return R.div({
        className: className
      }, R.div({
        className: "OutlineRow",
        onMouseDown: this.handleMouseDown
      }, canHaveChildren ? R.div({
        className: "OutlineDisclosure"
      }, R.div({
        className: disclosureClassName,
        onClick: this.toggleExpanded
      })) : void 0, R.OutlineInternalsView({
        fn: this.childFn.fn
      })), canHaveChildren && expanded ? R.OutlineChildrenView({
        compoundFn: this.childFn.fn,
        path: this.path
      }) : void 0);
    }
  });

  R.create("OutlineInternalsView", {
    propTypes: {
      fn: C.Fn
    },
    render: function() {
      return R.div({
        className: "OutlineInternals"
      }, this.fn instanceof C.BuiltInFn ? R.LabelView({
        fn: this.fn
      }) : this.fn instanceof C.DefinedFn ? R.LabelView({
        fn: this.fn
      }) : this.fn instanceof C.CompoundFn ? R.CombinerView({
        compoundFn: this.fn
      }) : void 0);
    }
  });

  R.create("LabelView", {
    propTypes: {
      fn: C.Fn
    },
    handleInput: function(newValue) {
      return this.fn.label = newValue;
    },
    render: function() {
      return R.TextFieldView({
        className: "OutlineLabel",
        value: this.fn.label,
        onInput: this.handleInput
      });
    }
  });

  R.create("CombinerView", {
    propTypes: {
      compoundFn: C.CompoundFn
    },
    handleChange: function(e) {
      var value;
      value = e.target.selectedOptions[0].value;
      return this.compoundFn.combiner = value;
    },
    render: function() {
      return R.div({}, R.select({
        value: this.compoundFn.combiner,
        onChange: this.handleChange
      }, R.option({
        value: "sum"
      }, "Add"), R.option({
        value: "product"
      }, "Multiply"), R.option({
        value: "composition"
      }, "Compose")));
    }
  });

  R.create("OutlineControlsView", {
    propTypes: {
      fn: C.ChildFn
    },
    render: function() {
      var coordIndex, rowIndex;
      return R.table({}, R.tr({}, this.fn.domainTranslate.map((function(_this) {
        return function(variable) {
          return R.td({}, R.VariableView({
            variable: variable
          }));
        };
      })(this)), this.fn.rangeTranslate.map((function(_this) {
        return function(variable) {
          return R.td({}, R.VariableView({
            variable: variable
          }));
        };
      })(this))), (function() {
        var _i, _results;
        _results = [];
        for (coordIndex = _i = 0; _i < 4; coordIndex = ++_i) {
          _results.push(R.tr({}, (function() {
            var _j, _results1;
            _results1 = [];
            for (rowIndex = _j = 0; _j < 4; rowIndex = ++_j) {
              _results1.push(R.td({}, R.VariableView({
                variable: this.fn.domainTransform[rowIndex][coordIndex]
              })));
            }
            return _results1;
          }).call(this), (function() {
            var _j, _results1;
            _results1 = [];
            for (rowIndex = _j = 0; _j < 4; rowIndex = ++_j) {
              _results1.push(R.td({}, R.VariableView({
                variable: this.fn.rangeTransform[rowIndex][coordIndex]
              })));
            }
            return _results1;
          }).call(this)));
        }
        return _results;
      }).call(this));
    }
  });

}).call(this);
}, "view/R": function(exports, require, module) {(function() {
  var R, desugarPropType, key, value, _ref,
    __hasProp = {}.hasOwnProperty;

  window.R = R = {};

  _ref = React.DOM;
  for (key in _ref) {
    if (!__hasProp.call(_ref, key)) continue;
    value = _ref[key];
    R[key] = value;
  }

  R.cx = React.addons.classSet;

  R.UniversalMixin = {
    ownerView: function() {
      var _ref1;
      return (_ref1 = this._owner) != null ? _ref1 : this.props.__owner__;
    },
    lookup: function(keyName) {
      var _ref1, _ref2;
      return (_ref1 = this[keyName]) != null ? _ref1 : (_ref2 = this.ownerView()) != null ? _ref2.lookup(keyName) : void 0;
    },
    lookupView: function(viewName) {
      var _ref1;
      if (this === viewName || this.viewName() === viewName) {
        return this;
      }
      return (_ref1 = this.ownerView()) != null ? _ref1.lookupView(viewName) : void 0;
    },
    lookupViewWithKey: function(keyName) {
      var _ref1;
      if (this[keyName] != null) {
        return this;
      }
      return (_ref1 = this.ownerView()) != null ? _ref1.lookupViewWithKey(keyName) : void 0;
    },
    setPropsOnSelf: function(nextProps) {
      var propName, propValue, _results;
      _results = [];
      for (propName in nextProps) {
        if (!__hasProp.call(nextProps, propName)) continue;
        propValue = nextProps[propName];
        if (propName === "__owner__") {
          continue;
        }
        _results.push(this[propName] = propValue);
      }
      return _results;
    },
    componentWillMount: function() {
      return this.setPropsOnSelf(this.props);
    },
    componentWillUpdate: function(nextProps) {
      return this.setPropsOnSelf(nextProps);
    },
    componentDidMount: function() {
      var el;
      el = this.getDOMNode();
      return el.dataFor != null ? el.dataFor : el.dataFor = this;
    },
    componentWillUnmount: function() {
      var el;
      el = this.getDOMNode();
      return delete el.dataFor;
    }
  };

  desugarPropType = function(propType, optional) {
    var required;
    if (optional == null) {
      optional = false;
    }
    if (propType.optional) {
      propType = propType.optional;
      required = false;
    } else if (optional) {
      required = false;
    } else {
      required = true;
    }
    if (propType === Number) {
      propType = React.PropTypes.number;
    } else if (propType === String) {
      propType = React.PropTypes.string;
    } else if (propType === Boolean) {
      propType = React.PropTypes.bool;
    } else if (propType === Function) {
      propType = React.PropTypes.func;
    } else if (propType === Array) {
      propType = React.PropTypes.array;
    } else if (propType === Object) {
      propType = React.PropTypes.object;
    } else if (_.isArray(propType)) {
      propType = React.PropTypes.any;
    } else {
      propType = React.PropTypes.instanceOf(propType);
    }
    if (required) {
      propType = propType.isRequired;
    }
    return propType;
  };

  R.create = function(name, opts) {
    var propName, propType, _ref1;
    opts.displayName = name;
    opts.viewName = function() {
      return name;
    };
    if (opts.propTypes == null) {
      opts.propTypes = {};
    }
    _ref1 = opts.propTypes;
    for (propName in _ref1) {
      if (!__hasProp.call(_ref1, propName)) continue;
      propType = _ref1[propName];
      opts.propTypes[propName] = desugarPropType(propType);
    }
    if (opts.mixins == null) {
      opts.mixins = [];
    }
    opts.mixins.unshift(R.UniversalMixin);
    return R[name] = React.createClass(opts);
  };

  require("./ui/TextFieldView");

  require("./AppRootView");

  require("./ShaderOverlayView");

  require("./DefinitionsView");

  require("./MainPlotView");

  require("./OutlineView");

  require("./VariableView");

  require("./plot/CanvasView");

  require("./plot/GridView");

  require("./plot/ShaderCartesianView");

}).call(this);
}, "view/ShaderOverlayView": function(exports, require, module) {(function() {
  var Glod, bufferCartesianSamples, bufferQuad, createCartesianProgram, createColorMapProgram, createProgramFromSrc, drawCartesianProgram, drawColorMapProgram, setViewport,
    __hasProp = {}.hasOwnProperty;

  Glod = require("./plot/glod");

  R.create("ShaderOverlayView", {
    initializeGlod: function() {
      var canvas;
      this.glod = new Glod();
      canvas = this.getDOMNode();
      this.glod.canvas(canvas, {
        antialias: true
      });
      bufferQuad(this.glod);
      bufferCartesianSamples(this.glod, 20000);
      return this.programs = {};
    },
    sizeCanvas: function() {
      var canvas, rect;
      canvas = this.getDOMNode();
      rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        return canvas.height = rect.height;
      }
    },
    draw: function() {
      var bounds, canvas, junk, name, numSamples, plot, plots, rect, shaderEl, shaderEls, shaderView, usedPrograms, _i, _j, _len, _len1, _ref, _results;
      canvas = this.getDOMNode();
      usedPrograms = {};
      shaderEls = document.querySelectorAll(".Shader");
      for (_i = 0, _len = shaderEls.length; _i < _len; _i++) {
        shaderEl = shaderEls[_i];
        rect = shaderEl.getBoundingClientRect();
        setViewport(this.glod, rect.left, canvas.height - rect.bottom, rect.width, rect.height);
        shaderView = shaderEl.dataFor;
        plots = shaderView.plots;
        bounds = shaderView.bounds;
        numSamples = rect.width / config.resolution;
        for (_j = 0, _len1 = plots.length; _j < _len1; _j++) {
          plot = plots[_j];
          name = plot.exprString;
          if (!this.programs[name]) {
            createCartesianProgram(this.glod, name, name);
            this.programs[name] = true;
          }
          usedPrograms[name] = true;
          drawCartesianProgram(this.glod, name, numSamples, plot.color, bounds);
        }
      }
      _ref = this.programs;
      _results = [];
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        junk = _ref[name];
        if (!usedPrograms[name]) {
          delete this.glod._programs[name];
          _results.push(delete this.programs[name]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    handleResize: function() {
      this.sizeCanvas();
      return this.draw();
    },
    componentDidMount: function() {
      this.initializeGlod();
      this.sizeCanvas();
      return window.addEventListener("resize", this.handleResize);
    },
    componentWillUnmount: function() {
      return window.removeEventListener("resize", this.handleResize);
    },
    render: function() {
      return R.canvas({
        className: "ShaderOverlay"
      });
    }
  });

  createProgramFromSrc = function(glod, name, vertex, fragment) {
    Glod.preprocessed[name] = {
      name: name,
      fragment: fragment,
      vertex: vertex
    };
    delete glod._programs[name];
    return glod.createProgram(name);
  };

  setViewport = function(glod, x, y, w, h) {
    glod.viewport(x, y, w, h);
    return glod.viewport_ = {
      x: x,
      y: y,
      w: w,
      h: h
    };
  };

  bufferQuad = function(glod) {
    return glod.createVBO("quad").uploadCCWQuad("quad");
  };

  bufferCartesianSamples = function(glod, numSamples) {
    var i, samplesArray, _i;
    samplesArray = [];
    for (i = _i = 0; 0 <= numSamples ? _i <= numSamples : _i >= numSamples; i = 0 <= numSamples ? ++_i : --_i) {
      samplesArray.push(i);
    }
    if (glod.hasVBO("samples")) {
      glod.deleteVBO("samples");
    }
    return glod.createVBO("samples").bufferDataStatic("samples", new Float32Array(samplesArray));
  };

  createCartesianProgram = function(glod, name, expr) {
    var fragment, vertex;
    vertex = "precision highp float;\nprecision highp int;\n\nattribute float sample;\nuniform float numSamples;\nuniform float xMin;\nuniform float xMax;\nuniform float yMin;\nuniform float yMax;\n\nfloat lerp(float x, float dMin, float dMax, float rMin, float rMax) {\n  float ratio = (x - dMin) / (dMax - dMin);\n  return ratio * (rMax - rMin) + rMin;\n}\n\nvoid main() {\n  float s = sample / numSamples;\n\n  vec4 x = vec4(lerp(s, 0., 1., xMin, xMax), 0., 0., 0.);\n  vec4 y = " + expr + ";\n\n  float px = lerp(x.x, xMin, xMax, -1., 1.);\n  float py = lerp(y.x, yMin, yMax, -1., 1.);\n\n  gl_Position = vec4(px, py, 0., 1.);\n}";
    fragment = "precision highp float;\nprecision highp int;\n\nuniform vec4 color;\n\nvoid main() {\n  gl_FragColor = color;\n}";
    return createProgramFromSrc(glod, name, vertex, fragment);
  };

  drawCartesianProgram = function(glod, name, numSamples, color, bounds) {
    var gl;
    gl = glod.gl();
    gl.lineWidth(1.25);
    glod.begin(name);
    glod.pack("samples", "sample");
    glod.valuev("color", color);
    glod.value("xMin", bounds.xMin);
    glod.value("xMax", bounds.xMax);
    glod.value("yMin", bounds.yMin);
    glod.value("yMax", bounds.yMax);
    glod.value("numSamples", numSamples);
    glod.ready().lineStrip().drawArrays(0, numSamples);
    return glod.end();
  };

  createColorMapProgram = function(glod, name, expr) {
    var fragment, vertex;
    vertex = "precision highp float;\nprecision highp int;\n\nattribute vec4 position;\n\nvoid main() {\n  gl_Position = position;\n}";
    fragment = "precision highp float;\nprecision highp int;\n\nuniform float screenXMin, screenXMax, screenYMin, screenYMax;\n\nuniform float xMin;\nuniform float xMax;\nuniform float yMin;\nuniform float yMax;\n\nfloat lerp(float x, float dMin, float dMax, float rMin, float rMax) {\n  float ratio = (x - dMin) / (dMax - dMin);\n  return ratio * (rMax - rMin) + rMin;\n}\n\nvoid main() {\n  vec4 x = vec4(\n    lerp(gl_FragCoord.x, screenXMin, screenXMax, xMin, xMax),\n    lerp(gl_FragCoord.y, screenYMin, screenYMax, yMin, yMax),\n    0.,\n    0.\n  );\n  vec4 y = " + expr + ";\n\n  gl_FragColor = vec4(vec3(y.x), 1.);\n}";
    return createProgramFromSrc(glod, name, vertex, fragment);
  };

  drawColorMapProgram = function(glod, name, bounds) {
    var canvas;
    canvas = glod.canvas();
    glod.begin(name);
    glod.pack("quad", "position");
    glod.value("screenXMin", glod.viewport_.x);
    glod.value("screenXMax", glod.viewport_.x + glod.viewport_.w);
    glod.value("screenYMin", glod.viewport_.y);
    glod.value("screenYMax", glod.viewport_.y + glod.viewport_.h);
    glod.value("xMin", bounds.xMin);
    glod.value("xMax", bounds.xMax);
    glod.value("yMin", bounds.yMin);
    glod.value("yMax", bounds.yMax);
    glod.ready().triangles().drawArrays(0, 6);
    return glod.end();
  };

}).call(this);
}, "view/VariableView": function(exports, require, module) {(function() {
  R.create("VariableView", {
    propTypes: {
      variable: C.Variable
    },
    handleInput: function(newValue) {
      return this.variable.valueString = newValue;
    },
    render: function() {
      return R.TextFieldView({
        className: "Variable",
        value: this.variable.valueString,
        onInput: this.handleInput
      });
    }
  });

}).call(this);
}, "view/plot/CanvasView": function(exports, require, module) {(function() {
  R.create("CanvasView", {
    propTypes: {
      drawFn: Function
    },
    draw: function() {
      var canvas;
      canvas = this.getDOMNode();
      return this.drawFn(canvas);
    },
    sizeCanvas: function() {
      var canvas, rect;
      canvas = this.getDOMNode();
      rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        return true;
      }
      return false;
    },
    handleResize: function() {
      if (this.sizeCanvas()) {
        return this.draw();
      }
    },
    componentDidUpdate: function() {
      return this.draw();
    },
    componentDidMount: function() {
      this.sizeCanvas();
      this.draw();
      return window.addEventListener("resize", this.handleResize);
    },
    componentWillUnmount: function() {
      return window.removeEventListener("resize", this.handleResize);
    },
    render: function() {
      return R.canvas({});
    }
  });

}).call(this);
}, "view/plot/GridView": function(exports, require, module) {(function() {
  R.create("GridView", {
    propTypes: {
      bounds: Object
    },
    drawFn: function(canvas) {
      var ctx, xMax, xMin, yMax, yMin, _ref;
      ctx = canvas.getContext("2d");
      _ref = this.bounds, xMin = _ref.xMin, xMax = _ref.xMax, yMin = _ref.yMin, yMax = _ref.yMax;
      util.canvas.clear(ctx);
      return util.canvas.drawGrid(ctx, {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
      });
    },
    shouldComponentUpdate: function(nextProps) {
      return this.bounds !== nextProps.bounds;
    },
    render: function() {
      return R.CanvasView({
        drawFn: this.drawFn
      });
    }
  });

}).call(this);
}, "view/plot/ShaderCartesianView": function(exports, require, module) {(function() {
  R.create("ShaderCartesianView", {
    propTypes: {
      bounds: Object,
      plots: Array
    },
    render: function() {
      return R.div({
        className: "Shader"
      });
    }
  });

}).call(this);
}, "view/plot/glod": function(exports, require, module) {'use strict';

module.exports = Glod;

function GlodError(message, data) {
  this.message = message;
  this.data = data;
}
GlodError.prototype = Object.create(Error.prototype);

function die(message, data) {
  var error = new GlodError(message || 'Glod: die', data);

  // try {
  //   throw new Error(message || 'die');
  // }
  // catch(err) {
  //   error = err;
  // }

  // var line = error.stack.split('\n')[3];
  // var at = line.indexOf('at ');
  // var origin = line.slice(at + 3, line.length);

  // error.name = 'at ' + origin;

  throw error;
}

function Glod() {
  // Prevent instantiation without new.
  if (!Glod.prototype.isPrototypeOf(this)) {
    die('Glod: instantiate with `new Glod()`')
  }

  this._canvas            = null;
  this._gl                = null;
  this._vbos              = {};
  this._fbos              = {};
  this._rbos              = {};
  this._programs          = {};
  this._textures          = {};
  this._extensions        = {};

  this._variables         = {};

  this._mode              = -1;
  this._activeProgram     = null;
  this._contextLost       = false;
  this._onContextLost     = this.onContextLost.bind(this);
  this._onContextRestored = this.onContextRestored.bind(this);
  this.loseContext        = null;
  this.restoreContext     = null;
  this._initIds           = {};
  this._allocIds          = {};
  this._versionedIds      = {};

  this._optional  = {};
  this._optionalv = {};

  this._state = 0;
}

Glod.preprocessed = {};

// this should probably be called "cache shader" or something like that
Glod.preprocess = function(source) {
  var line_re      = /\n|\r/;
  var directive_re = /^\/\/!\s*(.*)$/;

  var vertex   = [];
  var fragment = [];

  var lines = source.split(line_re);

  var name = null;

  var section = "common";

  for (var i = 0; i < lines.length; i++) {
    var line  = lines[i];
    var match = directive_re.exec(line);

    if (match) {
      var tokens = match[1].split(/\s+/);

      switch(tokens[0]) {
        case "name":     name    = tokens[1];  break;
        case "common":   section = "common";   break;
        case "vertex":   section = "vertex";   break;
        case "fragment": section = "fragment"; break;
        default: die('gl.preprocess: bad directive: ' + tokens[0]);
      }
    }

    switch(section) {
      case "common":   vertex.push(line); fragment.push(line); break;
      case "vertex":   vertex.push(line); fragment.push(''  ); break;
      case "fragment": vertex.push(''  ); fragment.push(line); break;
    }
  }

  var fragment_src = fragment.join('\n');
  var vertex_src   = vertex  .join('\n');

  name         || die('gl.preprocess: no name');
  vertex_src   || die('gl.preprocess: no vertex source: ' + name);
  fragment_src || die('gl.preprocess: no fragment source: ' + name);

  var o = {
    name:     name,
    vertex:   vertex_src,
    fragment: fragment_src
  };

  Glod.preprocessed[o.name] && die('Glod: duplicate shader name: '+ o.name);
  Glod.preprocessed[o.name] = o;
};

Glod.prototype.isInactive      = function() { return this._state === 0;     };
Glod.prototype.isPreparing     = function() { return this._state === 1;     };
Glod.prototype.isDrawing       = function() { return this._state === 2;     };
Glod.prototype.isProgramActive = function() { return !!this._activeProgram; };

Glod.prototype.startInactive  = function() { this._state = 0; return this; };
Glod.prototype.startPreparing = function() { this._state = 1; return this; };
Glod.prototype.startDrawing   = function() { this._state = 2; return this; };

Glod.prototype.assertInactive      = function() { this.isInactive()      || this.outOfPhase(0); return this; };
Glod.prototype.assertPreparing     = function() { this.isPreparing()     || this.outOfPhase(1); return this; };
Glod.prototype.assertDrawing       = function() { this.isDrawing()       || this.outOfPhase(2); return this; };
Glod.prototype.assertProgramActive = function() { this.isProgramActive() || this.outOfPhase(1); return this; };

Glod.prototype.outOfPhase = function(expected, actual) {
  function s(n) {
    return n === 0 ? 'inactive'  :
           n === 1 ? 'preparing' :
           n === 2 ? 'drawing'   :
                     'unknown (' + n + ')';
  }

  die('Glod: out of phase: expected to be ' + s(expected) + ' but was ' + s(this._state));
};


// todo: print string names and type instead of [object WebGLProgram]
// function throwOnGLError(err, funcName, args) {
//   throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
// }

// function validateNoneOfTheArgsAreUndefined(functionName, args) {
//   for (var ii = 0; ii < args.length; ++ii) {
//     if (args[ii] === undefined) {
//       console.error("undefined passed to gl." + functionName + "(" +
//                     WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
//     }
//   }
// }

// function logGLCall(functionName, args) {
//   console.log("gl." + functionName + "(" +
//       WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
// }

// function logAndValidate(functionName, args) {
//   logGLCall(functionName, args);
//   validateNoneOfTheArgsAreUndefined (functionName, args);
// }


Glod.prototype.initContext = function() {
  var gl = this._gl;

  var supported = gl.getSupportedExtensions();

  for (var i = 0; i < supported.length; i++) {
    var name = supported[i];
    this._extensions[name] = gl.getExtension(name);
  }

  var lc = this.extension('WEBGL_lose_context');

  this.loseContext    = lc.loseContext.bind(lc);
  this.restoreContext = lc.restoreContext.bind(lc);
};

Glod.prototype.gl = function() {
  this._gl || die('Glod.gl: no gl context');
  return this._gl;
};

Glod.prototype.extension = function() {
  var l = arguments.length;
  for (var i = 0; i < l; i++) {
    var e = this._extensions[arguments[i]];
    if (e) return e;
  }
  die('Glod.extension: extension not found: ' + arguments);
};

Glod.prototype.canvas = function(canvas, options) {
  if (arguments.length === 0) {
    this.hasCanvas() || die('Glod.canvas: no canvas');
    return this._canvas;
  }

  if (this.hasCanvas()) {
    this._canvas.removeEventListener('webglcontextlost', this._onContextLost);
    this._canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
  }

  this._canvas = canvas || null;

  if (canvas && !this.hasCanvas()) {
    die('Glod.canvas: bad canvas: ' + canvas);
  }

  if (this.hasCanvas()) {
    this._canvas.addEventListener('webglcontextlost', this._onContextLost);
    this._canvas.addEventListener('webglcontextrestored', this._onContextRestored);
    var opts = options || { antialias: false };
    var gl = this._canvas.getContext('webgl', options);
    gl || (gl = this._canvas.getContext('experimental-webgl', opts));
    gl || (die('Glod.canvas: failed to create context'));
    // wrap && (gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, logAndValidate));
    this._gl = gl;
    this.initContext();
  }
  else {
    this._gl = null;
  }

  return this;
};

Glod.prototype.hasCanvas = function() {
  return !!(this._canvas); // && this._canvas.length == 1);
};

Glod.prototype.hasVBO     = function(name) { return this._vbos    .hasOwnProperty(name); };
Glod.prototype.hasFBO     = function(name) { return this._fbos    .hasOwnProperty(name); };
Glod.prototype.hasRBO     = function(name) { return this._rbos    .hasOwnProperty(name); };
Glod.prototype.hasTexture = function(name) { return this._textures.hasOwnProperty(name); };
Glod.prototype.hasProgram = function(name) { return this._programs.hasOwnProperty(name); };

Glod.prototype.createVBO = function(name) {
  this.hasVBO(name) && die('Glod.createVBO: duplicate name: ' + name);
  this._vbos[name] = this.gl().createBuffer();
  return this;
};

Glod.prototype.createFBO = function(name) {
  this.hasFBO(name) && die('Glod.createFBO: duplicate resource name: ' + name);
  this._fbos[name] = this.gl().createFramebuffer();
  return this;
};

Glod.prototype.createRBO = function(name) {
  this.hasRBO(name) && die('Glod.createRBO: duplicate resource name: ' + name);
  this._rbos[name] = this.gl().createRenderbuffer();
  return this;
};

Glod.prototype.createTexture = function(name) {
  this.hasTexture(name) && die('Glod.createTexture: duplicate resource name: ' + name);
  this._textures[name] = this.gl().createTexture();
  return this;
};

Glod.prototype.deleteVBO = function(name) {
  var vbo = this.vbo(name);
  this.gl().deleteBuffer(vbo);
  delete this._vbos[name];
  return this;
};

var NRF = function(type, name) {
  die('Glod.' + type + ': no resource found: ' + name);
};

Glod.prototype.vbo     = function(name) { this.hasVBO(name) || NRF('vbo', name); return this._vbos[name]; };
Glod.prototype.fbo     = function(name) { this.hasFBO(name) || NRF('fbo', name); return this._fbos[name]; };
Glod.prototype.rbo     = function(name) { this.hasRBO(name) || NRF('rbo', name); return this._rbos[name]; };

Glod.prototype.program = function(name) {
  this.hasProgram(name) || NRF('program', name); return this._programs[name];
};

Glod.prototype.texture = function(name) {
  this.hasTexture(name) || NRF('texture', name); return this._textures[name];
};

Glod.prototype.onContextLost = function(e) {
  e.preventDefault();
  this._contextLost = true;
};

Glod.prototype.onContextRestored = function(e) {
  this._contextLost = false;

  var name;
  for (name in this._vbos    ) { delete this._vbos    [name]; this.createVBO    (name); }
  for (name in this._fbos    ) { delete this._fbos    [name]; this.createFBO    (name); }
  for (name in this._rbos    ) { delete this._rbos    [name]; this.createRBO    (name); }
  for (name in this._textures) { delete this._textures[name]; this.createTexture(name); }
  for (name in this._programs) { delete this._programs[name]; this.createProgram(name); }

  this.initContext();
  this._allocIds     = {};
  this._versionedIds = {};
};

Glod.prototype.createProgram = function(name) {
  name || die('bad program name: ' + name);

  var o = Glod.preprocessed[name];

  o          || die('Glod.createProgram: program not preprocessed: ' + name);
  o.name     || die('Glod.createProgram: no name specified');
  o.vertex   || die('Glod.createProgram: no vertex source');
  o.fragment || die('Glod.createProgram: no fragment source');

  name             = o.name;
  var vertex_src   = o.vertex;
  var fragment_src = o.fragment;

  this.hasProgram(name) && die('Glod.createProgram: duplicate program name: ' + name);

  var gl = this.gl();
  var program = gl.createProgram();
  this._programs[name] = program;

  function shader(type, source) {
    var s = gl.createShader(type);

    gl.shaderSource(s, source);
    gl.compileShader(s);

    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      console.log(log);
      console.log(source);
      die('Glod.createProgram: compilation failed', log);
    }

    gl.attachShader(program, s);
  }

  shader(gl.VERTEX_SHADER,   vertex_src);
  shader(gl.FRAGMENT_SHADER, fragment_src);

  for (var pass = 0; pass < 2; pass++) {
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(gl.getProgramInfoLog(program));
      die('Glod.createProgram: linking failed');
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.log(gl.getProgramInfoLog(program));
      die('Glod.createProgram: validation failed');
    }

    if (pass === 0) {
      var active = [];

      var activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
      for (var i = 0; i < activeAttributes; i++) {
        var info = gl.getActiveAttrib(program, i);
        var re = new RegExp('^\\s*attribute\\s+([a-z0-9A-Z_]+)\\s+' + info.name + '\\s*;', 'm');
        var sourcePosition = vertex_src.search(re);
        sourcePosition >= 0 || die('couldn\'t find active attribute "' + info.name + '" in source');
        active.push([info.name, sourcePosition]);
      }

      var layout = active.sort(function(a, b) { return a[1] > b[1]; })
                         .map (function(x   ) { return x[0];        });

      for (var i = 0; i < layout.length; i++) {
        gl.bindAttribLocation(program, i, layout[i]);
      }

      continue;
    }

    var variables = this._variables[name] = {};

    var addVariable = function(index, attrib) {
      var info = attrib ? gl.getActiveAttrib (program, i) :
                          gl.getActiveUniform(program, i);

      var name = info.name;

      variables[name] && die('Glod: duplicate variable name: ' + name);

      var location = attrib ? gl.getAttribLocation (program, name) :
                              gl.getUniformLocation(program, name) ;

      var type = info.type;

      var count = type === gl.BYTE           ? 1  :
                  type === gl.UNSIGNED_BYTE  ? 1  :
                  type === gl.SHORT          ? 1  :
                  type === gl.UNSIGNED_SHORT ? 1  :
                  type === gl.INT            ? 1  :
                  type === gl.UNSIGNED_INT   ? 1  :
                  type === gl.FLOAT          ? 1  :
                  type === gl.BOOL           ? 1  :
                  type === gl.SAMPLER_2D     ? 1  :
                  type === gl.SAMPLER_CUBE   ? 1  :

                  type === gl.  INT_VEC2     ? 2  :
                  type === gl.FLOAT_VEC2     ? 2  :
                  type === gl. BOOL_VEC2     ? 2  :

                  type === gl. INT_VEC3      ? 3  :
                  type === gl.FLOAT_VEC3     ? 3  :
                  type === gl. BOOL_VEC3     ? 3  :

                  type === gl.  INT_VEC4     ? 4  :
                  type === gl.FLOAT_VEC4     ? 4  :
                  type === gl. BOOL_VEC4     ? 4  :

                  type === gl.FLOAT_MAT2     ? 4  :
                  type === gl.FLOAT_MAT3     ? 9  :
                  type === gl.FLOAT_MAT4     ? 16 :
                  die('Glod: unknown variable type: ' + type);

      var matrix = type === gl.FLOAT_MAT2 || type === gl.FLOAT_MAT3 || type === gl.FLOAT_MAT4;

      var float = type === gl.FLOAT      ||
                  type === gl.FLOAT_VEC2 || type === gl.FLOAT_VEC3 || type === gl.FLOAT_VEC4 ||
                  type === gl.FLOAT_MAT2 || type === gl.FLOAT_MAT3 || type === gl.FLOAT_MAT4;

      variables[name] = {
        location: location,
        info:     info,
        attrib:   attrib,
        count:    count,
        float:    float,
        matrix:   matrix,
        ready:    false
      };
    }

    var activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < activeUniforms; i++) addVariable(i, false);
    var activeAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < activeAttributes; i++) addVariable(i, true);
  }

  var error = this.gl().getError();
  if (error !== 0) die('unexpected error: ' + error);

  return this;
};

Glod.prototype.variable = function(name) {
  this.assertProgramActive()
  var variable = this._variables[this._activeProgram][name];
  // TODO(ryan): Maybe add a flag for this? It can be useful to know when
  // variables are unused, but also annoying if you want to set them regardless.
  // variable || die('Glod.variable: variable not found: ' + name);
  return variable;
};

Glod.prototype.location = function(name) { return this.variable(name).location; };
Glod.prototype.info     = function(name) { return this.variable(name).info;     };
Glod.prototype.isAttrib = function(name) { return this.variable(name).attrib;   };

Glod.prototype.uploadCCWQuad = function() {
  var positions = new Float32Array([1, -1, 0, 1, 1, 1, 0, 1, -1, 1, 0, 1, -1, 1, 0, 1, -1, -1, 0, 1, 1, -1, 0, 1]);

  return function(name) {
    var gl = this.gl();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo(name));
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    return this;
  };
}();

Glod.prototype.uploadPlaceholderTexture = function() {
  var rgba = new Uint8Array([255, 255, 255, 255, 0, 255, 255, 255, 255, 0, 255, 255, 255, 255, 0, 255]);

  return function(name) {
    var gl  = this.gl();
    var tex = this.texture(name);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return this;
  };
}();

Glod.prototype.bindFramebuffer = function(name) {
  var fbo = name === null ? null : this.fbo(name);
  var gl = this.gl();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  return this;
};


// todo:
//   use the vbo's type to determine which target to bind it to
//   support stream and dynamic draw
//   support passing a normal JS array
Glod.prototype.bufferDataStatic = function(targetName) {
  var al  = arguments.length;
  var gl  = this.gl();
  var vbo = this.vbo(targetName);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  var a;
  if (al === 2) {
    a = arguments[1];
    Array.prototype.isPrototypeOf(a) && (a = new Float32Array(a));
    gl.bufferData(gl.ARRAY_BUFFER, a, gl.STATIC_DRAW);
  }
  else if (al === 3) {
    a = arguments[1];
    Array.prototype.isPrototypeOf(a) && (a = new Float32Array(a));
    gl.bufferSubData(gl.ARRAY_BUFFER, a, arguments[2]);
  }
  else {
    die('Glod.bufferData: bad argument count: ' + al);
  }

  return this;
};

// todo:
//   support aperture base and opening
//   support scale factor
Glod.prototype.viewport = function() {
  var gl = this.gl();
  var x, y, w, h;

  var al = arguments.length;
  if (al === 4) {
    x = arguments[0];
    y = arguments[1];
    w = arguments[2];
    h = arguments[3];
  }
  else if (al === 0) {
    var canvas = this.canvas();
    x = y = 0;
    w = canvas.width;
    h = canvas.height;
  }
  else {
    die('Glod.viewport: bad argument count: ' + al);
  }

  gl.viewport(x, y, w, h);
  gl.scissor(x, y, w, h);

  return this;
}

Glod.prototype.begin = function(programName) {
  this.assertInactive().startPreparing();

  this.gl().useProgram(this.program(programName));

  this._activeProgram = programName;
  this._mode = -1;

  var variables = this._variables[programName];

  for (var name in variables) {
    variables[name].ready = false;
  }

  return this;
};

Glod.prototype.ready = function() {
  this.assertPreparing().startDrawing();

  var variables = this._variables[this._activeProgram];

  for (var name in variables) {
    var ov = this._optional[name];
    if (!variables[name].ready && ov) {
      switch(ov.length) {
        case 4: this.value(name, ov[0], ov[1], ov[2], ov[3]); break;
        case 3: this.value(name, ov[0], ov[1], ov[2]       ); break;
        case 2: this.value(name, ov[0], ov[1]              ); break;
        case 1: this.value(name, ov[0]                     ); break;
      }
    }

    variables[name].ready || die('Glod.ready: variable not ready: ' + name);
  }

  return this;
};

Glod.prototype.end = function() {
  this.assertDrawing().startInactive();
  this._activeProgram = null;
  return this;
};

Glod.prototype.manual = function() {
  this.assertProgramActive();
  for (var i = 0; i < arguments.length; i++) {
    this.variable(arguments[i]).ready = true;
  }
  return this;
};

Glod.prototype.value = function(name, a, b, c, d) {
  var v  = this.variable(name);

  // Bail if the variable does not exist.
  if (!v) return this;

  var gl = this.gl();
  var l  = arguments.length - 1;
  var loc = v.location;

  if (v.attrib) {
    l === 1 ? gl.vertexAttrib1f(loc, a         ) :
    l === 2 ? gl.vertexAttrib2f(loc, a, b      ) :
    l === 3 ? gl.vertexAttrib3f(loc, a, b, c   ) :
    l === 4 ? gl.vertexAttrib4f(loc, a, b, c, d) :
              die('Glod.value: bad length: ' + l);
  }
  else {
    var type = v.info.type;
    l === 1 ? (v.float ? gl.uniform1f(loc, a         ) : gl.uniform1i(loc, a         )) :
    l === 2 ? (v.float ? gl.uniform2f(loc, a, b      ) : gl.uniform2i(loc, a, b      )) :
    l === 3 ? (v.float ? gl.uniform3f(loc, a, b, c   ) : gl.uniform3i(loc, a, b, c   )) :
    l === 4 ? (v.float ? gl.uniform4f(loc, a, b, c, d) : gl.uniform4i(loc, a, b, c, d)) :
              die('Glod.value: bad length: ' + l);
  }
  v.ready = true;
  return this;
};

Glod.prototype.valuev = function(name, s, transpose) {
  s || die('Glod.valuev: bad vector: ' + s);

  var v = this.variable(name);

  // Bail if the variable does not exist.
  if (!v) return this;

  var gl = this.gl();
  var l = v.count;
  var loc = v.location;

  if (v.attrib) {
    l === s.length || die('Glod.valuev: bad vector length: ' + s.length);
    gl.disableVertexAttribArray(loc);
    l === 1 ? gl.vertexAttrib1fv(loc, s) :
    l === 2 ? gl.vertexAttrib2fv(loc, s) :
    l === 3 ? gl.vertexAttrib3fv(loc, s) :
    l === 4 ? gl.vertexAttrib4fv(loc, s) :
              die('Glod.valuev: bad length: ' + l);
  }
  else {
    if (v.matrix) {
      l === 4  ? gl.uniformMatrix2fv(loc, !!transpose, s) :
      l === 9  ? gl.uniformMatrix3fv(loc, !!transpose, s) :
      l === 16 ? gl.uniformMatrix4fv(loc, !!transpose, s) :
                 die('Glod.valuev: bad length: ' + l);
    }
    else {
      l === 1 ? (v.float ? gl.uniform1fv(loc, s) : gl.uniform1iv(loc, s)) :
      l === 2 ? (v.float ? gl.uniform2fv(loc, s) : gl.uniform2iv(loc, s)) :
      l === 3 ? (v.float ? gl.uniform3fv(loc, s) : gl.uniform3iv(loc, s)) :
      l === 4 ? (v.float ? gl.uniform4fv(loc, s) : gl.uniform4iv(loc, s)) :
                die('Glod.valuev: bad length: ' + l);
    }
  }

  v.ready = true;

  return this;
};

Glod.prototype.optional = function(name, a, b, c, d) {
  var l = arguments.length - 1;

  if (l === 1 && a === undefined) {
    delete this._optional[name];
    return this;
  }

  var v = this._optional[name] || [];
  this._optional[name] = v;
  v.length = l;

  switch (l) {
    case 4: v[3] = d;
    case 3: v[2] = c;
    case 2: v[1] = b;
    case 1: v[0] = a;
  }

  return this;
};

Glod.prototype.optionalv = function(name, s, transpose) {
  // WARNING: I'm not sure this actually works.
  if (arguments.length === 2 && s === undefined) {
    delete this._optionalv[name];
    return this;
  }

  var v = this._optionalv[name] || [];
  var l = s.length;
  this._optionalv[name] = v;
  v.length = s.length;
  v.TRANSPOSE = !!transpose;
  for (var i = 0; i < l; i++) {
    v[i] = s[i];
  }

  return this;
};

Glod.prototype.pack = function(vboName) {
  var vbo = this.vbo(vboName);
  var gl  = this.gl();

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  arguments.length < 2 && die('Glod.pack: no attribute provided');

  var stride = 0;
  var counts = [];
  var vars = [];
  for (var i = 1; i < arguments.length; i++) {
    var name = arguments[i];
    var v = this.variable(name);
    v.attrib || die('Glod.pack: tried to pack uniform: ' + name);
    v.ready  && die('Glod.pack: variable already ready: ' + name);
    var count = v.count;
    stride += count;
    counts.push(count);
    vars.push(v);
  }

  var offset = 0;
  for (var i = 1; i < arguments.length; i++) {
    var name = arguments[i];
    var v = vars[i - 1];
    var loc = v.location;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, v.count, gl.FLOAT, false, stride * 4, offset * 4);
    offset += v.count;
    v.ready = true;
  }

  return this;
};

Glod.prototype.primitive = function(mode) {
  (mode >= 0 && mode <= 6) || die('Glod.mode: bad mode: ' + mode);
  this._mode = mode
  return this;
};

Glod.prototype.points        = function() { this._mode = this._gl.POINTS;         return this; };
Glod.prototype.lines         = function() { this._mode = this._gl.LINES;          return this; };
Glod.prototype.lineLoop      = function() { this._mode = this._gl.LINE_LOOP;      return this; };
Glod.prototype.lineStrip     = function() { this._mode = this._gl.LINE_STRIP;     return this; };
Glod.prototype.triangles     = function() { this._mode = this._gl.TRIANGLES;      return this; };
Glod.prototype.triangleStrip = function() { this._mode = this._gl.TRIANGLE_STRIP; return this; };
Glod.prototype.triangleFan   = function() { this._mode = this._gl.TRIANGLE_FAN;   return this; };

Glod.prototype.drawArrays = function(first, count) {
  var mode = this._mode;
  (mode >= 0 && mode <= 6) || die('Glod.drawArrays: mode not set');
  var gl = this.gl();
  gl.drawArrays(mode, first, count);
  return this;
};

Glod.prototype.clearColor   = function(r, g, b, a) { this.gl().clearColor  (r, g, b, a); return this; };
Glod.prototype.clearDepth   = function(d         ) { this.gl().clearDepth  (d         ); return this; };
Glod.prototype.clearStencil = function(s         ) { this.gl().clearStencil(s         ); return this; };

Glod.prototype.clearColorv = function(s) {
  return this.clearColor(s[0], s[1], s[2], s[3]);
};

Glod.prototype.clear = function(color, depth, stencil) {
  var gl = this.gl();

  var clearBits = 0;
  color   && (clearBits |= gl.  COLOR_BUFFER_BIT);
  depth   && (clearBits |= gl.  DEPTH_BUFFER_BIT);
  stencil && (clearBits |= gl.STENCIL_BUFFER_BIT);

  clearBits && gl.clear(clearBits);
  return this;
};

Glod.prototype.bindArrayBuffer = function(name) {
  var gl = this._gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo(name));
  return this;
};

Glod.prototype.bindElementBuffer = function(name) {
  var gl = this._gl;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbo(name));
  return this;
};

Glod.prototype.bindTexture2D = function(name) {
  var texture = name === null ? null : this.texture(name);
  var gl = this._gl;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  return this;
};

Glod.prototype.activeTexture = function(unit) {
  var gl = this._gl;
  gl.activeTexture(gl.TEXTURE0 + unit);
  return this;
};

Glod.prototype.init = function(id, f) {
  this._initIds[id] || f();
  this._initIds[id] = true;
  return this;
};

Glod.prototype.alloc = function(id, f) {
  this._allocIds[id] || f();
  this._allocIds[id] = true;
  return this;
};

Glod.prototype.allocv = function(id, v, f) {
  if (this._versionedIds[id] !== v) {
    this._versionedIds[id] = v;
    f();
  }
  return this;
};
}, "view/ui/TextFieldView": function(exports, require, module) {(function() {
  var findAdjacentHost;

  R.create("TextFieldView", {
    propTypes: {
      value: String,
      className: String,
      onInput: Function,
      onBackSpace: Function,
      onFocus: Function,
      onBlur: Function,
      allowEnter: Boolean
    },
    getDefaultProps: function() {
      return {
        value: "",
        className: "",
        onInput: function(newValue) {},
        onBackSpace: function() {},
        onEnter: function() {},
        onFocus: function() {},
        onBlur: function() {},
        allowEnter: false
      };
    },
    shouldComponentUpdate: function(nextProps) {
      return this._isDirty || nextProps.value !== this.props.value;
    },
    refresh: function() {
      var el;
      el = this.getDOMNode();
      if (el.textContent !== this.value) {
        el.textContent = this.value;
      }
      this._isDirty = false;
      return UI.attemptAutoFocus(this);
    },
    componentDidMount: function() {
      return this.refresh();
    },
    componentDidUpdate: function() {
      return this.refresh();
    },
    handleInput: function() {
      var el, newValue;
      this._isDirty = true;
      el = this.getDOMNode();
      newValue = el.textContent;
      return this.onInput(newValue);
    },
    handleKeyDown: function(e) {
      var host, nextHost, previousHost;
      host = util.selection.getHost();
      if (e.keyCode === 37) {
        if (util.selection.isAtStart()) {
          previousHost = findAdjacentHost(host, -1);
          if (previousHost) {
            e.preventDefault();
            return util.selection.setAtEnd(previousHost);
          }
        }
      } else if (e.keyCode === 39) {
        if (util.selection.isAtEnd()) {
          nextHost = findAdjacentHost(host, 1);
          if (nextHost) {
            e.preventDefault();
            return util.selection.setAtStart(nextHost);
          }
        }
      } else if (e.keyCode === 8) {
        if (util.selection.isAtStart()) {
          e.preventDefault();
          return this.onBackSpace();
        }
      } else if (e.keyCode === 13) {
        if (!this.allowEnter) {
          e.preventDefault();
          return this.onEnter();
        }
      }
    },
    handleFocus: function() {
      return this.onFocus();
    },
    handleBlur: function() {
      return this.onBlur();
    },
    selectAll: function() {
      var el;
      el = this.getDOMNode();
      return util.selection.setAll(el);
    },
    isFocused: function() {
      var el, host;
      el = this.getDOMNode();
      host = util.selection.getHost();
      return el === host;
    },
    render: function() {
      return R.div({
        className: this.className,
        contentEditable: true,
        onInput: this.handleInput,
        onKeyDown: this.handleKeyDown,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur
      });
    }
  });

  findAdjacentHost = function(el, direction) {
    var hosts, index;
    hosts = document.querySelectorAll("[contenteditable]");
    hosts = _.toArray(hosts);
    index = hosts.indexOf(el);
    return hosts[index + direction];
  };

}).call(this);
}});
