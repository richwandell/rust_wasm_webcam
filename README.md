<p align="center">
  <a href="https://travis-ci.org/richwandell/rust_wasm_webcam"><img src="https://img.shields.io/travis/richwandell/rust_wasm_webcam/master.svg" alt="Build status" /></a>
  <a href="https://app.netlify.com/sites/happy-goldberg-e0d07e/deploys"><img src="https://img.shields.io/netlify/a0b4c13d-6cc7-4b49-9285-b33d148b9ac0" alt="Build status" /></a> 
</p>

Access the app at the link below.
<pre>https://happy-goldberg-e0d07e.netlify.app/</pre>

# Rust Wasm Webcam
This project was built with the goal of exploring webassembly threading using Rust. I went into this knowing very little about how rust can work with the web browser. I'm hoping that someone else can learn something from my experience with rust and webassembly. Feel free to contact me with any questions.


### Basics of editing a webcam image 

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
