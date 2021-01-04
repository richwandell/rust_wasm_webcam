import {useEffect, useRef} from "react";
import css from './cam.module.css'
import cam from './cam'

function Cam() {
    const canvas = useRef<HTMLCanvasElement>(null)
    const hiddenCanvas = useRef<HTMLCanvasElement>(null)
    const video = useRef<HTMLVideoElement>(null)
    const sobelButton = useRef<HTMLButtonElement>(null)
    const boxBlurButton = useRef<HTMLButtonElement>(null)
    const sharpenButton = useRef<HTMLButtonElement>(null)
    const embossButton = useRef<HTMLButtonElement>(null)
    const laplacianButton = useRef<HTMLButtonElement>(null)
    const sliderRef = useRef<HTMLInputElement>(null)
    const faceMeshButton = useRef<HTMLButtonElement>(null)
    const resolutionSelect = useRef<HTMLSelectElement>(null)


    useEffect(() => {
        if (resolutionSelect.current === null) return;
        if (faceMeshButton.current === null) return;
        if (sliderRef.current === null) return;
        if (canvas.current === null) return;
        if (hiddenCanvas.current === null) return;
        if (video.current === null) return;
        if (sobelButton.current === null) return;
        if (boxBlurButton.current === null) return;
        if (sharpenButton.current === null) return;
        if (embossButton.current === null) return;
        if (laplacianButton.current === null) return;

        cam(resolutionSelect, faceMeshButton, sliderRef, canvas, hiddenCanvas, video, sobelButton,
                boxBlurButton, sharpenButton, embossButton, laplacianButton)
    },[sobelButton, video, canvas])

    return (
        <>
            <div className={css.sliderContainer}>
                <label>Concurrency: <span id={"slider-concurrency"} >{navigator.hardwareConcurrency}</span></label>
                <input ref={sliderRef} type="range" max={navigator.hardwareConcurrency} min={1} className={css.slider} />
                <label>Resolution: </label>
                <select ref={resolutionSelect} defaultValue={"480p"}>
                    <option value={"1080p"} >1920x1080</option>
                    <option value={"720p"} >1280x720</option>
                    <option value={"480p"} >640x480</option>
                </select>
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
    );
}

export default Cam;
