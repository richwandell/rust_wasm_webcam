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
