import WebSocket from "ws";
import * as uuid from "uuid";

export class WebSocketServer {
  constructor(props) {
    this.port = props.port;
    this.httpServer = props.httpApp;
    this.webSocketServer = new WebSocket.Server({ port: this.port });
    this.setEvents();
    this.pcStatus = 0;
    this.sfmStatus = 0;
    this.wsdStatus = 0;
  }

  setEvents() {
    this.webSocketServer.on("connection", (client, req) => {
      /* removes "/" (eg from /ui) */
      const clientPath = req.url.substring(1);
      client.path = clientPath;
      client.id = uuid.v4();
      if (clientPath === "photo_capture" && !this.pcClient)
        this.setPhotoCaptureClient(client);
      else if (clientPath === "sfm" && !this.sfmClient)
        this.setSfMClient(client);
      else if (clientPath === "weld_seam_detection" && !this.wsdClient)
        this.setWeldSeamDetectionClient(client);
      else if (clientPath === "ui") this.addUIClient(client);
      else client.close();
    });
  }

  /*
   - iterate through webSocketServers.clients 
   - find the one that closed, make sure no zombies 
   */
  addUIClient(client) {
    client.on("close", () => {
      //console.log(client)
    });
  }

  /* should be callback in main.js */
  transmitStatus(status) {
    const key = status === this.pcStatus ? "pcStatus" : "sfmStatus";
    this.webSocketServer.clients.forEach((client) => {
      if (client.path === "ui") {
        this.sendWSClient(client, `{ \"${key}\" : ${status} }`);
      }
    });
  }

  setPhotoCaptureClient(client) {
    client.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.status) {
          this.pcStatus = parsedMessage.status;
          this.transmitStatus(this.pcStatus);
        }
      } catch (exception) {
        console.log(exception);
      }
    });
    client.on("close", () => {
      this.pcClient = undefined;
    });
    this.pcClient = client;
  }

  setSfMClient(client) {
    client.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.status) {
          this.sfmStatus = parsedMessage.status;
          this.transmitStatus(this.sfmStatus);
        }
      } catch (exception) {
        console.log(exception);
      }
    });
    client.on("close", () => {
      this.sfmClient = undefined;
    });
    this.sfmClient = client;
  }

  setWeldSeamDetectionClient(client) {
    client.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.status) {
          this.wsdStatus = parsedMessage.status;
          this.transmitStatus(this.wsdStatus);
        }
      } catch (exception) {
        console.log(exception);
      }
    });
    client.on("close", () => {
      this.wsdClient = undefined;
    });
    this.wsdClient = client;
  }

  sendWSClient(client, message) {
    client.send(message);
  }
}
