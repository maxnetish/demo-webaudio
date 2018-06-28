import React from 'react';
import {Component} from 'react';
import classNames from 'classnames';

import autobind from 'core-decorators/es/autobind';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlay, faStop, faPause, faUndoAlt, faEject, faVolumeOff} from '@fortawesome/free-solid-svg-icons';
import {Input, Alert, Button} from 'reactstrap';
import PropTypes from "prop-types";

export default class MediaStreamSource extends Component {

    static propTypes = {
        onAudioSourceReady: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            err: null,
            mediaStream: null,
            enabled: true
        };
    }

    componentDidMount() {

    }

    @autobind()
    handlePlayButton(e) {
        const self = this;

        if (this.state.mediaStream) {
            this.setState(prev => ({
                enabled: !prev.enabled
            }));
            return;
        }

        window.navigator.mediaDevices.getUserMedia({audio: true})
            .then(function (stream) {
                self.setState({
                    mediaStream: stream
                });
                if (self.props.onAudioSourceReady) {
                    self.props.onAudioSourceReady(stream);
                }
                return stream;
            })
            .then(null, err => {
                self.setState({
                    err: err
                });
            });
    }

    @autobind()
    handleSelevtedMediaDeviceChange(e) {
        this.setState({
            selectedMediaDeviceId: e.target.value
        });
    }

    render() {
        const state = this.state;
        const audioTracks = state.mediaStream ? state.mediaStream.getAudioTracks() : [];

        if(audioTracks.length) {
            audioTracks[0].enabled = state.enabled;
        }

        const playButtonIcon = (audioTracks.length && audioTracks[0].enabled) ? faStop : faPlay;

        return <div className="rounded bg-light shadow p-1">
            <div className="row">
                <div className="col">
                    <h5>WebRTC media stream</h5>
                </div>
            </div>
            <div className="row">
                <div className="col-md-auto">
                    <Button color="primary" onClick={this.handlePlayButton}>
                        <FontAwesomeIcon icon={playButtonIcon}/>
                    </Button>
                </div>
                <div className="col text-monospace text-primary small">
                    {audioTracks.map((audioTrack, ind) => <div key={audioTrack.id}>{ind}: {audioTrack.label}</div>)}
                </div>
            </div>
            {state.err ?
                <div className="row">
                    <div className="col">
                        <Alert color="danger">{state.err.toString()}</Alert>
                    </div>
                </div> :
                null
            }
        </div>;
    }
}