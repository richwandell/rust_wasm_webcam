#[macro_use]
extern crate ndarray;

use ndarray::{arr2, Array, Array2, ArrayBase, ArrayView, ArrayViewMut, Dim, Ix2};
use wasm_bindgen::__rt::core::{mem, slice};
use wasm_bindgen::__rt::core::ffi::c_void;
use wasm_bindgen::prelude::*;

mod utils;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

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
    unsafe  {
        let _buf = Vec::from_raw_parts(ptr, 0, cap);
    }
}


#[wasm_bindgen]
pub fn sobel(dest_pointer: *mut u8, width: usize, height: usize) {
    // pixels are stored in RGBA, so each pixel is 4 bytes
    let byte_size = width * height * 4;
    let dest = unsafe { slice::from_raw_parts_mut(dest_pointer, byte_size) };

    let vertical_filter: Array2<f32> = arr2(&[
        [1., 2., 1.],
        [0., 0., 0.],
        [-1., -2., -1.]
    ]);

    let rgba: Vec<f32> = dest.iter().map(|x| *x as f32).collect();

    let ym3 = height - 3;
    let xm3 = width - 3;
    let mut i = 0;
    for y in 0..height {
        let row_size = 4 * width;
        let begin = y * row_size;
        let end = begin + row_size;

        let m = Array::from(rgba[begin..end + row_size + row_size].to_vec());
        let m1 = m.into_shape((3, width, 4)).unwrap();

        for x in 0..width {
            let mr: Array2<f32> = m1.slice(s![0..3, x..x+3, 0]).to_owned();
            let mra = mr * &vertical_filter;
            let mul: f32 = mra.sum();

            let squared = mul.powf(2.) as u8;
            dest[i] = squared;
            dest[i + 1] = squared;
            dest[i + 2] = squared;
            dest[i + 3] = 255;
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

