import {h, Component} from 'preact';

import autobind from 'core-decorators/es/autobind';
import isFunction from 'lodash/isFunction';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';

import classNames from 'classnames';

import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';

import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';

import Typography from 'preact-material-components/Typography';
import 'preact-material-components/Typography/style.css';

import Slider from 'preact-material-components/Slider';
import 'preact-material-components/Slider/style.css';


const windowURL = window.URL;

function positionToDisplay(pos) {
    if (isNaN(pos) || !isNumber(pos)) {
        return '--:--';
    }
    let minutes = Math.floor(pos / 60);
    let seconds = Math.floor(pos - (minutes * 60));

    seconds = seconds.toString(10);
    seconds = seconds.length === 1 ? '0' + seconds : seconds;

    return `${minutes}:${seconds}`;
}

export default class AudioSourceElement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mediaFileUrl: null,
            mediaFileName: null,
            sliderStep: 1,
            sliderVal: 0,
            sliderMax: 10,
            sliderDisabled: false,
            sliderChanging: false,
            playState: 'PAUSE', // PLAY
            position: null
        };
    }

    @autobind()
    handleChangeFileInput(e) {
        const fileObject = e.target.files[0];
        if (fileObject) {
            this.setState(prev => ({
                mediaFileUrl: windowURL.createObjectURL(fileObject),
                mediaFileName: fileObject.name
            }));
        }
    }

    @autobind()
    handleChooseButtonClick(e) {
        this.fileInputElement.click(e.detail.value);
    }

    @autobind()
    refAudioElement(elm) {
        if (!elm) {
            // strange: refAudioElement calls with null after set src
            return;
        }
        if (isFunction(this.props.refAudioElement)) {
            this.props.refAudioElement(elm);
        }
        this.refAudioElement = elm;
    }

    @autobind()
    onAudioSliderInput(e) {
        console.log('onAudioSliderInput');
        this.setState(prev => ({
            sliderChanging: true,
            sliderValue: e.detail.value
        }));
    }

    @autobind()
    onAudioSliderChange(e) {
        this.refAudioElement.currentTime = e.detail.value;
        this.setState(prev => ({
            sliderChanging: false,
            sliderValue: e.detail.value
        }));
    }

    @autobind()
    handleCanPlay(e) {
        this.setState(prev => ({
            sliderMax: e.target.duration,
            sliderMin: 0,
            sliderValue: e.target.currentTime,
            sliderStep: 0.1
        }));
    }

    @autobind()
    handleAudioTimeupdate(e) {
        this.setState(prev => {
            // do not modify slider when user drags it
            if (prev.sliderChanging) {
                return {
                    position: e.target.currentTime
                };
            }

            return {
                position: e.target.currentTime,
                sliderValue: e.target.currentTime
            };
        });
    }

    @autobind()
    handlePlayPauseButton(e) {
        if (this.refAudioElement.paused) {
            this.refAudioElement.play();
        } else {
            this.refAudioElement.pause();
        }
    }

    @autobind()
    handlePlayAudio(e) {
        this.setState(prev => ({
            playState: e.target.paused ? 'PAUSE' : 'PLAY'
        }));
    }

    @autobind()
    handlePauseAudio(e) {
        this.setState(prev => ({
            playState: e.target.paused ? 'PAUSE' : 'PLAY'
        }));
    }

    render(props, state, context) {
        const playBtnClass = classNames({
            'fas fa-play-circle fa-3x': state.playState === 'PAUSE',
            'fas fa-pause-circle fa-3x': state.playState === 'PLAY'
        });

        return <Card>
            <Typography caption>Audio source</Typography>
            <div>
                <input
                    style="display:none"
                    type="file"
                    accept="audio/*"
                    onChange={this.handleChangeFileInput}
                    ref={elm => this.fileInputElement = elm}
                />
                <audio
                    style="display:none"
                    onCanPlay={this.handleCanPlay}
                    onTimeUpdate={this.handleAudioTimeupdate}
                    onPlay={this.handlePlayAudio}
                    onPause={this.handlePauseAudio}
                    controls
                    src={state.mediaFileUrl}
                    ref={this.refAudioElement}
                />
                <div style={{display: 'flex'}}>
                    <div>
                        <Button style={{height: 'auto'}} disabled={!state.mediaFileUrl}
                                onClick={this.handlePlayPauseButton}>
                            <i className={playBtnClass}/>
                        </Button>
                    </div>
                    <div>
                        {state.mediaFileUrl ?
                            <Typography headline4>{positionToDisplay(state.position)}</Typography> : null}
                    </div>
                </div>
                <div>
                    <Typography caption style={{position: 'absolute', right: '20px'}}>{state.mediaFileUrl ? positionToDisplay(state.sliderMax) : null}</Typography>
                    <Slider step={state.sliderStep} value={state.sliderValue} max={state.sliderMax}
                            disabled={state.sliderDisabled} onChange={this.onAudioSliderChange}
                            onInput={this.onAudioSliderInput}/>
                </div>
                <div>
                    <Typography body1>{state.mediaFileName}</Typography>
                </div>
            </div>
            <Card.Actions>
                <Card.ActionButton onClick={this.handleChooseButtonClick}>
                    <i className="fas fa-file-audio fa-lg"/>
                    {state.mediaFileName ? 'Choose another file' : 'Choose audio file'}
                </Card.ActionButton>
            </Card.Actions>
        </Card>;
    }
};