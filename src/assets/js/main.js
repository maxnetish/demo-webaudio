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


window.app = {
    init: function () {
        const that = this;
        this.rootComponent = render(<App/>, document.querySelector('#react-app'));
        return that;
    }
};
window.onload = function () {
    window.app.init();
};