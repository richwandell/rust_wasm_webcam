/* tslint:disable */
/* eslint-disable */
/**
* @param {number} size
* @returns {number}
*/
export function alloc(size: number): number;
/**
* @param {number} ptr
* @param {number} cap
*/
export function dealloc(ptr: number, cap: number): void;
/**
* @param {number} dest_pointer
* @param {number} width
* @param {number} height
* @param {number} thread_num
* @param {number} total_threads
*/
export function sharpen(dest_pointer: number, width: number, height: number, thread_num: number, total_threads: number): void;
/**
* @param {number} dest_pointer
* @param {number} width
* @param {number} height
* @param {number} thread_num
* @param {number} total_threads
*/
export function emboss(dest_pointer: number, width: number, height: number, thread_num: number, total_threads: number): void;
/**
* @param {number} dest_pointer
* @param {number} width
* @param {number} height
* @param {number} thread_num
* @param {number} total_threads
*/
export function sobel(dest_pointer: number, width: number, height: number, thread_num: number, total_threads: number): void;
/**
* @param {number} dest_pointer
* @param {number} width
* @param {number} height
* @param {number} thread_num
* @param {number} total_threads
*/
export function box_blur(dest_pointer: number, width: number, height: number, thread_num: number, total_threads: number): void;
/**
* @param {number} dest_pointer
* @param {number} width
* @param {number} height
* @param {number} thread_num
* @param {number} total_threads
*/
export function laplacian(dest_pointer: number, width: number, height: number, thread_num: number, total_threads: number): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly alloc: (a: number) => number;
  readonly dealloc: (a: number, b: number) => void;
  readonly sharpen: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly emboss: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly sobel: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly box_blur: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly laplacian: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_export_0: WebAssembly.Memory;
  readonly __wbindgen_start: () => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>, maybe_memory: WebAssembly.Memory): Promise<InitOutput>;
        