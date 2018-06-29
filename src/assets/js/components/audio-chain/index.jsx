import React from 'react';

import {Component} from 'react';
import autobind from 'core-decorators/es/autobind';

import {Alert} from 'reactstrap';

import AudioElementSource from '../audio-element-source';
import MediaStreamSource from '../media-stream-source';
import ConvolverFunction from '../convolver-function';

export default class AudioChain extends Component {
    constructor(props) {
        super(props);

        this.state = {
            convolverFunctionOn: true
        };

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.audioElementRef = React.createRef();

        // create audio nodes for convolver-function and connect convolver to its gain
        this.convolverNodeFunction = this.audioContext.createConvolver();
        this.gainNodeForConvolverFunction = this.audioContext.createGain();
        this.convolverNodeFunction.connect(this.gainNodeForConvolverFunction);
        this.gainNodeForConvolverFunction.connect(this.audioContext.destination);
    }

    @autobind()
    handleAudioSourceReady(audioElmRef) {
        // audio element ready...
        if (audioElmRef) {
            this.mediaElementAudioSourceNode = this.audioContext.createMediaElementSource(audioElmRef);
            this.mediaElementAudioSourceNode.connect(this.convolverNodeFunction);
            this.mediaElementAudioSourceNode.connect(this.audioContext.destination);
        }
    }

    @autobind()
    handleStreamReady(audioStream) {
        // audio stream is open...
        this.mediaStreamAudioSourceNode = this.audioContext.createMediaStreamSource(audioStream);
        this.mediaStreamAudioSourceNode.connect(this.convolverNodeFunction);
        this.mediaStreamAudioSourceNode.connect(this.audioContext.destination);
    }

    @autobind()
    handleConvolverFunctionPowerToggle(e) {
        this.setState(prev => {
            if(prev.convolverFunctionOn) {
                this.gainNodeForConvolverFunction.disconnect(this.audioContext.destination)
            } else {
                this.gainNodeForConvolverFunction.connect(this.audioContext.destination);
            }
            return {
                convolverFunctionOn: !prev.convolverFunctionOn
            };
        });
    }

    render() {
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
                    <AudioElementSource onAudioElementRef={this.handleAudioSourceReady}/>
                </div>
                <div className="col">
                    <MediaStreamSource onAudioSourceReady={this.handleStreamReady}/>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col">
                    <ConvolverFunction convolverNode={this.convolverNodeFunction}
                                       gainNode={this.gainNodeForConvolverFunction}
                                       powerOn={this.state.convolverFunctionOn}
                                       onPowerToggle={this.handleConvolverFunctionPowerToggle}/>
                </div>
            </div>
        </div>;
    }

    componentDidMount() {

    }
}