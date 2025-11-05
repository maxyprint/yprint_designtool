/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./public/js/src/Designer.js":
/*!***********************************!*\
  !*** ./public/js/src/Designer.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DesignerWidget: () => (/* binding */ DesignerWidget)
/* harmony export */ });
/* harmony import */ var fabric__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fabric */ "./node_modules/fabric/dist/index.min.mjs");
/* harmony import */ var _ToastManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ToastManager */ "./public/js/src/ToastManager.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


var DesignerWidget = /*#__PURE__*/function () {
  function DesignerWidget() {
    var _window$octoPrintDesi,
      _this = this;
    _classCallCheck(this, DesignerWidget);

    // 🛡️ SINGLETON GUARD: Prevent multiple DesignerWidget instances
    if (window.designerWidgetInstance) {
      console.log('🛡️ SINGLETON PROTECTION: DesignerWidget already exists, returning existing instance');
      return window.designerWidgetInstance;
    }

    this.container = document.querySelector('.octo-print-designer');
    if (!this.container) return;
    this.currentDesignId = null;
    this.templates = new Map();
    this.currentView = null;
    this.currentVariation = null;
    this.activeTemplateId = null;

    // Store view-specific images and their transforms per variation
    this.variationImages = new Map(); // Key format: `${variationId}_${viewId}`

    // In-memory storage for temporary images (non-logged users)
    this.tempImages = [];
    this.tempImageCounter = 0;
    this.isLoggedIn = ((_window$octoPrintDesi = window.octoPrintDesigner) === null || _window$octoPrintDesi === void 0 ? void 0 : _window$octoPrintDesi.isLoggedIn) || false;
    window.addEventListener('resize', function () {
      return _this.handleResize();
    });
    this.storeElementReferences();
    this.initializeTemplates();
    this.storeModalElements();
    this.setupModalEvents();
    this.toastManager = new _ToastManager__WEBPACK_IMPORTED_MODULE_0__.ToastManager(this.toastContainer);

    // 🛡️ SINGLETON REGISTRATION: Register this instance immediately to prevent duplicates
    window.designerWidgetInstance = this;
    console.log('🛡️ SINGLETON: DesignerWidget instance registered successfully');

    // 🎯 FABRIC.JS GLOBAL EXPOSURE - Emergency Fix by THADDÄUS Agent 3
    // Pattern copied from working admin.bundle.js implementation
    if (!window.fabric && typeof fabric__WEBPACK_IMPORTED_MODULE_1__ !== 'undefined') {
      try {
        console.log('🎯 FABRIC EXPOSURE: Emergency fix - exposing fabric globally from designer bundle');

        // Assign fabric module to global scope with error handling
        window.fabric = fabric__WEBPACK_IMPORTED_MODULE_1__;

        // Validate successful exposure
        if (window.fabric && typeof window.fabric.Canvas === 'function') {
          console.log('✅ FABRIC EXPOSURE: window.fabric successfully available from designer bundle');

          // Dispatch event for cross-system communication
          if (typeof window.CustomEvent === 'function') {
            window.dispatchEvent(new CustomEvent('fabricGlobalReady', {
              detail: {
                fabric: window.fabric,
                source: 'designer-bundle-emergency-fix',
                timestamp: Date.now()
              }
            }));
          }
        } else {
          console.error('❌ FABRIC EXPOSURE: Failed - window.fabric assignment unsuccessful');
        }
      } catch (error) {
        console.error('❌ FABRIC EXPOSURE: Error during fabric exposure:', error);
      }
    } else if (window.fabric) {
      console.log('✅ FABRIC EXPOSURE: window.fabric already available, skipping emergency fix');
    } else {
      console.error('❌ FABRIC EXPOSURE: fabric__WEBPACK_IMPORTED_MODULE_1__ not available for exposure');
    }

    this.init();
  }
  return _createClass(DesignerWidget, [{
    key: "initializeToolbar",
    value: function initializeToolbar() {
      var _this2 = this;
      // Clone toolbar template
      var toolbarTemplate = document.getElementById('designer-image-toolbar-template');
      this.imageToolbar = toolbarTemplate.content.cloneNode(true).querySelector('.designer-image-toolbar');
      this.canvas.parentNode.appendChild(this.imageToolbar);

      // Store references to inputs
      this.widthInput = this.imageToolbar.querySelector('.width-input');
      this.heightInput = this.imageToolbar.querySelector('.height-input');
      this.pixelToCmLabel = this.imageToolbar.querySelector('.pixel-to-cm');

      // Add toolbar button handlers
      this.imageToolbar.querySelector('.center-image').addEventListener('click', function () {
        var activeObject = _this2.fabricCanvas.getActiveObject();
        if (activeObject) {
          activeObject.set({
            left: _this2.fabricCanvas.width / 2,
            top: _this2.fabricCanvas.height / 2
          });
          activeObject.setCoords();
          _this2.fabricCanvas.renderAll();

          // Update stored position
          if (_this2.currentView && _this2.currentVariation) {
            var key = "".concat(_this2.currentVariation, "_").concat(_this2.currentView);
            var imageData = _this2.variationImages.get(key);
            if (imageData) {
              imageData.transform.left = activeObject.left;
              imageData.transform.top = activeObject.top;
            }
          }
          _this2.updateToolbarPosition();
        }
      });

      // Add width/height input handlers
      this.widthInput.addEventListener('input', function (e) {
        return _this2.handleDimensionChange('width', e.target.value);
      });
      this.heightInput.addEventListener('input', function (e) {
        return _this2.handleDimensionChange('height', e.target.value);
      });

      // Rename label to clarify it shows physical dimensions
      this.pixelToCmLabel.classList.add('physical-dimensions');
    }
  }, {
    key: "handleDimensionChange",
    value: function handleDimensionChange(dimension, value) {
      var activeObject = this.fabricCanvas.getActiveObject();
      if (!activeObject) return;
      var pixelValue = parseInt(value, 10);
      if (isNaN(pixelValue)) return;
      var currentWidth = activeObject.width * activeObject.scaleX;
      var currentHeight = activeObject.height * activeObject.scaleY;
      var aspectRatio = activeObject.width / activeObject.height;
      var newScaleX, newScaleY;
      if (dimension === 'width') {
        newScaleX = pixelValue / activeObject.width;
        newScaleY = newScaleX; // Maintain aspect ratio
      } else {
        newScaleY = pixelValue / activeObject.height;
        newScaleX = newScaleY; // Maintain aspect ratio
      }

      // Apply new scale
      activeObject.set({
        scaleX: newScaleX,
        scaleY: newScaleY
      });

      // Update the other input
      if (dimension === 'width') {
        this.heightInput.value = Math.round(activeObject.height * newScaleY);
      } else {
        this.widthInput.value = Math.round(activeObject.width * newScaleX);
      }

      // Update physical dimensions display
      this.updatePixelToCmConversion();
      activeObject.setCoords();
      this.fabricCanvas.renderAll();
      this.updateToolbarPosition();

      // Store the image transformation
      if (this.currentView && this.currentVariation) {
        var key = "".concat(this.currentVariation, "_").concat(this.currentView);
        var imageData = this.variationImages.get(key);
        if (imageData) {
          imageData.transform.scaleX = newScaleX;
          imageData.transform.scaleY = newScaleY;
        }
      }
    }
  }, {
    key: "updatePixelToCmConversion",
    value: function updatePixelToCmConversion() {
      var _template$variations$, _view$safeZone, _view$safeZone2;
      // This method now updates the physical dimensions display
      var activeObject = this.fabricCanvas.getActiveObject();
      if (!activeObject) return;
      var template = this.templates.get(this.activeTemplateId);
      if (!template) return;

      // Get physical dimensions and canvas dimensions
      var physicalWidth = template.physical_width_cm || 30;
      var physicalHeight = template.physical_height_cm || 40;
      var view = (_template$variations$ = template.variations.get(this.currentVariation)) === null || _template$variations$ === void 0 ? void 0 : _template$variations$.views.get(this.currentView);
      if (!view) return;
      var safeZoneWidth = ((_view$safeZone = view.safeZone) === null || _view$safeZone === void 0 ? void 0 : _view$safeZone.width) || 800;
      var safeZoneHeight = ((_view$safeZone2 = view.safeZone) === null || _view$safeZone2 === void 0 ? void 0 : _view$safeZone2.height) || 500;

      // Calculate actual physical dimensions of the design
      var designWidthCm = activeObject.width * activeObject.scaleX / safeZoneWidth * physicalWidth;
      var designHeightCm = activeObject.height * activeObject.scaleY / safeZoneHeight * physicalHeight;

      // Update the physical dimensions display
      this.pixelToCmLabel.textContent = "".concat(designWidthCm.toFixed(1), "cm \xD7 ").concat(designHeightCm.toFixed(1), "cm");
    }
  }, {
    key: "storeElementReferences",
    value: function storeElementReferences() {
      // Navigation elements
      this.navItems = this.container.querySelectorAll('.designer-nav-item');
      this.sectionItemsContainer = this.container.querySelector('.designer-item-sections');
      this.sectionContents = this.container.querySelectorAll('.designer-item-section-content');

      // Upload zone elements
      this.uploadZone = this.container.querySelector('#uploadZone');
      this.uploadInput = this.container.querySelector('#uploadInput');
      this.imagesGrid = this.container.querySelector('.images-grid');
      this.imagesGridLimit = this.container.querySelector('.images-grid-limit');

      // Canvas elements
      this.canvas = this.container.querySelector('#octo-print-designer-canvas');
      this.viewsToolbar = this.container.querySelector('.views-toolbar');

      // Variation elements
      this.variationsToolbar = this.container.querySelector('.variations-toolbar');
      this.variationsList = this.container.querySelector('.variations-list');

      // Zoom controls
      this.zoomControls = this.container.querySelector('.zoom-controls');
      this.zoomInput = this.zoomControls.querySelector('input');
      this.zoomButtons = this.zoomControls.querySelectorAll('button');
      this.zoomPopup = this.container.querySelector('.zoom-level-popup');
      this.zoomRange = this.zoomPopup.querySelector('input');

      // Library section
      this.libraryGrid = this.container.querySelector('[data-section="library"] .images-grid');

      //Designer Toolbar
      this.togglePrintZoneButton = this.container.querySelector('#toggle-print-zone');
      this.toastContainer = this.container.querySelector('.toast-container');
    }
  }, {
    key: "initializeTemplates",
    value: function initializeTemplates() {
      this.libraryImageTemplate = document.querySelector('#octo-print-designer-library-image-template');
      this.libraryItemTemplate = document.querySelector('#octo-print-designer-library-item-template');
      this.viewButtonTemplate = document.querySelector('#octo-print-designer-view-button-template');
    }
  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              this.initializeCanvas();
              this.initializeToolbar();
              _context.next = 4;
              return Promise.all([this.loadTemplates(), this.loadUserImages()]);
            case 4:
              this.setupNavigationEvents();
              this.setupUploadEvents();
              this.setupZoomControls();
              this.setupDesignerToolbar();
              this.setupViewButtons();
              this.updateImagesGridLimit();
              this.handleResize();
              this.updateZoom(100);
              _context.next = 14;
              return this.loadInitialTemplate();
            case 14:
              if (this.activeTemplateId) {
                _context.next = 17;
                break;
              }
              _context.next = 17;
              return this.loadInitialDesign();
            case 17:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
  }, {
    key: "loadInitialDesign",
    value: function () {
      var _loadInitialDesign = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var urlParams, initialDesignId;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              urlParams = new URLSearchParams(window.location.search);
              initialDesignId = urlParams.get('design_id');
              if (initialDesignId) {
                _context2.next = 4;
                break;
              }
              return _context2.abrupt("return", false);
            case 4:
              _context2.next = 6;
              return this.loadDesign(initialDesignId);
            case 6:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function loadInitialDesign() {
        return _loadInitialDesign.apply(this, arguments);
      }
      return loadInitialDesign;
    }()
  }, {
    key: "loadInitialTemplate",
    value: function () {
      var _loadInitialTemplate = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var templateId;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              templateId = this.getInitialTemplateByUrl();
              if (!templateId) templateId = this.getDefaultTemplateByData();
              if (templateId) {
                _context3.next = 4;
                break;
              }
              return _context3.abrupt("return");
            case 4:
              if (!(templateId && this.templates.has(templateId))) {
                _context3.next = 8;
                break;
              }
              _context3.next = 7;
              return this.loadTemplate(templateId);
            case 7:
              window.history.replaceState({}, '', window.location.pathname);
            case 8:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function loadInitialTemplate() {
        return _loadInitialTemplate.apply(this, arguments);
      }
      return loadInitialTemplate;
    }()
  }, {
    key: "getInitialTemplateByUrl",
    value: function getInitialTemplateByUrl() {
      var urlParams = new URLSearchParams(window.location.search);
      var templateId = urlParams.get('template_id');
      if (!templateId) return false;
      return templateId;
    }
  }, {
    key: "getDefaultTemplateByData",
    value: function getDefaultTemplateByData() {
      var dataTemplateId = this.container.dataset.defaultTemplateId;
      if (!dataTemplateId) return false;
      return dataTemplateId;
    }
  }, {
    key: "initializeCanvas",
    value: function initializeCanvas() {
      // AGENT 3 FIX: Null check prevents canvas instantiation failure
      if (!this.canvas) {
        console.error('❌ CANVAS INSTANTIATION: Canvas element not found, cannot initialize fabric canvas');
        return;
      }
      this.fabricCanvas = new fabric__WEBPACK_IMPORTED_MODULE_1__.Canvas('octo-print-designer-canvas', {
        width: this.canvas.offsetWidth || 800,
        height: this.canvas.offsetHeight || 600,
        backgroundColor: '#fff',
        preserveObjectStacking: true
      });
    }
  }, {
    key: "loadTemplates",
    value: function () {
      var _loadTemplates = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var response, data;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'get_templates',
                  nonce: octoPrintDesigner.nonce
                })
              });
            case 3:
              response = _context4.sent;
              if (response.ok) {
                _context4.next = 6;
                break;
              }
              console.warn('⚠️ RESILIENCE: Network error in template loading, using fallback templates');
              this.templates = this.parseTemplates({templates: []}); // Empty fallback
              this.renderTemplatesLibrary();
              return; // Graceful exit instead of throwing
            case 6:
              _context4.next = 8;
              return response.json();
            case 8:
              data = _context4.sent;
              if (!data.success) {
                _context4.next = 14;
                break;
              }
              this.templates = this.parseTemplates(data.data);
              this.renderTemplatesLibrary();
              _context4.next = 15;
              break;
            case 14:
              console.warn('⚠️ RESILIENCE: API error in template loading, using empty template set');
              this.templates = this.parseTemplates({templates: []});
              this.renderTemplatesLibrary();
              return; // Graceful recovery instead of throwing
            case 15:
              _context4.next = 20;
              break;
            case 17:
              _context4.prev = 17;
              _context4.t0 = _context4["catch"](0);
              console.error('Error loading templates:', _context4.t0);
            case 20:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[0, 17]]);
      }));
      function loadTemplates() {
        return _loadTemplates.apply(this, arguments);
      }
      return loadTemplates;
    }()
  }, {
    key: "loadUserImages",
    value: function () {
      var _loadUserImages = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
        var _this3 = this;
        var response, data;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              if (this.isLoggedIn) {
                _context5.next = 2;
                break;
              }
              return _context5.abrupt("return");
            case 2:
              _context5.prev = 2;
              _context5.next = 5;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'get_user_images',
                  nonce: octoPrintDesigner.nonce
                })
              });
            case 5:
              response = _context5.sent;
              if (response.ok) {
                _context5.next = 8;
                break;
              }
              console.warn('⚠️ RESILIENCE: Network error in image loading, showing empty gallery');
              return; // Graceful degradation - empty image grid
            case 8:
              _context5.next = 10;
              return response.json();
            case 10:
              data = _context5.sent;
              if (!data.success) {
                _context5.next = 15;
                break;
              }
              data.data.images.forEach(function (image) {
                _this3.addImageToGrid(image.url, image.id);
              });
              _context5.next = 16;
              break;
            case 15:
              console.warn('⚠️ RESILIENCE: API error in image loading, showing empty gallery');
              return; // Graceful recovery with empty gallery
            case 16:
              _context5.next = 21;
              break;
            case 18:
              _context5.prev = 18;
              _context5.t0 = _context5["catch"](2);
              console.error('Error loading user images:', _context5.t0);
            case 21:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[2, 18]]);
      }));
      function loadUserImages() {
        return _loadUserImages.apply(this, arguments);
      }
      return loadUserImages;
    }()
  }, {
    key: "parseTemplates",
    value: function parseTemplates(templates) {
      var parsedTemplates = new Map();
      for (var _i = 0, _Object$entries = Object.entries(templates); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          templateId = _Object$entries$_i[0],
          template = _Object$entries$_i[1];
        template.variations = new Map(Object.entries(template.variations));
        var _iterator = _createForOfIteratorHelper(template.variations),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
              variationId = _step$value[0],
              variation = _step$value[1];
            variation.views = new Map(Object.entries(variation.views));
            if (variation.is_default) template.defaultVariation = variationId;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        parsedTemplates.set(templateId, template);
      }
      return parsedTemplates;
    }
  }, {
    key: "renderTemplatesLibrary",
    value: function renderTemplatesLibrary() {
      var _this4 = this;
      this.libraryGrid.innerHTML = '';
      var _iterator2 = _createForOfIteratorHelper(this.templates),
        _step2;
      try {
        var _loop = function _loop() {
          var _step2$value = _slicedToArray(_step2.value, 2),
            templateId = _step2$value[0],
            template = _step2$value[1];
          var templateElement = _this4.createTemplateElement(template);
          templateElement.addEventListener('click', function () {
            return _this4.loadTemplate(templateId);
          });
          _this4.libraryGrid.appendChild(templateElement);
        };
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "createTemplateElement",
    value: function createTemplateElement(template) {
      var $element = this.libraryItemTemplate.content.cloneNode(true);
      var $container = $element.querySelector('.library-item');
      var $preview = $container.querySelector('.image-preview');
      var $name = $container.querySelector('span');
      var defaultVariation = template.variations.get(template.defaultVariation);
      var firstView = Array.from(defaultVariation.views.values())[0];
      if (firstView !== null && firstView !== void 0 && firstView.image_url) $preview.src = firstView.image_url;
      $name.textContent = template.name;
      return $container;
    }
  }, {
    key: "setupViewButtons",
    value: function setupViewButtons() {
      this.viewsToolbar.innerHTML = '';
    }
  }, {
    key: "createViewButton",
    value: function createViewButton(name, viewId) {
      var buttonTemplate = this.viewButtonTemplate.content.cloneNode(true);
      var button = buttonTemplate.querySelector('button');
      button.textContent = name;
      button.dataset.viewId = viewId;
      button.classList.add('designer-view-button', 'designer-action-button');
      return button;
    }
  }, {
    key: "updateViewButtons",
    value: function updateViewButtons() {
      var _this5 = this;
      var template = this.templates.get(this.activeTemplateId);
      var variation = template.variations.get(this.currentVariation);
      this.viewsToolbar.innerHTML = '';
      var _iterator3 = _createForOfIteratorHelper(variation.views),
        _step3;
      try {
        var _loop2 = function _loop2() {
          var _step3$value = _slicedToArray(_step3.value, 2),
            viewId = _step3$value[0],
            view = _step3$value[1];
          var button = _this5.createViewButton(view.name, viewId);
          _this5.viewsToolbar.appendChild(button);
          button.addEventListener('click', function () {
            _this5.viewsToolbar.querySelectorAll('button').forEach(function (btn) {
              return btn.classList.remove('active');
            });
            button.classList.add('active');
            _this5.currentView = viewId;
            _this5.loadTemplateView(viewId);
          });
        };
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          _loop2();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      var firstButton = this.viewsToolbar.querySelector('button');
      if (firstButton) firstButton.classList.add('active');
    }
  }, {
    key: "updateVariationButtons",
    value: function updateVariationButtons() {
      var _this6 = this;
      var template = this.templates.get(this.activeTemplateId);
      this.variationsList.innerHTML = '';
      template.variations.forEach(function (variation) {
        var button = document.createElement('button');
        button.classList.add('variation-button');
        button.style.backgroundColor = variation.color;
        button.dataset.variationId = variation.id;
        if (variation.is_default) button.classList.add('active');
        button.addEventListener('click', function () {
          return _this6.handleVariationChange(variation.id);
        });
        _this6.variationsList.appendChild(button);
      });
    }
  }, {
    key: "handleVariationChange",
    value: function handleVariationChange(variationId) {
      this.currentVariation = variationId;
      this.variationsList.querySelectorAll('.variation-button').forEach(function (btn) {
        return btn.classList.toggle('active', btn.dataset.variationId === variationId);
      });
      this.loadTemplateView(this.currentView);
    }
  }, {
    key: "loadTemplate",
    value: function () {
      var _loadTemplate = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(templateId) {
        var template, defaultVariation, firstViewId;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              template = this.templates.get(templateId);
              if (template) {
                _context6.next = 3;
                break;
              }
              return _context6.abrupt("return");
            case 3:
              if (this.isMobile) this.sectionItemsContainer.classList.toggle('hidden', true);
              this.activeTemplateId = templateId;
              this.currentVariation = template.defaultVariation;
              this.updateVariationButtons();
              this.updateViewButtons();
              defaultVariation = template.variations.get(template.defaultVariation);
              firstViewId = Array.from(defaultVariation.views.keys())[0];
              if (!firstViewId) {
                _context6.next = 14;
                break;
              }
              this.currentView = firstViewId;
              _context6.next = 14;
              return this.loadTemplateView(firstViewId);
            case 14:
              this.updatePixelToCmConversion();
            case 15:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
      function loadTemplate(_x) {
        return _loadTemplate.apply(this, arguments);
      }
      return loadTemplate;
    }()
  }, {
    key: "loadTemplateView",
    value: function () {
      var _loadTemplateView = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(viewId) {
        var _this7 = this;
        var template, variation, view;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              if (this.activeTemplateId) {
                _context7.next = 2;
                break;
              }
              return _context7.abrupt("return");
            case 2:
              template = this.templates.get(this.activeTemplateId);
              variation = template.variations.get(this.currentVariation.toString());
              view = variation.views.get(viewId);
              if (view) {
                _context7.next = 7;
                break;
              }
              return _context7.abrupt("return");
            case 7:
              fabric__WEBPACK_IMPORTED_MODULE_1__.Image.fromURL(view.image_url).then(function (img) {
                _this7.renderTemplateView(view, img);
              });
            case 8:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this);
      }));
      function loadTemplateView(_x2) {
        return _loadTemplateView.apply(this, arguments);
      }
      return loadTemplateView;
    }()
  }, {
    key: "renderTemplateView",
    value: function renderTemplateView(view, fabricImage) {
      // Clear existing canvas
      this.fabricCanvas.clear();
      this.clipMask = new fabric__WEBPACK_IMPORTED_MODULE_1__.Rect({
        left: view.safeZone.left * this.fabricCanvas.width / 100,
        top: view.safeZone.top * this.fabricCanvas.height / 100,
        width: view.safeZone.width,
        height: view.safeZone.height,
        absolutePositioned: true,
        fill: 'transparent',
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
      });
      fabricImage.set(_objectSpread(_objectSpread({}, view.imageZone), {}, {
        selectable: false,
        evented: false,
        left: view.imageZone.left * this.fabricCanvas.width / 100,
        top: view.imageZone.top * this.fabricCanvas.height / 100,
        originX: 'center',
        originY: 'center'
      }));
      this.printingZoneElement = new fabric__WEBPACK_IMPORTED_MODULE_1__.Rect(_objectSpread(_objectSpread({}, view.safeZone), {}, {
        left: view.safeZone.left * this.fabricCanvas.width / 100,
        top: view.safeZone.top * this.fabricCanvas.height / 100,
        // fill: 'rgba(0, 124, 186, 0.2)',
        fill: 'transparent',
        stroke: '#007cba',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
      }));
      if (view.colorOverlayEnabled) {
        var template = this.templates.get(this.activeTemplateId);
        var variation = template.variations.get(this.currentVariation.toString());
        fabricImage.filters.push(new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.BlendColor({
          color: variation === null || variation === void 0 ? void 0 : variation.color,
          mode: 'multiply',
          alpha: view.overlayOpacity || 0.5
        }));
        fabricImage.applyFilters();
      }
      this.fabricCanvas.add(fabricImage);
      if (this.isPrintingVisible) this.fabricCanvas.add(this.printingZoneElement);

      // Load saved image for this view if it exists
      this.loadViewImage();
    }
  }, {
    key: "addImageToGrid",
    value: function addImageToGrid(imageUrl, imageId) {
      var _this8 = this;
      var isTemporary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var template = this.libraryImageTemplate.content.cloneNode(true);
      var imageItem = template.querySelector('.library-image-item');
      var preview = imageItem.querySelector('.image-preview');
      var removeButton = imageItem.querySelector('button');
      preview.src = imageUrl;
      imageItem.dataset.imageId = imageId;
      imageItem.dataset.isTemporary = isTemporary ? 'true' : 'false';
      preview.addEventListener('click', function () {
        if (_this8.isMobile) _this8.sectionItemsContainer.classList.toggle('hidden', true);
        fabric__WEBPACK_IMPORTED_MODULE_1__.Image.fromURL(imageUrl).then(function (img) {
          var template = _this8.templates.get(_this8.activeTemplateId);
          var variation = template.variations.get(_this8.currentVariation.toString());
          var view = variation.views.get(_this8.currentView);
          var safeZone = view.safeZone;
          var scaleX = safeZone.width / img.width;
          var scaleY = safeZone.height / img.height;
          var scale = Math.min(scaleX, scaleY, 1);
          img.set({
            left: _this8.fabricCanvas.width / 2,
            top: _this8.fabricCanvas.height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale
            // Remove other styling properties that will be set in configureAndLoadFabricImage
          });

          // Generate unique ID for the image
          var imageId = "img_".concat(Date.now(), "_").concat(Math.floor(Math.random() * 1000));
          img.data = {
            imageId: imageId
          };

          // Store the image in our data structure
          _this8.storeViewImage(imageUrl, img);

          // Instead of adding directly to canvas, use our loading method
          // which will properly apply all styles, filters, and clipping
          _this8.loadViewImage();

          // After loading, find and select this image
          var key = "".concat(_this8.currentVariation, "_").concat(_this8.currentView);
          var imagesArray = _this8.variationImages.get(key) || [];
          var addedImageData = imagesArray.find(function (data) {
            return data.id === imageId;
          });
          if (addedImageData && addedImageData.fabricImage) {
            _this8.fabricCanvas.setActiveObject(addedImageData.fabricImage);
            addedImageData.fabricImage.setCoords(); // FIX: Re-initialize oCoords after setActiveObject (setActiveObject invalidates oCoords)
            _this8.fabricCanvas.renderAll();
          }
        });
      });
      removeButton.addEventListener('click', /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(e) {
          var key, currentImage, response, data, _key, _currentImage;
          return _regeneratorRuntime().wrap(function _callee8$(_context8) {
            while (1) switch (_context8.prev = _context8.next) {
              case 0:
                e.stopPropagation();
                if (confirm('Are you sure you want to remove this image?')) {
                  _context8.next = 3;
                  break;
                }
                return _context8.abrupt("return");
              case 3:
                if (!isTemporary) {
                  _context8.next = 9;
                  break;
                }
                // Remove temporary image
                _this8.removeTempImage(imageId);
                imageItem.remove();
                _this8.updateImagesGridLimit();

                // If this image is being used in the current view, remove it
                if (_this8.currentView && _this8.currentVariation) {
                  key = "".concat(_this8.currentVariation, "_").concat(_this8.currentView);
                  currentImage = _this8.variationImages.get(key);
                  if ((currentImage === null || currentImage === void 0 ? void 0 : currentImage.url) === imageUrl) _this8.removeViewImage();
                }
                return _context8.abrupt("return");
              case 9:
                _context8.prev = 9;
                _context8.next = 12;
                return fetch(octoPrintDesigner.ajaxUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: new URLSearchParams({
                    action: 'delete_user_image',
                    nonce: octoPrintDesigner.nonce,
                    image_id: imageId
                  })
                });
              case 12:
                response = _context8.sent;
                if (response.ok) {
                  _context8.next = 15;
                  break;
                }
                console.warn('⚠️ RESILIENCE: Network error in image deletion, keeping image in grid');
                return; // Graceful degradation - keep image visible
              case 15:
                _context8.next = 17;
                return response.json();
              case 17:
                data = _context8.sent;
                if (!data.success) {
                  _context8.next = 24;
                  break;
                }
                imageItem.remove();
                _this8.updateImagesGridLimit();

                // If this image is being used in the current view, remove it
                if (_this8.currentView && _this8.currentVariation) {
                  _key = "".concat(_this8.currentVariation, "_").concat(_this8.currentView);
                  _currentImage = _this8.variationImages.get(_key);
                  if ((_currentImage === null || _currentImage === void 0 ? void 0 : _currentImage.url) === imageUrl) _this8.removeViewImage();
                }
                _context8.next = 25;
                break;
              case 24:
                console.warn('⚠️ RESILIENCE: API error in image deletion, keeping image in grid');
                return; // Graceful recovery - maintain current state
              case 25:
                _context8.next = 31;
                break;
              case 27:
                _context8.prev = 27;
                _context8.t0 = _context8["catch"](9);
                console.error('Error deleting image:', _context8.t0);
                alert('Failed to delete image: ' + _context8.t0.message);
              case 31:
              case "end":
                return _context8.stop();
            }
          }, _callee8, null, [[9, 27]]);
        }));
        return function (_x3) {
          return _ref.apply(this, arguments);
        };
      }());
      this.imagesGrid.appendChild(imageItem);
      this.updateImagesGridLimit();
    }
  }, {
    key: "storeViewImage",
    value: function storeViewImage(imageUrl, fabricImage) {
      var _this9 = this;
      if (!this.currentView || !this.currentVariation) return;

      // Create a unique ID for the image
      var imageId = "img_".concat(Date.now(), "_").concat(Math.floor(Math.random() * 1000));
      var imageData = {
        id: imageId,
        url: imageUrl,
        transform: {
          left: fabricImage.left,
          top: fabricImage.top,
          scaleX: fabricImage.scaleX,
          scaleY: fabricImage.scaleY,
          angle: fabricImage.angle,
          width: fabricImage.width,
          height: fabricImage.height
        },
        fabricImage: fabricImage,
        visible: true
      };
      var key = "".concat(this.currentVariation, "_").concat(this.currentView);

      // Initialize array if needed
      if (!this.variationImages.has(key)) {
        this.variationImages.set(key, []);
      }

      // Add to image array instead of replacing
      this.variationImages.get(key).push(imageData);

      // Mark the template view as having custom images (existing code)
      var template = this.templates.get(this.activeTemplateId);
      var variation = template.variations.get(this.currentVariation.toString());
      var view = variation.views.get(this.currentView);
      view.has_custom_image = true;

      // Handle copying to other variations if this is the default variation
      if (this.currentVariation != template.defaultVariation) return;
      template.variations.forEach(function (eachVariation) {
        if (eachVariation.is_default || _this9.hasCustomImage(eachVariation.id)) return;
        var variationKey = "".concat(eachVariation.id, "_").concat(_this9.currentView);

        // Initialize array if needed
        if (!_this9.variationImages.has(variationKey)) {
          _this9.variationImages.set(variationKey, []);
        }

        // Add a deep copy of the image data (without fabricImage reference)
        var imageCopy = _objectSpread({}, imageData);
        delete imageCopy.fabricImage; // We'll create a new fabric instance when loading
        _this9.variationImages.get(variationKey).push(imageCopy);
      });
      return imageId; // Return the ID so we can reference this specific image
    }
  }, {
    key: "removeViewImage",
    value: function removeViewImage() {
      var _this10 = this;
      var imageId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (!this.currentView || !this.currentVariation) return;
      var key = "".concat(this.currentVariation, "_").concat(this.currentView);
      var imagesArray = this.variationImages.get(key);
      if (!imagesArray || imagesArray.length === 0) return;
      if (imageId) {
        // Remove specific image by ID
        var index = imagesArray.findIndex(function (img) {
          return img.id === imageId;
        });
        if (index !== -1) {
          // Remove from canvas if it exists
          var imageData = imagesArray[index];
          if (imageData.fabricImage) {
            this.fabricCanvas.remove(imageData.fabricImage);
          }
          // Remove from array
          imagesArray.splice(index, 1);
        }
      } else {
        // Remove all images (backward compatibility)
        imagesArray.forEach(function (imageData) {
          if (imageData.fabricImage) {
            _this10.fabricCanvas.remove(imageData.fabricImage);
          }
        });
        imagesArray.length = 0; // Clear the array
      }

      // Update has_custom_image flag if needed
      if (imagesArray.length === 0) {
        var template = this.templates.get(this.activeTemplateId);
        var variation = template.variations.get(this.currentVariation.toString());
        var view = variation.views.get(this.currentView);
        view.has_custom_image = false;

        // Also remove from other variations if this is default
        if (this.currentVariation == template.defaultVariation) {
          template.variations.forEach(function (eachVariation) {
            if (eachVariation.is_default) return;
            var variationKey = "".concat(eachVariation.id, "_").concat(_this10.currentView);
            var variationImages = _this10.variationImages.get(variationKey);
            if (variationImages && variationImages.length > 0) {
              variationImages.forEach(function (img) {
                if (img.fabricImage) {
                  _this10.fabricCanvas.remove(img.fabricImage);
                }
              });
              variationImages.length = 0;
            }
            var variationView = eachVariation.views.get(_this10.currentView);
            if (variationView) {
              variationView.has_custom_image = false;
            }
          });
        }
      }

      // Render canvas to reflect changes
      this.fabricCanvas.renderAll();
    }
  }, {
    key: "loadViewImage",
    value: function loadViewImage() {
      var _this11 = this;
      if (!this.currentView || !this.currentVariation) return;
      var key = "".concat(this.currentVariation, "_").concat(this.currentView);
      var imagesArray = this.variationImages.get(key);
      if (!imagesArray || imagesArray.length === 0) return;

      // Get template and variation data for filter settings
      var template = this.templates.get(this.activeTemplateId);
      var variation = template.variations.get(this.currentVariation.toString());
      var isDarkShirt = variation.is_dark_shirt === true;

      // Load each image
      imagesArray.forEach(function (imageData) {
        // Skip if we already have this image on canvas (avoids duplicates)
        if (imageData.fabricImage && _this11.fabricCanvas.contains(imageData.fabricImage)) {
          return;
        }

        // If we have a URL but no fabric instance, create one
        if (imageData.url && !imageData.fabricImage) {
          fabric__WEBPACK_IMPORTED_MODULE_1__.Image.fromURL(imageData.url).then(function (img) {
            // Store the fabricImage reference
            imageData.fabricImage = img;

            // Apply common settings and load the image
            _this11.configureAndLoadFabricImage(imageData, isDarkShirt);
          });
        } else if (imageData.fabricImage) {
          // We have a fabric instance already, just configure and add
          _this11.configureAndLoadFabricImage(imageData, isDarkShirt);
        }
      });
    }
  }, {
    key: "configureAndLoadFabricImage",
    value: function configureAndLoadFabricImage(imageData, isDarkShirt) {
      var img = imageData.fabricImage;

      // Reset filters
      img.filters = [];
      if (isDarkShirt) {
        // Settings for dark shirts (keep existing logic)
        img.filters.push(new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.Contrast({
          contrast: 0.15
        }), new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.BlendColor({
          color: '#ffffff',
          mode: 'screen',
          alpha: 0.1
        }));
        img.applyFilters();
        img.set(_objectSpread(_objectSpread({}, imageData.transform), {}, {
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false,
          cornerColor: '#007cba',
          borderColor: '#007cba',
          cornerStrokeColor: '#fff',
          padding: 5,
          globalCompositeOperation: 'screen',
          preserveAspectRatio: true,
          clipPath: this.clipMask,
          opacity: 0.95,
          visible: imageData.visible !== undefined ? imageData.visible : true
        }));
      } else {
        // Settings for light shirts (keep existing logic)
        img.filters.push(new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.Brightness({
          brightness: -0.05
        }), new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.Contrast({
          contrast: 0.1
        }), new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.BlendColor({
          color: '#ffffff',
          mode: 'multiply',
          alpha: 0.9
        }));
        img.applyFilters();
        img.set(_objectSpread(_objectSpread({}, imageData.transform), {}, {
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false,
          cornerColor: '#007cba',
          borderColor: '#007cba',
          cornerStrokeColor: '#fff',
          padding: 5,
          globalCompositeOperation: 'multiply',
          preserveAspectRatio: true,
          clipPath: this.clipMask,
          opacity: 0.8,
          visible: imageData.visible !== undefined ? imageData.visible : true
        }));
      }

      // Bind events to this image
      this.bindImageEvents(img);

      // Add to canvas
      this.fabricCanvas.add(img);
      img.setCoords();

      // Render canvas
      this.fabricCanvas.renderAll();
    }
  }, {
    key: "hasCustomImage",
    value: function hasCustomImage(variationId) {
      var variation = this.templates.get(this.activeTemplateId).variations.get(variationId.toString());
      var view = variation.views.get(this.currentView);
      return view.has_custom_image;
    }
  }, {
    key: "copyImageFromDefaultVariation",
    value: function copyImageFromDefaultVariation(targetVariationId) {
      var template = this.templates.get(this.activeTemplateId);
      var defaultVariation = template.variations.find(function (v) {
        return v.is_default;
      });
      var defaultImageData = this.variationImages.get("".concat(defaultVariation.id, "_").concat(this.currentView));
      if (defaultImageData) {
        this.variationImages.set("".concat(targetVariationId, "_").concat(this.currentView), _objectSpread({}, defaultImageData));
      }
    }
  }, {
    key: "bindImageEvents",
    value: function bindImageEvents(img) {
      var _this12 = this;
      img.on('scaling', function (event) {
        // Maintain aspect ratio
        if (img.scaleX !== img.scaleY) {
          var avgScale = (img.scaleX + img.scaleY) / 2;
          img.set({
            scaleX: avgScale,
            scaleY: avgScale
          });
        }

        // Update input fields during scaling
        if (_this12.widthInput && _this12.heightInput) {
          _this12.widthInput.value = Math.round(img.width * img.scaleX);
          _this12.heightInput.value = Math.round(img.height * img.scaleY);

          // Update physical dimensions display
          _this12.updatePixelToCmConversion();
        }

        // Update toolbar position
        _this12.updateToolbarPosition();
      });
      img.on('modified', function () {
        // Maintain aspect ratio
        if (img.scaleX !== img.scaleY) {
          var avgScale = (img.scaleX + img.scaleY) / 2;
          img.set({
            scaleX: avgScale,
            scaleY: avgScale
          });
        }

        // Update input fields
        if (_this12.widthInput && _this12.heightInput) {
          _this12.widthInput.value = Math.round(img.width * img.scaleX);
          _this12.heightInput.value = Math.round(img.height * img.scaleY);

          // Update physical dimensions display
          _this12.updatePixelToCmConversion();
        }

        // Find and update the corresponding image data
        _this12.updateImageTransform(img);
        _this12.fabricCanvas.renderAll();
        _this12.updateToolbarPosition();
      });
      img.on('selected', function () {
        img.set({
          borderColor: '#007cba',
          cornerColor: '#007cba'
        });
        _this12.showToolbar();
      });
      img.on('deselected', function () {
        img.set({
          borderColor: '#d2d2d2',
          cornerColor: '#d2d2d2'
        });
        _this12.hideToolbar();
      });
      img.on('moving', function () {
        _this12.updateToolbarPosition();
      });
    }
  }, {
    key: "updateImageTransform",
    value: function updateImageTransform(img) {
      if (!this.currentView || !this.currentVariation) return;
      var key = "".concat(this.currentVariation, "_").concat(this.currentView);
      var imagesArray = this.variationImages.get(key);
      if (!imagesArray) return;

      // Find the image by reference or by ID
      var imageData = imagesArray.find(function (data) {
        return data.fabricImage === img || img.data && img.data.imageId === data.id;
      });
      if (imageData) {
        // Update transform data
        imageData.transform = {
          left: img.left,
          top: img.top,
          scaleX: img.scaleX,
          scaleY: img.scaleY,
          angle: img.angle,
          width: img.width,
          height: img.height
        };
      }
    }
  }, {
    key: "setupNavigationEvents",
    value: function setupNavigationEvents() {
      var _this13 = this;
      this.navItems.forEach(function (item) {
        item.addEventListener('click', function () {
          if (item.dataset.type === 'fiverr') {
            window.open('https://fiverr.com', '_blank');
            return;
          }
          _this13.navItems.forEach(function (navItem) {
            return navItem.classList.remove('active');
          });
          item.classList.add('active');
          var sectionType = item.dataset.type;
          _this13.sectionContents.forEach(function (section) {
            section.classList.toggle('hidden', section.dataset.section !== sectionType);
          });
        });
      });
    }
  }, {
    key: "showToolbar",
    value: function showToolbar() {
      var activeObject = this.fabricCanvas.getActiveObject();
      if (!activeObject) return;

      // Update dimension inputs
      this.widthInput.value = Math.round(activeObject.width * activeObject.scaleX);
      this.heightInput.value = Math.round(activeObject.height * activeObject.scaleY);

      // Update physical dimensions display
      this.updatePixelToCmConversion();
      this.imageToolbar.classList.add('visible');
      this.updateToolbarPosition();
    }
  }, {
    key: "hideToolbar",
    value: function hideToolbar() {
      this.imageToolbar.classList.remove('visible');
    }
  }, {
    key: "updateToolbarPosition",
    value: function updateToolbarPosition() {
      var activeObject = this.fabricCanvas.getActiveObject();
      if (!activeObject) return;

      // Get canvas container (wrapper) rect
      var containerRect = this.canvas.parentNode.getBoundingClientRect();

      // Get object coordinates relative to canvas
      var objCoords = activeObject.getBoundingRect();
      var zoom = this.fabricCanvas.getZoom();
      var pan = this.fabricCanvas.viewportTransform;

      // Calculate absolute position considering zoom and pan
      var absoluteLeft = objCoords.left * zoom + pan[4];
      var absoluteTop = objCoords.top * zoom + pan[5];
      var absoluteWidth = objCoords.width * zoom;

      // Position the toolbar relative to the canvas container
      this.imageToolbar.style.left = "".concat(absoluteLeft + absoluteWidth / 2, "px");
      this.imageToolbar.style.top = "".concat(absoluteTop - this.imageToolbar.offsetHeight - 10, "px");
    }
  }, {
    key: "setupUploadEvents",
    value: function setupUploadEvents() {
      var _this14 = this;
      // Setup drag and drop
      this.uploadZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this14.uploadZone.style.backgroundColor = '#f8f8f8';
      });
      this.uploadZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this14.uploadZone.style.backgroundColor = '';
      });
      this.uploadZone.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this14.uploadZone.style.backgroundColor = '';
        var files = e.dataTransfer.files;
        _this14.handleFileUpload(files);
      });

      // Setup click to upload
      this.uploadZone.addEventListener('click', function () {
        _this14.uploadInput.click();
      });
      this.uploadInput.addEventListener('change', function (e) {
        _this14.handleFileUpload(e.target.files);
      });
    }
  }, {
    key: "handleFileUpload",
    value: function () {
      var _handleFileUpload = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(files) {
        var allowedTypes, maxSize, maxImages, currentImages, _i2, _Array$from, file, formData, response, data;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              if (files.length) {
                _context9.next = 2;
                break;
              }
              return _context9.abrupt("return");
            case 2:
              allowedTypes = ['image/jpeg', 'image/png'];
              maxSize = 5 * 1024 * 1024; // 5MB
              maxImages = 20; // Match server-side limit
              currentImages = this.imagesGrid.querySelectorAll('.library-image-item').length;
              if (!(currentImages >= maxImages)) {
                _context9.next = 9;
                break;
              }
              alert('Maximum number of images reached');
              return _context9.abrupt("return");
            case 9:
              _i2 = 0, _Array$from = Array.from(files);
            case 10:
              if (!(_i2 < _Array$from.length)) {
                _context9.next = 51;
                break;
              }
              file = _Array$from[_i2];
              if (allowedTypes.includes(file.type)) {
                _context9.next = 15;
                break;
              }
              alert('Only JPG and PNG files are allowed');
              return _context9.abrupt("continue", 48);
            case 15:
              if (!(file.size > maxSize)) {
                _context9.next = 18;
                break;
              }
              alert('File size must be less than 5MB');
              return _context9.abrupt("continue", 48);
            case 18:
              if (!(currentImages + files.length > maxImages)) {
                _context9.next = 21;
                break;
              }
              alert("Can only add ".concat(maxImages - currentImages, " more images"));
              return _context9.abrupt("break", 51);
            case 21:
              if (this.isLoggedIn) {
                _context9.next = 24;
                break;
              }
              this.handleTempImageUpload(file);
              return _context9.abrupt("continue", 48);
            case 24:
              _context9.prev = 24;
              // Create FormData and upload to server for logged-in users
              formData = new FormData();
              formData.append('action', 'upload_user_image');
              formData.append('nonce', octoPrintDesigner.nonce);
              formData.append('image', file);
              _context9.next = 31;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: formData
              });
            case 31:
              response = _context9.sent;
              if (response.ok) {
                _context9.next = 34;
                break;
              }
              console.warn('⚠️ RESILIENCE: Network error in file upload, skipping this file');
              return; // Graceful degradation - continue with other files
            case 34:
              _context9.next = 36;
              return response.json();
            case 36:
              data = _context9.sent;
              if (!data.success) {
                _context9.next = 41;
                break;
              }
              // Add image to grid with server-generated ID
              this.addImageToGrid(data.data.url, data.data.id);
              _context9.next = 42;
              break;
            case 41:
              console.warn('⚠️ RESILIENCE: API error in file upload, skipping this file');
              return; // Graceful recovery - continue with batch upload
            case 42:
              _context9.next = 48;
              break;
            case 44:
              _context9.prev = 44;
              _context9.t0 = _context9["catch"](24);
              console.error('Error uploading file:', _context9.t0);
              alert('Failed to upload image: ' + _context9.t0.message);
            case 48:
              _i2++;
              _context9.next = 10;
              break;
            case 51:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this, [[24, 44]]);
      }));
      function handleFileUpload(_x4) {
        return _handleFileUpload.apply(this, arguments);
      }
      return handleFileUpload;
    }() // Handle temporary image upload for non-logged users
  }, {
    key: "handleTempImageUpload",
    value: function handleTempImageUpload(file) {
      var _this15 = this;
      var reader = new FileReader();
      reader.onload = function (e) {
        var imageUrl = e.target.result;
        var tempId = "temp-".concat(++_this15.tempImageCounter);

        // Store in tempImages array
        _this15.tempImages.push({
          id: tempId,
          url: imageUrl,
          file: file
        });

        // Add to grid with temporary flag
        _this15.addImageToGrid(imageUrl, tempId, true);
      };
      reader.readAsDataURL(file);
    }

    // Remove a temporary image by ID
  }, {
    key: "removeTempImage",
    value: function removeTempImage(tempId) {
      var index = this.tempImages.findIndex(function (img) {
        return img.id === tempId;
      });
      if (index !== -1) {
        this.tempImages.splice(index, 1);
      }
    }
  }, {
    key: "updateImagesGridLimit",
    value: function updateImagesGridLimit() {
      var maxImages = 25;
      var currentImages = this.imagesGrid.querySelectorAll('.library-image-item').length;
      this.imagesGridLimit.innerHTML = "".concat(currentImages, "/<b>").concat(maxImages, "</b>");
    }
  }, {
    key: "setupDesignerToolbar",
    value: function setupDesignerToolbar() {
      var _this16 = this;
      this.togglePrintZoneButton.addEventListener('click', function () {
        _this16.isPrintingVisible = !_this16.isPrintingVisible || false;
        _this16.togglePrintZoneButton.classList.toggle('active', _this16.isPrintingVisible);
        if (_this16.isPrintingVisible) _this16.fabricCanvas.add(_this16.printingZoneElement);else _this16.fabricCanvas.remove(_this16.printingZoneElement);
      });
    }
  }, {
    key: "setupZoomControls",
    value: function setupZoomControls() {
      var _this17 = this;
      var zoomTimeout;
      var minZoom = 10; // 10%
      var maxZoom = 200; // 200%
      var step = 10; // 10% steps

      // Setup zoom buttons
      this.zoomButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var currentZoom = parseInt(_this17.zoomInput.value);
          var newZoom = button.dataset.zoomType === 'in' ? Math.min(currentZoom + step, maxZoom) : Math.max(currentZoom - step, minZoom);
          _this17.updateZoom(newZoom);
        });
      });

      // Setup zoom input
      this.zoomInput.addEventListener('input', function (e) {
        var value = parseInt(e.target.value);
        // Ensure value is within bounds
        value = Math.max(minZoom, Math.min(maxZoom, value));
        // Ensure value is a multiple of step
        value = Math.round(value / step) * step;
        _this17.updateZoom(value);
      });

      // Setup zoom range in popup
      this.zoomRange.addEventListener('input', function (e) {
        _this17.updateZoom(parseInt(e.target.value));
      });

      // Show/hide zoom popup
      this.zoomInput.addEventListener('focus', function () {
        clearTimeout(zoomTimeout);
        _this17.zoomPopup.classList.remove('hidden');
        _this17.zoomRange.focus();
      });
      this.zoomRange.addEventListener('blur', function () {
        zoomTimeout = setTimeout(function () {
          _this17.zoomPopup.classList.add('hidden');
        }, 200);
      });
    }
  }, {
    key: "updateZoom",
    value: function updateZoom(percentage) {
      var _this$imageToolbar;
      // Update inputs with percentage value
      this.zoomInput.value = percentage;
      this.zoomRange.value = percentage;

      // Convert percentage to zoom factor (100% = 1.0)
      var zoom = percentage / 100;

      // Get the canvas center
      var center = {
        x: this.fabricCanvas.width / 2,
        y: this.fabricCanvas.height / 2
      };

      // Apply zoom from center
      this.fabricCanvas.zoomToPoint(center, zoom);
      this.fabricCanvas.renderAll();

      // Update any UI elements that depend on zoom level
      if ((_this$imageToolbar = this.imageToolbar) !== null && _this$imageToolbar !== void 0 && _this$imageToolbar.classList.contains('visible')) {
        this.updateToolbarPosition();
      }
    }
  }, {
    key: "handleResize",
    value: function handleResize() {
      var _this18 = this;
      // Check if mobile view (under 950px)
      this.isMobile = window.innerWidth <= 950;

      // Toggle section visibility based on viewport
      if (!this.isMobile) this.sectionItemsContainer.classList.remove('hidden');

      // Add click handlers for mobile navigation
      this.navItems.forEach(function (item) {
        var originalClickHandler = item.onclick;
        item.onclick = function (e) {
          if (_this18.isMobile && item.dataset.type !== 'fiverr') _this18.sectionItemsContainer.classList.toggle('hidden');
          if (originalClickHandler) originalClickHandler(e);
        };
      });

      // Reload current view to adjust positions
      if (this.currentView) {
        this.loadTemplateView(this.currentView);
      }
    }

    // Add these new methods to DesignerWidget class
  }, {
    key: "storeModalElements",
    value: function storeModalElements() {
      this.saveDesignModal = document.getElementById('saveDesignModal');
      if (!this.saveDesignModal) return;
      this.modalNameInput = this.saveDesignModal.querySelector('#designName');
      this.modalDesignId = this.saveDesignModal.querySelector('#designId');
      this.modalSaveButton = this.saveDesignModal.querySelector('.designer-modal-save');
      this.modalCancelButton = this.saveDesignModal.querySelector('.designer-modal-cancel');
      this.modalCloseButton = this.saveDesignModal.querySelector('.designer-modal-close');
    }
  }, {
    key: "setupModalEvents",
    value: function setupModalEvents() {
      var _this19 = this;
      if (!this.saveDesignModal) return;

      // Save button in footer
      var saveButton = this.container.querySelector('.designer-editor footer .designer-action-button');
      saveButton.addEventListener('click', function () {
        return _this19.showSaveModal();
      });

      // Modal events
      this.modalSaveButton.addEventListener('click', function () {
        return _this19.saveDesign();
      });
      this.modalCancelButton.addEventListener('click', function () {
        return _this19.hideModal();
      });
      this.modalCloseButton.addEventListener('click', function () {
        return _this19.hideModal();
      });

      // Close on overlay click
      this.saveDesignModal.querySelector('.designer-modal-overlay').addEventListener('click', function () {
        return _this19.hideModal();
      });

      // Prevent modal close when clicking modal content
      this.saveDesignModal.querySelector('.designer-modal-content').addEventListener('click', function (e) {
        return e.stopPropagation();
      });
    }
  }, {
    key: "showSaveModal",
    value: function showSaveModal() {
      if (!this.isLoggedIn) {
        this.showLoginModal();
        return;
      }
      if (!this.activeTemplateId) {
        alert('Please select a template first');
        return;
      }
      this.saveDesignModal.classList.remove('hidden');
      this.modalNameInput.focus();
    }
  }, {
    key: "showLoginModal",
    value: function showLoginModal() {
      try {
        elementorProFrontend.modules.popup.showPopup({
          id: 1831
        });
      } catch (e) {}

      // const loginModal = document.getElementById('loginRequiredModal');
      // if (!loginModal) return;

      // // Disable all interactions with the designer
      // this.container.querySelectorAll('button, input, a').forEach(element => {
      //     if (!element.closest('#loginRequiredModal')) {
      //         element.style.pointerEvents = 'none';
      //     }
      // });

      // loginModal.classList.remove('hidden');
    }
  }, {
    key: "hideModal",
    value: function hideModal() {
      this.saveDesignModal.classList.remove('loading');
      this.saveDesignModal.classList.add('hidden');
    }
  }, {
    key: "saveDesign",
    value: function () {
      var _saveDesign = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
        var name, designData, formData, previews, viewIndex, viewId, preview, _previews, _viewIndex, _viewId, _preview, response, data;
        return _regeneratorRuntime().wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              if (this.isLoggedIn) {
                _context10.next = 3;
                break;
              }
              this.showLoginModal();
              return _context10.abrupt("return");
            case 3:
              name = this.modalNameInput.value.trim();
              if (name) {
                _context10.next = 7;
                break;
              }
              alert('Please enter a name for your design');
              return _context10.abrupt("return");
            case 7:
              _context10.prev = 7;
              this.saveDesignModal.classList.add('loading');

              // Collect the current design state
              designData = this.collectDesignState();
              formData = new FormData();
              formData.append('action', 'save_design');
              formData.append('nonce', octoPrintDesigner.nonce);
              formData.append('template_id', this.activeTemplateId);
              formData.append('name', name);
              formData.append('design_data', JSON.stringify(designData));
              if (!this.currentDesignId) {
                _context10.next = 26;
                break;
              }
              formData.append('design_id', this.currentDesignId);

              // For existing designs, capture all view previews if we're updating the design
              _context10.next = 20;
              return this.captureAllViewsPreviews();
            case 20:
              previews = _context10.sent;
              viewIndex = 0;
              for (viewId in previews) {
                preview = previews[viewId];
                formData.append("preview_image_".concat(viewId), preview.blob, "preview_".concat(viewId, ".png"));
                formData.append("preview_view_".concat(viewId), viewId);
                formData.append("preview_view_name_".concat(viewId), preview.viewName);
                viewIndex++;
              }
              formData.append('preview_count', viewIndex); // Add count of previews
              _context10.next = 32;
              break;
            case 26:
              _context10.next = 28;
              return this.captureAllViewsPreviews();
            case 28:
              _previews = _context10.sent;
              _viewIndex = 0;
              for (_viewId in _previews) {
                _preview = _previews[_viewId];
                formData.append("preview_image_".concat(_viewId), _preview.blob, "preview_".concat(_viewId, ".png"));
                formData.append("preview_view_".concat(_viewId), _viewId);
                formData.append("preview_view_name_".concat(_viewId), _preview.viewName);
                _viewIndex++;
              }
              formData.append('preview_count', _viewIndex); // Add count of previews
            case 32:
              _context10.next = 34;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: formData
              });
            case 34:
              response = _context10.sent;
              if (response.ok) {
                _context10.next = 37;
                break;
              }
              console.warn('⚠️ RESILIENCE: Network error in design saving, showing user-friendly message');
              this.toastManager.show('Network error - please try again', 'error', { duration: 5000 });
              return; // Graceful degradation with user notification
            case 37:
              _context10.next = 39;
              return response.json();
            case 39:
              data = _context10.sent;
              if (!data.success) {
                _context10.next = 46;
                break;
              }
              this.toastManager.show('Design saved!', 'success');
              this.currentDesignId = data.data.design_id;
setTimeout(function () {
  window.location.href = data.data.redirect_url;
}, 1000);
              _context10.next = 47;
              break;
            case 46:
              console.warn('⚠️ RESILIENCE: API error in design saving, showing user-friendly message');
              this.toastManager.show(data.data.message || 'Error saving design - please try again', 'error', { duration: 5000 });
              return; // Graceful recovery with user feedback
            case 47:
              _context10.next = 54;
              break;
            case 49:
              _context10.prev = 49;
              _context10.t0 = _context10["catch"](7);
              this.toastManager.show('Error while saving the design', 'error', {
                duration: null
              });
              console.error('Error saving design:', _context10.t0);
              alert('Failed to save design: ' + _context10.t0.message);
            case 54:
              _context10.prev = 54;
              this.saveDesignModal.classList.remove('loading');
              return _context10.finish(54);
            case 57:
            case "end":
              return _context10.stop();
          }
        }, _callee10, this, [[7, 49, 54, 57]]);
      }));
      function saveDesign() {
        return _saveDesign.apply(this, arguments);
      }
      return saveDesign;
    }()
  }, {
    key: "loadDesign",
    value: function () {
      var _loadDesign = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(designId) {
        var formData, response, data;
        return _regeneratorRuntime().wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              if (this.isLoggedIn) {
                _context11.next = 3;
                break;
              }
              this.showLoginModal();
              return _context11.abrupt("return");
            case 3:
              _context11.prev = 3;
              formData = new FormData();
              formData.append('action', 'load_design');
              formData.append('nonce', octoPrintDesigner.nonce);
              formData.append('design_id', designId);
              _context11.next = 10;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                body: formData
              });
            case 10:
              response = _context11.sent;
              if (response.ok) {
                _context11.next = 13;
                break;
              }
              console.warn('⚠️ RESILIENCE: Network error in design loading, showing user-friendly message');
              this.toastManager.show('Network error - unable to load design', 'error', { duration: 5000 });
              return; // Graceful degradation with user notification
            case 13:
              _context11.next = 15;
              return response.json();
            case 15:
              data = _context11.sent;
              if (!data.success) {
                _context11.next = 22;
                break;
              }
              this.toastManager.show('Design loaded', 'success');
              _context11.next = 20;
              return this.applyDesignState(data.data);
            case 20:
              _context11.next = 23;
              break;
            case 22:
              console.warn('⚠️ RESILIENCE: API error in design loading, showing user-friendly message');
              this.toastManager.show(data.data.message || 'Error loading design', 'error', { duration: 5000 });
              return; // Graceful recovery with user feedback
            case 23:
              _context11.next = 30;
              break;
            case 25:
              _context11.prev = 25;
              _context11.t0 = _context11["catch"](3);
              this.toastManager.show('Error loading the design', 'error');
              console.error('Error loading design:', _context11.t0);
              alert('Failed to load design: ' + _context11.t0.message);
            case 30:
            case "end":
              return _context11.stop();
          }
        }, _callee11, this, [[3, 25]]);
      }));
      function loadDesign(_x5) {
        return _loadDesign.apply(this, arguments);
      }
      return loadDesign;
    }()
  }, {
    key: "collectDesignState",
    value: function collectDesignState() {
      // Create an object representing the current state of the design
      var state = {
        templateId: this.activeTemplateId,
        currentVariation: this.currentVariation,
        variationImages: {}
      };

      // Convert the variationImages Map to a plain object with arrays
      var _iterator4 = _createForOfIteratorHelper(this.variationImages),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _step4$value = _slicedToArray(_step4.value, 2),
            key = _step4$value[0],
            imagesArray = _step4$value[1];
          if (!imagesArray || imagesArray.length === 0) continue;
          state.variationImages[key] = imagesArray.map(function (imageData) {
            // Create a clean version without circular references
            return {
              id: imageData.id,
              url: imageData.url,
              transform: {
                left: imageData.transform.left,
                top: imageData.transform.top,
                scaleX: imageData.transform.scaleX,
                scaleY: imageData.transform.scaleY,
                angle: imageData.transform.angle,
                width: imageData.transform.width || imageData.fabricImage.width,
                height: imageData.transform.height || imageData.fabricImage.height
              },
              visible: imageData.visible !== undefined ? imageData.visible : true
            };
          });
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      return state;
    }
  }, {
    key: "applyDesignState",
    value: function () {
      var _applyDesignState = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(design) {
        var designData, _i3, _Object$entries2, _Object$entries2$_i, key, value, _key$split, _key$split2, variationId, viewId, _iterator5, _step5, imageData;
        return _regeneratorRuntime().wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              designData = JSON.parse(design.design_data); // Load the template first
              _context12.next = 3;
              return this.loadTemplate(designData.templateId);
            case 3:
              // Clear existing images
              this.variationImages.clear();

              // Restore variation images - handle both formats
              _i3 = 0, _Object$entries2 = Object.entries(designData.variationImages || {});
            case 5:
              if (!(_i3 < _Object$entries2.length)) {
                _context12.next = 33;
                break;
              }
              _Object$entries2$_i = _slicedToArray(_Object$entries2[_i3], 2), key = _Object$entries2$_i[0], value = _Object$entries2$_i[1];
              _key$split = key.split('_'), _key$split2 = _slicedToArray(_key$split, 2), variationId = _key$split2[0], viewId = _key$split2[1];
              if (!Array.isArray(value)) {
                _context12.next = 28;
                break;
              }
              // New format: array of images
              _iterator5 = _createForOfIteratorHelper(value);
              _context12.prev = 10;
              _iterator5.s();
            case 12:
              if ((_step5 = _iterator5.n()).done) {
                _context12.next = 18;
                break;
              }
              imageData = _step5.value;
              _context12.next = 16;
              return this.restoreViewImage(variationId, viewId, imageData);
            case 16:
              _context12.next = 12;
              break;
            case 18:
              _context12.next = 23;
              break;
            case 20:
              _context12.prev = 20;
              _context12.t0 = _context12["catch"](10);
              _iterator5.e(_context12.t0);
            case 23:
              _context12.prev = 23;
              _iterator5.f();
              return _context12.finish(23);
            case 26:
              _context12.next = 30;
              break;
            case 28:
              _context12.next = 30;
              return this.restoreViewImage(variationId, viewId, value);
            case 30:
              _i3++;
              _context12.next = 5;
              break;
            case 33:
              // Load the template again to refresh the view
              this.loadTemplate(designData.templateId);

              // Store the current design ID
              this.currentDesignId = design.id;
              this.modalNameInput.value = design.name;
              this.modalDesignId.value = design.id;
            case 37:
            case "end":
              return _context12.stop();
          }
        }, _callee12, this, [[10, 20, 23, 26]]);
      }));
      function applyDesignState(_x6) {
        return _applyDesignState.apply(this, arguments);
      }
      return applyDesignState;
    }()
  }, {
    key: "restoreViewImage",
    value: function () {
      var _restoreViewImage = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(variationId, viewId, imageData) {
        var img, key;
        return _regeneratorRuntime().wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              _context13.prev = 0;
              _context13.next = 3;
              return fabric__WEBPACK_IMPORTED_MODULE_1__.Image.fromURL(imageData.url);
            case 3:
              img = _context13.sent;
              // Set image properties
              img.set(_objectSpread({
                originX: 'center',
                originY: 'center',
                cornerSize: 10,
                cornerStyle: 'circle',
                transparentCorners: false,
                cornerColor: '#007cba',
                borderColor: '#007cba',
                cornerStrokeColor: '#fff',
                padding: 5,
                centeredScaling: true,
                preserveAspectRatio: true
              }, imageData.transform));

              // Store image ID in fabric object for reference
              img.data = {
                imageId: imageData.id || "img_".concat(Date.now(), "_").concat(Math.floor(Math.random() * 1000))
              };

              // Get or create key in variationImages map
              key = "".concat(variationId, "_").concat(viewId);
              if (!this.variationImages.has(key)) {
                this.variationImages.set(key, []);
              }

              // Add image to the array
              this.variationImages.get(key).push({
                id: img.data.imageId,
                url: imageData.url,
                transform: imageData.transform,
                fabricImage: img,
                visible: imageData.visible !== undefined ? imageData.visible : true
              });

              // Bind events to the image
              this.bindImageEvents(img);
              return _context13.abrupt("return", img);
            case 13:
              _context13.prev = 13;
              _context13.t0 = _context13["catch"](0);
              console.error('Error restoring image:', _context13.t0);
              return _context13.abrupt("return", null);
            case 17:
            case "end":
              return _context13.stop();
          }
        }, _callee13, this, [[0, 13]]);
      }));
      function restoreViewImage(_x7, _x8, _x9) {
        return _restoreViewImage.apply(this, arguments);
      }
      return restoreViewImage;
    }()
  }, {
    key: "captureCanvasPreview",
    value: function () {
      var _captureCanvasPreview = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14() {
        var tempCanvasElement, tempCanvas, template, variation, view, backgroundImage, key, imagesArray, widthRatio, heightRatio, clipPath, _iterator6, _step6, imageData, userImage, isDarkShirt;
        return _regeneratorRuntime().wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              // Create temporary canvas for preview 
              tempCanvasElement = document.createElement('canvas');
              tempCanvas = new fabric__WEBPACK_IMPORTED_MODULE_1__.Canvas(tempCanvasElement, {
                width: 500,
                height: 500,
                backgroundColor: 'white'
              });
              _context14.prev = 2;
              // Get the current template view settings
              template = this.templates.get(this.activeTemplateId);
              variation = template.variations.get(this.currentVariation.toString());
              view = variation.views.get(this.currentView); // Add template background with same settings as main canvas
              _context14.next = 8;
              return fabric__WEBPACK_IMPORTED_MODULE_1__.Image.fromURL(view.image_url);
            case 8:
              backgroundImage = _context14.sent;
              backgroundImage.set(_objectSpread(_objectSpread({}, view.imageZone), {}, {
                selectable: false,
                evented: false,
                left: view.imageZone.left * tempCanvas.width / 100,
                top: view.imageZone.top * tempCanvas.height / 100,
                originX: 'center',
                originY: 'center'
              }));

              // Add color overlay if enabled
              if (view.colorOverlayEnabled) {
                backgroundImage.filters.push(new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.BlendColor({
                  color: variation === null || variation === void 0 ? void 0 : variation.color,
                  mode: 'multiply',
                  alpha: view.overlayOpacity || 0.5
                }));
                backgroundImage.applyFilters();
              }
              tempCanvas.add(backgroundImage);

              // Get current user images for this view
              key = "".concat(this.currentVariation, "_").concat(this.currentView);
              imagesArray = this.variationImages.get(key) || []; // Calculate position adjustment factors
              widthRatio = tempCanvas.width / this.fabricCanvas.width;
              heightRatio = tempCanvas.height / this.fabricCanvas.height; // Create clipPath with adjusted dimensions
              clipPath = new fabric__WEBPACK_IMPORTED_MODULE_1__.Rect({
                left: view.safeZone.left * tempCanvas.width / 100,
                top: view.safeZone.top * tempCanvas.height / 100,
                width: view.safeZone.width,
                height: view.safeZone.height,
                absolutePositioned: true,
                fill: 'transparent',
                selectable: false,
                evented: false,
                originX: 'center',
                originY: 'center'
              }); // Add each image to the preview canvas
              _iterator6 = _createForOfIteratorHelper(imagesArray);
              _context14.prev = 18;
              _iterator6.s();
            case 20:
              if ((_step6 = _iterator6.n()).done) {
                _context14.next = 34;
                break;
              }
              imageData = _step6.value;
              if (!(!imageData.visible || !imageData.url)) {
                _context14.next = 24;
                break;
              }
              return _context14.abrupt("continue", 32);
            case 24:
              _context14.next = 26;
              return fabric__WEBPACK_IMPORTED_MODULE_1__.Image.fromURL(imageData.url);
            case 26:
              userImage = _context14.sent;
              // Set position and transformation
              userImage.set({
                left: imageData.transform.left * widthRatio,
                top: imageData.transform.top * heightRatio,
                scaleX: imageData.transform.scaleX,
                scaleY: imageData.transform.scaleY,
                angle: imageData.transform.angle || 0,
                originX: 'center',
                originY: 'center',
                clipPath: clipPath
              });

              // Apply dark/light shirt filters if needed
              isDarkShirt = variation.is_dark_shirt === true;
              if (isDarkShirt) {
                userImage.filters.push(new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.Contrast({
                  contrast: 0.15
                }), new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.BlendColor({
                  color: '#ffffff',
                  mode: 'screen',
                  alpha: 0.1
                }));
                userImage.set({
                  globalCompositeOperation: 'screen',
                  opacity: 0.95
                });
              } else {
                userImage.filters.push(new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.Brightness({
                  brightness: -0.05
                }), new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.Contrast({
                  contrast: 0.1
                }), new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.BlendColor({
                  color: '#ffffff',
                  mode: 'multiply',
                  alpha: 0.9
                }));
                userImage.set({
                  globalCompositeOperation: 'multiply',
                  opacity: 0.8
                });
              }
              userImage.applyFilters();
              tempCanvas.add(userImage);
            case 32:
              _context14.next = 20;
              break;
            case 34:
              _context14.next = 39;
              break;
            case 36:
              _context14.prev = 36;
              _context14.t0 = _context14["catch"](18);
              _iterator6.e(_context14.t0);
            case 39:
              _context14.prev = 39;
              _iterator6.f();
              return _context14.finish(39);
            case 42:
              tempCanvas.renderAll();
              return _context14.abrupt("return", tempCanvas.toDataURL({
                format: 'png',
                quality: 0.8
              }));
            case 44:
              _context14.prev = 44;
              tempCanvas.dispose();
              return _context14.finish(44);
            case 47:
            case "end":
              return _context14.stop();
          }
        }, _callee14, this, [[2,, 44, 47], [18, 36, 39, 42]]);
      }));
      function captureCanvasPreview() {
        return _captureCanvasPreview.apply(this, arguments);
      }
      return captureCanvasPreview;
    }()
  }, {
    key: "captureAllViewsPreviews",
    value: function () {
      var _captureAllViewsPreviews = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
        var template, variation, originalView, previews, _iterator7, _step7, _step7$value, viewId, view, previewDataUrl, blob;
        return _regeneratorRuntime().wrap(function _callee15$(_context15) {
          while (1) switch (_context15.prev = _context15.next) {
            case 0:
              // Get the current template and variation
              template = this.templates.get(this.activeTemplateId);
              console.log(template);
              if (template) {
                _context15.next = 4;
                break;
              }
              return _context15.abrupt("return", {});
            case 4:
              variation = template.variations.get(this.currentVariation.toString());
              console.log(variation);
              if (variation) {
                _context15.next = 8;
                break;
              }
              return _context15.abrupt("return", {});
            case 8:
              // Store the current view so we can restore it later
              originalView = this.currentView; // Object to store all previews
              previews = {}; // Capture preview for each view
              _iterator7 = _createForOfIteratorHelper(variation.views);
              _context15.prev = 11;
              _iterator7.s();
            case 13:
              if ((_step7 = _iterator7.n()).done) {
                _context15.next = 27;
                break;
              }
              _step7$value = _slicedToArray(_step7.value, 2), viewId = _step7$value[0], view = _step7$value[1];
              // Set current view to capture
              this.currentView = viewId;

              // Capture the preview
              _context15.next = 18;
              return this.captureCanvasPreview();
            case 18:
              previewDataUrl = _context15.sent;
              _context15.next = 21;
              return fetch(previewDataUrl);
            case 21:
              _context15.next = 23;
              return _context15.sent.blob();
            case 23:
              blob = _context15.sent;
              // Store the preview
              previews[viewId] = {
                viewId: viewId,
                viewName: view.name,
                blob: blob
              };
            case 25:
              _context15.next = 13;
              break;
            case 27:
              _context15.next = 32;
              break;
            case 29:
              _context15.prev = 29;
              _context15.t0 = _context15["catch"](11);
              _iterator7.e(_context15.t0);
            case 32:
              _context15.prev = 32;
              _iterator7.f();
              return _context15.finish(32);
            case 35:
              // Restore the original view
              this.currentView = originalView;
              return _context15.abrupt("return", previews);
            case 37:
            case "end":
              return _context15.stop();
          }
        }, _callee15, this, [[11, 29, 32, 35]]);
      }));
      function captureAllViewsPreviews() {
        return _captureAllViewsPreviews.apply(this, arguments);
      }
      return captureAllViewsPreviews;
    }()
  }]);
}();

// ❌ REDUNDANT INITIALIZATION REMOVED: Handled by Gatekeeper system
// document.addEventListener('DOMContentLoaded', function () {
//   new DesignerWidget();
// });

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"public/js/dist/designer": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkocto_print_designer"] = self["webpackChunkocto_print_designer"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["public/js/dist/common","public/js/dist/vendor"], () => (__webpack_require__("./public/js/src/Designer.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/
/******/ 	// 🚀 GLOBAL EXPOSURE FIX: Expose DesignerWidget globally
/******/ 	if (__webpack_exports__ && __webpack_exports__.DesignerWidget) {
/******/ 		window.DesignerWidget = __webpack_exports__.DesignerWidget;
/******/ 		console.log("✅ WEBPACK FIX: DesignerWidget exposed globally from bundle");
/******/
/******/ 		// 🎯 GATEKEEPER SOLUTION: Auto-create instance and fire ready event
/******/ 		function waitForCanvasElement() {
/******/ 			const canvasElement = document.querySelector('#octo-print-designer-canvas');
/******/ 			if (canvasElement) {
/******/ 				try {
/******/ 					const instance = new window.DesignerWidget();
/******/ 					window.designerWidgetInstance = instance;
/******/ 					console.log("✅ TIMING FIX: DesignerWidget created with canvas element available");
/******/
/******/ 					// Fire the designerReady event to signal all dependent scripts
/******/ 					document.dispatchEvent(new CustomEvent('designerReady', {
/******/ 						detail: { instance: instance }
/******/ 					}));
/******/ 					console.log("🚀 GATEKEEPER: designerReady event fired - dependent scripts can now initialize");
/******/ 				} catch (error) {
/******/ 					console.error("❌ GATEKEEPER: Failed to create DesignerWidget instance:", error);
/******/ 					// Retry with fallback after short delay
/******/ 					setTimeout(waitForCanvasElement, 50);
/******/ 				}
/******/ 			} else {
/******/ 				console.log("⏳ TIMING FIX: Canvas element not ready, retrying...");
/******/ 				setTimeout(waitForCanvasElement, 10);
/******/ 			}
/******/ 		}
/******/ 		waitForCanvasElement();
/******/ 	}
/******/
/******/
/******/ 	// 🛡️ ERROR RESILIENCE ENGINEER: Global UI-Stability Safeguards
/******/ 	window.addEventListener('error', function(event) {
/******/ 		console.warn('⚠️ RESILIENCE: Global JavaScript error intercepted:', event.error);
/******/
/******/ 		// Prevent UI crashes from unhandled errors
/******/ 		if (event.error && event.error.message) {
/******/ 			if (event.error.message.includes('DesignerWidget') ||
/******/ 				event.error.message.includes('canvas') ||
/******/ 				event.error.message.includes('fabric')) {
/******/ 				console.error('❌ RESILIENCE: Critical designer error detected, attempting recovery');
/******/
/******/ 				// Try to recover DesignerWidget if it exists
/******/ 				if (window.designerWidgetInstance && window.designerWidgetInstance.toastManager) {
/******/ 					window.designerWidgetInstance.toastManager.show(
/******/ 						'An error occurred - the designer is attempting to recover',
/******/ 						'error',
/******/ 						{ duration: 3000 }
/******/ 					);
/******/ 				}
/******/
/******/ 				// Prevent error propagation that could crash UI
/******/ 				event.preventDefault();
/******/ 				return false;
/******/ 			}
/******/ 		}
/******/ 	});
/******/
/******/ 	// 🛡️ RESILIENCE: Unhandled Promise Rejection Handler
/******/ 	window.addEventListener('unhandledrejection', function(event) {
/******/ 		console.warn('⚠️ RESILIENCE: Unhandled promise rejection intercepted:', event.reason);
/******/
/******/ 		// Prevent UI crashes from unhandled promise rejections
/******/ 		if (event.reason && (
/******/ 			event.reason.message?.includes('Network response was not ok') ||
/******/ 			event.reason.message?.includes('Error loading') ||
/******/ 			event.reason.message?.includes('Error saving') ||
/******/ 			event.reason.message?.includes('Error uploading') ||
/******/ 			event.reason.message?.includes('Error deleting')
/******/ 		)) {
/******/ 			console.error('❌ RESILIENCE: Network/API promise rejection intercepted');
/******/
/******/ 			// Show user-friendly notification if possible
/******/ 			if (window.designerWidgetInstance && window.designerWidgetInstance.toastManager) {
/******/ 				window.designerWidgetInstance.toastManager.show(
/******/ 					'Connection issue detected - please check your network',
/******/ 					'warning',
/******/ 					{ duration: 4000 }
/******/ 				);
/******/ 			}
/******/
/******/ 			// Prevent unhandled rejection from crashing UI
/******/ 			event.preventDefault();
/******/ 		}
/******/ 	});
/******/
/******/ 	console.log("🛡️ RESILIENCE: Global error safeguards activated for UI stability");
/******/ })()
;
//# sourceMappingURL=designer.bundle.js.map