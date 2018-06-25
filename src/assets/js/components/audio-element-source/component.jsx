import React from 'react';
import PropTypes from 'prop-types';

import {Component} from 'react';

import autobind from 'core-decorators/es/autobind';
import isFunction from 'lodash/isFunction';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';

import classNames from 'classnames';

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

    @autobind()
    audioElementRef(elm) {
        if (!elm) {
            // strange: refAudioElement calls with null after set src
            return;
        }
        if (isFunction(this.props.audioElementRef)) {
            this.props.audioElementRef(elm);
        }
        this.audioElementRef = elm;
    }

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
    formatSliderValue(val) {
        return positionToDisplay(val);
    }

    render() {
        return renderFn.call(this);
    }

    render() {
        const state = this.state;
        const props = this.props;

        const playBtnClass = classNames({
            'fas fa-play-circle fa-3x': state.playState === 'PAUSE',
            'fas fa-pause-circle fa-3x': state.playState === 'PLAY'
        });

        return <div className="card">
            <div className="caption">Audio source</div>
            <div>
                <input
                    style={{display: 'none'}}
                    type="file"
                    accept="audio/*"
                    onChange={this.handleChangeFileInput}
                    ref={this.fileInputElementRef}
                />
                <audio
                    controls
                    onCanPlay={this.handleCanPlay}
                    onTimeUpdate={this.handleAudioTimeupdate}
                    onPlay={this.handlePlayAudio}
                    onPause={this.handlePauseAudio}
                    src={state.mediaFileUrl}
                    ref={this.audioElementRef}
                />
                <div style={{display: 'flex'}}>
                    <div>
                        <button
                            type="button"
                            style={{height: 'auto'}}
                            disabled={!state.mediaFileUrl}
                            onClick={this.handlePlayPauseButton}
                        >
                            <i className={playBtnClass}/>
                            {playButtonLabelByState[state.playState]}
                        </button>
                    </div>
                    <div>{this.formatSliderValue(state.position)}</div>
                </div>
                <div style={{position:'relative'}}>
                    <div className="caption" style={{position: 'absolute', right:'0px', top: '-28px'}}>
                        {state.mediaFileUrl ? this.formatSliderValue(state.sliderMax) : null}
                    </div>
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
                <div>
                    <span>{state.mediaFileName}</span>
                </div>
            </div>
            <div className="card-actions">
                <button onClick={this.handleChooseButtonClick}>
                    <i className="fas fa-file-audio fa-lg"/>
                    {state.mediaFileName ? 'Choose another file' : 'Choose audio file'}
                </button>
            </div>
        </div>;
    }
};