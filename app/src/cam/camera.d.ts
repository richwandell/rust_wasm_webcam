import {InitOutput} from "../../../rust/pkg";

export interface Wasm extends InitOutput {
    memory: {
        buffer: SharedArrayBuffer
    }
}
