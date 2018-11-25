import React from 'react';
import {Component} from 'react';

import autobind from 'core-decorators/es/autobind';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEject} from '@fortawesome/free-solid-svg-icons';
import {Button, ButtonGroup, Alert} from 'reactstrap';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import '../../../css/rangeslider-overrides.scss';
import PropTypes from 'prop-types';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import pick from 'lodash/pick';

import MyToggleButton from '../toggle-button';
import classNames from "classnames";

import fileObjectsFromEvent from '../../utils/file-object-from-drop-event';

const audioBufferProps = [
    {
        code: 'sampleRate',
        label: 'Sample rate',
        format: val => `${val.toFixed(0)} Hz`
    },
    {
        code: 'length',
        label: 'Length',
        format: val => `${val} samples`
    },
    {
        code: 'duration',
        label: 'Duration',
        format: val => `${val.toFixed(2)} s`
    },
    {
        code: 'numberOfChannels',
        label: 'Channels',
        format: val => val
    }
];

const fileObjectProps = [
    {
        code: 'name',
        label: 'File name',
        format: val => val
    },
    {
        code: 'size',
        label: 'Size',
        format: val => `${val.toFixed(0)} bytes`
    }
];

function readFile(fileObject) {
    if (!fileObject) {
        return Promise.reject('File required');
    }

    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = e => {
            resolve(e.target.result);
        };
        fileReader.onerror = e => {
            reject(e.error);
        };
        fileReader.readAsArrayBuffer(fileObject);
    });
}

export default class ConvolverFile extends Component {

    static propTypes = {
        convolverNode: PropTypes.instanceOf(ConvolverNode).isRequired,
        gainNode: PropTypes.instanceOf(GainNode).isRequired,
        powerOn: PropTypes.bool,
        onPowerToggle: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.fileInputElementRef = React.createRef();

        this.gainSliderProps = {
            min: 0,
            max: 1,
            step: 0.05,
            draggingOver: false
        };

        this.state = {
            gain: 0.5,
            name: null,
            size: null,
            sampleRate: null,
            length: null,
            duration: null,
            numberOfChannels: null,
            err: null
        };

        props.convolverNode.loop = true;
        props.convolverNode.normalize = true;
        props.gainNode.gain.value = this.state.gain;
    }

    @autobind()
    onChangeImpulseFile(fileObject) {
        if (fileObject) {
            this.setState(pick(fileObject, fileObjectProps.map(p => p.code)));
            this.setState({err: null});
        }

        return readFile(fileObject)
            .then(arrayBuffer => {
                const ctx = this.props.convolverNode.context;
                return ctx.decodeAudioData(arrayBuffer);
            })
            .then(audioBuffer => {
                this.setState(pick(audioBuffer, audioBufferProps.map(p => p.code)));
                this.props.convolverNode.buffer = audioBuffer;
            })
            .then(null, err => {
                this.setState({err});
            });
    }

    @autobind()
    formatSliderValue(val) {
        if (isNaN(val) || !isNumber(val)) {
            return '-';
        }
        return val.toFixed(2);
    }

    @autobind()
    handleSliderBeginChange(e) {
        this.changing = true;
    }

    @autobind()
    handleSliderChangeComplete(e) {
        this.changing = false;
    }

    @autobind()
    handleSliderChange(e) {
        this.changing = true;
        this.setState({
            gain: e
        });
    }

    @autobind()
    handleChangeFileInput(e) {
        const fileObject = e.target.files[0];
        return this.onChangeImpulseFile(fileObject);
    }

    @autobind()
    handleChooseButtonClick(e) {
        if (this.fileInputElementRef.current) {
            // Why pass e.detail.value?
            this.fileInputElementRef.current.click(e.detail.value);
        }
    }

    @autobind()
    handleDrop(event) {
        event.preventDefault();

        const files = fileObjectsFromEvent({event});

        this.setState({draggingOver: false});

        if (files.length) {
            return this.onChangeImpulseFile(files[0]);
        }
        return null;
    }

    @autobind()
    handleDragEnter(event) {
        event.preventDefault();
        const files = fileObjectsFromEvent({event});
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


    render() {
        const state = this.state;
        const props = this.props;

        const {powerOn, onPowerToggle, ...other} = props;

        const wrapperClass = classNames({
            'file-drop dragging': state.draggingOver,
            'file-drop': !state.draggingOver
        });

        props.gainNode.gain.value = this.state.gain;

        return <div className="rounded bg-light shadow p-1">
            <input
                style={{display: 'none'}}
                type="file"
                accept="audio/*"
                onChange={this.handleChangeFileInput}
                ref={this.fileInputElementRef}
            />
            <div
                onDrop={this.handleDrop}
                onDragEnter={this.handleDragEnter}
                onDragOver={this.handleDragOver}
                onDragLeave={this.handleDragLeave}
                className={wrapperClass}
            >
                <div className="row mb-1">
                    <div className="col-md-auto">
                        <MyToggleButton powerOn={powerOn} onPowerToggle={onPowerToggle} {...other}/>
                    </div>
                    <div className="col">
                        <h5>Convolver based on impulse response file</h5>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <Alert color="info">
                            There is great resource with impulse responses: <a className="alert-link"
                                                                               href="http://www.openairlib.net/"
                                                                               target="_blank">Openair</a>
                        </Alert>
                    </div>
                </div>
                {state.err ? <div className="row mt-1">
                    <div className="col">
                        <Alert color="danger">
                            {state.err.toString()}
                        </Alert>
                    </div>
                </div> : null}
                <div className="row">
                    <div className="col-md-auto">
                        <ButtonGroup>
                            <Button color="primary" onClick={this.handleChooseButtonClick}>
                                <FontAwesomeIcon icon={faEject}/>
                            </Button>
                        </ButtonGroup>
                    </div>
                    <div className="col text-monospace text-primary small">
                        {state.name ? fileObjectProps.map(p =>
                            <div key={p.code}>
                                {p.label}: {p.format(state[p.code])}
                            </div>
                        ) : null}
                        {state.length ? audioBufferProps.map(p =>
                            <div key={p.code}>
                                {p.label}: {p.format(state[p.code])}
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-8">
                        <Slider
                            value={state.gain}
                            max={this.gainSliderProps.max}
                            min={this.gainSliderProps.min}
                            step={this.gainSliderProps.step}
                            orientation="horizontal"
                            tooltip={true}
                            format={this.formatSliderValue}
                            onChangeStart={this.handleSliderBeginChange}
                            onChangeComplete={this.handleSliderChangeComplete}
                            onChange={this.handleSliderChange}
                        />
                    </div>
                    <div className="col-sm-1 align-self-center text-primary text-monospace">
                        {this.formatSliderValue(state.gain)}
                    </div>
                    <div className="col-sm-3 align-self-center">
                        Gain
                    </div>
                </div>
            </div>
        </div>;
    }
};