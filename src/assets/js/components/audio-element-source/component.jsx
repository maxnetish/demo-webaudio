import React from 'react';
import PropTypes from 'prop-types';

import {Component} from 'react';

import autobind from 'core-decorators/es/autobind';
import isFunction from 'lodash/isFunction';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';

import classNames from 'classnames';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlay, faPause, faUndoAlt, faEject, faVolumeOff} from '@fortawesome/free-solid-svg-icons';
import {Button, ButtonGroup} from 'reactstrap';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import './rangeslider-overrides.scss';

const windowURL = window.URL;

const playButtonLabelByState = {
    PAUSE: 'Play',
    PLAY: 'Pause'
};

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

    static propTypes = {
        onAudioSourceReady: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.fileInputElementRef = React.createRef();
        this.audioElementRef = React.createRef();
        this.sliderPositionRef = React.createRef();

        this.canPlaySentOnce = false;
        this.sliderChanging = false;

        this.state = {
            mediaFileUrl: null,
            mediaFileName: null,
            sliderStep: 1,
            sliderVal: 0,
            sliderMax: 10,
            sliderDisabled: false,
            playState: 'PAUSE', // PLAY
            position: null,
            loop: false,
            muted: false
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
        if (this.fileInputElementRef.current) {
            this.fileInputElementRef.current.click(e.detail.value);
        }
    }

    // @autobind()
    // audioElementRef(elm) {
    //     if (!elm) {
    //         // strange: refAudioElement calls with null after set src
    //         return;
    //     }
    //     if (isFunction(this.props.audioElementRef)) {
    //         this.props.audioElementRef(elm);
    //     }
    //     this.audioElementRef = elm;
    // }

    @autobind()
    handleAudioSliderBeginChange(e) {
        this.sliderChanging = true;
    }

    @autobind()
    handleAudioSliderChangeComplete(e) {
        const self = this;
        const localSliderValue = this.state.sliderValue;
        setTimeout(function () {
            self.sliderChanging = false;
            if (self.audioElementRef.current) {
                self.audioElementRef.current.currentTime = localSliderValue;
            }
        }, 0);
    }

    @autobind()
    handleAudioSliderChange(e) {
        // set flag sliderChanging to prevent handleAudioTimeupdate() of setting slider value before call handleAudioSliderChangeComplete()
        this.sliderChanging = true;
        this.setState(prev => ({
            sliderValue: e
        }));
    }

    @autobind()
    handleCanPlay(e) {
        const {duration, currentTime} = e.target;

        if (isFunction(this.props.onAudioSourceReady) && !this.canPlaySentOnce) {
            this.props.onAudioSourceReady(this.audioElementRef);
            this.canPlaySentOnce = true;
        }

        this.setState(prev => ({
            sliderMax: duration,
            sliderMin: 0,
            sliderValue: currentTime,
            sliderStep: 0.1
        }));
    }

    @autobind()
    handleAudioTimeupdate(e) {
        const {currentTime} = e.target;
        if (this.sliderChanging) {
            this.setState(prev => ({
                position: currentTime
            }));
        } else {
            this.setState(prev => ({
                position: currentTime,
                sliderValue: currentTime
            }));
        }
    }

    @autobind()
    handlePlayPauseButton(e) {
        const audioElm = this.audioElementRef.current;
        if (!audioElm) {
            return;
        }
        if (audioElm.paused) {
            audioElm.play();
        } else {
            audioElm.pause();
        }
    }

    @autobind()
    handlePlayAudio(e) {
        const {paused} = e.target;
        this.setState(prev => ({
            playState: paused ? 'PAUSE' : 'PLAY'
        }));
    }

    @autobind()
    handlePauseAudio(e) {
        const {paused} = e.target;
        this.setState(prev => ({
            playState: paused ? 'PAUSE' : 'PLAY'
        }));
    }

    @autobind()
    handleLoopButton(e) {
        this.setState(prev => ({
            loop: !prev.loop
        }));
    }
    
    @autobind()
    handleMuteButton(e) {
        this.setState(prev => ({
            muted: !prev.muted
        }));
    }

    @autobind()
    formatSliderValue(val) {
        return positionToDisplay(val);
    }

    render() {
        const state = this.state;
        const props = this.props;
        const audioElm = this.audioElementRef.current;

        const playPauseIcon = {
            'PLAY': faPause,
            'PAUSE': faPlay
        };

        // update audio element media props
        if(audioElm) {
            audioElm.loop = !!state.loop;
            audioElm.muted = !!state.muted;
        }


        return <div>
            <div>
                <input
                    style={{display: 'none'}}
                    type="file"
                    accept="audio/*"
                    onChange={this.handleChangeFileInput}
                    ref={this.fileInputElementRef}
                />
                <audio
                    onCanPlay={this.handleCanPlay}
                    onTimeUpdate={this.handleAudioTimeupdate}
                    onPlay={this.handlePlayAudio}
                    onPause={this.handlePauseAudio}
                    src={state.mediaFileUrl}
                    ref={this.audioElementRef}
                />
                <div className="d-flex">
                    <ButtonGroup className="align-self-start">
                        <Button color="primary" onClick={this.handleChooseButtonClick}>
                            <FontAwesomeIcon icon={faEject}/>
                        </Button>
                        <Button color="primary" onClick={this.handlePlayPauseButton} disabled={!state.mediaFileUrl}>
                            <FontAwesomeIcon icon={playPauseIcon[state.playState]}/>
                        </Button>
                        <Button color="primary" active={!!state.loop} onClick={this.handleLoopButton}>
                            <FontAwesomeIcon icon={faUndoAlt}/>
                        </Button>
                        <Button color="primary" active={!!state.muted} onClick={this.handleMuteButton}>
                            <FontAwesomeIcon icon={faVolumeOff}/>
                        </Button>
                    </ButtonGroup>
                    <div className="pl-1 pr-1 text-monospace text-primary small">
                        <div>{this.formatSliderValue(state.position)}</div>
                        <div>{state.mediaFileName}</div>
                    </div>
                </div>
                <div style={{position:'relative'}}>
                    <Slider
                        value={state.sliderValue}
                        max={state.sliderMax}
                        step={state.sliderStep}
                        orientation="horizontal"
                        tooltip={true}
                        format={this.formatSliderValue}
                        onChangeStart={this.handleAudioSliderBeginChange}
                        onChangeComplete={this.handleAudioSliderChangeComplete}
                        onChange={this.handleAudioSliderChange}
                        ref={this.sliderPositionRef}
                    />
                    {/*<Slider step={state.sliderStep} value={state.sliderValue} max={state.sliderMax}*/}
                    {/*disabled={state.sliderDisabled} onChange={this.onAudioSliderChange}*/}
                    {/*onInput={this.onAudioSliderInput}/>*/}
                </div>
            </div>
        </div>;
    }
};