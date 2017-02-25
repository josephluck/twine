(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";function noop(){return null}function arrayToObj(e,t){return Object.assign({},e,t)}function merge(e,t){if(e.models){var r=Object.keys(e.models).map(function(r){return o={},o[r]=merge(e.models[r],t),o;var o}).reduce(arrayToObj,{});return Object.assign({},e[t],r)}return e[t]}function createState(e){return merge(e,"state")}function retrieveNestedModel(e,t,r){if(void 0===r&&(r=0),e.models){var o=e.models[t[r]];return o&&o.models&&o.models[t[r+1]]?retrieveNestedModel(o,t,r+1):o}return e}function tansu(e){e||(e=noop);var t="function"==typeof e?e:e.onStateChange||noop,r="function"==typeof e?noop:e.onMethodCall||noop;return function(e){function o(o,n,l){var u=Object.keys(o||{}).map(function(n){return u={},u[n]=function(){var u;if(l.length){var s=retrieveNestedModel(e,l).scoped?dotProp.get(a,l.join(".")):a,p=Object.assign({},s,o[n].apply(null,[s].concat(Array.prototype.slice.call(arguments))));dotProp.set(a,l.join("."),p),u=a}else u=o[n].apply(null,[a].concat(Array.prototype.slice.call(arguments)));return t(u,a,c),r.apply(null,[u,a].concat(Array.prototype.slice.call(arguments))),a=u,u},u;var u}),s=Object.keys(n||{}).map(function(t){return r={},r[t]=function(){if(l.length){var r=retrieveNestedModel(e,l),o=r.scoped?r.state:a,u=r.scoped?dotProp.get(c,l.join(".")):c;return n[t].apply(null,[o,u].concat(Array.prototype.slice.call(arguments)))}return n[t].apply(null,[a,c].concat(Array.prototype.slice.call(arguments)))},r;var r});return u.concat(s).reduce(arrayToObj,{})}function n(e,t){if(e.models){var r=Object.keys(e.models).map(function(r){return o={},o[r]=n(e.models[r],t.concat(r)),o;var o}).reduce(arrayToObj,{});return Object.assign({},o(e.reducers,e.effects,t),r)}return o(e.reducers,e.effects,t)}var a=createState(e),c=n(e,[]);return{state:a,methods:c}}}Object.defineProperty(exports,"__esModule",{value:!0});var dotProp=require("dot-prop");exports.default=tansu;

},{"dot-prop":2}],2:[function(require,module,exports){
"use strict";function getPathSegments(t){for(var e=t.split("."),r=[],n=0;n<e.length;n++){for(var i=e[n];"\\"===i[i.length-1]&&void 0!==e[n+1];)i=i.slice(0,-1)+".",i+=e[++n];r.push(i)}return r}var isObj=require("is-obj");module.exports={get:function(t,e,r){if(!isObj(t)||"string"!=typeof e)return void 0===r?t:r;for(var n=getPathSegments(e),i=0;i<n.length;i++){if(!Object.prototype.propertyIsEnumerable.call(t,n[i]))return r;if(t=t[n[i]],void 0===t||null===t){if(i!==n.length-1)return r;break}}return t},set:function(t,e,r){if(isObj(t)&&"string"==typeof e)for(var n=getPathSegments(e),i=0;i<n.length;i++){var s=n[i];isObj(t[s])||(t[s]={}),i===n.length-1&&(t[s]=r),t=t[s]}},delete:function(t,e){if(isObj(t)&&"string"==typeof e)for(var r=getPathSegments(e),n=0;n<r.length;n++){var i=r[n];if(n===r.length-1)return void delete t[i];if(t=t[i],!isObj(t))return}},has:function(t,e){if(!isObj(t)||"string"!=typeof e)return!1;for(var r=getPathSegments(e),n=0;n<r.length;n++){if(!isObj(t))return!1;if(!(r[n]in t))return!1;t=t[r[n]]}return!0}};

},{"is-obj":3}],3:[function(require,module,exports){
"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o};module.exports=function(o){var t="undefined"==typeof o?"undefined":_typeof(o);return null!==o&&("object"===t||"function"===t)};

},{}]},{},[1]);
