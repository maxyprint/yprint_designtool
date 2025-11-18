/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./admin/js/src/components/PricingManager.js":
/*!***************************************************!*\
  !*** ./admin/js/src/components/PricingManager.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PricingManager: () => (/* binding */ PricingManager)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var PricingManager = /*#__PURE__*/function () {
  function PricingManager() {
    _classCallCheck(this, PricingManager);
    this.container = document.getElementById('template-pricing-container');
    if (!this.container) return;
    this.table = this.container.querySelector('.template-pricing-table tbody');
    this.addButton = this.container.querySelector('.add-pricing-rule');
    this.template = document.getElementById('pricing-rule-template');
    this.init();
  }
  return _createClass(PricingManager, [{
    key: "init",
    value: function init() {
      var _this = this;
      this.addButton.addEventListener('click', function () {
        return _this.addRule();
      });
      this.table.addEventListener('click', function (e) {
        if (e.target.matches('.remove-pricing-rule')) {
          _this.removeRule(e.target.closest('tr'));
        }
      });

      // Update name attributes when rows are added/removed
      this.table.addEventListener('change', function () {
        return _this.reindexRules();
      });
    }
  }, {
    key: "addRule",
    value: function addRule() {
      var index = this.table.children.length;
      var template = this.template.innerHTML.replace(/{index}/g, index);
      this.table.insertAdjacentHTML('beforeend', template);
      this.reindexRules();
    }
  }, {
    key: "removeRule",
    value: function removeRule(row) {
      row.remove();
      this.reindexRules();
    }
  }, {
    key: "reindexRules",
    value: function reindexRules() {
      Array.from(this.table.children).forEach(function (row, index) {
        row.querySelectorAll('input').forEach(function (input) {
          var name = input.getAttribute('name');
          input.setAttribute('name', name.replace(/\[\d+\]/, "[".concat(index, "]")));
        });
      });
    }
  }]);
}();

/***/ }),

/***/ "./admin/js/src/components/SizesManager.js":
/*!*************************************************!*\
  !*** ./admin/js/src/components/SizesManager.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SizesManager: () => (/* binding */ SizesManager)
/* harmony export */ });
/* harmony import */ var _utils_ErrorHandler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/ErrorHandler */ "./admin/js/src/utils/ErrorHandler.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var SizesManager = /*#__PURE__*/function () {
  function SizesManager() {
    _classCallCheck(this, SizesManager);
    this.container = document.getElementById('template-sizes-container');
    if (!this.container) return;
    this.sizesList = this.container.querySelector('.sizes-list');
    this.addButton = this.container.querySelector('.add-size');
    this.init();
  }
  return _createClass(SizesManager, [{
    key: "init",
    value: function init() {
      var _this = this;
      if (this.addButton) {
        this.addButton.addEventListener('click', function () {
          return _this.addSize();
        });
      }
      if (this.sizesList) {
        this.sizesList.addEventListener('click', function (e) {
          if (e.target.classList.contains('remove-size')) {
            _this.removeSize(e.target.closest('.size-item'));
          }
        });

        // Make sizes sortable
        if (window.jQuery && window.jQuery.ui) {
          window.jQuery(this.sizesList).sortable({
            items: '.size-item',
            handle: '.dashicons-move',
            axis: 'y',
            update: function update() {
              return _this.updateSizeOrders();
            }
          });
        }

        // Add validation listeners
        this.sizesList.addEventListener('input', function (e) {
          if (e.target.matches('input[name*="[id]"]')) {
            _this.validateSizeId(e.target);
          }
        });
      }
    }
  }, {
    key: "addSize",
    value: function addSize() {
      try {
        var index = this.sizesList.children.length;
        var sizeItem = this.createSizeElement(index);
        this.sizesList.appendChild(sizeItem);
        this.updateSizeOrders();
      } catch (error) {
        _utils_ErrorHandler__WEBPACK_IMPORTED_MODULE_0__.ErrorHandler.handle(error, 'Add Size');
      }
    }
  }, {
    key: "createSizeElement",
    value: function createSizeElement(index) {
      var div = document.createElement('div');
      div.className = 'size-item';
      div.dataset.index = index;
      div.innerHTML = "\n            <span class=\"dashicons dashicons-move\"></span>\n            <input type=\"text\" \n                   name=\"sizes[".concat(index, "][id]\" \n                   placeholder=\"").concat(window.wp.i18n.__('Size ID (e.g., S, M, L)', 'octo-print-designer'), "\" \n                   pattern=\"[A-Za-z0-9_-]+\"\n                   required>\n            <input type=\"text\" \n                   name=\"sizes[").concat(index, "][name]\" \n                   placeholder=\"").concat(window.wp.i18n.__('Size Name', 'octo-print-designer'), "\"\n                   required>\n            <input type=\"number\" \n                   name=\"sizes[").concat(index, "][order]\" \n                   value=\"").concat(index, "\"\n                   class=\"small-text\"\n                   min=\"0\">\n            <button type=\"button\" class=\"button remove-size\">\n                ").concat(window.wp.i18n.__('Remove', 'octo-print-designer'), "\n            </button>\n        ");
      return div;
    }
  }, {
    key: "removeSize",
    value: function removeSize(sizeItem) {
      try {
        var sizeId = sizeItem.querySelector('input[name*="[id]"]').value;

        // Check if this size is being used in any variations
        var variationsContainer = document.getElementById('template-variations-container');
        if (variationsContainer) {
          var usedInVariation = Array.from(variationsContainer.querySelectorAll("input[name*=\"[available_sizes][]\"][value=\"".concat(sizeId, "\"]:checked")));
          if (usedInVariation.length > 0) {
            if (!confirm(window.wp.i18n.__('This size is used in one or more variations. Removing it will also remove it from those variations. Continue?', 'octo-print-designer'))) {
              return;
            }
            // Remove size from variations
            usedInVariation.forEach(function (checkbox) {
              checkbox.checked = false;
            });
          }
        }
        sizeItem.remove();
        this.reindexSizes();
        this.updateSizeOrders();
      } catch (error) {
        _utils_ErrorHandler__WEBPACK_IMPORTED_MODULE_0__.ErrorHandler.handle(error, 'Remove Size');
      }
    }
  }, {
    key: "reindexSizes",
    value: function reindexSizes() {
      Array.from(this.sizesList.children).forEach(function (item, index) {
        item.dataset.index = index;
        var inputs = item.querySelectorAll('input');
        inputs.forEach(function (input) {
          var name = input.getAttribute('name');
          if (name) {
            input.setAttribute('name', name.replace(/sizes\[\d+\]/, "sizes[".concat(index, "]")));
          }
        });
      });
    }
  }, {
    key: "updateSizeOrders",
    value: function updateSizeOrders() {
      Array.from(this.sizesList.children).forEach(function (item, index) {
        var orderInput = item.querySelector('input[name*="[order]"]');
        if (orderInput) {
          orderInput.value = index;
        }
      });
    }
  }, {
    key: "validateSizeId",
    value: function validateSizeId(input) {
      // Remove any invalid characters
      input.value = input.value.replace(/[^A-Za-z0-9_-]/g, '');

      // Check for duplicates
      var sizeIds = Array.from(this.sizesList.querySelectorAll('input[name*="[id]"]')).map(function (input) {
        return input.value;
      }).filter(Boolean);
      var duplicates = sizeIds.filter(function (id, index) {
        return sizeIds.indexOf(id) !== index;
      });
      if (duplicates.includes(input.value)) {
        input.setCustomValidity(window.wp.i18n.__('This size ID is already in use', 'octo-print-designer'));
      } else {
        input.setCustomValidity('');
      }
    }
  }]);
}();

/***/ }),

/***/ "./admin/js/src/components/TemplateEditor.js":
/*!***************************************************!*\
  !*** ./admin/js/src/components/TemplateEditor.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TemplateEditor: () => (/* binding */ TemplateEditor)
/* harmony export */ });
/* harmony import */ var fabric__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fabric */ "./node_modules/fabric/dist/index.min.mjs");
/* harmony import */ var _utils_MediaUploader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/MediaUploader */ "./admin/js/src/utils/MediaUploader.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


var TemplateEditor = /*#__PURE__*/function () {
  function TemplateEditor($container) {
    _classCallCheck(this, TemplateEditor);
    this.$container = $container;
    this.eventListeners = new Map();
    this.initialize();
    this.changeSelectionMode('image');
  }
  return _createClass(TemplateEditor, [{
    key: "initialize",
    value: function initialize() {
      this.setupToolbar();
      this.initializeEditor();
      this.initializeToolbar();
      this.bindCanvasEvents();
    }
  }, {
    key: "initializeEditor",
    value: function initializeEditor() {
      var $editorContainer = this.$editorContainer = this.$container.querySelector('.template-canvas-container');
      var $canvas = document.createElement('canvas');
      $editorContainer.appendChild($canvas);
      this.canvas = new fabric__WEBPACK_IMPORTED_MODULE_1__.Canvas($canvas, {
        width: 800,
        height: 500,
        backgroundColor: '#f0f0f0',
        preserveObjectStacking: true
      });

      // 🎯 FABRIC.JS GLOBAL EXPOSURE - Clean Bundle Patch by 16-Agent Hierarchical Swarm
      // Validated by: Bundle-Code-Inspector, Cross-Browser-Compatibility-Expert, Performance-Quality-Auditor
      if (!window.fabric && typeof fabric__WEBPACK_IMPORTED_MODULE_1__ !== 'undefined') {
        try {
          console.log('🎯 FABRIC EXPOSURE: Clean bundle patch - exposing fabric globally');

          // Assign fabric module to global scope with error handling
          window.fabric = fabric__WEBPACK_IMPORTED_MODULE_1__;

          // Validate successful exposure
          if (window.fabric && typeof window.fabric.Canvas === 'function') {
            console.log('✅ FABRIC EXPOSURE: window.fabric successfully available');

            // Dispatch clean event for cross-system communication
            if (typeof window.CustomEvent === 'function') {
              window.dispatchEvent(new CustomEvent('fabricGlobalReady', {
                detail: {
                  fabric: window.fabric,
                  source: 'clean-bundle-patch',
                  timestamp: Date.now(),
                  canvas: this.canvas
                }
              }));
            }

            // Fallback for legacy systems
            if (typeof window.dispatchEvent === 'function') {
              window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                detail: {
                  canvas: this.canvas,
                  source: 'clean-bundle-patch'
                }
              }));
            }
          } else {
            console.warn('⚠️ FABRIC EXPOSURE: window.fabric assigned but Canvas not available');
          }
        } catch (error) {
          console.error('❌ FABRIC EXPOSURE: Bundle patch failed:', error);
        }
      } else if (window.fabric) {
        console.log('✅ FABRIC EXPOSURE: window.fabric already available, skipping patch');
      } else {
        console.warn('⚠️ FABRIC EXPOSURE: fabric__WEBPACK_IMPORTED_MODULE_1__ not available');
      }

      this.initializeSafeZone();
    }
  }, {
    key: "initializeSafeZone",
    value: function initializeSafeZone() {
      this.safeZone = new fabric__WEBPACK_IMPORTED_MODULE_1__.Rect({
        width: 200,
        height: 200,
        fill: 'rgba(0, 124, 186, 0.2)',
        stroke: '#007cba',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        lockRotation: true,
        transparentCorners: false,
        cornerColor: '#007cba',
        cornerSize: 10,
        cornerStyle: 'circle',
        originX: 'center',
        originY: 'center',
        centeredScaling: true,
        left: this.canvas.width / 2,
        top: this.canvas.height / 2
      });
      this.canvas.add(this.safeZone);
      if (this.state) {
        this.setState({
          safeZone: {
            left: this.canvas.width / 2 / this.canvas.width * 100,
            top: this.canvas.height / 2 / this.canvas.height * 100,
            width: 200,
            height: 200
          }
        });
      }
    }

    // Event System
  }, {
    key: "on",
    value: function on(eventName, callback) {
      var _this = this;
      if (!this.eventListeners.has(eventName)) {
        this.eventListeners.set(eventName, new Set());
      }
      this.eventListeners.get(eventName).add(callback);
      return function () {
        return _this.off(eventName, callback);
      }; // Return unsubscribe function
    }
  }, {
    key: "off",
    value: function off(eventName, callback) {
      if (this.eventListeners.has(eventName)) {
        this.eventListeners.get(eventName)["delete"](callback);
      }
    }
  }, {
    key: "emit",
    value: function emit(eventName, data) {
      if (this.eventListeners.has(eventName)) {
        this.eventListeners.get(eventName).forEach(function (callback) {
          return callback(data);
        });
      }
    }
  }, {
    key: "bindCanvasEvents",
    value: function bindCanvasEvents() {
      var _this2 = this;
      this.canvas.on({
        'object:moving': function objectMoving(e) {
          var _this2$imageToolbar;
          _this2.emit('stateChange', _this2.updateState());
          if ((_this2$imageToolbar = _this2.imageToolbar) !== null && _this2$imageToolbar !== void 0 && _this2$imageToolbar.classList.contains('visible')) {
            _this2.updateToolbarPosition();
          }
        },
        'object:scaling': function objectScaling(e) {
          var _this2$imageToolbar2;
          _this2.emit('stateChange', _this2.updateState());
          if ((_this2$imageToolbar2 = _this2.imageToolbar) !== null && _this2$imageToolbar2 !== void 0 && _this2$imageToolbar2.classList.contains('visible')) {
            var obj = e.target;
            _this2.widthInput.value = Math.round(obj.width * obj.scaleX);
            _this2.heightInput.value = Math.round(obj.height * obj.scaleY);
            _this2.updateToolbarPosition();
          }
        },
        'object:rotating': function objectRotating(e) {
          var _this2$imageToolbar3;
          _this2.emit('stateChange', _this2.updateState());
          if ((_this2$imageToolbar3 = _this2.imageToolbar) !== null && _this2$imageToolbar3 !== void 0 && _this2$imageToolbar3.classList.contains('visible')) {
            _this2.updateToolbarPosition();
          }
        },
        'object:modified': function objectModified(e) {
          _this2.emit('stateChange', _this2.updateState());
        },
        'selection:created': function selectionCreated(e) {
          if (e.selected[0] === _this2.backgroundImage) {
            _this2.showToolbar();
          }
        },
        'selection:cleared': function selectionCleared() {
          _this2.hideToolbar();
        },
        'selection:updated': function selectionUpdated(e) {
          if (e.target === _this2.backgroundImage) {
            _this2.showToolbar();
          } else {
            _this2.hideToolbar();
          }
        }
      });
    }
  }, {
    key: "loadImage",
    value: function () {
      var _loadImage = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(imageId) {
        var _this3 = this;
        var imageUrl, imgElement;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _utils_MediaUploader__WEBPACK_IMPORTED_MODULE_0__.MediaUploader.getImageUrl(imageId);
            case 2:
              imageUrl = _context.sent;
              imgElement = new window.Image();
              imgElement.crossOrigin = 'anonymous';
              _context.next = 7;
              return new Promise(function (resolve, reject) {
                imgElement.onload = function () {
                  _this3.onImageLoadFinished(imgElement);
                  resolve();
                };
                imgElement.onerror = reject;
                imgElement.src = imageUrl;
              });
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function loadImage(_x) {
        return _loadImage.apply(this, arguments);
      }
      return loadImage;
    }()
  }, {
    key: "onImageLoadFinished",
    value: function onImageLoadFinished($image) {
      this.loadedImage = $image;

      // Center the image on load
      var canvasCenter = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      };

      // Calculate scale to fit canvas while maintaining aspect ratio
      var scale = Math.min(this.canvas.width * 0.8 / $image.width, this.canvas.height * 0.8 / $image.height);
      this.renderImage(canvasCenter, scale);
    }
  }, {
    key: "renderImage",
    value: function renderImage() {
      var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      if (!this.loadedImage) return;
      if (this.backgroundImage) this.canvas.remove(this.backgroundImage);
      var imageCanvas = this.getImageCanvas();
      var fabricImage = new fabric__WEBPACK_IMPORTED_MODULE_1__.Image(imageCanvas);
      var left = this.canvas.width / 2;
      var top = this.canvas.height / 2;
      if (this.state.imageZone) {
        left = this.state.imageZone.left * this.canvas.width / 100;
        top = this.state.imageZone.top * this.canvas.height / 100;
      }

      // Configure image properties
      fabricImage.set(_objectSpread(_objectSpread({}, this.state.imageZone), {}, {
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: false,
        cornerStyle: 'circle',
        cornerColor: '#007cba',
        cornerSize: 10,
        transparentCorners: false,
        centeredScaling: true,
        originX: 'center',
        originY: 'center',
        left: left,
        top: top
      }));
      if (this.state.colorOverlayEnabled) {
        fabricImage.filters.push(new fabric__WEBPACK_IMPORTED_MODULE_1__.filters.BlendColor({
          color: this.state.overlayColor,
          mode: 'multiply',
          alpha: this.state.overlayOpacity || 0.5
        }));
        fabricImage.applyFilters();
      }
      this.backgroundImage = fabricImage;
      this.canvas.remove(this.safeZone);

      // Add objects in correct order
      this.canvas.add(fabricImage);
      this.canvas.add(this.safeZone);

      // Set coordinates and interactivity
      fabricImage.setCoords();
      this.safeZone.setCoords();
      fabricImage.selectable = this.activeMode === 'image';
      fabricImage.evented = this.activeMode === 'image';
      this.canvas.requestRenderAll();
      this.emit('stateChange', this.updateState());
      this.updateObjectsSelectability();
    }
  }, {
    key: "getImageCanvas",
    value: function getImageCanvas() {
      // Create main rendering canvas
      var $renderingCanvas = document.createElement('canvas');
      var renderContext = $renderingCanvas.getContext('2d');
      $renderingCanvas.width = this.loadedImage.width;
      $renderingCanvas.height = this.loadedImage.height;

      // Draw original image
      renderContext.drawImage(this.loadedImage, 0, 0);
      return $renderingCanvas;
    }
  }, {
    key: "setColor",
    value: function setColor(color) {
      this.overlayColor = color;
      this.renderImage();
      this.emit('stateChange', state);
    }
  }, {
    key: "setOpacity",
    value: function setOpacity(opacity) {
      this.opacity = opacity;
      this.renderImage();
    }
  }, {
    key: "zoom",
    value: function zoom(factor) {
      var zoom = this.canvas.getZoom() * factor;
      zoom = Math.min(Math.max(0.1, zoom), 5);
      var center = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      };
      this.canvas.zoomToPoint(center, zoom);
    }
  }, {
    key: "resetView",
    value: function resetView() {
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    }
  }, {
    key: "changeSelectionMode",
    value: function changeSelectionMode(mode) {
      this.selectionMode = mode;
      var _iterator = _createForOfIteratorHelper(this.$changeModeButtons),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var $button = _step.value;
          $button.classList.toggle('active', mode == $button.dataset.mode);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.updateObjectsSelectability();
    }
  }, {
    key: "updateObjectsSelectability",
    value: function updateObjectsSelectability() {
      // Update safe zone selectability
      if (this.safeZone) {
        this.safeZone.selectable = this.selectionMode === 'safezone';
        this.safeZone.evented = this.selectionMode === 'safezone';
      }

      // Update background image selectability
      if (this.backgroundImage) {
        this.backgroundImage.selectable = this.selectionMode === 'image';
        this.backgroundImage.evented = this.selectionMode === 'image';
        this.backgroundImage.hasControls = this.selectionMode === 'image';
        this.backgroundImage.hasBorders = this.selectionMode === 'image';
      }
    }
  }, {
    key: "setupToolbar",
    value: function setupToolbar() {
      var _this4 = this;
      var $toolbar = this.$container.querySelector('.template-editor-toolbar');
      this.$changeModeButtons = $toolbar.querySelectorAll('.mode-select');
      var _iterator2 = _createForOfIteratorHelper(this.$changeModeButtons),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var $button = _step2.value;
          $button.addEventListener('click', function (e) {
            _this4.changeSelectionMode(e.currentTarget.dataset.mode);
          });
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var $zoomInButton = $toolbar.querySelector('.zoomIn');
      $zoomInButton.addEventListener('click', function () {
        return _this4.zoom(1.1);
      });
      var $zoomOutButton = $toolbar.querySelector('.zoomOut');
      $zoomOutButton.addEventListener('click', function () {
        return _this4.zoom(0.9);
      });
      var $resetZoomButton = $toolbar.querySelector('.resetZoom');
      $resetZoomButton.addEventListener('click', function () {
        return _this4.resetView();
      });
      var $resetImageButton = $toolbar.querySelector('.resetImage');
      $resetImageButton.addEventListener('click', function () {
        return _this4.resetImage();
      });
      var $resetSafeZoneButton = $toolbar.querySelector('.resetSafeZone');
      $resetSafeZoneButton.addEventListener('click', function () {
        return _this4.resetSafeZone();
      });
    }
  }, {
    key: "resetImage",
    value: function resetImage() {
      if (!this.originalState) return;
      this.setState(this.originalState);
    }
  }, {
    key: "resetSafeZone",
    value: function resetSafeZone() {
      if (this.safeZone) this.canvas.remove(this.safeZone);
      this.initializeSafeZone();
    }
  }, {
    key: "updateState",
    value: function updateState() {
      var _this$state;
      if (!this.canvas) return null;
      var state = {
        safeZone: {
          left: this.safeZone.left / this.canvas.width * 100,
          top: this.safeZone.top / this.canvas.height * 100,
          width: Math.round(this.safeZone.getScaledWidth()),
          height: Math.round(this.safeZone.getScaledHeight())
        }
      };
      if (this.backgroundImage) {
        state.imageZone = {
          left: this.backgroundImage.left / this.canvas.width * 100,
          top: this.backgroundImage.top / this.canvas.height * 100,
          scaleX: this.backgroundImage.scaleX,
          scaleY: this.backgroundImage.scaleY,
          angle: this.backgroundImage.angle
        };
      }
      this.state = Object.assign((_this$state = this.state) !== null && _this$state !== void 0 ? _this$state : {}, state);
      return state;
    }
  }, {
    key: "setState",
    value: function () {
      var _setState = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(state) {
        var _this$state2;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              //Merge current state with the new one
              if (!this.state) this.originalState = Object.assign({}, state);
              this.state = Object.assign((_this$state2 = this.state) !== null && _this$state2 !== void 0 ? _this$state2 : {}, state);
              if (state.safeZone) this.setSafeZoneAttributes(state.safeZone);
              if (state.imageZone) this.setImageZoneAttributes(state.imageZone);
              if (!state.image) {
                _context2.next = 7;
                break;
              }
              _context2.next = 7;
              return this.loadImage(state.image);
            case 7:
              if ((state.overlayColor != undefined || state.overlayOpacity != undefined || state.colorOverlayEnabled != undefined) && !state.image) this.renderImage();
              this.emit('stateChange', this.state);
              this.canvas.requestRenderAll();
            case 10:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function setState(_x2) {
        return _setState.apply(this, arguments);
      }
      return setState;
    }()
  }, {
    key: "setSafeZoneAttributes",
    value: function setSafeZoneAttributes(attributes) {
      var finalAttributes = Object.assign({}, attributes);
      if (attributes.left) finalAttributes.left = attributes.left * this.canvas.width / 100;
      if (attributes.top) finalAttributes.top = attributes.top * this.canvas.height / 100;
      this.safeZone.set(finalAttributes);
      this.safeZone.setCoords();
    }
  }, {
    key: "setImageZoneAttributes",
    value: function setImageZoneAttributes(attributes) {
      if (!this.backgroundImage) return;
      var finalAttributes = Object.assign({}, attributes);
      if (attributes.left) finalAttributes.left = attributes.left * this.canvas.width / 100;
      if (attributes.top) finalAttributes.top = attributes.top * this.canvas.height / 100;
      this.backgroundImage.set(finalAttributes);
      this.backgroundImage.setCoords();
    }
  }, {
    key: "initializeToolbar",
    value: function initializeToolbar() {
      var _this5 = this;
      // Clone toolbar template
      var toolbarTemplate = document.getElementById('designer-image-toolbar-template');
      this.imageToolbar = toolbarTemplate.content.cloneNode(true).querySelector('.designer-image-toolbar');
      this.$editorContainer.appendChild(this.imageToolbar);

      // Store references to inputs
      this.widthInput = this.imageToolbar.querySelector('.width-input');
      this.heightInput = this.imageToolbar.querySelector('.height-input');
      this.pixelToCmLabel = this.imageToolbar.querySelector('.pixel-to-cm');

      // Add toolbar button handlers
      this.imageToolbar.querySelector('.center-image').addEventListener('click', function (e) {
        var activeObject = _this5.canvas.getActiveObject();
        if (activeObject) {
          // Center the object on canvas
          activeObject.set({
            left: _this5.canvas.width / 2,
            top: _this5.canvas.height / 2
          });
          activeObject.setCoords();
          _this5.canvas.renderAll();

          // Update toolbar position
          _this5.updateToolbarPosition();
        }
        e.preventDefault();
      });

      // Add width/height input handlers
      this.widthInput.addEventListener('input', function (e) {
        return _this5.handleDimensionChange('width', e.target.value);
      });
      this.heightInput.addEventListener('input', function (e) {
        return _this5.handleDimensionChange('height', e.target.value);
      });

      // Update DPI conversion display
      this.updatePixelToCmConversion();
    }
  }, {
    key: "handleDimensionChange",
    value: function handleDimensionChange(dimension, value) {
      var activeObject = this.canvas.getActiveObject();
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
      activeObject.setCoords();
      this.canvas.renderAll();
      this.updateToolbarPosition();
      this.canvas.fire('object:modified', {
        target: activeObject
      });
    }
  }, {
    key: "updatePixelToCmConversion",
    value: function updatePixelToCmConversion() {
      var _window$octoPrintDesi;
      // Get DPI from WordPress settings
      var dpi = ((_window$octoPrintDesi = window.octoPrintDesigner) === null || _window$octoPrintDesi === void 0 ? void 0 : _window$octoPrintDesi.dpi) || 300; // Default to 300 if not set
      var pixelsPerCm = Math.round(dpi / 2.54); // 2.54 cm = 1 inch
      this.pixelToCmLabel.textContent = "1cm \u2248 ".concat(pixelsPerCm, "px");
    }
  }, {
    key: "showToolbar",
    value: function showToolbar() {
      var activeObject = this.canvas.getActiveObject();
      if (!activeObject) return;

      // Update dimension inputs
      this.widthInput.value = Math.round(activeObject.width * activeObject.scaleX);
      this.heightInput.value = Math.round(activeObject.height * activeObject.scaleY);
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
      var activeObject = this.canvas.getActiveObject();
      if (!activeObject) return;

      // Get canvas container rect
      var containerRect = this.canvas.wrapperEl.getBoundingClientRect();

      // Get object coordinates relative to canvas
      var objCoords = activeObject.getBoundingRect();
      var zoom = this.canvas.getZoom();
      var pan = this.canvas.viewportTransform;

      // Calculate absolute position considering zoom and pan
      var absoluteLeft = objCoords.left * zoom + pan[4];
      var absoluteTop = objCoords.top * zoom + pan[5];
      var absoluteWidth = objCoords.width * zoom;

      // Position the toolbar relative to the canvas container
      this.imageToolbar.style.left = "".concat(absoluteLeft + absoluteWidth / 2, "px");
      this.imageToolbar.style.top = "".concat(absoluteTop - this.imageToolbar.offsetHeight - 10, "px");
    }
  }]);
}();

/***/ }),

/***/ "./admin/js/src/components/VariationsManager.js":
/*!******************************************************!*\
  !*** ./admin/js/src/components/VariationsManager.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VariationsManager: () => (/* binding */ VariationsManager)
/* harmony export */ });
/* harmony import */ var _utils_MediaUploader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/MediaUploader */ "./admin/js/src/utils/MediaUploader.js");
/* harmony import */ var _utils_ErrorHandler__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/ErrorHandler */ "./admin/js/src/utils/ErrorHandler.js");
/* harmony import */ var _TemplateEditor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TemplateEditor */ "./admin/js/src/components/TemplateEditor.js");
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



var VariationsManager = /*#__PURE__*/function () {
  function VariationsManager() {
    _classCallCheck(this, VariationsManager);
    this.container = document.getElementById('template-variations-container');
    if (!this.container) return;
    this.storeElementReferences();
    this.editors = window.templateEditors = new Map();
    window.variationsManager = this;
    this.init();
  }
  return _createClass(VariationsManager, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _this = this;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.loadSizes();
            case 2:
              _context.next = 4;
              return this.loadVariations();
            case 4:
              this.initializeVariations();
              this.$addVariation.addEventListener('click', function () {
                return _this.addVariation();
              });
            case 6:
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
    key: "loadVariations",
    value: function () {
      var _loadVariations = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var response, data;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'get_template_variations',
                  nonce: octoPrintDesigner.nonce,
                  post_id: octoPrintDesigner.postId // Assuming you have postId as a class property
                })
              });
            case 3:
              response = _context2.sent;
              if (response.ok) {
                _context2.next = 6;
                break;
              }
              throw new Error('Network response was not ok');
            case 6:
              _context2.next = 8;
              return response.json();
            case 8:
              data = _context2.sent;
              if (!data.success) {
                _context2.next = 13;
                break;
              }
              this.variations = this.parseBackendVariations(data.data);
              _context2.next = 14;
              break;
            case 13:
              throw new Error(data.data || 'Error loading variations');
            case 14:
              _context2.next = 20;
              break;
            case 16:
              _context2.prev = 16;
              _context2.t0 = _context2["catch"](0);
              console.error('Error loading variations:', _context2.t0);
              _utils_ErrorHandler__WEBPACK_IMPORTED_MODULE_1__.ErrorHandler.handle(_context2.t0, 'Load Variations');
            case 20:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this, [[0, 16]]);
      }));
      function loadVariations() {
        return _loadVariations.apply(this, arguments);
      }
      return loadVariations;
    }()
  }, {
    key: "parseBackendVariations",
    value: function parseBackendVariations(variations) {
      var finalVariations = Object.entries(variations);
      for (var _i = 0, _finalVariations = finalVariations; _i < _finalVariations.length; _i++) {
        var _finalVariations$_i = _slicedToArray(_finalVariations[_i], 2),
          variationId = _finalVariations$_i[0],
          variation = _finalVariations$_i[1];
        if (!variation.views) continue;
        // eachVariation.views = new Map(Object.entries(eachVariation.view));
        variation.views = new Map(Object.entries(variation.views));
      }
      return new Map(finalVariations);
    }
  }, {
    key: "loadSizes",
    value: function () {
      var _loadSizes = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var response, data;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'get_template_sizes',
                  nonce: octoPrintDesigner.nonce,
                  post_id: octoPrintDesigner.postId // Assuming you have postId as a class property
                })
              });
            case 3:
              response = _context3.sent;
              if (response.ok) {
                _context3.next = 6;
                break;
              }
              throw new Error('Network response was not ok');
            case 6:
              _context3.next = 8;
              return response.json();
            case 8:
              data = _context3.sent;
              if (!data.success) {
                _context3.next = 13;
                break;
              }
              this.sizes = data.data;
              _context3.next = 14;
              break;
            case 13:
              throw new Error(data.data || 'Error loading sizes');
            case 14:
              _context3.next = 20;
              break;
            case 16:
              _context3.prev = 16;
              _context3.t0 = _context3["catch"](0);
              console.error('Error loading sizes:', _context3.t0);
              _utils_ErrorHandler__WEBPACK_IMPORTED_MODULE_1__.ErrorHandler.handle(_context3.t0, 'Load Sizes');
            case 20:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[0, 16]]);
      }));
      function loadSizes() {
        return _loadSizes.apply(this, arguments);
      }
      return loadSizes;
    }()
  }, {
    key: "storeElementReferences",
    value: function storeElementReferences() {
      this.tabsList = this.container.querySelector('.tabs-list');
      this.tabsContent = this.container.querySelector('.tabs-content');
      this.$addVariation = this.container.querySelector('.add-variation');
      this.variationTabButtonTemplate = document.querySelector('#designer-tab-button-template');
      this.variationItemTemplate = document.querySelector('#designer-variation-item-template');
      this.variationSizeItemTemplate = document.querySelector('#designer-variation-size-item-template');
      this.variationViewItemTemplate = document.querySelector('#designer-view-item-template');
      this.variationViewItemToolbarTemplate = document.querySelector('#designer-view-item-toolbar-template');
    }
  }, {
    key: "initializeSizes",
    value: function initializeSizes() {}
  }, {
    key: "initializeVariations",
    value: function initializeVariations() {
      var _iterator = _createForOfIteratorHelper(this.variations.entries()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            variationId = _step$value[0],
            variation = _step$value[1];
          this.initializeVariation(variationId);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "initializeVariation",
    value: function initializeVariation(variationId) {
      var $contentElement = this.createVariationContentElement();
      var $tabButton = this.createVariationTabButtonElement();
      var variation = this.variations.get(variationId);
      variation.elements = {
        '$tabButton': $tabButton,
        '$contentElement': $contentElement
      };
      if (variation.is_default) this.defaultVariationId = variationId;
      this.fillVariationTabButton(variationId);
      this.fillVariationContent(variationId);
    }
  }, {
    key: "createVariationTabButtonElement",
    value: function createVariationTabButtonElement() {
      var $element = this.variationTabButtonTemplate.content.cloneNode(true).querySelector('.tab-button');
      return $element;
    }
  }, {
    key: "createVariationContentElement",
    value: function createVariationContentElement() {
      var $element = this.variationItemTemplate.content.cloneNode(true).querySelector('.tab-content');
      return $element;
    }
  }, {
    key: "createVariationViewElement",
    value: function createVariationViewElement() {
      var $element = this.variationViewItemTemplate.content.cloneNode(true).querySelector('.view-item');
      return $element;
    }
  }, {
    key: "createSizeItemElement",
    value: function createSizeItemElement() {
      var $element = this.variationSizeItemTemplate.content.cloneNode(true).querySelector('.size-item');
      return $element;
    }
  }, {
    key: "fillVariationTabButton",
    value: function fillVariationTabButton(variationId) {
      var _this2 = this;
      var variation = this.variations.get(variationId);
      var $button = variation.elements.$tabButton;
      this.tabsList.insertBefore($button, this.$addVariation);
      var $colorPreview = $button.querySelector('.color-preview');
      var $defaultBadge = $button.querySelector('.default-badge');
      var $name = document.createTextNode(variation.name);
      $button.insertBefore($name, $defaultBadge);
      if (!variation.is_default) $defaultBadge.remove();
      $colorPreview.style.backgroundColor = variation.color_code;
      variation.elements.$buttonName = $name;
      $button.addEventListener('click', function () {
        _this2.switchTab(variationId);
      });
      variation.elements.$colorPreview = $colorPreview;
    }
  }, {
    key: "fillVariationContent",
    value: function fillVariationContent(variationId) {
      var _this3 = this;
      var variation = this.variations.get(variationId);
      if (!variation.views) variation.views = new Map();
      var $container = variation.elements.$contentElement;
      this.tabsContent.appendChild($container);
      var $nameInput = $container.querySelector('.variation-name input');
      $nameInput.name = "variations[".concat(variationId, "][name]");
      $nameInput.value = variation.name;
      var $colorInput = variation.elements.$colorInput = $container.querySelector('.variation-color input');
      $colorInput.name = "variations[".concat(variationId, "][color_code]");
      $colorInput.value = variation.color_code;

      // Add dark shirt checkbox handling
      var $darkShirtInput = variation.elements.$darkShirtInput = $container.querySelector('.variation-dark-shirt input');
      $darkShirtInput.name = "variations[".concat(variationId, "][is_dark_shirt]");
      $darkShirtInput.value = "1";
      $darkShirtInput.checked = variation.is_dark_shirt === true;
      var $dataElementIsDefault = document.createElement('input');
      $dataElementIsDefault.type = 'hidden';
      $dataElementIsDefault.name = "variations[".concat(variationId, "][is_default]");
      variation.elements.$contentElement.appendChild($dataElementIsDefault);
      $dataElementIsDefault.value = variation.is_default ? '1' : '0';
      var $removeButton = $container.querySelector('.remove-variation');
      $removeButton.addEventListener('click', function () {
        _this3.removeVariation(variationId);
      });
      variation.elements.$sizesContainer = $container.querySelector('.variation-sizes');
      this.addSizesToVariation(variationId);
      var $addView = $container.querySelector('.add-view');
      if (variation.is_default) {
        $addView.addEventListener('click', function () {
          var newViewID = _this3.addView(variationId);
          _this3.propagateDefaultVariationViewAddition(newViewID);
        });
        $removeButton.remove();
      } else {
        $addView.remove();
      }
      variation.elements.$viewsContainer = $container.querySelector('.views-list');
      var _iterator2 = _createForOfIteratorHelper(variation.views),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            viewId = _step2$value[0],
            view = _step2$value[1];
          this.initializeViewEditor(viewId, variationId);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      $colorInput.addEventListener('input', function () {
        variation.elements.$colorPreview.style.backgroundColor = $colorInput.value;
      });
    }
  }, {
    key: "addSizesToVariation",
    value: function addSizesToVariation(variationId) {
      for (var sizeIndex in this.sizes) {
        var variation = this.variations.get(variationId);
        var $sizeItem = this.createSizeItemElement();
        variation.elements.$sizesContainer.appendChild($sizeItem);
        var $sizeInput = $sizeItem.querySelector('input');
        $sizeInput.name = "variations[".concat(variationId, "][available_sizes][]");
        $sizeInput.value = this.sizes[sizeIndex].id;
        var $sizeName = document.createTextNode(this.sizes[sizeIndex].name);
        $sizeItem.appendChild($sizeName);
        $sizeInput.checked = variation.available_sizes.includes(this.sizes[sizeIndex].id);
        console.log(sizeIndex, this.sizes[sizeIndex]);
      }
    }
  }, {
    key: "initializeViewEditor",
    value: function () {
      var _initializeViewEditor = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(viewId, variationId) {
        var _this4 = this;
        var variation, editorKey, viewItem, $viewElement, $viewDataContainer, inputPrefix, $dataElementImage, $dataElementUseDefault, $dataElementOverlayEnabled, $dataElementOverlayOpacity, $dataElementName, $dataElementSafeZone, $dataElementImageZone, $safeZoneEditor, editor;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              variation = this.variations.get(variationId);
              editorKey = "".concat(variationId, "-").concat(viewId);
              viewItem = variation.views.get(viewId);
              $viewElement = this.createVariationViewElement();
              variation.elements.$viewsContainer.appendChild($viewElement);
              $viewDataContainer = $viewElement.querySelector('.data-container');
              viewItem.elements = {
                '$container': $viewElement,
                '$name': $viewElement.querySelector('h4'),
                '$nameInput': $viewElement.querySelector('input'),
                '$removeButton': $viewElement.querySelector('.remove-view'),
                '$useDefaultToggle': $viewElement.querySelector('.use-default-toggle input'),
                '$uploadImageButton': $viewElement.querySelector('.upload-image'),
                '$overlayTools': $viewElement.querySelector('.color-overlay-tools'),
                '$overlaySettings': $viewElement.querySelector('.overlay-settings'),
                '$overlayEnabledCheckbox': $viewElement.querySelector('.overlay-settings-enabled-checkbox'),
                '$overlayOpacityInput': $viewElement.querySelector('.overlay-settings input'),
                '$dataContainer': $viewElement.querySelector('.data-container')
              };
              viewItem.overlayColor = variation.elements.$colorInput.value;
              viewItem.elements.$name.innerText = viewItem.name;
              viewItem.elements.$nameInput.value = viewItem.name;
              viewItem.elements.$nameInput.name = "variations[".concat(variationId, "][views][").concat(viewId, "][name]");
              viewItem.elements.$useDefaultToggle.checked = viewItem.use_default;
              viewItem.elements.$uploadImageButton.classList.toggle('hidden', !viewItem.use_default);
              viewItem.elements.$uploadImageButton.addEventListener('click', function () {
                return _this4.uploadNewImageToView(variationId, viewId);
              });

              // Create the inputs to hold the state
              inputPrefix = "variations[".concat(variationId, "][views][").concat(viewId, "]");
              $dataElementImage = document.createElement('input');
              $dataElementImage.type = 'hidden';
              $dataElementImage.name = "".concat(inputPrefix, "[image]");
              viewItem.elements.$dataContainer.appendChild($dataElementImage);
              $dataElementUseDefault = $dataElementImage.cloneNode();
              $dataElementUseDefault.name = "".concat(inputPrefix, "[use_default]");
              viewItem.elements.$dataContainer.appendChild($dataElementUseDefault);
              $dataElementOverlayEnabled = $dataElementImage.cloneNode();
              $dataElementOverlayEnabled.name = "".concat(inputPrefix, "[colorOverlayEnabled]");
              viewItem.elements.$dataContainer.appendChild($dataElementOverlayEnabled);
              $dataElementOverlayOpacity = $dataElementImage.cloneNode();
              $dataElementOverlayOpacity.name = "".concat(inputPrefix, "[overlay_opacity]");
              viewItem.elements.$dataContainer.appendChild($dataElementOverlayOpacity);
              $dataElementName = $dataElementImage.cloneNode();
              $dataElementName.name = "".concat(inputPrefix, "[name]");
              viewItem.elements.$dataContainer.appendChild($dataElementName);
              $dataElementSafeZone = $dataElementImage.cloneNode();
              $dataElementSafeZone.name = "".concat(inputPrefix, "[safe_zone]");
              viewItem.elements.$dataContainer.appendChild($dataElementSafeZone);
              $dataElementImageZone = $dataElementImage.cloneNode();
              $dataElementImageZone.name = "".concat(inputPrefix, "[image_zone]");
              viewItem.elements.$dataContainer.appendChild($dataElementImageZone);
              viewItem.elements.$dataElementImage = $dataElementImage;
              viewItem.elements.$dataElementUseDefault = $dataElementUseDefault;
              viewItem.elements.$dataElementOverlayEnabled = $dataElementOverlayEnabled;
              viewItem.elements.$dataElementName = $dataElementName;
              viewItem.elements.$dataElementSafeZone = $dataElementSafeZone;
              viewItem.elements.$dataElementImageZone = $dataElementImageZone;
              viewItem.elements.$dataElementOverlayOpacity = $dataElementOverlayOpacity;
              $safeZoneEditor = $viewElement.querySelector('.safe-zone-editor');
              editor = viewItem.editor = new _TemplateEditor__WEBPACK_IMPORTED_MODULE_2__.TemplateEditor($safeZoneEditor);
              editor.on('stateChange', function (newState) {
                _this4.handleViewStateChange(variationId, viewId, newState);
              });
              editor.setState(viewItem);
              if (variation.is_default) {
                viewItem.elements.$useDefaultToggle.parentNode.remove();
                viewItem.elements.$overlayEnabledCheckbox.parentNode.remove();
                viewItem.elements.$nameInput.addEventListener('input', function (event) {
                  _this4.onDefaultViewNameChange(viewId, event.target.value);
                });
                viewItem.elements.$removeButton.addEventListener('click', function () {
                  _this4.removeView(viewId, variationId);
                  _this4.propagateDefaultVariationViewRemoval(viewId);
                });
              } else {
                viewItem.elements.$nameInput.remove();
                viewItem.elements.$removeButton.remove();
                viewItem.elements.$overlayTools.classList.toggle('hidden', !viewItem.use_default);
                viewItem.elements.$overlaySettings.classList.toggle('hidden', !viewItem.colorOverlayEnabled);
                viewItem.elements.$overlayEnabledCheckbox.addEventListener('change', function () {
                  _this4.onOverlayEnabledChange(variationId, viewId, viewItem.elements.$overlayEnabledCheckbox.checked);
                });
                viewItem.elements.$overlayOpacityInput.addEventListener('input', function (event) {
                  viewItem.editor.setState({
                    overlayOpacity: event.target.value
                  });
                });
                viewItem.elements.$useDefaultToggle.addEventListener('change', function (event) {
                  var useDefault = event.target.checked;
                  viewItem.use_default = useDefault;
                  if (useDefault) _this4.propagateDefaultImageView(viewId);
                });
                variation.elements.$colorInput.addEventListener('input', function (event) {
                  viewItem.editor.setState({
                    overlayColor: event.target.value
                  });
                });
              }
            case 49:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function initializeViewEditor(_x, _x2) {
        return _initializeViewEditor.apply(this, arguments);
      }
      return initializeViewEditor;
    }()
  }, {
    key: "handleViewStateChange",
    value: function handleViewStateChange(variationId, viewId, newState) {
      var variation = this.variations.get(variationId);
      var viewItem = variation.views.get(viewId);

      // Update the view item state
      Object.assign(viewItem, newState);

      // Update hidden input elements with new state values
      viewItem.elements.$dataElementName.value = viewItem.name || '';
      viewItem.elements.$dataElementUseDefault.value = viewItem.use_default ? '1' : '0';
      viewItem.elements.$dataElementImage.value = viewItem.image;
      viewItem.elements.$dataElementOverlayEnabled.value = viewItem.colorOverlayEnabled ? '1' : '0';
      viewItem.elements.$dataElementOverlayOpacity.value = viewItem.overlayOpacity;
      if (newState.safeZone) viewItem.elements.$dataElementSafeZone.value = JSON.stringify(newState.safeZone);
      if (newState.imageZone) viewItem.elements.$dataElementImageZone.value = JSON.stringify(newState.imageZone);
      viewItem.elements.$overlayEnabledCheckbox.checked = viewItem.colorOverlayEnabled;
      viewItem.elements.$overlayOpacityInput.value = viewItem.overlayOpacity;
      viewItem.elements.$useDefaultToggle.checked = viewItem.use_default;
      if (variationId === this.defaultVariationId) this.propagateDefaultViewState(viewId, newState);
    }
  }, {
    key: "propagateDefaultViewState",
    value: function propagateDefaultViewState(viewId, defaultState) {
      var _iterator3 = _createForOfIteratorHelper(this.variations),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
            variationId = _step3$value[0],
            variation = _step3$value[1];
          // Skip the default variation
          if (variationId === this.defaultVariationId) continue;
          var viewItem = variation.views.get(viewId);

          // Only update if view exists and is set to use default
          if (!viewItem || !viewItem.use_default) continue;

          // Create a clean state object with only the properties we want to propagate
          var propagatedState = {
            imageZone: defaultState.imageZone,
            safeZone: defaultState.safeZone
          };

          // Maintain the variation's own overlay settings
          if (viewItem.colorOverlayEnabled) {
            propagatedState.overlayColor = viewItem.overlayColor;
            propagatedState.overlayOpacity = viewItem.overlayOpacity;
            propagatedState.colorOverlayEnabled = viewItem.colorOverlayEnabled;
          }

          // Update the view's editor with the new state
          viewItem.editor.setState(propagatedState);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "onDefaultViewNameChange",
    value: function onDefaultViewNameChange(viewId, newName) {
      var _iterator4 = _createForOfIteratorHelper(this.variations),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _step4$value = _slicedToArray(_step4.value, 2),
            variationId = _step4$value[0],
            variation = _step4$value[1];
          var viewItem = variation.views.get(viewId);
          viewItem.name = newName;
          viewItem.elements.$name.innerText = newName;
          viewItem.elements.$dataElementName.value = newName;
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }, {
    key: "onOverlayEnabledChange",
    value: function onOverlayEnabledChange(variationId, viewId, newState) {
      var variation = this.variations.get(variationId);
      var viewItem = variation.views.get(viewId);
      viewItem.colorOverlayEnabled = newState;
      viewItem.elements.$overlaySettings.classList.toggle('hidden', !newState);
      viewItem.editor.setState({
        colorOverlayEnabled: newState
      });
    }
  }, {
    key: "addView",
    value: function addView(variationId) {
      var viewId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var variation = this.variations.get(variationId);
      var viewData = {
        id: viewId !== null && viewId !== void 0 ? viewId : this.generateRandomID(),
        name: 'New View',
        image: null,
        use_default: true,
        overlay_settings: {
          enabled: false,
          opacity: 0.85
        },
        elements: {},
        print_settings: {
          width: '400px',
          height: '400px',
          x: 0,
          y: 0
        }
      };
      if (!variation.views) variation.views = new Map();
      variation.views.set(viewData.id, viewData);
      this.initializeViewEditor(viewData.id, variationId);
      return viewData.id;
    }
  }, {
    key: "propagateDefaultVariationViewRemoval",
    value: function propagateDefaultVariationViewRemoval(viewId) {
      var _iterator5 = _createForOfIteratorHelper(this.variations),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _step5$value = _slicedToArray(_step5.value, 2),
            variationId = _step5$value[0],
            variation = _step5$value[1];
          if (variationId == this.defaultVariationId) continue;
          this.removeView(viewId, variationId);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "propagateDefaultVariationViewAddition",
    value: function propagateDefaultVariationViewAddition(viewId) {
      var _iterator6 = _createForOfIteratorHelper(this.variations),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _step6$value = _slicedToArray(_step6.value, 2),
            variationId = _step6$value[0],
            variation = _step6$value[1];
          if (variationId == this.defaultVariationId) continue;
          this.addView(variationId, viewId);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }
  }, {
    key: "propagateDefaultImageView",
    value: function propagateDefaultImageView(viewId) {
      var defaultVariation = this.variations.get(this.defaultVariationId);
      var defaultViewItem = defaultVariation.views.get(viewId);
      var imageId = defaultViewItem.image;
      var _iterator7 = _createForOfIteratorHelper(this.variations),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _step7$value = _slicedToArray(_step7.value, 2),
            variationId = _step7$value[0],
            variation = _step7$value[1];
          var viewItem = variation.views.get(viewId);
          if (!viewItem.use_default || variationId == this.defaultVariationId) continue;
          viewItem.editor.loadImage(imageId);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }
  }, {
    key: "addVariation",
    value: function addVariation() {
      var defaultVariation = this.variations.get(this.defaultVariationId);
      var variationData = {
        id: this.generateRandomID(),
        name: 'New Variation',
        color_code: this.generateRandomColor(),
        is_default: defaultVariation == null,
        is_dark_shirt: false,
        available_sizes: [],
        views: defaultVariation !== null && defaultVariation !== void 0 && defaultVariation.views ? this.cloneObjectMap(defaultVariation.views) : new Map()
      };
      this.variations.set(variationData.id, variationData);
      this.initializeVariation(variationData.id);
      this.switchTab(variationData.id);
    }
  }, {
    key: "switchTab",
    value: function switchTab(newVariationId) {
      var _iterator8 = _createForOfIteratorHelper(this.variations),
        _step8;
      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var _step8$value = _slicedToArray(_step8.value, 2),
            variationId = _step8$value[0],
            variation = _step8$value[1];
          var isActive = newVariationId == variationId;
          variation.elements.$tabButton.classList.toggle('active', isActive);
          variation.elements.$contentElement.classList.toggle('active', isActive);
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    }
  }, {
    key: "removeVariation",
    value: function removeVariation(variationId) {
      var variation = this.variations.get(variationId);
      if (variation.is_default) return;
      variation.elements.$tabButton.remove();
      var _iterator9 = _createForOfIteratorHelper(variation.views),
        _step9;
      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var _step9$value = _slicedToArray(_step9.value, 2),
            viewId = _step9$value[0],
            view = _step9$value[1];
          this.removeView(viewId, variationId);
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }
      variation.elements.$contentElement.remove();
      this.variations["delete"](variationId);
      this.switchTab(Array.from(this.variations.values())[0].id);
    }
  }, {
    key: "removeView",
    value: function removeView(viewId, variationId) {
      var variation = this.variations.get(variationId);
      var viewItem = variation.views.get(viewId);
      viewItem.editor.canvas.dispose();
      viewItem.elements.$container.remove();
      variation.views["delete"](viewId);
    }
  }, {
    key: "uploadNewImageToView",
    value: function () {
      var _uploadNewImageToView = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(variationId, viewId) {
        var variation, viewItem, image;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              variation = this.variations.get(variationId);
              viewItem = variation.views.get(viewId);
              _context5.next = 4;
              return _utils_MediaUploader__WEBPACK_IMPORTED_MODULE_0__.MediaUploader.open({
                title: window.wp.i18n.__('Select View Image', 'octo-print-designer'),
                buttonText: window.wp.i18n.__('Use this image', 'octo-print-designer')
              });
            case 4:
              image = _context5.sent;
              viewItem.editor.setState({
                image: image.id
              });
              if (variation.is_default) this.propagateDefaultImageView(viewId);
            case 7:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function uploadNewImageToView(_x3, _x4) {
        return _uploadNewImageToView.apply(this, arguments);
      }
      return uploadNewImageToView;
    }()
  }, {
    key: "generateRandomColor",
    value: function generateRandomColor() {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }
  }, {
    key: "generateRandomID",
    value: function generateRandomID() {
      return Math.floor(Math.random() * 1000000);
    }
  }, {
    key: "convertArrayToMap",
    value: function convertArrayToMap(array) {
      var _this5 = this;
      return new Map(array.map(function (item) {
        var realId = item.id || _this5.generateRandomID();
        item.id = realId;
        return [realId, item];
      }));
    }
  }, {
    key: "cloneObjectMap",
    value: function cloneObjectMap(map) {
      var clone = new Map();
      var _iterator10 = _createForOfIteratorHelper(map),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var _step10$value = _slicedToArray(_step10.value, 2),
            key = _step10$value[0],
            value = _step10$value[1];
          clone.set(key, _objectSpread({}, value));
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
      return clone;
    }
  }]);
}();

/***/ }),

/***/ "./admin/js/src/index.js":
/*!*******************************!*\
  !*** ./admin/js/src/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_SizesManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/SizesManager */ "./admin/js/src/components/SizesManager.js");
/* harmony import */ var _components_VariationsManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/VariationsManager */ "./admin/js/src/components/VariationsManager.js");
/* harmony import */ var _utils_ErrorHandler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/ErrorHandler */ "./admin/js/src/utils/ErrorHandler.js");
/* harmony import */ var _components_PricingManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/PricingManager */ "./admin/js/src/components/PricingManager.js");
// import { TemplateManager } from './components/TemplateManager';




document.addEventListener('DOMContentLoaded', function () {
  new _components_SizesManager__WEBPACK_IMPORTED_MODULE_0__.SizesManager();
  new _components_VariationsManager__WEBPACK_IMPORTED_MODULE_1__.VariationsManager();
  new _components_PricingManager__WEBPACK_IMPORTED_MODULE_3__.PricingManager();
});

/***/ }),

/***/ "./admin/js/src/utils/ErrorHandler.js":
/*!********************************************!*\
  !*** ./admin/js/src/utils/ErrorHandler.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ErrorHandler: () => (/* binding */ ErrorHandler)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var ErrorHandler = /*#__PURE__*/function () {
  function ErrorHandler() {
    _classCallCheck(this, ErrorHandler);
  }
  return _createClass(ErrorHandler, null, [{
    key: "handle",
    value: function handle(error) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      console.error("".concat(context, ":"), error);
      this.showNotification(error.message, 'error');
    }
  }, {
    key: "showNotification",
    value: function showNotification(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
      var notification = document.createElement('div');
      notification.className = "notice notice-".concat(type, " is-dismissible");
      notification.innerHTML = "<p>".concat(message, "</p>");
      var wrapper = document.querySelector('.wrap');
      if (wrapper) {
        wrapper.insertBefore(notification, wrapper.firstChild);
        setTimeout(function () {
          return notification.remove();
        }, 5000);
      }
    }
  }]);
}();

/***/ }),

/***/ "./admin/js/src/utils/MediaUploader.js":
/*!*********************************************!*\
  !*** ./admin/js/src/utils/MediaUploader.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MediaUploader: () => (/* binding */ MediaUploader)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var MediaUploader = /*#__PURE__*/function () {
  function MediaUploader() {
    _classCallCheck(this, MediaUploader);
  }
  return _createClass(MediaUploader, null, [{
    key: "open",
    value: function () {
      var _open = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _wp;
        var options,
          _args = arguments;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
              if ((_wp = wp) !== null && _wp !== void 0 && _wp.media) {
                _context.next = 3;
                break;
              }
              throw new Error('WordPress Media Library not available');
            case 3:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var frame = wp.media({
                  title: options.title || 'Select Media',
                  button: {
                    text: options.buttonText || 'Select'
                  },
                  multiple: false,
                  library: {
                    type: 'image'
                  }
                });
                frame.on('select', function () {
                  var selection = frame.state().get('selection');
                  var attachment = selection.first().toJSON();
                  if (!attachment.type || attachment.type !== 'image') {
                    reject(new Error('Please select an image file'));
                    return;
                  }
                  resolve({
                    id: attachment.id,
                    url: attachment.url,
                    width: attachment.width,
                    height: attachment.height,
                    alt: attachment.alt || ''
                  });
                });
                frame.on('close', function () {
                  var selection = frame.state().get('selection');
                  if (!selection.length) {
                    reject(new Error('No media selected'));
                  }
                });
                frame.open();
              }));
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function open() {
        return _open.apply(this, arguments);
      }
      return open;
    }()
  }, {
    key: "getImageUrl",
    value: function () {
      var _getImageUrl = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(attachmentId) {
        var _attachment$attribute;
        var attachment;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return wp.media.attachment(attachmentId);
            case 2:
              attachment = _context2.sent;
              if (attachment !== null && attachment !== void 0 && (_attachment$attribute = attachment.attributes) !== null && _attachment$attribute !== void 0 && _attachment$attribute.url) {
                _context2.next = 6;
                break;
              }
              _context2.next = 6;
              return attachment.fetch();
            case 6:
              return _context2.abrupt("return", attachment.attributes.url);
            case 7:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function getImageUrl(_x) {
        return _getImageUrl.apply(this, arguments);
      }
      return getImageUrl;
    }()
  }]);
}();

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
/******/ 			"admin/js/dist/admin": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["admin/js/dist/vendor"], () => (__webpack_require__("./admin/js/src/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=admin.bundle.js.map