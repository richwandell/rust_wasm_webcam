#[macro_use]
extern crate ndarray;

use ndarray::{arr2, Array, Array2, ArrayBase, ArrayView, ArrayViewMut, Dim, Ix2, Array1, arr3, Array3};
use wasm_bindgen::__rt::core::{mem, slice};
use wasm_bindgen::__rt::core::ffi::c_void;
use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::std::ops::Mul;
use web_sys::{DedicatedWorkerGlobalScope, MessageEvent};
use web_sys::{ErrorEvent, Event, Worker};

mod utils;

macro_rules! console_log {
    ($($t:tt)*) => (crate::log(&format_args!($($t)*).to_string()))
}

// mod pool;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn logv(x: &JsValue);
}

#[wasm_bindgen]
pub fn alloc(size: usize) -> *mut c_void {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    mem::forget(buf);
    return ptr as *mut c_void;
}

#[wasm_bindgen]
pub fn dealloc(ptr: *mut c_void, cap: usize) {
    unsafe {
        let _buf = Vec::from_raw_parts(ptr, 0, cap);
    }
}

#[wasm_bindgen]
pub fn sharpen(dest_pointer: *mut u8, width: usize, height: usize, thread_num: usize, total_threads: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let num_bytes_in_row = width * 4;
    let mut chunk_size = (height / total_threads) as usize;
    let mut start_byte = num_bytes_in_row * chunk_size * thread_num;
    let extra = height - (chunk_size * total_threads);
    if thread_num == total_threads - 1 {
        chunk_size += extra;
    }
    let mut end_byte = start_byte + chunk_size * num_bytes_in_row;
    let mut dest = unsafe {
        let start_pointer = dest_pointer.offset(start_byte as isize);
        let size = end_byte - start_byte;
        slice::from_raw_parts_mut(start_pointer, size)
    };

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();

    let ym3 = chunk_size - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..chunk_size {
        for x in 0..width {
            let mut y1: i32 = 0;
            let mut y2: i32 = 0;
            let mut y3: i32 = 0;
            let mut x1: i32 = 0;
            let mut x2: i32 = 0;
            let mut x3: i32 = 0;
            if y <= ym3 {
                y1 = i as i32;
                y2 = i as i32 + num_bytes_in_row as i32;
                y3 = i as i32 + 2 * num_bytes_in_row as i32;
            } else if y == ym3 + 1 {
                y1 = i as i32 - num_bytes_in_row as i32;
                y2 = i as i32;
                y3 = i as i32 + num_bytes_in_row as i32;
            } else {
                y1 = i as i32 - 2 * num_bytes_in_row as i32;
                y2 = i as i32 - num_bytes_in_row as i32;
                y3 = i as i32;
            }
            if x <= xm3 {
                x1 = 0;
                x2 = 4;
                x3 = 8;
            } else if x == xm3 + 1 {
                x1 = -4;
                x2 = 0;
                x3 = 4;
            } else {
                x1 = -8;
                x2 = -4;
                x3 = 0;
            }

            let rval =
                  (v[(y1 + x1) as usize] * 0.) + (v[(y1 + x2) as usize] * -1.) + (v[(y1 + x3) as usize] * 0.)
                + (v[(y2 + x1) as usize] * -1.) + (v[(y2 + x2) as usize] * 5.) + (v[(y2 + x3) as usize] * -1.)
                + (v[(y3 + x1) as usize] * 0.) + (v[(y3 + x2) as usize] * -1.) + (v[(y3 + x3) as usize] * 0.);

            let gval =
                 (v[(y1 + x1 + 1) as usize] * 0.) + (v[(y1 + x2 + 1) as usize] * -1.) + (v[(y1 + x3 + 1) as usize] * 0.)
               + (v[(y2 + x1 + 1) as usize] * -1.) + (v[(y2 + x2 + 1) as usize] * 5.) + (v[(y2 + x3 + 1) as usize] * -1.)
               + (v[(y3 + x1 + 1) as usize] * 0.) + (v[(y3 + x2 + 1) as usize] * -1.) + (v[(y3 + x3 + 1) as usize] * 0.);

            let bval =
                (v[(y1 + x1 + 2) as usize] * 0.) + (v[(y1 + x2 + 2) as usize] * -1.) + (v[(y1 + x3 + 2) as usize] * 0.)
              + (v[(y2 + x1 + 2) as usize] * -1.) + (v[(y2 + x2 + 2) as usize] * 5.) + (v[(y2 + x3 + 2) as usize] * -1.)
              + (v[(y3 + x1 + 2) as usize] * 0.) + (v[(y3 + x2 + 2) as usize] * -1.) + (v[(y3 + x3 + 2) as usize] * 0.);
            dest[i] = rval as u8;
            dest[i + 1] = gval as u8;
            dest[i + 2] = bval as u8;
            i += 4;
        }
    }
}

#[wasm_bindgen]
pub fn emboss(dest_pointer: *mut u8, width: usize, height: usize, thread_num: usize, total_threads: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let num_bytes_in_row = width * 4;
    let mut chunk_size = (height / total_threads) as usize;
    let mut start_byte = num_bytes_in_row * chunk_size * thread_num;
    let extra = height - (chunk_size * total_threads);
    if thread_num == total_threads - 1 {
        chunk_size += extra;
    }
    let mut end_byte = start_byte + chunk_size * num_bytes_in_row;
    let mut dest = unsafe {
        let start_pointer = dest_pointer.offset(start_byte as isize);
        let size = end_byte - start_byte;
        slice::from_raw_parts_mut(start_pointer, size)
    };

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();

    let ym3 = chunk_size - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..chunk_size {
        for x in 0..width {
            let mut y1: i32 = 0;
            let mut y2: i32 = 0;
            let mut y3: i32 = 0;
            let mut x1: i32 = 0;
            let mut x2: i32 = 0;
            let mut x3: i32 = 0;
            if y <= ym3 {
                y1 = i as i32;
                y2 = i as i32 + num_bytes_in_row as i32;
                y3 = i as i32 + 2 * num_bytes_in_row as i32;
            } else if y == ym3 + 1 {
                y1 = i as i32 - num_bytes_in_row as i32;
                y2 = i as i32;
                y3 = i as i32 + num_bytes_in_row as i32;
            } else {
                y1 = i as i32 - 2 * num_bytes_in_row as i32;
                y2 = i as i32 - num_bytes_in_row as i32;
                y3 = i as i32;
            }
            if x <= xm3 {
                x1 = 0;
                x2 = 4;
                x3 = 8;
            } else if x == xm3 + 1 {
                x1 = -4;
                x2 = 0;
                x3 = 4;
            } else {
                x1 = -8;
                x2 = -4;
                x3 = 0;
            }

            let rval =
                (v[(y1 + x1) as usize] * -2.) + (v[(y1 + x2) as usize] * -1.) + (v[(y1 + x3) as usize] * 0.)
                    + (v[(y2 + x1) as usize] * -1.) + (v[(y2 + x2) as usize] * 1.) + (v[(y2 + x3) as usize] * 1.)
                    + (v[(y3 + x1) as usize] * 0.) + (v[(y3 + x2) as usize] * 1.) + (v[(y3 + x3) as usize] * 2.);

            let gval =
                (v[(y1 + x1 + 1) as usize] * -2.) + (v[(y1 + x2 + 1) as usize] * -1.) + (v[(y1 + x3 + 1) as usize] * 0.)
                    + (v[(y2 + x1 + 1) as usize] * -1.) + (v[(y2 + x2 + 1) as usize] * 1.) + (v[(y2 + x3 + 1) as usize] * 1.)
                    + (v[(y3 + x1 + 1) as usize] * 0.) + (v[(y3 + x2 + 1) as usize] * 1.) + (v[(y3 + x3 + 1) as usize] * 2.);

            let bval =
                (v[(y1 + x1 + 2) as usize] * -2.) + (v[(y1 + x2 + 2) as usize] * -1.) + (v[(y1 + x3 + 2) as usize] * 0.)
                    + (v[(y2 + x1 + 2) as usize] * -1.) + (v[(y2 + x2 + 2) as usize] * 1.) + (v[(y2 + x3 + 2) as usize] * 1.)
                    + (v[(y3 + x1 + 2) as usize] * 0.) + (v[(y3 + x2 + 2) as usize] * 1.) + (v[(y3 + x3 + 2) as usize] * 2.);
            dest[i] = rval as u8;
            dest[i + 1] = gval as u8;
            dest[i + 2] = bval as u8;
            i += 4;
        }
    }
}

#[wasm_bindgen]
pub fn sobel(dest_pointer: *mut u8, width: usize, height: usize, thread_num: usize, total_threads: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let num_bytes_in_row = width * 4;
    let mut chunk_size = (height / total_threads) as usize;
    let mut start_byte = num_bytes_in_row * chunk_size * thread_num;
    let extra = height - (chunk_size * total_threads);
    if thread_num == total_threads - 1 {
        chunk_size += extra;
    }
    let mut end_byte = start_byte + chunk_size * num_bytes_in_row;
    let mut dest = unsafe {
        let start_pointer = dest_pointer.offset(start_byte as isize);
        let size = end_byte - start_byte;
        slice::from_raw_parts_mut(start_pointer, size)
    };

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();

    let ym3 = chunk_size - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..chunk_size {
        for x in 0..width {
            let mut y1: i32 = 0;
            let mut y2: i32 = 0;
            let mut y3: i32 = 0;
            let mut x1: i32 = 0;
            let mut x2: i32 = 0;
            let mut x3: i32 = 0;
            if y <= ym3 {
                y1 = i as i32;
                y2 = i as i32 + num_bytes_in_row as i32;
                y3 = i as i32 + 2 * num_bytes_in_row as i32;
            } else if y == ym3 + 1 {
                y1 = i as i32 - num_bytes_in_row as i32;
                y2 = i as i32;
                y3 = i as i32 + num_bytes_in_row as i32;
            } else {
                y1 = i as i32 - 2 * num_bytes_in_row as i32;
                y2 = i as i32 - num_bytes_in_row as i32;
                y3 = i as i32;
            }
            if x <= xm3 {
                x1 = 0;
                x2 = 4;
                x3 = 8;
            } else if x == xm3 + 1 {
                x1 = -4;
                x2 = 0;
                x3 = 4;
            } else {
                x1 = -8;
                x2 = -4;
                x3 = 0;
            }

            let rval =
                (v[(y1 + x1) as usize] * 1.) + (v[(y1 + x2) as usize] * 2.) + (v[(y1 + x3) as usize] * 1.)
                    + (v[(y3 + x1) as usize] * -1.) + (v[(y3 + x2) as usize] * -2.) + (v[(y3 + x3) as usize] * -1.);

            let gval =
                (v[(y1 + x1 + 1) as usize] * 1.) + (v[(y1 + x2 + 1) as usize] * 2.) + (v[(y1 + x3 + 1) as usize] * 1.)
                    + (v[(y3 + x1 + 1) as usize] * -1.) + (v[(y3 + x2 + 1) as usize] * -2.) + (v[(y3 + x3 + 1) as usize] * -1.);

            let bval =
                (v[(y1 + x1 + 2) as usize] * 1.) + (v[(y1 + x2 + 2) as usize] * 2.) + (v[(y1 + x3 + 2) as usize] * 1.)
                    + (v[(y3 + x1 + 2) as usize] * -1.) + (v[(y3 + x2 + 2) as usize] * -2.) + (v[(y3 + x3 + 2) as usize] * -1.);
            dest[i] = rval as u8;
            dest[i + 1] = gval as u8;
            dest[i + 2] = bval as u8;
            i += 4;
        }
    }
}

#[wasm_bindgen]
pub fn box_blur(dest_pointer: *mut u8, width: usize, height: usize, thread_num: usize, total_threads: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let num_bytes_in_row = width * 4;
    let mut chunk_size = (height / total_threads) as usize;
    let mut start_byte = num_bytes_in_row * chunk_size * thread_num;
    let extra = height - (chunk_size * total_threads);
    if thread_num == total_threads - 1 {
        chunk_size += extra;
    }
    let mut end_byte = start_byte + chunk_size * num_bytes_in_row;
    let mut dest = unsafe {
        let start_pointer = dest_pointer.offset(start_byte as isize);
        let size = end_byte - start_byte;
        slice::from_raw_parts_mut(start_pointer, size)
    };

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();

    let ym3 = chunk_size - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..chunk_size {
        for x in 0..width {
            let mut y1: i32 = 0;
            let mut y2: i32 = 0;
            let mut y3: i32 = 0;
            let mut x1: i32 = 0;
            let mut x2: i32 = 0;
            let mut x3: i32 = 0;
            if y <= ym3 {
                y1 = i as i32;
                y2 = i as i32 + num_bytes_in_row as i32;
                y3 = i as i32 + 2 * num_bytes_in_row as i32;
            } else if y == ym3 + 1 {
                y1 = i as i32 - num_bytes_in_row as i32;
                y2 = i as i32;
                y3 = i as i32 + num_bytes_in_row as i32;
            } else {
                y1 = i as i32 - 2 * num_bytes_in_row as i32;
                y2 = i as i32 - num_bytes_in_row as i32;
                y3 = i as i32;
            }
            if x <= xm3 {
                x1 = 0;
                x2 = 4;
                x3 = 8;
            } else if x == xm3 + 1 {
                x1 = -4;
                x2 = 0;
                x3 = 4;
            } else {
                x1 = -8;
                x2 = -4;
                x3 = 0;
            }

            let rval =
                (v[(y1 + x1) as usize]) + (v[(y1 + x2) as usize]) + (v[(y1 + x3) as usize])
                    + (v[(y2 + x1) as usize]) + (v[(y2 + x2) as usize]) + (v[(y2 + x3) as usize])
                    + (v[(y3 + x1) as usize]) + (v[(y3 + x2) as usize]) + (v[(y3 + x3) as usize]);

            let gval =
                (v[(y1 + x1 + 1) as usize]) + (v[(y1 + x2 + 1) as usize]) + (v[(y1 + x3 + 1) as usize])
                    + (v[(y2 + x1 + 1) as usize]) + (v[(y2 + x2 + 1) as usize]) + (v[(y2 + x3 + 1) as usize])
                    + (v[(y3 + x1 + 1) as usize]) + (v[(y3 + x2 + 1) as usize]) + (v[(y3 + x3 + 1) as usize]);

            let bval =
                (v[(y1 + x1 + 2) as usize]) + (v[(y1 + x2 + 2) as usize]) + (v[(y1 + x3 + 2) as usize])
                    + (v[(y2 + x1 + 2) as usize]) + (v[(y2 + x2 + 2) as usize]) + (v[(y2 + x3 + 2) as usize])
                    + (v[(y3 + x1 + 2) as usize]) + (v[(y3 + x2 + 2) as usize]) + (v[(y3 + x3 + 2) as usize]);
            dest[i] = (rval / 9.) as u8;
            dest[i + 1] = (gval / 9.) as u8;
            dest[i + 2] = (bval / 9.) as u8;
            i += 4;
        }
    }
}

#[wasm_bindgen]
pub fn laplacian(dest_pointer: *mut u8, width: usize, height: usize, thread_num: usize, total_threads: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let num_bytes_in_row = width * 4;
    let mut chunk_size = (height / total_threads) as usize;
    let mut start_byte = num_bytes_in_row * chunk_size * thread_num;
    let extra = height - (chunk_size * total_threads);
    if thread_num == total_threads - 1 {
        chunk_size += extra;
    }
    let mut end_byte = start_byte + chunk_size * num_bytes_in_row;
    let mut dest = unsafe {
        let start_pointer = dest_pointer.offset(start_byte as isize);
        let size = end_byte - start_byte;
        slice::from_raw_parts_mut(start_pointer, size)
    };

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();

    let ym3 = chunk_size - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..chunk_size {
        for x in 0..width {
            let mut y1: i32 = 0;
            let mut y2: i32 = 0;
            let mut y3: i32 = 0;
            let mut x1: i32 = 0;
            let mut x2: i32 = 0;
            let mut x3: i32 = 0;
            if y <= ym3 {
                y1 = i as i32;
                y2 = i as i32 + num_bytes_in_row as i32;
                y3 = i as i32 + 2 * num_bytes_in_row as i32;
            } else if y == ym3 + 1 {
                y1 = i as i32 - num_bytes_in_row as i32;
                y2 = i as i32;
                y3 = i as i32 + num_bytes_in_row as i32;
            } else {
                y1 = i as i32 - 2 * num_bytes_in_row as i32;
                y2 = i as i32 - num_bytes_in_row as i32;
                y3 = i as i32;
            }
            if x <= xm3 {
                x1 = 0;
                x2 = 4;
                x3 = 8;
            } else if x == xm3 + 1 {
                x1 = -4;
                x2 = 0;
                x3 = 4;
            } else {
                x1 = -8;
                x2 = -4;
                x3 = 0;
            }
            let rval =
                (v[(y1 + x1) as usize] * 0.) + (v[(y1 + x2) as usize] * 1.) + (v[(y1 + x3) as usize] * 0.)
                    + (v[(y2 + x1) as usize] * 1.) + (v[(y2 + x2) as usize] * -4.) + (v[(y2 + x3) as usize] * 1.)
                    + (v[(y3 + x1) as usize] * 0.) + (v[(y3 + x2) as usize] * 1.) + (v[(y3 + x3) as usize] * 0.);

            let gval =
                (v[(y1 + x1 + 1) as usize] * 0.) + (v[(y1 + x2 + 1) as usize] * 1.) + (v[(y1 + x3 + 1) as usize] * 0.)
                    + (v[(y2 + x1 + 1) as usize] * 1.) + (v[(y2 + x2 + 1) as usize] * -4.) + (v[(y2 + x3 + 1) as usize] * 1.)
                    + (v[(y3 + x1 + 1) as usize] * 0.) + (v[(y3 + x2 + 1) as usize] * 1.) + (v[(y3 + x3 + 1) as usize] * 0.);

            let bval =
                (v[(y1 + x1 + 2) as usize] * 0.) + (v[(y1 + x2 + 2) as usize] * 1.) + (v[(y1 + x3 + 2) as usize] * 0.)
                    + (v[(y2 + x1 + 2) as usize] * 1.) + (v[(y2 + x2 + 2) as usize] * -4.) + (v[(y2 + x3 + 2) as usize] * 1.)
                    + (v[(y3 + x1 + 2) as usize] * 0.) + (v[(y3 + x2 + 2) as usize] * 1.) + (v[(y3 + x3 + 2) as usize] * 0.);
            dest[i] = rval as u8;
            dest[i + 1] = gval as u8;
            dest[i + 2] = bval as u8;
            i += 4;
        }
    }
}

