import {h, Component} from 'preact';
import Convolution from './convolutions/convolution.jsx';

export default class App extends Component {
    render(props, state) {
        return (
            <div id="app">
                <h1>Demo audio</h1>
                <section>
                    <h3>Simple audio</h3>
                    <Convolution/>
                </section>
            </div>
        );
    }
}