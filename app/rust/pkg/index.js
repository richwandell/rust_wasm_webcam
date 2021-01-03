let wasm_bindgen;
(function() {
    const __exports = {};
    let wasm;

    let memory;

    let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

    cachedTextDecoder.decode();

    let cachegetUint8Memory0 = null;
    function getUint8Memory0() {
        if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.__wbindgen_export_0.buffer) {
            cachegetUint8Memory0 = new Uint8Array(wasm.__wbindgen_export_0.buffer);
        }
        return cachegetUint8Memory0;
    }

    function getStringFromWasm0(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory0().slice(ptr, ptr + len));
    }
    /**
    * @param {number} size
    * @returns {number}
    */
    __exports.alloc = function(size) {
        var ret = wasm.alloc(size);
        return ret;
    };

    /**
    * @param {number} ptr
    * @param {number} cap
    */
    __exports.dealloc = function(ptr, cap) {
        wasm.dealloc(ptr, cap);
    };

    /**
    * @param {number} dest_pointer
    * @param {number} width
    * @param {number} height
    * @param {number} thread_num
    * @param {number} total_threads
    */
    __exports.sharpen = function(dest_pointer, width, height, thread_num, total_threads) {
        wasm.sharpen(dest_pointer, width, height, thread_num, total_threads);
    };

    /**
    * @param {number} dest_pointer
    * @param {number} width
    * @param {number} height
    * @param {number} thread_num
    * @param {number} total_threads
    */
    __exports.emboss = function(dest_pointer, width, height, thread_num, total_threads) {
        wasm.emboss(dest_pointer, width, height, thread_num, total_threads);
    };

    /**
    * @param {number} dest_pointer
    * @param {number} width
    * @param {number} height
    * @param {number} thread_num
    * @param {number} total_threads
    */
    __exports.sobel = function(dest_pointer, width, height, thread_num, total_threads) {
        wasm.sobel(dest_pointer, width, height, thread_num, total_threads);
    };

    /**
    * @param {number} dest_pointer
    * @param {number} width
    * @param {number} height
    * @param {number} thread_num
    * @param {number} total_threads
    */
    __exports.box_blur = function(dest_pointer, width, height, thread_num, total_threads) {
        wasm.box_blur(dest_pointer, width, height, thread_num, total_threads);
    };

    /**
    * @param {number} dest_pointer
    * @param {number} width
    * @param {number} height
    * @param {number} thread_num
    * @param {number} total_threads
    */
    __exports.laplacian = function(dest_pointer, width, height, thread_num, total_threads) {
        wasm.laplacian(dest_pointer, width, height, thread_num, total_threads);
    };

    async function load(module, imports, maybe_memory) {
        if (typeof Response === 'function' && module instanceof Response) {
            memory = imports.wbg.memory = new WebAssembly.Memory({initial:17,maximum:16384,shared:true});
            if (typeof WebAssembly.instantiateStreaming === 'function') {
                try {
                    return await WebAssembly.instantiateStreaming(module, imports);

                } catch (e) {
                    if (module.headers.get('Content-Type') != 'application/wasm') {
                        console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                    } else {
                        throw e;
                    }
                }
            }

            const bytes = await module.arrayBuffer();
            return await WebAssembly.instantiate(bytes, imports);

        } else {
            memory = imports.wbg.memory = maybe_memory;
            const instance = await WebAssembly.instantiate(module, imports);

            if (instance instanceof WebAssembly.Instance) {
                return { instance, module };

            } else {
                return instance;
            }
        }
    }

    async function init(input, maybe_memory) {
        if (typeof input === 'undefined') {
            let src;
            if (typeof document === 'undefined') {
                src = location.href;
            } else {
                src = document.currentScript.src;
            }
            input = src.replace(/\.js$/, '_bg.wasm');
        }
        const imports = {};
        imports.wbg = {};
        imports.wbg.__wbindgen_throw = function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        };

        if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
            input = fetch(input);
        }

        const { instance, module } = await load(await input, imports, maybe_memory);

        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;
        wasm.__wbindgen_start();
        return wasm;
    }

    wasm_bindgen = Object.assign(init, __exports);

})();
