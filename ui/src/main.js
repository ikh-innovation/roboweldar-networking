import React from 'react';
import ReactDOM from 'react-dom';
import './assets/index.css';

import TabsPanel  from './TabsPanel.js';
import WebSocketClient from './WebSocketClient.js';


let wsC = new WebSocketClient( { hostname: 'localhost' } );


ReactDOM.render(<TabsPanel hostname='localhost' wsCli={wsC} />, document.querySelector('#user-panel'));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
