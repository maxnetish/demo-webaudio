/**
 * Created by sanchez
 */
'use strict';

//check the environment
// if (process.env.NODE_ENV !== 'production') {
//     console.log('Looks like we are in development mode!');
// }

// import CSS
// import animate_css from 'animate.css/animate.min.css';
// import css from '../css/css.css';
// import scss from '../css/sass.scss';


// import Js Plugins/Entities

//ES6 Module
// import Bar1 from './entities/Bar1';
// import Howler from 'howler';
//CommonJS
// var Bar2 = require('./entities/Bar2');

import 'bootstrap/dist/css/bootstrap.css';

import 'core-js/es6/array';
import 'core-js/es6/string';

import React from 'react';
import {render} from 'react-dom';

import App from './components/app.jsx';

// import BPlayer from './audio-player';


window.app = {
    init: function () {
        const that = this;
        // const appInstance = new App();

        // this.bPlayer = new BPlayer();

        // const App = require('./components/app').default;
        this.rootComponent = render(<App/>, document.querySelector('#preact-app'));

        return that;
    }
};
window.onload = function () {
    window.app.init();
};

//Stats JavaScript Performance Monitor

//import Stats from 'stats.js';
//showStats();
// function showStats() {
//     var stats = new Stats();
//     stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//     var fs = document.createElement('div');
//     fs.style.position = 'absolute';
//     fs.style.left = 0;
//     fs.style.top = 0;
//     fs.style.zIndex = 999;
//     fs.appendChild(stats.domElement);
//     document.body.appendChild(fs);

//     function animate() {
//         stats.begin();
//         // monitored code goes here
//         stats.end();
//         requestAnimationFrame(animate);
//     }
//     requestAnimationFrame(animate);
// }