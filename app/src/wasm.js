import * as wasm from "wasm_rust/index_bg.wasm";
export * from "wasm_rust/index";
export const memory = wasm.memory;
