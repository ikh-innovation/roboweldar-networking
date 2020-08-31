import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import SlideShow from 'react-image-show';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Augmented from './Augmented.js';
import HTTPWrapper from './HTTPWrapper.js';


export default class Application extends React.Component {
  constructor( properties ) {
    super( properties );

    this.hostname = properties.hostname;
    this.httpPort = properties.httpPort;
    this.meshEndpoint = properties.meshEndpoint;
    this.imageNamesEndpoint = properties.imageNamesEndpoint;
    this.serveImageEndpoint = properties.serveImageEndpoint;
    this.arCanvasDOM = properties.arCanvasDOM;

    this.state = {
      value: 0,
      tabIndex: 0,
      imagePaths: []
    }

    const arProps = {
      canvasDOMId: this.arCanvasDOM
    }

    this.ar = new Augmented( arProps );

    properties.wsCli.overloadOnMessage( ( message ) => {
      console.log(message)
      const parsed = JSON.parse(message.data);
      if ( parsed.message === 'pc_complete' )
        this.fetchImageNames()
      if ( parsed.message === 'sfm_complete' )
        this.fetchGLTF()
    });
  }

  fetchGLTF() {
    const props = {
      gltf: 'texturedMesh.gltf',
      hostname: this.hostname,
      port: this.httpPort,
      endpoint: this.meshEndpoint
    }
    this.ar.loadGLTF( props );
  }

  fetchObj() {
    const props = {
      obj: 'texturedMesh.obj',
      mtl: 'texturedMesh.mtl',
      hostname: this.hostname,
      port: this.httpPort,
      endpoint: this.meshEndpoint
    }
    this.ar.loadObj( props );
  }

  fetchImageNames() {
    const queryKey = 'name';
    const hostname = this.hostname;
    const port = this.httpPort;
    const namesEndpoint = this.imageNamesEndpoint;
    const serveEndpoint = this.serveImageEndpoint;

    const imageNamesURL =
      `http://${ hostname }:${ port }/${ namesEndpoint }`;

    const serveImagesURL =
      `http://${ hostname }:${ port }/${ serveEndpoint }`;

    HTTPWrapper.fetchURL(
      imageNamesURL,
      ( response ) => {
        if ( response.status === 200 )
          response.json().then( ( imageNames ) => {
            const paths =
              imageNames.map( ( name ) => {
                return `${ serveImagesURL }?${queryKey}=${ name }`
              });
            this.setState({
              imagePaths: paths
            })
          })
      }
    )
  }

  renderImages() {
    return(
      <SlideShow
        images={ this.state.imagePaths }
        width="920px"
        imagesWidth="800px"
        imagesHeight="450px"
        imagesHeightMobile="56vw"
        thumbnailsWidth="920px"
        thumbnailsHeight="12vw"
        indicators thumbnails fixedImagesHeight
       />
     )
  }

  handleChange( event, newValue ) {
    this.setState({
      tabIndex: newValue
    });
  };


  tabPanel(args) {
    const { children, value, ...other } = args;
    return (
      <div
        role="tabpanel"
        hidden={ value !== this.state.tabIndex }
        id={ `simple-tabpanel-${ this.state.tabIndex }` }
        aria-labelledby={ `simple-tab-${ this.state.tabIndex }` }
        { ...other }
      >
        { this.state.tabIndex === 0 && 
          (
          <Box >
            { reconstructionButtons( args.hostname ) }
            { reconstructionStatus() }
          </Box>
          ) 
        }
        { this.state.tabIndex !== 0 && 
          (
          <Box >
          </Box>
          ) 
        }
        {this.renderImages()}
      </div>
    );
  }

  render() {
    return (
      <div className='panels'>
        <AppBar position="static">
          <Tabs value={ this.state.tabIndex }
            onChange={ (e, v) => { this.handleChange(e, v) } }
            aria-label="main tabs"
          >
            <Tab label="3D Reconstruction" { ...a11yProps(0) } />
            <Tab label="Item Two" { ...a11yProps(1) } />
            <Tab label="Item Three" { ...a11yProps(2) } />
          </Tabs>
        </AppBar>
        {
          this.tabPanel({
            hostname: this.hostname,
            value: 0
          })
        }
      </div>
    );
  }
}

function reconstructionStatus( value ) {
  return (
   <div> Status : tbd </div> 
  )
}

function sendPCStartSignal(hostname) {
  fetch(
    `http://${hostname}:3000/initialize_photo_capture`,
     {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
     }
   );
}

function reconstructionButtons( hostname ) {
  return (
    <Fragment>
      <div>
        <Button variant="outlined"
          color="primary"
          onClick={ () => { sendPCStartSignal( hostname) } }
        >
          Start
        </Button>
      </div>
    </Fragment>
  );
}

function a11yProps( index ) {
  return {
    id: `simple-tab-${ index }`,
    'aria-controls': `simple-tabpanel-${ index }`,
  };
}



