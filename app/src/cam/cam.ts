import React from "react";
//@ts-ignore
import worker from 'workerize-loader!./worker'; // eslint-disable-line import/no-webpack-loader-syntax
import {Wasm} from "./camera";
import {Coords3D} from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util";
import {MediaPipeFaceMesh} from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import {TRIANGULATION} from './triangulation';

tfjsWasm.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);

declare function wasm_bindgen(script: string): void

export default function Cam(
    faceMeshButton: React.RefObject<HTMLButtonElement>,
    sliderRef: React.RefObject<HTMLInputElement>,
    canvas: React.RefObject<HTMLCanvasElement>,
    hiddenCanvas: React.RefObject<HTMLCanvasElement>,
    video: React.RefObject<HTMLVideoElement>,
    sobelButton: React.RefObject<HTMLButtonElement>,
    boxBlurButton: React.RefObject<HTMLButtonElement>,
    sharpenButton: React.RefObject<HTMLButtonElement>,
    embossButton: React.RefObject<HTMLButtonElement>,
    laplacianButton: React.RefObject<HTMLButtonElement>
) {
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

    let ctx: CanvasRenderingContext2D | null,
        hctx: CanvasRenderingContext2D | null,
        wasm: Wasm,
        pointer = -1,
        lastTime = Infinity,
        ticks = 0,
        effect = 0,
        workers: Wasm[] = [],
        workersFinished = 0,
        width = 0,
        height = 0,
        memory: { buffer: SharedArrayBuffer },
        wasmSrc: string,
        numThreads = navigator.hardwareConcurrency,
        numJobs = navigator.hardwareConcurrency,
        tfModel: MediaPipeFaceMesh;

    const GREEN = '#32EEDB';
    const RED = "#FF2C35";
    // const BLUE = "#157AB3";

    function makeWasmSrc() {
        let fileParts = window.location.href.split("/")
        if (fileParts[fileParts.length - 1] === "") fileParts.pop()
        let srcPath = window.location.href.replace(
            fileParts[fileParts.length - 1], fileParts[fileParts.length - 1] + "/pkg/index_bg.wasm")
        if (srcPath[srcPath.length - 1] === "/") srcPath = srcPath.slice(0, -1)
        wasmSrc = srcPath;
    }

    function allocateMemory(width: number, height: number) {
        if (!(video.current && canvas.current && hiddenCanvas.current)) return;
        hiddenCanvas.current.width = width
        hiddenCanvas.current.height = height
        canvas.current.width = width;
        canvas.current.height = height;
        const byteSize = width * height * 4;
        //@ts-ignore
        pointer = wasm.alloc(byteSize);
        return requestAnimationFrame(drawToCanvas)
    }

    function drawPath(ctx: CanvasRenderingContext2D, points: any, closePath: boolean) {
        const region = new Path2D();
        region.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            region.lineTo(point[0], point[1]);
        }
        if (closePath) {
            region.closePath();
        }
        ctx.stroke(region);
    }

    async function drawMesh() {
        if (video.current === null || ctx === null) return

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
            // for (let i = 0; i < keypoints.length; i++) {
            //     const [x, y, z] = keypoints[i];
            //     ctx.beginPath()
            //     ctx.arc(x, y, 1, 0, 360)
            //     ctx.stroke()
            // }

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

        return requestAnimationFrame(drawToCanvas)
    }

    function drawToCanvas(time: number) {
        if (!(video.current && canvas.current && hiddenCanvas.current)) return;
        drawFps(time)
        width = video.current.videoWidth;
        height = video.current.videoHeight;
        // do we need to allocate memory?
        if (width > 0 && canvas.current && pointer === -1) return allocateMemory(width, height)
        // draw webcam to canvas
        hctx?.drawImage(video.current, 0, 0, width, height);
        // do we have no effect selected? is the canvas ready?
        if (effect === 0 || !(width > 0 && canvas.current && ctx && hctx)) {
            ctx?.drawImage(video.current, 0, 0, width, height);
            return requestAnimationFrame(drawToCanvas)
        } else if (effect === 6) {
            return drawMesh()
        }
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
            case 2:
                for (let i = 0; i < numThreads; i++) {
                    workers[i].box_blur(pointer, width, height, i, numThreads)
                }
                break;
            case 3:
                for (let i = 0; i < numThreads; i++) {
                    workers[i].sharpen(pointer, width, height, i, numThreads)
                }
                break;
            case 4:
                for (let i = 0; i < numThreads; i++) {
                    workers[i].emboss(pointer, width, height, i, numThreads)
                }
                break;
            case 5:
                for (let i = 0; i < numThreads; i++) {
                    workers[i].laplacian(pointer, width, height, i, numThreads)
                }
                break;
        }

    }

    function workerMesageRecieved(message: MessageEvent) {
        if (message.data.type) return;

        if (message.data.loaded && workersFinished === numJobs - 1) {
            workersFinished = 0;
            drawToCanvas(new Date().getTime())
        } else if (message.data.loaded) {
            workersFinished += 1;
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

    function createWorkers() {
        for (let i = 0; i < numThreads; i++) {
            const workerInstance = worker()
            workerInstance.addEventListener('message', workerMesageRecieved)
            workerInstance.loadWasm(wasmSrc, memory)
            workers.push(workerInstance)
        }
    }

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

        createWorkers()
    }

    function wasmLoaded() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true})
                .then(camLoaded)
                .catch(function () {
                    console.log("Something went wrong!");
                });
        }
    }

    function memcopy(b1: ArrayBufferLike, b2: ArrayBufferLike, offset: number) {
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

    function disableSlider() {
        if (sliderRef.current) sliderRef.current.disabled = true;
        //@ts-ignore
        document.querySelector("#slider-concurrency").innerHTML = "NA";
    }

    function enableSlider() {
        if (sliderRef.current) sliderRef.current.disabled = false;
        //@ts-ignore
        document.querySelector("#slider-concurrency").innerHTML = Number(sliderRef.current.value);
    }

    sobelButton.current.addEventListener("click", () => {
        enableSlider()
        effect = effect === 1 ? 0 : 1
    })

    boxBlurButton.current.addEventListener("click", () => {
        enableSlider()
        effect = effect === 2 ? 0 : 2
    })

    sharpenButton.current.addEventListener("click", () => {
        enableSlider()
        effect = effect === 3 ? 0 : 3
    })

    embossButton.current.addEventListener("click", () => {
        enableSlider()
        effect = effect === 4 ? 0 : 4
    })

    laplacianButton.current.addEventListener("click", () => {
        enableSlider()
        effect = effect === 5 ? 0 : 5
    });

    faceMeshButton.current.addEventListener("click", () => {
        disableSlider()
        effect = effect === 6 ? 0 : 6
    })

    sliderRef.current.addEventListener("input", (e) => {
        //@ts-ignore
        document.querySelector("#slider-concurrency").innerHTML = e.target.value;
        //@ts-ignore
        numThreads = Number(e.target.value)
    });

    (async () => {
        makeWasmSrc();
        //@ts-ignore
        wasm = await wasm_bindgen(wasmSrc);
        //@ts-ignore
        memory = wasm.__wbindgen_export_0;
        await tf.ready()
        //@ts-ignore
        tfModel = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
        wasmLoaded()
    })();

}
