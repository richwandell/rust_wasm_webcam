import {Wasm} from './camera';

declare function postMessage(message: any): void;

let threadNum: number
let wasm: Wasm;

export function box_blur(pointer: number, width: number, height: number, start_row: number, end_row: number) {
    wasm.box_blur(pointer, width, height, start_row, end_row)
    postMessage({workerFinished: true})
}

export function loadWasm(thread_num: number) {
    threadNum = thread_num;
    function wasmLoaded(native: Wasm) {
        wasm = native;
        postMessage({loaded: true})
    }

    (async function() {
        const wasm = await import('wasm_algos/index_bg.js')
        const src = await import("wasm_algos/index_bg.wasm");



    })()



}
