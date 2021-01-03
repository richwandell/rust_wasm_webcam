import {InitOutput} from "../../build/pkg";

export interface Wasm extends InitOutput {
    memory: {
        buffer: SharedArrayBuffer
    }
}
