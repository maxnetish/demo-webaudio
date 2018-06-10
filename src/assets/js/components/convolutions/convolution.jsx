import {h, Component} from 'preact';
import autobind from 'core-decorators/es/autobind';
import debounce from 'core-decorators/es/debounce';

const windowURL = window.URL;
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

        this.state = {
            duration: 0.2,
            decay: 2,
            gain: 0.5,
            reverse: false,
            mediaFileUrl: null
        };

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.updateImpulseBuffer();
    }

    @autobind
    handleChangeFileInput(e) {
        const fileObject = e.target.files[0];
        if (fileObject) {
            this.setState(prev => ({
                mediaFileUrl: windowURL.createObjectURL(fileObject)
            }));
        }
    }

    @autobind
    @debounce(250)
    handleChangeDurationInput(e) {
        this.setState(prev => ({
            duration: parseFloat(e.target.value)
        }));
    }

    @autobind
    @debounce(250)
    handleChangeDecayInput(e) {
        this.setState(prev => ({
            decay: parseFloat(e.target.value)
        }));
    }

    @autobind
    handleClickReverseInput(e) {
        this.setState(prev => ({
            reverse: !prev.reverse
        }));
    }

    @autobind
    @debounce(250)
    handleChangeGainInput(e) {
        this.convolverGain.gain.value = e.target.value;
        this.setState(prev => ({
            gain: parseFloat(e.target.value)
        }));
    }

    @autobind
    @debounce(500)
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
            if(this.convolver) {
                console.log('set impulse buffer');
                this.convolver.buffer = this.impulseBuffer;
            }
            propsOfImpulseBuffer.forEach(prop => {
                self.currentIpulseParams[prop] = self.state[prop];
            });
        }
    }

    @autobind
    refAudioElement(audioElm) {
        this.audioElement = audioElm;

        this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
        this.convolver = this.audioContext.createConvolver();
        this.convolverGain = this.audioContext.createGain();

        this.convolver.buffer = this.impulseBuffer;

        this.audioSource.connect(this.convolverGain);
        this.audioSource.connect(this.audioContext.destination);
        this.convolverGain.connect(this.convolver);
        this.convolver.connect(this.audioContext.destination);

        this.convolver.loop = true;
        this.convolver.normalize = true;
        this.convolverGain.gain.value = this.state.gain;
    }

    render(props, state) {
        this.updateImpulseBuffer();

        return <div>
            <div>
                <audio
                    controls
                    src={state.mediaFileUrl}
                    ref={this.refAudioElement}
                />
            </div>
            <div>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={this.handleChangeFileInput}
                />
            </div>
            <div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    list="reverbDurationMarks"
                    value={state.duration}
                    onInput={this.handleChangeDurationInput}
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