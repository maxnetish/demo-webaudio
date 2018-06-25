import React from 'react';

import {Component} from 'react';
import autobind from 'core-decorators/es/autobind';

import AudioElementSource from '../audio-element-source/component';

const propsOfImpulseBuffer = ['duration', 'decay', 'reverse'];

function impulseResponse({duration = 0.2, decay = 2, reverse, contextInstance}) {
    const sampleRate = contextInstance.sampleRate;
    const length = sampleRate * (duration || 0.01);
    const impulse = contextInstance.createBuffer(2, length, sampleRate);
    let impulseL = impulse.getChannelData(0);
    let impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++) {
        var n = reverse ? length - i : i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
}

export default class Convolution extends Component {
    constructor(props) {
        super(props);

        this.audioElementSourceRef = React.createRef();

        this.state = {
            duration: 0.2,
            decay: 2,
            gain: 0.5,
            reverse: false
        };

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.convolver = this.audioContext.createConvolver();
        this.convolverGain = this.audioContext.createGain();

        this.convolver.loop = true;
        this.convolver.normalize = true;
        this.convolverGain.gain.value = this.state.gain;

        this.convolver.connect(this.convolverGain);
        this.convolverGain.connect(this.audioContext.destination);

        this.updateImpulseBuffer();
    }

    @autobind
    handleInputDurationInput(e) {
        const {value} = e.target;
        this.setState(prev => ({
            duration: parseFloat(value)
        }));
    }

    @autobind
    handleChangeDecayInput(e) {
        const {value} = e.target;
        this.setState(prev => ({
            decay: parseFloat(value)
        }));
    }

    @autobind
    handleClickReverseInput(e) {
        this.setState(prev => ({
            reverse: !prev.reverse
        }));
    }

    @autobind
    handleChangeGainInput(e) {
        const {value} = e.target;
        this.setState(prev => ({
            gain: parseFloat(value)
        }));
    }

    @autobind
    updateImpulseBuffer() {
        const self = this;
        this.currentIpulseParams = this.currentIpulseParams || {};

        if (propsOfImpulseBuffer.some(prop => {
            return self.currentIpulseParams[prop] !== self.state[prop];
        })) {
            this.impulseBuffer = impulseResponse({
                contextInstance: this.audioContext,
                duration: this.state.duration,
                decay: this.state.decay,
                reverse: this.state.reverse
            });
            if (this.convolver) {
                console.log('set impulse buffer');
                this.convolver.buffer = this.impulseBuffer;
            }
            propsOfImpulseBuffer.forEach(prop => {
                self.currentIpulseParams[prop] = self.state[prop];
            });
        }
    }

    @autobind
    buildAudioChain() {
        // not used

        const audioElement = this.audioElementSourceRef.current &&
            this.audioElementSourceRef.current.audioElementRef &&
            this.audioElementSourceRef.current.audioElementRef.current;

        console.log(audioElement);

        // this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
        // this.convolver = this.audioContext.createConvolver();
        // this.convolverGain = this.audioContext.createGain();
        //
        // this.convolver.buffer = this.impulseBuffer;
        //
        // this.audioSource.connect(this.convolverGain);
        // this.audioSource.connect(this.audioContext.destination);
        // this.convolverGain.connect(this.convolver);
        // this.convolver.connect(this.audioContext.destination);
        //
        // this.convolver.loop = true;
        // this.convolver.normalize = true;
        // this.convolverGain.gain.value = this.state.gain;
    }

    @autobind()
    handleAudioSourceReady (audioElmRef) {
     const audioElement = audioElmRef.current;
        this.audioSource = this.audioContext.createMediaElementSource(audioElement);
        this.audioSource.connect(this.convolver);
        this.audioSource.connect(this.audioContext.destination);
    }

    render() {
        const state = this.state;
        const props = this.props;

        this.updateImpulseBuffer();
        if (this.convolverGain) {
            this.convolverGain.gain.value = this.state.gain;
        }

        return <div>
            <div>
                <h3>Convolution effect</h3>
                <p>
                    Apply convolution with simple impulse response to produce reverberation-like effect.
                </p>
                <p>
                    What is convolution? See <a href="https://en.wikipedia.org/wiki/Convolution_reverb"
                                                target="_blank">here</a>
                </p>
            </div>
            <AudioElementSource ref={this.audioElementSourceRef} onAudioSourceReady={this.handleAudioSourceReady}/>
            <div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    list="reverbDurationMarks"
                    value={state.duration}
                    onInput={this.handleInputDurationInput}
                    onChange={this.handleInputDurationInput}
                />
                <datalist id="reverbDurationMarks">
                    <option value="0" label="0"/>
                    <option value="2"/>
                    <option value="4"/>
                    <option value="6"/>
                    <option value="8"/>
                    <option value="10" label="10"/>
                </datalist>
                <span>Duration: {state.duration}</span>
            </div>
            <div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    list="reverbDecayMarks"
                    value={state.decay}
                    onInput={this.handleChangeDecayInput}
                    onChange={this.handleChangeDecayInput}
                />
                <datalist id="reverbDecayMarks">
                    <option value="0" label="0"/>
                    <option value="2"/>
                    <option value="4"/>
                    <option value="6"/>
                    <option value="8"/>
                    <option value="10" label="10"/>
                </datalist>
                <span>Decay: {state.decay}</span>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={state.reverse}
                        onClick={this.handleClickReverseInput}
                    />
                    Reverse
                </label>
            </div>
            <div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    list="reverbGainMarks"
                    value={state.gain}
                    onInput={this.handleChangeGainInput}
                    onChange={this.handleChangeGainInput}
                />
                <datalist id="reverbGainMarks">
                    <option value="0" label="0"/>
                    <option value="0.2"/>
                    <option value="0.4"/>
                    <option value="0.6"/>
                    <option value="0.8"/>
                    <option value="1" label="1"/>
                </datalist>
                <span>Gain: {state.gain}</span>
            </div>
        </div>;
    }

    componentDidMount() {

    }
}