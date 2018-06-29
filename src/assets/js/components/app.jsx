import React from 'react';

import {Component} from 'react';
import AudioChain from './audio-chain';

export default class App extends Component {
    render() {
        return (
            <div className="container">
                <h1>Demo audio</h1>
                <section>
                    <AudioChain/>
                </section>
            </div>
        );
    }
}