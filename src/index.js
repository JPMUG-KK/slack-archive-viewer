import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Home from './Home.jsx';
import {
    BrowserRouter as Router,
    Switch,
    Route
  } from "react-router-dom";
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Router><Home /></Router>, document.getElementById('root'));
serviceWorker.unregister();
