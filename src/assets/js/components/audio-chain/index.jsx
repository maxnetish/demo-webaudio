import React from 'react';

import {Component} from 'react';
import autobind from 'core-decorators/es/autobind';

import {Alert} from 'reactstrap';

import AudioElementSource from '../audio-element-source';
import MediaStreamSource from '../media-stream-source';
import ConvolverFunction from '../convolver-function';
import ConvolverFile from '../convolver-file';
import AudioAnalyzer from '../audio-analyzer';

export default class AudioChain extends Component {
    constructor(props) {
        super(props);

        this.state = {
            convolverFunctionOn: true,
            audioAnalyzerOn: true,
            convolverFileOn: true
        };

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.audioElementRef = React.createRef();

        // create analyzer node
        this.audioAnalyzerNode = this.audioContext.createAnalyser();
        this.audioAnalyzerNode.connect(this.audioContext.destination);

        // create audio nodes for convolver-function and connect convolver to its gain
        this.convolverNodeFunction = this.audioContext.createConvolver();
        this.gainNodeForConvolverFunction = this.audioContext.createGain();
        this.convolverNodeFunction.connect(this.gainNodeForConvolverFunction);
        this.gainNodeForConvolverFunction.connect(this.audioAnalyzerNode);

        // create audio node for convolver file
        this.convolverNodeFile = this.audioContext.createConvolver();
        this.gainNodeForVonvolverFile = this.audioContext.createGain();
        this.convolverNodeFile.connect(this.gainNodeForVonvolverFile);
        this.gainNodeForVonvolverFile.connect(this.audioAnalyzerNode);
    }

    @autobind()
    handleAudioSourceReady(audioElmRef) {
        // audio element ready...
        if (audioElmRef) {
            this.mediaElementAudioSourceNode = this.audioContext.createMediaElementSource(audioElmRef);
            this.mediaElementAudioSourceNode.connect(this.convolverNodeFunction);
            this.mediaElementAudioSourceNode.connect(this.convolverNodeFile);
            this.mediaElementAudioSourceNode.connect(this.audioAnalyzerNode);
        }
    }

    @autobind()
    handleStreamReady(audioStream) {
        // audio stream is open...
        this.mediaStreamAudioSourceNode = this.audioContext.createMediaStreamSource(audioStream);
        this.mediaStreamAudioSourceNode.connect(this.convolverNodeFunction);
        this.mediaStreamAudioSourceNode.connect(this.convolverNodeFile);
        this.mediaStreamAudioSourceNode.connect(this.audioAnalyzerNode);
    }

    @autobind()
    handleConvolverFunctionPowerToggle(e) {
        this.setState(prev => {
            if (prev.convolverFunctionOn) {
                this.gainNodeForConvolverFunction.disconnect(this.audioAnalyzerNode);
            } else {
                this.gainNodeForConvolverFunction.connect(this.audioAnalyzerNode);
            }
            return {
                convolverFunctionOn: !prev.convolverFunctionOn
            };
        });
    }

    @autobind()
    handleConvolverFilePowerToggle(e) {
        this.setState(prev => {
            if (prev.convolverFileOn) {
                this.gainNodeForVonvolverFile.disconnect(this.audioAnalyzerNode);
            } else {
                this.gainNodeForVonvolverFile.connect(this.audioAnalyzerNode);
            }
            return {
                convolverFileOn: !prev.convolverFileOn
            };
        });
    }

    @autobind()
    handleAudioAnalyzerPowerToggle(e) {
        this.setState(prev => {
            return {
                audioAnalyzerOn: !prev.audioAnalyzerOn
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
                <div className="col">
                    <ConvolverFile convolverNode={this.convolverNodeFile}
                                   gainNode={this.gainNodeForVonvolverFile}
                                   powerOn={this.state.convolverFileOn}
                                   onPowerToggle={this.handleConvolverFilePowerToggle}/>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col">
                    <AudioAnalyzer powerOn={this.state.audioAnalyzerOn}
                                   onPowerToggle={this.handleAudioAnalyzerPowerToggle}
                                   analyzerNode={this.audioAnalyzerNode}/>
                </div>
            </div>
        </div>;
    }

    componentDidMount() {

    }
}