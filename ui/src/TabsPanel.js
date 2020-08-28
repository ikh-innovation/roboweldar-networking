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
          Start 3D Reconstruction
        </Button>
        <Button variant="outlined" color="secondary">
          Stop 3D Reconstruction
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

export default class TabsPanel extends React.Component {
  constructor( properties ) {
    super( properties );
    this.hostname = properties.hostname;
    this.state = {
      value: 0,
      tabIndex: 0,
      imagePaths: []
    }
    this.ar = new Augmented( 'obj-mesh' );
    
    properties.wsCli.overloadOnMessage( ( message ) => {
      console.log(message)
      const parsed = JSON.parse(message.data);
      if ( parsed.message === 'pc_complete' ) 
        this.fetchImageNames()
      if ( parsed.message === 'sfm_complete' ) 
        this.fetchMesh()
    }); 
    
  }
  
  fetchMesh() {
          this.ar.loadObj(
            "http://localhost:3000/serve_mtl",
            "http://localhost:3000/serve_obj"
          ) 
  }
  
  fetchImageNames() {
    HTTPWrapper.fetchURL( 
      'http://localhost:3000/image_names',
      ( response ) => {
        if ( response.status === 200 )
          response.json().then( ( imageNames ) => {
            const paths =
              imageNames.map( ( name ) => {
                return `http://localhost:3000/serve_image?imageName=${ name }`
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
          images={this.state.imagePaths}
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


