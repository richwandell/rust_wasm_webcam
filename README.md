<p align="center">
  <a href="https://travis-ci.org/richwandell/rust_wasm_webcam"><img src="https://img.shields.io/travis/richwandell/rust_wasm_webcam/master.svg" alt="Build status" /></a>
  <a href="https://app.netlify.com/sites/happy-goldberg-e0d07e/deploys"><img src="https://img.shields.io/netlify/a0b4c13d-6cc7-4b49-9285-b33d148b9ac0" alt="Build status" /></a> 
</p>

Access the app at the link below.
<pre>https://happy-goldberg-e0d07e.netlify.app/</pre>

# Rust Wasm Webcam
This project was built with the goal of exploring webassembly threading using Rust. I went into this knowing very little about how rust can work with the web browser. I'm hoping that someone else can learn something from my experience with rust and webassembly. Feel free to contact me with any questions.


### Basics of editing a webcam image 
Before digging into the rust and threading code let's first talk about how to edit an image coming from a webcam. 

I like to use create react app whenever I write a new web project, it's become my default go-to framework for front end projects. For this project I start with a small amount of markup in my react component. 

```jsx
<>
  <div className={css.sliderContainer}>
     <label>Concurrency: <span id={"slider-concurrency"} >{navigator.hardwareConcurrency}</span></label>
     <input ref={sliderRef} type="range" max={navigator.hardwareConcurrency} min={1} className={css.slider} />
  </div>
  <div className={css.flex}>
     <div className={css.sideDiv}>
        <ul className={css.buttonList}>
           <li><button ref={sobelButton}>Sobel Edge Detection</button></li>
           <li><button ref={boxBlurButton}>Box Blur</button></li>
           <li><button ref={sharpenButton}>Sharpen</button></li>
           <li><button ref={embossButton}>Emboss</button></li>
           <li><button ref={laplacianButton}>Laplacian</button></li>
           <li><button ref={faceMeshButton}>Face Mesh</button></li>
         </ul>
      </div>
      <canvas ref={canvas} > </canvas>
      <canvas className={css.hide} ref={hiddenCanvas}/>
      <video className={css.hide} autoPlay={true} ref={video} />
      <div className={css.sideDiv}/>
  </div>
</>
```

Notice that I have created two canvas elements and one video element. All three of these elements are using refs. I chose to use refs in this case so that I can prevent re renders by directly interfacing with the html elements, more on this later. I've used a slider with some custom css to change the concurrency level as well as a button list to select the filter effect to apply to the cam image.

Getting access to the users webcam is pretty strait forward. We use the `navigator.mediaDevices.getUserMedia` function.
```typescript
navigator.mediaDevices.getUserMedia({video: true})
  .then(camLoaded)
  .catch(function () {
      console.log("Something went wrong!");
  });
```
This will call my `camLoaded` function if we have successfully aquired the users video device. The `camLoaded` function takes a single parameter which is a `MediaStream`. This stream can be directly connected to the `<video>` tag that we created using react. In `camLoaded` I also grab the canvas context for both the visible and hidden canvas. 

```typescript
function camLoaded(stream: MediaStream) {
    if (canvas.current !== null) {
        ctx = canvas.current.getContext('2d');
    }
    if (hiddenCanvas.current !== null) {
        hctx = hiddenCanvas.current.getContext('2d')
    }
    if (video.current) {
        video.current.srcObject = stream;
    }

    ...
}
```

Next in my render loop I draw the video from the video element to the hidden canvas so that I can use this canvas to retrieve an `ImageData` object containing pixel information. This `ImageData` is then copied to the memory buffer that is being used in rust exposing this pixel information to the webassembly code.
```typescript
function memcopy(b1: ArrayBufferLike, b2: ArrayBufferLike, offset: number) {
    new Uint8Array(b2, offset, b1.byteLength).set(new Uint8Array(b1));
}

// draw webcam to canvas
hctx?.drawImage(video.current, 0, 0, width, height);

// get image data from the canvas
const imageData = hctx.getImageData(0, 0, width, height);
memcopy(imageData.data.buffer, memory.buffer, pointer)
```

For the face mesh example I don't need to do anything with wasm directly because the tensorflow wasm backend does this for us. Instead I use tensorflow to get the facial landmarks and then draw the video to the visible canvas and draw on top of this canvas.
```typescript
const predictions = await tfModel.estimateFaces({
    input: video.current
});

ctx.drawImage(video.current, 0, 0)

for (let i = 0; i < predictions.length; i++) {
    ctx.beginPath();
    //@ts-ignore
    let width = predictions[i].boundingBox.bottomRight[0] - predictions[i].boundingBox.topLeft[0]
    //@ts-ignore
    let height = predictions[i].boundingBox.bottomRight[1] - predictions[i].boundingBox.topLeft[1]
    ctx.strokeStyle = RED;
    ctx.lineWidth = 0.5;
    //@ts-ignore
    ctx.rect(predictions[i].boundingBox.topLeft[0], predictions[i].boundingBox.topLeft[1], width, height);
    ctx.stroke();
    const keypoints: Coords3D = predictions[i].scaledMesh as Coords3D;
    ctx.strokeStyle = GREEN;
    // this triangulation stuff taken from the google demo
    ctx.beginPath()
    for (let i = 0; i < TRIANGULATION.length / 3; i++) {
        const points = [
            TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
            TRIANGULATION[i * 3 + 2]
        ].map(index => keypoints[index]);

        drawPath(ctx, points, true);
    }
}
```
### Setting up rust 
In order to get access to shared memory we need to create a file `.cargo/config`. This file contains the following.
```toml
[target.wasm32-unknown-unknown]
rustflags = [
    "-C", "target-feature=+atomics,+bulk-memory",
]

[unstable]
build-std = ['std', 'panic_abort']

[build]
target = "wasm32-unknown-unknown"
rustflags = '-Ctarget-feature=+atomics,+bulk-memory'
```
We will also run wasm-pack using the flag `--target no-modules`. The combination of these two things will enable us to use the `wasm_bindgen` javascript function to load our wasm file. The return value will contain a property that will allow us to access the memory used in wasm and this memory will be backed by a `SharedArrayBuffer` so that all threads can access the same memory. Due to the use of `--target no-modules` we don't have a way to load this using webpack. Instead I create a webpack config that will compile my rust code using `WasmPackPlugin` and copy the finished product into my build folder when it finishes. I've used [React App Rewired](https://www.npmjs.com/package/react-app-rewired) in order to re configure my CRA app. The `config-overries.js` file containes the following.

```javascript
config.plugins = (config.plugins || []).concat([
    new WasmPackPlugin({
        crateDirectory: path.resolve(__dirname, "../rust"),
        extraArgs: "--target no-modules",
        outDir: path.resolve(__dirname, "../rust/pkg"),
        forceMode: "production"
    }),
    new CopyPlugin([
        {
            from: "*",
            to: "pkg",
            context: path.resolve(__dirname, "../rust/pkg") + "/",
            filter: (path) => {
                if (path.endsWith(".gitignore")) {
                    return false;
                }
                return true;
            }
        },
    ]),
]);
```
I've also added a script tag into the app  `index.html` file so that we load the code generated by `wasm-pack`. This will create a global function `wasm_bindgen` that I can use to load the web assembly module.
```html
 <body>
   <script src="pkg/index.js"></script>
```

### Creating threads 
Ok now that we are able to generate the wasm code from rust and we can load it into the page, let's talk a bit about how we interact with it. I've chosen to create the threads in javascript. I do this by creating `WebWorker` instance. I used an npm module [Workerize Loader](https://www.npmjs.com/package/workerize-loader) to load the web worker code into my CRA app. This gives us a function we can call which returns a module instance containing all of the exported functions that were exported from the web worker. This type of interface was much easier to work with than the browser API using `postMessage` and `onmessage` so I'm happy that I found this module. 

After the web cam is successfully created and we have obtained our canvas contexts we create the web worker instances by calling the `createWorkers` function. This function instantiates a new worker, registers a message handler, and tells this worker to load our wasm code. Notice that the `loadWasm` function accepts the shared memory instance.

```typescript
function createWorkers() {
    for (let i = 0; i < numThreads; i++) {
        const workerInstance = worker()
        workerInstance.addEventListener('message', workerMesageRecieved)
        workerInstance.loadWasm(wasmSrc, memory)
        workers.push(workerInstance)
    }
}
```
In the web worker code we have a function that will call `wasm_bindgen` and load the web assembly module into the worker passing our memory into the function. When this module is loaded the worker will post a message back to the main thread where we are waiting for all threads to report back.

```typescript
export async function loadWasm(wasmSrc: string, memory: WebAssembly.Memory) {
    const module = await fetch(wasmSrc)
    //@ts-ignore
    wasm = await wasm_bindgen(await module.arrayBuffer(), memory);

    postMessage({loaded: true})
}
```

Back in our main thread we have a function `workerMessageRecieved`. This function accepts message from the web worker. In the first section of our if/else statement we look to see if we have a `message.data.loaded` property. We keep a variable `workersFinished` that is incremented any time a worker is finished with it's job. In this case we have created many workers, set `workersFinished` to zero and we check that `workersFinished` has been incremented up to `numJobs`. After all workers are finished loading the wasm we start the render loop by setting `workersFinished` back to zero and calling `drawToCanvas` for the first time.
```typescript
function workerMesageRecieved(message: MessageEvent) {
    if (message.data.type) return;

    if (message.data.loaded && workersFinished === numJobs - 1) {
        workersFinished = 0;
        drawToCanvas(new Date().getTime())
    } else if (message.data.loaded) {
       workersFinished += 1;
    } else if (message.data.workerFinished && workersFinished === numJobs - 1) {
        ...
    } else if (message.data.workerFinished) {
        ...
    }
}
```
In the `drawToCanvas` function we draw a video frame to our hidden canvas, we use this `ImageData` object to copy pixel information to our memory buffer that is exposed to our threads, and then we call the appropriate function in our web worker that will tell each thread to manipulate a certain section of pixel information in the buffer. A variable `i` is used to indicate which section the thread should work on, and a variable `numThreads` is used to tell the thread how many total threads exist, more on this later.

```typescript
function drawToCanvas(time: number) {
    ...
    // do we need to allocate memory?
    if (width > 0 && canvas.current && pointer === -1) return allocateMemory(width, height)
    // draw webcam to canvas
    hctx?.drawImage(video.current, 0, 0, width, height);
    ...
    // get image data from the canvas
    const imageData = hctx.getImageData(0, 0, width, height);
    memcopy(imageData.data.buffer, memory.buffer, pointer)
    numJobs = numThreads;
    switch (effect) {
        case 1:
            for (let i = 0; i < numThreads; i++) {
                workers[i].sobel(pointer, width, height, i, numThreads)
            }
            break;
            ...
    }
}
```
The web worker accepts parameters and passes these parameters directly to our rust code.
```typescript
export function sobel(pointer: number, width: number, height: number, thread_number: number, total_threads: number) {
    wasm.sobel(pointer, width, height, thread_number, total_threads)
    postMessage({workerFinished: true})
}
```

Each thread is tasked with working on a section of the image. Sections are broken up vertically. In an image with 100 pixel height, thread 1 would work on rows 1 - 10, thread 2 would work on rows 11 - 20 and so on.

### Rust Code

Now for the fun part. We have a rust function using the `#[wasm_bindgen]` attribute provided to use by wasm bindgen. This allows us to expose this function to our javascript code. Fist we determine which chunk of memory this thread should work on. This is done by calculating the start byte and end byte. After we have the start and end bytes we use this to get a reference to the memory location starting at the start byte and ending at the end byte. This data is then converted into a 32 bit float and mapped into a rust `Vec`.

```rust
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
```
Now that we have our memory chunk we can loop through the pixels in this chunk and calculate the laplacian filter values. For the laplacian we multiply the pixel values for pixels surrounding the current pixel by the following matrix.

| | | |
| ------------- | ------------- | ---- |
| 0  | 1  | 0 |
| 1  | -4  | 1 |
| 0 | 1 | 0 |

After the rgb values are calculated we set the pixel value directly on our shared memory.

```rust
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
```

### Finishing it up

Due to the fact that this memory is shared between all threads including the main thread, these pixel values are immediatly available in the main thread. After all threads have completed their work the main thread draws this array buffer to the visible canvas.

In our `workerMessageRecieved` function we look for a propertie `workerFinished`. If this property exists we increment the `workersFinished` variable. If the `workersFinished` variable is equal to the number of workers then we copy the `SharedArrayBuffer` memory to a new `ImageData` object and set this new data on the visible canvas.

```typescript
function workerMesageRecieved(message: MessageEvent) {
    if (message.data.type) return;

    if (message.data.loaded && workersFinished === numJobs - 1) {
        ...
    } else if (message.data.loaded) {
        ...
    } else if (message.data.workerFinished && workersFinished === numJobs - 1) {
        workersFinished = 0;
        const data = new Uint8ClampedArray(memory.buffer, pointer, width * height * 4).slice(0);
        const imageDataUpdated = new ImageData(data, width, height);
        ctx?.putImageData(imageDataUpdated, 0, 0)
        requestAnimationFrame(drawToCanvas)
    } else if (message.data.workerFinished) {
        workersFinished += 1;
    }
}
```
