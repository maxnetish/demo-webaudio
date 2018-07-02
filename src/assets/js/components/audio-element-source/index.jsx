import React from 'react';
import PropTypes from 'prop-types';

import {Component} from 'react';

import autobind from 'core-decorators/es/autobind';
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';

import classNames from 'classnames';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlay, faPause, faUndoAlt, faEject, faVolumeOff} from '@fortawesome/free-solid-svg-icons';
import {Button, ButtonGroup} from 'reactstrap';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import '../../../css/rangeslider-overrides.scss';
import '../../../css/file-drop.scss';

import fileObjectsFromEvent from '../../utils/file-object-from-drop-event';

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

function fileObjectsFromEventLocal(event) {
    return fileObjectsFromEvent({event, typeStartsWith: 'audio/'});
}

export default class AudioElementSource extends Component {

    static propTypes = {
        onAudioElementRef: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.fileInputElementRef = React.createRef();
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
            muted: false,
            draggingOver: false
        };
    }

    @autobind()
    handleDrop(e) {
        e.preventDefault();

        const files = fileObjectsFromEventLocal(e);

        if (files.length) {
            this.setState({
                draggingOver: false,
                mediaFileUrl: windowURL.createObjectURL(files[0]),
                mediaFileName: files[0].name
            });
        } else {
            this.setState({
                draggingOver: false
            });
        }
    }

    @autobind()
    handleDragEnter(e) {
        e.preventDefault();
        const files = fileObjectsFromEventLocal(e);
        if (files && files.length) {
            this.setState({
                draggingOver: true
            });
        }
    }

    @autobind()
    handleDragOver(e) {
        e.preventDefault();
    }

    @autobind()
    handleDragLeave(e) {
        e.preventDefault();
        this.setState({
            draggingOver: false
        });
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
    handleAudioSliderBeginChange(e) {
        this.sliderChanging = true;
    }

    @autobind()
    handleAudioSliderChangeComplete(e) {
        const self = this;
        const localSliderValue = this.state.sliderValue;
        setTimeout(function () {
            self.sliderChanging = false;
            if (this.audioElementRef) {
                this.audioElementRef.currentTime = localSliderValue;
            }
        }, 0);
    }

    @autobind()
    handleAudioSliderChange(e) {
        // set flag sliderChanging to prevent handleAudioTimeupdate() of setting slider value before call handleAudioSliderChangeComplete()
        this.sliderChanging = true;
        this.setState({
            sliderValue: e
        });
    }

    @autobind()
    handleCanPlay(e) {
        const {duration, currentTime} = e.target;
        this.setState({
            sliderMax: duration,
            sliderMin: 0,
            sliderValue: currentTime,
            sliderStep: 0.1
        });
    }

    @autobind()
    handleAudioTimeupdate(e) {
        const {currentTime} = e.target;
        if (this.sliderChanging) {
            this.setState({
                position: currentTime
            });
        } else {
            this.setState({
                position: currentTime,
                sliderValue: currentTime
            });
        }
    }

    @autobind()
    handlePlayPauseButton(e) {
        const audioElm = this.audioElementRef;
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
        this.setState({
            playState: paused ? 'PAUSE' : 'PLAY'
        });
    }

    @autobind()
    handlePauseAudio(e) {
        const {paused} = e.target;
        this.setState({
            playState: paused ? 'PAUSE' : 'PLAY'
        });
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

    @autobind()
    setAudioElementRef(audioElement) {
        this.audioElementRef = audioElement;
        if (this.props.onAudioElementRef) {
            this.props.onAudioElementRef(audioElement);
        }
    }

    render() {
        const state = this.state;
        const audioElm = this.audioElementRef;
        const playPauseIcon = {
            'PLAY': faPause,
            'PAUSE': faPlay
        };
        const wrapperClass = classNames({
            'file-drop dragging': state.draggingOver,
            'file-drop': !state.draggingOver
        });

        // update audio element media props
        if (audioElm) {
            audioElm.loop = !!state.loop;
            audioElm.muted = !!state.muted;
        }


        return <div className="rounded bg-light shadow">
            <div
                onDrop={this.handleDrop}
                onDragEnter={this.handleDragEnter}
                onDragOver={this.handleDragOver}
                onDragLeave={this.handleDragLeave}
                className={wrapperClass}
            >
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
                    ref={this.setAudioElementRef}
                />
                <div className="row">
                    <div className="col">
                        <h5>Audio player</h5>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-auto">
                        <ButtonGroup>
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
                    </div>
                    <div className="col text-monospace text-primary small">
                        <div>{this.formatSliderValue(state.position)}</div>
                        <div>{state.mediaFileName}</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col position-relative">
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
                        />
                    </div>
                </div>
            </div>
        </div>;
    }
};