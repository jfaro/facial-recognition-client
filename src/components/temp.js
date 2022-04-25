import React, { Component } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';
import styled from 'styled-components';
// import WebCamPicture from './components/WebCamPicture.js';

import Webcam from 'react-webcam';

const videoConstraints = {
    width: 350,
    height: 350,
    facingMode: 'user',
};

const MODEL_URL = '/models'
const minConfidence = 0.6
// const testImage = '/img/bonnie.jpg'

const MainContainer = styled.div`
  background: red;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
`;

const TopRowDiv = styled.div`
  height: ${props => props.height}%;
  width: inherit;
  background: yellow;
  flex-direction: row;
  justify-content: flex-start;
  display: flex;
`;

const BottomRowDiv = styled.div`
  background: green;
  width: inherit;
  flex: 1;
`;

const HorizontalRange = styled.input`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
`;

const VerticalRange = styled.input`
  height: 100%;
  position: absolute;
  transform: rotate(90deg);
  width: 100vh;
  right: -50vh;
  // width: 10px;
  top: 0;
  // writing-mode: bt-lr; /* IE */
  // -webkit-appearance: slider-vertical; /* WebKit */
`;

const VideoDiv = styled.div`
  text-align: center;
  width: ${props => props.width}%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  // flex-direction: row;
  background: #0f2338; /* Old browsers */
  background: -moz-linear-gradient(top, #0f2338 0%, #2d73aa 100%); /* FF3.6-15 */
  background: -webkit-linear-gradient(top, #0f2338 0%,#2d73aa 100%); /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to bottom, #0f2338 0%,#2d73aa 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  border: 1px solid red;
`;

export default class App extends Component {
    constructor(props) {
        super(props);
        this.fullFaceDescriptions = null;
        this.canvas = React.createRef();
        this.canvasPicWebCam = React.createRef();
        this.webcam = React.createRef();
        this.state = {
            width: 50,
            height: 50,
            imageSrc: null,
        }
    }

    async componentDidMount() {
        await this.loadModels();
        // const testImageHTML = document.getElementById('test')
        // this.drawHTMLImage(this.canvas.current,testImageHTML,296,296);
        // await this.getFullFaceDescription(this.canvas.current);
        // this.drawDescription(this.canvas.current);

        setInterval(() => {
            this.capture();
        }, 1000);
    }

    async loadModels() {
        //await faceapi.loadModels(MODEL_URL)
        await faceapi.loadFaceDetectionModel(MODEL_URL)
        await faceapi.loadFaceLandmarkModel(MODEL_URL)
        await faceapi.loadFaceRecognitionModel(MODEL_URL)
    }

    capture = () => {
        const imageSrc = this.webcam.current.getScreenshot();
        //console.log("Take Picture");
        // this.props.landmarkPicture(imageSrc);
        // this.setState({ imageSrc });
        this.landmarkWebCamPicture(imageSrc);
    };

    landmarkWebCamPicture = (picture) => {
        const ctx = this.canvasPicWebCam.current.getContext("2d");
        var image = new Image();
        image.onload = async () => {
            ctx.drawImage(image, 0, 0);
            await this.getFullFaceDescription(this.canvasPicWebCam.current);
            this.drawDescription(this.canvasPicWebCam.current);
        };
        image.src = picture;
    }

    getFullFaceDescription = async (canvas) => {
        console.log(canvas);
        this.fullFaceDescriptions = await faceapi
            .allFaces(canvas, minConfidence);
        console.log(this.fullFaceDescriptions);
    }

    drawDescription = (canvas) => {
        this.fullFaceDescriptions.forEach((fd, i) => {
            console.log("drawDescription", i, fd);
            faceapi.drawLandmarks(canvas, fd.landmarks, { drawLines: false })
        })
    }

    drawHTMLImage(canvas, image, width, height) {
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
    }

    render() {
        return (
            <div className="App" >
                <MainContainer>
                    <VerticalRange
                        type="range"
                        name="points"
                        min="0"
                        max="100"
                        step="0.1"
                        value={this.state.height}
                        onChange={(event) => this.setState({ height: event.target.value })}
                    />
                    <HorizontalRange
                        type="range"
                        name="points"
                        min="0"
                        max="100"
                        step="0.1"
                        value={this.state.width}
                        onChange={(event) => this.setState({ width: event.target.value })}
                    />
                    <TopRowDiv
                        height={this.state.height}
                    >
                        <VideoDiv
                            width={this.state.width}
                        >
                            <Webcam
                                audio={false}
                                height={350}
                                ref={this.webcam}
                                screenshotFormat="image/jpeg"
                                width={350}
                                videoConstraints={videoConstraints}
                            />
                            <Canvas ref={this.canvasPicWebCam} width={350} height={350} />
                        </VideoDiv>
                    </TopRowDiv>
                    <BottomRowDiv />
                </MainContainer>
            </div>
        );
    }
}