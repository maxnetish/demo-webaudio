import React from 'react';
import {Component} from 'react';

import autobind from 'core-decorators/es/autobind';

import {Input} from 'reactstrap';
import PropTypes from 'prop-types';
import range from 'lodash/range';

import MyToggleButton from '../toggle-button';

import './style.scss';

export default class AudioAnalyzer extends Component {

    static propTypes = {
        analyzerNode: PropTypes.instanceOf(AnalyserNode).isRequired,
        powerOn: PropTypes.bool.isRequired,
        onPowerToggle: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            firstElement: 0,
            fftSize: '32',
            updateInterval: '100',
            smoothingFactor: '0.1'
        };

        props.analyzerNode.smoothingTimeConstant = parseFloat(this.state.smoothingFactor);

        this.availableFftSize = [
            '32', '64', '128', '256', '512', '1024'
        ];

        this.availableUpdateInterval = [
            '50', '100', '200', '500', '1000'
        ];

        this.availableSmoothingFactor = [
            {
                value: '0',
                label: 'Without smoothing'
            },
            {
                value: '0.1',
                label: '10%'
            },
            {
                value: '0.2',
                label: '20%'
            },
            {
                value: '0.3',
                label: '30%'
            },
            {
                value: '0.4',
                label: '40%'
            },
            {
                value: '0.5',
                label: '50%'
            },
            {
                value: '0.6',
                label: '60%'
            },
            {
                value: '0.7',
                label: '70%'
            },
            {
                value: '0.8',
                label: '80%'
            },
            {
                value: '0.9',
                label: '90%'
            },
            {
                value: '1',
                label: '100%'
            }
        ];

        this.rebuildBuffers(props, this.state.fftSize);

        this.pollIntervalId = setInterval(this.pollAnalyzerData, 100);
    }

    @autobind()
    pollAnalyzerData() {
        if (!this.props.powerOn) {
            return;
        }
        this.props.analyzerNode.getByteFrequencyData(this.analyzerData);
        this.setState({
            firstElement: this.analyzerData[0]
        });
    }

    @autobind()
    handleChangeFftSize(e) {

        this.rebuildBuffers(this.props, e.target.value);

        this.setState({
            fftSize: e.target.value
        });
    }

    @autobind()
    handleUpdateIntervalChange(e) {
        const newIntervalValue = parseInt(e.target.value, 10);
        clearInterval(this.pollIntervalId);
        this.pollIntervalId = setInterval(this.pollAnalyzerData, newIntervalValue);
        this.setState({
            updateInterval: e.target.value
        });
    }

    @autobind()
    handleSmoothingFactorChange(e) {
        this.props.analyzerNode.smoothingTimeConstant = parseFloat(e.target.value);
        this.setState({
            smoothingFactor: e.target.value
        });
    }

    @autobind()
    rebuildBuffers(props, fftSize) {
        props.analyzerNode.fftSize = parseInt(fftSize, 10);
        this.analyzerData = new Uint8Array(props.analyzerNode.frequencyBinCount);
        this.dataIndices = range(props.analyzerNode.frequencyBinCount);
    }

    render() {
        const state = this.state;
        const props = this.props;

        const {powerOn, onPowerToggle, ...other} = props;

        return <div className="rounded bg-light shadow p-1">
            <div className="row mb-1">
                <div className="col-md-auto">
                    <MyToggleButton powerOn={powerOn} onPowerToggle={onPowerToggle} {...other}/>
                </div>
                <div className="col">
                    <h5>Analyzer</h5>
                </div>
            </div>
            <div className="row mb-1">
                <div className="col-sm-8">
                    <Input type="select" value={state.fftSize}
                           onChange={this.handleChangeFftSize}>
                        {this.availableFftSize.map(size =>
                            <option value={size} key={size}>{size}</option>
                        )}
                    </Input>
                </div>
                <div className="col-sm-4 align-self-center">
                    fft size
                </div>
            </div>
            <div className="row mb-1">
                <div className="col-sm-8">
                    <Input type="select" value={state.updateInterval} onChange={this.handleUpdateIntervalChange}>
                        {this.availableUpdateInterval.map(interval =>
                            <option value={interval} key={interval}>{interval}</option>
                        )}
                    </Input>
                </div>
                <div className="col-sm-4 align-self-center">
                    Update interval
                </div>
            </div>
            <div className="row mb-1">
                <div className="col-sm-8">
                    <Input type="select" value={state.smoothingFactor} onChange={this.handleSmoothingFactorChange}>
                        {this.availableSmoothingFactor.map(fac =>
                            <option value={fac.value} key={fac.value}>{fac.label}</option>
                        )}
                    </Input>
                </div>
                <div className="col-sm-4 align-self-center">
                    Smoothing factor
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <div className="analyzer-panel">
                        {this.dataIndices.map(ind => {
                            let localStyle = {
                                height: `${this.analyzerData[ind] / 2}px`
                            };
                            return <div key={ind} className="analyzer-panel__bar" style={localStyle}/>;
                        })}
                    </div>
                </div>
            </div>
        </div>;
    }
};