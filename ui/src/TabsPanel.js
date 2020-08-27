import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Augmented from './Augmented.js';

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
      tabIndex: 0
    }
    this.ar = new Augmented();
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
            { this.ar.showObj( true ) }
          </Box>
          ) 
        }
        { this.state.tabIndex !== 0 && 
          (
          <Box >
            { this.ar.showObj( false ) }
          </Box>
          ) 
        }
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


