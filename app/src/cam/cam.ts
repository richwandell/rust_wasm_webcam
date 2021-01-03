import React from "react";
//@ts-ignore
import worker from 'workerize-loader!./worker'; // eslint-disable-line import/no-webpack-loader-syntax
import {Wasm} from './camera';

export default function Cam(
    canvas: React.RefObject<HTMLCanvasElement>,
    video: React.RefObject<HTMLVideoElement>,
    sobelButton: React.RefObject<HTMLButtonElement>,
    boxBlurButton: React.RefObject<HTMLButtonElement>,
    sharpenButton: React.RefObject<HTMLButtonElement>,
    embossButton: React.RefObject<HTMLButtonElement>,
    laplacianButton: React.RefObject<HTMLButtonElement>
) {
    if (canvas.current === null) return;
    if (video.current === null) return;
    if (sobelButton.current === null) return;
    if (boxBlurButton.current === null) return;
    if (sharpenButton.current === null) return;
    if (embossButton.current === null) return;
    if (laplacianButton.current === null) return;

    let ctx: CanvasRenderingContext2D | null,
        pointer = -1,
        lastTime = Infinity,
        ticks = 0,
        effect = 0,
        workers: Wasm[] = [],
        workersFinished = 0,
        width = 0,
        height = 0,
        numJobs = 0,
        memory = new WebAssembly.Memory({
            initial: 80,
            maximum: 80,
            //@ts-ignore
            shared: true
        });

    function drawToCanvas(time: number) {
        if (!(video.current && canvas.current)) return;
        drawFps(time)
        width = video.current.videoWidth;
        height = video.current.videoHeight;
        canvas.current.width = width;
        canvas.current.height = height;
        // draw webcam to canvas
        ctx?.drawImage(video.current, 0, 0, width, height);
        // do we have no effect selected? is the canvas ready?
        if (effect === 0 || !(width > 0 && canvas.current && ctx)) return requestAnimationFrame(drawToCanvas)
        // get image data from the canvas
        const imageData = ctx.getImageData(0, 0, width, height);
        memcopy(imageData.data.buffer, memory.buffer, pointer)
        switch (effect) {
            case 2:
                for(let i = 0; i < workers.length; i++) {
                    workers[i].box_blur(pointer, width, height, i, navigator.hardwareConcurrency)
                }
                break;
        }
    }

    function workerMesageRecieved(message: MessageEvent) {
        if (message.data.type) return;

        if (message.data.loaded && workersFinished === navigator.hardwareConcurrency - 1) {
            workersFinished = 0;
            drawToCanvas(new Date().getTime())
        } else if (message.data.loaded) {
            workersFinished += 1;
        } else if (message.data.workerFinished && workersFinished === navigator.hardwareConcurrency - 1) {
            console.log("workers are all finished")
            workersFinished = 0;
            const data = new Uint8ClampedArray(memory.buffer, pointer, width * height * 4);
            const imageDataUpdated = new ImageData(data, width, height);
            ctx?.putImageData(imageDataUpdated, 0, 0)

            requestAnimationFrame(drawToCanvas)
        } else if (message.data.workerFinished) {
            workersFinished += 1;
        }
    }

    function createWorkers() {
        for (let i = 0; i < navigator.hardwareConcurrency; i++) {
            const workerInstance = worker()
            workerInstance.addEventListener('message', workerMesageRecieved)
            workerInstance.loadWasm(memory)
            workers.push(workerInstance)
        }
    }

    function camLoaded(stream: MediaStream) {
        if (canvas.current !== null) {
            ctx = canvas.current.getContext('2d');
        }
        if (video.current) {
            video.current.srcObject = stream;
        }

        createWorkers()
    }

    function memcopy(b1: ArrayBufferLike, b2: ArrayBuffer, offset: number) {
        new Uint8Array(b2, offset, b1.byteLength).set(new Uint8Array(b1));
    }

    function drawFps(time: number) {
        if (ticks % 5 === 0) {
            //@ts-ignore
            document.querySelector("#fps").innerHTML = (1000 / (time - lastTime)).toFixed(2);
        }
        ticks += 1;
        if (ticks > 5) ticks = 0;
        lastTime = time;
    }

    sobelButton.current.addEventListener("click", () => {
        effect = effect === 1 ? 0 : 1
    })

    boxBlurButton.current.addEventListener("click", () => {
        effect = effect === 2 ? 0 : 2
    })

    sharpenButton.current.addEventListener("click", () => {
        effect = effect === 3 ? 0 : 3
    })

    embossButton.current.addEventListener("click", () => {
        effect = effect === 4 ? 0 : 4
    })

    laplacianButton.current.addEventListener("click", () => {
        effect = effect === 5 ? 0 : 5
    })

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({video: true})
            .then(camLoaded)
            .catch(function () {
                console.log("Something went wrong!");
            });
    }
}
