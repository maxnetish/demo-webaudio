import React from 'react';

import {Component} from 'react';
import autobind from 'core-decorators/es/autobind';

import {Alert} from 'reactstrap';

import AudioElementSource from '../audio-element-source/component';
import MediaStreamSource from '../media-stream-source';
import ConvolverFunction from '../convolver-function';

export default class Convolution extends Component {
    constructor(props) {
        super(props);

        // this.audioElementSourceRef = React.createRef();

        this.state = {

        };

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    @autobind()
    handleAudioSourceReady(audioElmRef) {
        const audioElement = audioElmRef.current;
        this.audioSource = this.audioContext.createMediaElementSource(audioElement);
        this.audioSource.connect(this.convolver);
        this.audioSource.connect(this.audioContext.destination);
    }

    @autobind()
    handleStreamReady(audioStream) {
        this.audioStreamSource = this.audioContext.createMediaStreamSource(audioStream);
        this.audioStreamSource.connect(this.convolver);
        this.audioStreamSource.connect(this.audioContext.destination);
    }

    @autobind()
    handleConvolverReady({inputNode, outputNode}) {
        outputNode.connect(this.audioContext.destination);
        this.convolver = inputNode;
    }

    render() {
        const state = this.state;
        const props = this.props;

        return <div>
            <div className="row">
                <div className="col">
                    <Alert color="info">
                        Apply convolution with impulse response to produce reverberation-like effect.
                        What is convolution? See <a className="alert-link"
                                                    href="https://en.wikipedia.org/wiki/Convolution_reverb"
                                                    target="_blank">here</a>
                    </Alert>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col">
                    <AudioElementSource onAudioSourceReady={this.handleAudioSourceReady}/>
                </div>
                <div className="col">
                    <MediaStreamSource onAudioSourceReady={this.handleStreamReady}/>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col">
                    <ConvolverFunction onConvolverReady={this.handleConvolverReady} audioContextInstance={this.audioContext}/>
                </div>
            </div>
        </div>;
    }

    componentDidMount() {

    }
}