import {useEffect, useRef} from "react";
import css from './cam.module.css'
import cam from './cam'

function Cam() {
    const canvas = useRef<HTMLCanvasElement>(null)
    const video = useRef<HTMLVideoElement>(null)
    const sobelButton = useRef<HTMLButtonElement>(null)
    const boxBlurButton = useRef<HTMLButtonElement>(null)
    const sharpenButton = useRef<HTMLButtonElement>(null)
    const embossButton = useRef<HTMLButtonElement>(null)
    const laplacianButton = useRef<HTMLButtonElement>(null)


    useEffect(() => cam(canvas, video, sobelButton, boxBlurButton, sharpenButton, embossButton, laplacianButton),
        [sobelButton, video, canvas])

    return (
        <div className={css.flex}>
            <div className={css.sideDiv}>
                <ul className={css.buttonList}>
                    <li><button ref={sobelButton}>Sobel Edge Detection</button></li>
                    <li><button ref={boxBlurButton}>Box Blur</button></li>
                    <li><button ref={sharpenButton}>Sharpen</button></li>
                    <li><button ref={embossButton}>Emboss</button></li>
                    <li><button ref={laplacianButton}>Laplacian</button></li>
                </ul>
            </div>
            <canvas ref={canvas} > </canvas>
            <video className={css.hide} autoPlay={true} ref={video} />
            <div className={css.sideDiv}></div>
        </div>
    );
}

export default Cam;
