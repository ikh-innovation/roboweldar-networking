import React from 'react';
import ReactDOM from 'react-dom';
import './assets/index.css';

import Application  from './Application.js';
import WebSocketClient from './WebSocketClient.js';
import * as Config from './Config.js';

/* move ws initialization in Application */

const wsProps = {
  hostname: Config.serverHostName,
  port: Config.serverWSPort,
  endpoint: Config.serverWSUIEndpoint
}

const wsC = new WebSocketClient( wsProps );

const appProps = {
  hostname: Config.serverHostName,
  httpPort: Config.serverHTTPPort,
  meshEndpoint: Config.meshFilesEndpoint,
  imageNamesEndpoint: Config.imageNamesEndpoint,
  serveImageEndpoint: Config.serveImageEndpoint,
  arCanvasDOM: 'obj-mesh',
  wsCli: wsC
}

ReactDOM.render(
  <Application
    { ...appProps }
  />,
  document.querySelector('#user-panel')
);

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
