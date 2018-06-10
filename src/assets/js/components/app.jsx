import {h, Component} from 'preact';
import Convolution from './convolutions/convolution.jsx';

export default class App extends Component {
    render(props, state) {
        return (
            <div id="app">
                <h1>Demo audio</h1>
                <section>
                    <h2>Simple audio</h2>
                    <Convolution/>
                </section>
            </div>
        );
    }
}