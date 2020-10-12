import React, { Fragment } from "react";
import PropTypes from "prop-types";

import SlideShow from "react-image-show";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import Augmented from "./Augmented.js";
import HTTPWrapper from "./HTTPWrapper.js";

export default class Application extends React.Component {
  constructor(properties) {
    super(properties);

    this.hostname = properties.hostname;
    this.httpPort = properties.httpPort;
    this.meshEndpoint = properties.meshEndpoint;
    this.imageNamesEndpoint = properties.imageNamesEndpoint;
    this.serveImageEndpoint = properties.serveImageEndpoint;
    this.arCanvasDOM = properties.arCanvasDOM;

    this.state = {
      value: 0,
      tabIndex: 0,
      imagePaths: [],
      pcStatus: 0,
      wdsStatus: 0,
      sfmStatus: 0,
      xhrLoading: 0,
      modalOpen: false,
    };

    const arProps = {
      canvasDOMId: this.arCanvasDOM,
    };

    this.ar = new Augmented(arProps);

    properties.wsCli.overloadOnMessage((message) => {
      const parsed = JSON.parse(message.data);
      if (parsed.message === "pc_start") {
      }
      if (parsed.message === "pc_complete") {
        this.fetchImageNames();
      }
      if (parsed.message === "sfm_complete") {
        this.fetchGLTF();
      }
      if (parsed.message === "weld_seam_detection_complete") {
        // TODO: execute code after weld seam detection is complete
        this.setState({wsdStatus: 100})
      }
      if (parsed.pcStatus) this.setState({ pcStatus: parsed.pcStatus });
      if (parsed.sfmStatus) this.setState({ sfmStatus: parsed.sfmStatus });
      if (parsed.wsdStatus) this.setState({ wsdStatus: parsed.wsdStatus });

    });
  }

  renderLoadingCircle() {
    return (
      <Dialog
        fullScreen={false}
        open={this.state.modalOpen}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle> Loading Mesh </DialogTitle>
        <DialogContent style={{ height: "6em", width: "8em" }}>
          <CircularProgress
            style={{
              display: "block",
              margin: "auto",
              height: "4em",
              width: "4em",
            }}
            variant="static"
            value={this.state.xhrLoading}
          />
        </DialogContent>
      </Dialog>
    );
  }

  fetchGLTF() {
    const props = {
      gltf: "model.gltf",
      hostname: this.hostname,
      port: this.httpPort,
      endpoint: this.meshEndpoint,
    };
    this.setState({
      sfmStatus: 100,
    });
    this.state.modalOpen = true;
    this.ar.loadGLTF(
      props,
      (xhr) => {
        this.setState({
          xhrLoading: xhr,
        });
      },
      () => {
        this.setState({
          modalOpen: false,
        });
      }
    );
  }
  /* not currently in use */
  fetchObj() {
    const props = {
      obj: "texturedMesh.obj",
      mtl: "texturedMesh.mtl",
      hostname: this.hostname,
      port: this.httpPort,
      endpoint: this.meshEndpoint,
    };
    this.ar.loadObj(props);
  }

  fetchImageNames() {
    const queryKey = "name";
    const hostname = this.hostname;
    const port = this.httpPort;
    const namesEndpoint = this.imageNamesEndpoint;
    const serveEndpoint = this.serveImageEndpoint;

    const imageNamesURL = `http://${hostname}:${port}/${namesEndpoint}`;

    const serveImagesURL = `http://${hostname}:${port}/${serveEndpoint}`;

    HTTPWrapper.fetchURL(imageNamesURL, (response) => {
      if (response.status === 200)
        response.json().then((imageNames) => {
          const paths = imageNames.map((name) => {
            return `${serveImagesURL}?${queryKey}=${name}`;
          });
          var path = require("path");
          var EXTENSION = ".jpeg";
          var targetFiles = paths.filter(function (file) {
            return path.extname(file).toLowerCase() === EXTENSION;
          });

          this.setState({ imagePaths: targetFiles });
          this.setState({ pcStatus: 100 });
        });
    });
  }

  renderImages() {
    return (
      <SlideShow
        images={this.state.imagePaths}
        width="920px"
        imagesWidth="800px"
        imagesHeight="450px"
        imagesHeightMobile="56vw"
        thumbnailsWidth="920px"
        thumbnailsHeight="12vw"
        indicators={false}
        thumbnails
        fixedImagesHeight
      />
    );
  }

  handleChange(event, newValue) {
    this.setState({
      tabIndex: newValue,
    });
  }

  tabPanel(args) {
    const { children, value, ...other } = args;
    return (
      <div
        role="tabpanel"
        hidden={value !== this.state.tabIndex}
        id={`simple-tabpanel-${this.state.tabIndex}`}
        aria-labelledby={`simple-tab-${this.state.tabIndex}`}
        {...other}
      >
        {this.state.tabIndex === 0 && <Box>{this.loadingBars()}</Box>}
        {this.state.tabIndex !== 0 && <Box></Box>}
        {this.renderImages()}
        {this.renderLoadingCircle()}
      </div>
    );
  }

  photoCaptureLoadingBar() {
    const wrapperStyle = {
      visibility: "hidden",
      margin: "auto",
      marginTop: "1em",
      width: "40%",
    };
    const barStyle = {
      height: "2em",
    };

    const typoStyle = {
      backgroundColor: "#e3dfd5",
    };

    return (
      <div style={wrapperStyle} id="pcLoadingBar">
        <Typography
          variant="body1"
          component="div"
          align="center"
          style={typoStyle}
        >
          Photo Capture
          <span style={{ color: "red" }}> {this.state.pcStatus}% </span>
        </Typography>
        <LinearProgress
          variant="determinate"
          color="secondary"
          value={this.state.pcStatus}
          style={barStyle}
        />
      </div>
    );
  }

  sfmLoadingBar() {
    const wrapperStyle = {
      visibility: "hidden",
      margin: "auto",
      marginTop: "1em",
      width: "40%",
    };
    const barStyle = {
      height: "2em",
    };

    const typoStyle = {
      backgroundColor: "#e3dfd5",
    };

    return (
      <div style={wrapperStyle} id="sfmLoadingBar">
        <Typography
          variant="body1"
          component="div"
          align="center"
          style={typoStyle}
        >
          Structure from Motion
          <span style={{ color: "red" }}> {this.state.sfmStatus}% </span>
        </Typography>
        <LinearProgress
          color="secondary"
          variant="determinate"
          value={this.state.sfmStatus}
          style={barStyle}
        />
      </div>
    );
  }

  loadingBars() {
    const barsWrapper = {
      marginTop: "2em",
      marginBottom: "2em",
    };

    return (
      <div style={barsWrapper}>
        {this.photoCaptureLoadingBar()}
        {this.sfmLoadingBar()}
      </div>
    );
  }

  weldSeamDetectionLoadingBar() {
    const wrapperStyle = {
      visibility: "hidden",
      margin: "auto",
      marginTop: "1em",
      width: "40%",
    };
    const barStyle = {
      height: "2em",
    };

    const typoStyle = {
      backgroundColor: "#e3dfd5",
    };

    return (
      <div style={wrapperStyle} id="wsdLoadingBar">
        <Typography
          variant="body1"
          component="div"
          align="center"
          style={typoStyle}
        >
          Weld Seam Detection
          <span style={{ color: "red" }}> {this.state.wsdStatus}% </span>
        </Typography>
        <LinearProgress
          variant="determinate"
          color="secondary"
          value={this.state.wsdStatus}
          style={barStyle}
        />
      </div>
    );
  }


  sendPCStartSignal(hostname) {
    document.getElementById("pcLoadingBar").style.visibility = "visible";
    document.getElementById("sfmLoadingBar").style.visibility = "visible";
    fetch(`http://${hostname}:3000/start_photo_capture`, {
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  sendSfMStopSignal(hostname) {
    fetch(`http://${hostname}:3000/stop_sfm`, {
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  sendWSDStartSignal(hostname) {
    document.getElementById("wsdLoadingBar").style.visibility = "visible";
    fetch(`http://${hostname}:3000/start_welding_seam_detection`, {
      mode: "cors",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  render() {
    return (
      <div className="panels">
        <AppBar position="static">
          <Tabs
            value={this.state.tabIndex}
            onChange={(e, v) => {
              this.handleChange(e, v);
            }}
            aria-label="main tabs"
          >
            <Tab
              label="3D Reconstruction"
              {...a11yProps(0)}
              onClick={() => {
                this.sendPCStartSignal(this.hostname);
              }}
            />
            <Tab
              label="Weld Seam Detection"
              {...a11yProps(0)}
              onClick={() => {
                this.sendWSDStartSignal(this.hostname);
              }}
            />
          </Tabs>
        </AppBar>
        {this.tabPanel({
          hostname: this.hostname,
          value: 0,
        })}
      </div>
    );
  }
}

function LinearProgressWithLabel(props) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
