import {useEffect, useRef, useState} from "react";
import css from './cam.module.css'

function Cam() {
    let canvas = useRef<HTMLCanvasElement>(null)
    let video = useRef<HTMLVideoElement>(null)
    let sobelButton = useRef<HTMLButtonElement>(null)


    useEffect(() => {
        if (canvas === null) return;
        if (video.current === null) return;
        if (sobelButton.current === null) return;

        let effect = 0;

        sobelButton.current.addEventListener("click", () => {
            effect = effect === 1 ? 0 : 1
        })

        let ctx: CanvasRenderingContext2D | null,
            // @ts-ignore
            wasm,
            pointer = -1,
            lastTime = Infinity,
            ticks = 0;

        function memcopy(b1: ArrayBufferLike, b2: SharedArrayBuffer, offset: number) {
            new Uint8Array(b2, offset, b1.byteLength).set(new Uint8Array(b1));
        }

        function drawToCanvas(time: number) {
            if (video.current && canvas.current) {
                const width = video.current.videoWidth;
                const height = video.current.videoHeight;
                canvas.current.width = width;
                canvas.current.height = height;

                ctx?.drawImage(video.current, 0, 0, width, height);
                if (effect === 1) {
                    if (canvas.current.width > 0) {
                        if (canvas.current && pointer === -1) {
                            canvas.current.width = width;
                            canvas.current.height = height;
                            const byteSize = width * height * 4;
                            // @ts-ignore
                            pointer = wasm.alloc(byteSize);
                        } else if (canvas.current && ctx) {
                            let imageData = ctx.getImageData(0, 0, width, height);
                            //@ts-ignore
                            memcopy(imageData.data.buffer, wasm.memory.buffer, pointer)
                            //@ts-ignore
                            wasm.sobel(pointer, width, height)
                            //@ts-ignore
                            const data = new Uint8ClampedArray(wasm.memory.buffer, pointer, width * height * 4);
                            const imageDataUpdated = new ImageData(data, width, height);
                            ctx.putImageData(imageDataUpdated, 0, 0)
                        }
                    }
                }
                if (ticks % 5 === 0) {
                    let fps = (1000 / (time - lastTime)).toFixed(2);
                    //@ts-ignore
                    document.querySelector("#fps").innerHTML = fps;
                }
                ticks += 1;
                if (ticks > 5) ticks = 0;
                lastTime = time;
                requestAnimationFrame(drawToCanvas)
            }
        }

        import('../wasm')
            .then(native => {
                wasm = native;
                if (navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(function (stream) {
                            if (canvas.current !== null) {
                                ctx = canvas.current.getContext('2d');
                            }
                            if (video.current) {
                                video.current.srcObject = stream;
                            }

                            drawToCanvas(new Date().getTime())
                        })
                        .catch(function (err0r) {
                            console.log("Something went wrong!");
                        });
                }
            })
    }, [sobelButton, video, canvas])

    return (
        <div className={css.flex}>
            <div className={css.sideDiv}>
                <ul className={css.buttonList}>
                    <button ref={sobelButton}>Sobel Edge Detection</button>
                </ul>
            </div>
            <canvas ref={canvas} > </canvas>
            <video className={css.hide} autoPlay={true} ref={video} />
            <div className={css.sideDiv}></div>
        </div>
    );
}

export default Cam;
