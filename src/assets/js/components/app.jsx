
import React from 'react';

import {Component} from 'react';
import Convolution from './convolutions/convolution.jsx';

export default class App extends Component {
    render() {
        return (
            <div>
                <h1>Demo audio</h1>
                <section>
                    <h3>Simple audio</h3>
                    <Convolution/>
                </section>
            </div>
        );
    }
}