import { useState, useRef, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import axios from 'axios'


const WebcamVideo = () => {
    const videoHeight = 400
    const videoWidth = 400

    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [mediaStream, setMediaStream] = useState()
    const [names, setNames] = useState(null)
    const [loadingNames, setLoadingNames] = useState(false)
    const videoRef = useRef()
    const canvasRef = useRef()

    // Load models
    useEffect(() => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            // faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models")
        ]).then(() => {
            console.log("Models loaded");
            setModelsLoaded(true)
        })
    }, []);

    // Start/stop video
    useEffect(() => {
        const enableStream = async () => {
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: videoWidth,
                    height: videoHeight
                }
            })
                .then(stream => {
                    videoRef.current.srcObject = stream
                    videoRef.current.play()
                        .then(() => setMediaStream(stream))
                        .catch(err => console.error(err))
                })
                .catch(err => console.error(err))
        }

        if (!mediaStream) {
            enableStream()
        } else {
            return () => {
                mediaStream.getTracks().forEach(track => track.stop())
                setMediaStream(null)
            }
        }
    }, [mediaStream])

    // Update loop
    useEffect(() => {

        const updateOverlay = async () => {

            // Get detections
            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                // .withFaceLandmarks()
                .withFaceExpressions()

            // Resize detections
            const displaySize = { width: videoWidth, height: videoHeight }
            const resizedDetections = faceapi.resizeResults(
                detections,
                displaySize
            );

            if (canvasRef && canvasRef.current) {
                // Draw to canvas
                const canvas = canvasRef.current
                const context = canvas.getContext("2d")
                context.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            }
        }

        const interval = setInterval(() => {
            if (mediaStream && modelsLoaded) {
                updateOverlay()
            }
        }, 100)

        return () => clearInterval(interval)
    }, [mediaStream, modelsLoaded])

    const getScreenshot = () => {
        const canvas = getCanvas()
        return (canvas && canvas.toDataURL('image/jpeg'))
    }

    const getCanvas = () => {
        if (!videoRef || !videoRef.current) {
            return null
        }

        const canvas = document.createElement('canvas')
        canvas.width = videoWidth
        canvas.height = videoHeight

        const ctx = canvas.getContext('2d')
        if (ctx && canvas) {
            ctx.imageSmoothingEnabled = true
            ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight)
        }
        return canvas
    }

    // Get names associated with current frame
    const recognizeFaces = () => {

        // Get screenshot
        const imageSrc = getScreenshot()

        // Set loading true
        setLoadingNames(true)

        // Make request
        const URL = 'http://127.0.0.1:5000/api'
        axios.post(URL, { data: imageSrc })
            .then(res => {
                console.log('response: ', res)
                const data = res.data
                setNames(data.results)
                setLoadingNames(false)
            })
            .catch(err => {
                console.error(`error: ${err}`)
                setLoadingNames(false)
            })
    }

    let displayNames = "No known faces detected"
    if (loadingNames) {
        displayNames = "Loading names..."
    } else if (names && names.length > 0) {
        displayNames = ""
        names.forEach(name => {
            displayNames = `${displayNames} ${name}`
        })
    }

    return (
        <div className='vertical-layout'>
            <p>{!modelsLoaded ? 'Loading models...' : null}</p>
            <p>{!mediaStream ? 'Starting webcam...' : null}</p>
            <div className="video-container">
                <video
                    ref={videoRef}
                    width={videoWidth}
                    height={videoHeight}
                    preload="none" />
                <canvas
                    ref={canvasRef}
                    width={videoWidth}
                    height={videoHeight}
                />
            </div>
            <p>{displayNames}</p>
            <button onClick={recognizeFaces}>Detect face(s)</button>
        </div>
    );
}

export default WebcamVideo