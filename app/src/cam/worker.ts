import {InitOutput} from 'wasm_rust';

declare function postMessage(message: any): void;
declare function importScripts(scriot: string): void;

importScripts("pkg/index.js")

let wasm: InitOutput;

export function box_blur(pointer: number, width: number, height: number, start_row: number, end_row: number) {
    wasm.box_blur(pointer, width, height, start_row, end_row)
    postMessage({workerFinished: true})
}

export async function loadWasm() {
    //eslint-disable-next-line
    let fileParts = location.href.split("/")
    //eslint-disable-next-line
    let srcPath = location.href.replace(fileParts[fileParts.length - 1], "pkg/index_bg.wasm")
    //@ts-ignore
    wasm = await wasm_bindgen(srcPath);

    postMessage({loaded: true})
}

