import React from 'react';
import {Component} from 'react';
import classNames from 'classnames';

import autobind from 'core-decorators/es/autobind';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlay, faStop, faPause, faUndoAlt, faEject, faVolumeOff} from '@fortawesome/free-solid-svg-icons';
import {Input, Alert, Button} from 'reactstrap';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import '../../../css/rangeslider-overrides.scss';
import PropTypes from 'prop-types';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import pick from 'lodash/pick';

const convolverParameters = [
    {
        code: 'duration',
        label: 'Duration',
        min: 0,
        max: 10,
        step: 0.1
    },
    {
        code: 'decay',
        label: 'Decay',
        min: 0,
        max: 10,
        step: 0.1
    },
    {
        code: 'gain',
        label: 'Gain',
        min: 0,
        max: 1,
        step: 0.05
    }
];

const propsOfImpulseBuffer = ['duration', 'decay'];

function impulseResponse({duration = 0.2, decay = 2, reverse = false, contextInstance}) {
    const sampleRate = contextInstance.sampleRate || 44100;
    const length = sampleRate * (duration || 0.01);
    const impulse = contextInstance.createBuffer(2, length, sampleRate);
    let impulseL = impulse.getChannelData(0);
    let impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (let i = 0; i < length; i++) {
        let n = reverse ? length - i : i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
}

export default class ConvolverFunction extends Component {

    static propTypes = {
        onConvolverReady: PropTypes.func.isRequired,
        audioContextInstance: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            duration: 0.2,
            decay: 2,
            gain: 0.5
        };

        this.changing = {};

        this.convolver = props.audioContextInstance.createConvolver();
        this.convolverGain = props.audioContextInstance.createGain();

        this.convolver.loop = true;
        this.convolver.normalize = true;
        this.convolverGain.gain.value = this.state.gain;

        this.convolver.connect(this.convolverGain);

        this.updateImpulseBuffer();

        props.onConvolverReady({inputNode: this.convolver, outputNode: this.convolverGain});
    }

    @autobind()
    handleSliderBeginChange(paramCode, e) {
        this.changing[paramCode] = true;
    }

    @autobind()
    handleSliderChangeComplete(paramCode, e) {
        this.changing[paramCode] = false;
    }

    @autobind()
    handleliderChange(paramCode, e) {
        this.changing[paramCode] = true;
        this.setState({
            [paramCode]: e
        });
    }

    @autobind()
    formatSliderValue(val){
        if (isNaN(val) || !isNumber(val)) {
            return '-';
        }
        return val.toFixed(2);
    }

    @autobind
    updateImpulseBuffer() {
        const self = this;
        this.currentIpulseParams = this.currentIpulseParams || {};

        if (propsOfImpulseBuffer.some(prop => {
            return self.currentIpulseParams[prop] !== self.state[prop];
        })) {
            this.impulseBuffer = impulseResponse(Object.assign({contextInstance: this.props.audioContextInstance}, pick(this.state, propsOfImpulseBuffer)));
            if (this.convolver) {
                this.convolver.buffer = this.impulseBuffer;
            }
            this.currentIpulseParams = pick(this.state, propsOfImpulseBuffer);
        }
    }

    render() {
        const state = this.state;

        this.updateImpulseBuffer();
        if (this.convolverGain) {
            this.convolverGain.gain.value = this.state.gain;
        }

        return <div className="rounded bg-light shadow p-1">
            <div className="row">
                <div className="col">
                    <h5>Convolver</h5>
                </div>
            </div>
            {convolverParameters.map(convolverParameter =>
                <div className="row" key={convolverParameter.code}>
                    <div className="col-sm-8">
                        <Slider
                            value={state[convolverParameter.code]}
                            max={convolverParameter.max}
                            min={convolverParameter.min}
                            step={convolverParameter.step}
                            orientation="horizontal"
                            tooltip={true}
                            format={this.formatSliderValue}
                            onChangeStart={this.handleSliderBeginChange.bind(this, convolverParameter.code)}
                            onChangeComplete={this.handleSliderChangeComplete.bind(this, convolverParameter.code)}
                            onChange={this.handleliderChange.bind(this, convolverParameter.code)}
                        />
                    </div>
                    <div className="col-sm-1 align-self-center text-primary text-monospace">
                        {this.formatSliderValue(state[convolverParameter.code])}
                    </div>
                    <div className="col-sm-3 align-self-center">
                        {convolverParameter.label}
                    </div>
                </div>
            )}
        </div>;
    }
};