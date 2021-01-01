!function (e) {
    this.webpackChunk = function (t, r) {
        for (var o in r) e[o] = r[o];
        for (; t.length;) n[t.pop()] = 1
    };
    var t = {}, n = {0: 1}, r = {};
    var o = {
        3: function () {
            return {
                "./index_bg.js": {
                    __wbg_alert_89681084c6c0f08d: function (e, n) {
                        return t[2].exports.a(e, n)
                    }
                }
            }
        }
    };

    function i(n) {
        if (t[n]) return t[n].exports;
        var r = t[n] = {i: n, l: !1, exports: {}};
        return e[n].call(r.exports, r, r.exports, i), r.l = !0, r.exports
    }

    i.e = function (e) {
        var t = [];
        return t.push(Promise.resolve().then((function () {
            n[e] || importScripts(i.p + "" + e + ".2fe9b92a244a33a74c27.worker.js")
        }))), ({1: [3]}[e] || []).forEach((function (e) {
            var n = r[e];
            if (n) t.push(n); else {
                var s, a = o[e](), u = fetch(i.p + "" + {3: "fe0494ea00572ca4b4b3"}[e] + ".module.wasm");
                if (a instanceof Promise && "function" === typeof WebAssembly.compileStreaming) s = Promise.all([WebAssembly.compileStreaming(u), a]).then((function (e) {
                    return WebAssembly.instantiate(e[0], e[1])
                })); else if ("function" === typeof WebAssembly.instantiateStreaming) s = WebAssembly.instantiateStreaming(u, a); else {
                    s = u.then((function (e) {
                        return e.arrayBuffer()
                    })).then((function (e) {
                        return WebAssembly.instantiate(e, a)
                    }))
                }
                t.push(r[e] = s.then((function (t) {
                    return i.w[e] = (t.instance || t).exports
                })))
            }
        })), Promise.all(t)
    }, i.m = e, i.c = t, i.d = function (e, t, n) {
        i.o(e, t) || Object.defineProperty(e, t, {enumerable: !0, get: n})
    }, i.r = function (e) {
        "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
    }, i.t = function (e, t) {
        if (1 & t && (e = i(e)), 8 & t) return e;
        if (4 & t && "object" === typeof e && e && e.__esModule) return e;
        var n = Object.create(null);
        if (i.r(n), Object.defineProperty(n, "default", {
            enumerable: !0,
            value: e
        }), 2 & t && "string" != typeof e) for (var r in e) i.d(n, r, function (t) {
            return e[t]
        }.bind(null, r));
        return n
    }, i.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return i.d(t, "a", t), t
    }, i.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, i.p = "/", i.w = {}, i(i.s = 0)
}([function (e, t, n) {
    "use strict";
    var r;

    function o(e, t, n, o, i) {
        r.box_blur(e, t, n, o, i), postMessage({workerFinished: !0})
    }

    function i(e) {
        e, n.e(1).then(n.bind(null, 1)).then((function (e) {
            r = e, postMessage({loaded: !0})
        }))
    }

    n.r(t), n.d(t, "box_blur", (function () {
        return o
    })), n.d(t, "loadWasm", (function () {
        return i
    })), addEventListener("message", (function (e) {
        var n, r = e.data, o = r.type, i = r.method, s = r.id, a = r.params;
        "RPC" === o && i && ((n = t[i]) ? Promise.resolve().then((function () {
            return n.apply(t, a)
        })) : Promise.reject("No such method")).then((function (e) {
            postMessage({type: "RPC", id: s, result: e})
        })).catch((function (e) {
            var t = {message: e};
            e.stack && (t.message = e.message, t.stack = e.stack, t.name = e.name), postMessage({
                type: "RPC",
                id: s,
                error: t
            })
        }))
    })), postMessage({type: "RPC", method: "ready"})
}]);
//# sourceMappingURL=2fe9b92a244a33a74c27.worker.js.map
