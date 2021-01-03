#[macro_use]
extern crate ndarray;

use ndarray::{arr2, Array, Array2, ArrayBase, ArrayView, ArrayViewMut, Dim, Ix2, Array1, arr3, Array3};
use wasm_bindgen::__rt::core::{mem, slice};
use wasm_bindgen::__rt::core::ffi::c_void;
use wasm_bindgen::prelude::*;
use wasm_bindgen::__rt::std::ops::Mul;

mod utils;

macro_rules! console_log {
    ($($t:tt)*) => (crate::log(&format_args!($($t)*).to_string()))
}

mod pool;

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
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, rich!");
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
pub fn sharpen(dest_pointer: *mut u8, width: usize, height: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let byte_size = width * height * 4;
    let dest = unsafe { slice::from_raw_parts_mut(dest_pointer, byte_size) };

    let kernel: Array2<f32> = arr2(&[
        [0., -1., 0.],
        [-1., 5., -1.],
        [0., -1., 0.]
    ]);

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();
    let rgba = Array::from(v);
    let m = rgba.into_shape((height, width, 4)).unwrap();

    let ym3 = height - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..height {
        for x in 0..width {
            let rval = (m.slice(s![y..y+3, x..x+3, 0]).to_owned() * &kernel).sum();
            let gval = (m.slice(s![y..y+3, x..x+3, 1]).to_owned() * &kernel).sum();
            let bval = (m.slice(s![y..y+3, x..x+3, 2]).to_owned() * &kernel).sum();

            dest[i] = rval as u8;
            dest[i + 1] = gval as u8;
            dest[i + 2] = bval as u8;
            i += 4;

            if x == xm3 {
                i += 8;
                break;
            }
        }
        if y == ym3 {
            i += 3;
            break;
        }
    }
}

#[wasm_bindgen]
pub fn emboss(dest_pointer: *mut u8, width: usize, height: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let byte_size = width * height * 4;
    let dest = unsafe { slice::from_raw_parts_mut(dest_pointer, byte_size) };

    let kernel: Array2<f32> = arr2(&[
        [-2., -1., 0.],
        [-1., 1., 1.],
        [0., 1., 2.]
    ]);

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();
    let rgba = Array::from(v);
    let m = rgba.into_shape((height, width, 4)).unwrap();

    let ym3 = height - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..height {
        for x in 0..width {
            let r = (m.slice(s![y..y+3, x..x+3, 0]).to_owned() * &kernel).sum() as u8;
            let g = (m.slice(s![y..y+3, x..x+3, 1]).to_owned() * &kernel).sum() as u8;
            let b = (m.slice(s![y..y+3, x..x+3, 2]).to_owned() * &kernel).sum() as u8;

            dest[i] = r;
            dest[i + 1] = g;
            dest[i + 2] = b;
            i += 4;

            if x == xm3 {
                i += 8;
                break;
            }
        }
        if y == ym3 {
            i += 3;
            break;
        }
    }
}

#[wasm_bindgen]
pub fn sobel(dest_pointer: *mut u8, width: usize, height: usize, thread_num: usize, total_threads: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    // let byte_size = width * height * 4;
    // let dest = unsafe { slice::from_raw_parts_mut(dest_pointer, byte_size) };
    //
    // let chunk_size = (height / total_threads) as usize;
    // let extra = height - (chunk_size * total_threads);
    //
    // let kernel: Array2<f32> = arr2(&[
    //     [1., 2., 1.],
    //     [0., 0., 0.],
    //     [-1., -2., -1.]
    // ]);
    //
    // let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();
    // let rgba = Array::from(v);
    // let m = rgba.into_shape((height, width, 4)).unwrap();
    //
    // let ym3 = height - 3;
    // let xm3 = width - 3;
    // let start_row = chunk_size * thread_num;
    // let end_row = start_row + chunk_size;
    // let mut i = 4 * width * start_row;
    // for y in start_row..end_row {
    //     for x in 0..width {
    //         let rval = (m.slice(s![y..y+3, x..x+3, 0]).to_owned() * &kernel).sum();
    //
    //         let squared = rval.powf(2.) as u8;
    //         dest[i] = squared;
    //         dest[i + 1] = squared;
    //         dest[i + 2] = squared;
    //         dest[i + 3] = 255;
    //         i += 4;
    //
    //         if x == xm3 {
    //             i += 8;
    //             break;
    //         }
    //     }
    //     if y == ym3 {
    //         i += 3;
    //         break;
    //     }
    // }


    // pixels are stored in RGBA, so each pixel is 4 bytes
    let byte_size = width * height * 4;
    let dest = unsafe { slice::from_raw_parts_mut(dest_pointer, byte_size) };

    let chunk_size = (height / total_threads) as usize;
    let extra = height - (chunk_size * total_threads);

    let kernel: Array2<f32> = arr2(&[
        [1., 2., 1.],
        [0., 0., 0.],
        [-1., -2., -1.]
    ]);

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();
    let rgba = Array::from(v);
    let m = rgba.into_shape((height, width, 4)).unwrap();

    let ym3 = height - 3;
    let xm3 = width - 3;

    let start_row = chunk_size * thread_num;
    let end_row = start_row + chunk_size;

    let mut i = 4 * width * start_row;
    for y in start_row..end_row {
        for x in 0..width {
            let mut a = dest[i];
            a = a * dest[y * x * 4]
            dest[i] = dest[i]
            let rval: f32 = (m.slice(s![y..y+3, x..x+3, 0]).to_owned() * &kernel).sum();
            let gval: f32 = m.slice(s![y..y+3, x..x+3, 1]).to_owned().sum() / 9.;
            let bval: f32 = m.slice(s![y..y+3, x..x+3, 2]).sum() / 9.;
            let aval: f32 = m.slice(s![y..y+3, x..x+3, 3]).sum() / 9.;

            dest[i] = rval as u8;
            dest[i + 1] = gval as u8;
            dest[i + 2] = bval as u8;
            dest[i + 3] = aval as u8;
            i += 4;

            if x == xm3 {
                i += 8;
                break;
            }
        }
        if y == ym3 {
            i += 3;
            break;
        }
    }
}

#[wasm_bindgen]
pub fn box_blur(dest_pointer: *mut u8, width: usize, height: usize, thread_num: usize, total_threads: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let byte_size = width * height * 4;
    let dest = unsafe { slice::from_raw_parts_mut(dest_pointer, byte_size) };

    let chunk_size = (height / total_threads) as usize;
    let extra = height - (chunk_size * total_threads);

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();
    let rgba = Array::from(v);
    let m = rgba.into_shape((height, width, 4)).unwrap();

    let ym3 = height - 3;
    let xm3 = width - 3;

    let start_row = chunk_size * thread_num;
    let end_row = start_row + chunk_size;

    let mut i = 4 * width * start_row;
    for y in start_row..end_row {
        for x in 0..width {
            let rval: f32 = m.slice(s![y..y+3, x..x+3, 0]).to_owned().sum() / 9.;
            let gval: f32 = m.slice(s![y..y+3, x..x+3, 1]).to_owned().sum() / 9.;
            let bval: f32 = m.slice(s![y..y+3, x..x+3, 2]).sum() / 9.;
            let aval: f32 = m.slice(s![y..y+3, x..x+3, 3]).sum() / 9.;

            dest[i] = rval as u8;
            dest[i + 1] = gval as u8;
            dest[i + 2] = bval as u8;
            dest[i + 3] = aval as u8;
            i += 4;

            if x == xm3 {
                i += 8;
                break;
            }
        }
        if y == ym3 {
            i += 3;
            break;
        }
    }
}

#[wasm_bindgen]
pub fn laplacian(dest_pointer: *mut u8, width: usize, height: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let byte_size = width * height * 4;
    let dest = unsafe { slice::from_raw_parts_mut(dest_pointer, byte_size) };

    let kernel: Array2<f32> = arr2(&[
        [0., 1., 0.],
        [1., -4., 1.],
        [0., 1., 0.]
    ]);

    let v: Vec<f32> = dest.iter().map(|x| *x as f32).collect();
    let rgba = Array::from(v);
    let m = rgba.into_shape((height, width, 4)).unwrap();

    let ym3 = height - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..height {
        for x in 0..width {
            let r = (m.slice(s![y..y+3, x..x+3, 0]).to_owned() * &kernel).sum() as u8;
            let g = (m.slice(s![y..y+3, x..x+3, 1]).to_owned() * &kernel).sum() as u8;
            let b = (m.slice(s![y..y+3, x..x+3, 2]).to_owned() * &kernel).sum() as u8;

            dest[i] = r;
            dest[i + 1] = g;
            dest[i + 2] = b;
            i += 4;

            if x == xm3 {
                i += 8;
                break;
            }
        }
        if y == ym3 {
            i += 3;
            break;
        }
    }
}

