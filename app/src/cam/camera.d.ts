export interface Wasm  {
    memory: {
        buffer: SharedArrayBuffer
    }
    alloc(bytes: number): number
    sobel(pointer: number, width: number, height: number): void
    box_blur(pointer: number, width: number, height: number, thread_num: number, total_threads: number): void
    sharpen(pointer: number, width: number, height: number): void
    emboss(pointer: number, width: number, height: number): void
    laplacian(pointer: number, width: number, height: number): void
    thing(v: number): number
}
