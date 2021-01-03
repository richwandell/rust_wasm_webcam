import {InitOutput} from 'wasm_rust';

declare function postMessage(message: any): void;
declare function importScripts(scriot: string): void;

importScripts("pkg/index.js")

let wasm: InitOutput;

export function box_blur(pointer: number, width: number, height: number, thread_number: number, total_threads: number) {
    wasm.box_blur(pointer, width, height, thread_number, total_threads)
    postMessage({workerFinished: true})
}

export function sobel(pointer: number, width: number, height: number, thread_number: number, total_threads: number) {
    wasm.sobel(pointer, width, height, thread_number, total_threads)
    postMessage({workerFinished: true})
}

export function sharpen(pointer: number, width: number, height: number, thread_number: number, total_threads: number) {
    wasm.sharpen(pointer, width, height, thread_number, total_threads)
    postMessage({workerFinished: true})
}

export function emboss(pointer: number, width: number, height: number, thread_number: number, total_threads: number) {
    wasm.emboss(pointer, width, height, thread_number, total_threads)
    postMessage({workerFinished: true})
}

export function laplacian(pointer: number, width: number, height: number, thread_number: number, total_threads: number) {
    wasm.laplacian(pointer, width, height, thread_number, total_threads)
    postMessage({workerFinished: true})
}

export async function loadWasm(wasmSrc: string, memory: WebAssembly.Memory) {
    const module = await fetch(wasmSrc)
    //@ts-ignore
    wasm = await wasm_bindgen(await module.arrayBuffer(), memory);

    postMessage({loaded: true})
}

