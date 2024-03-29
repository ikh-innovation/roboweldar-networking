import * as logger from "./logger.js";
import * as Config from "./Config/index.js";
import { HTTPServer } from "./HTTPServer/HTTPServer.js";
import { WebSocketServer } from "./WebSocketServer/WebSocketServer.js";

function runMe() {
  const httpProperties = {
    port: Config.httpPort,
    imagesPath: Config.imageUploadPath,
    meshPath: Config.meshUploadPath,
    weldingtrajPath: Config.weldingTrajUploadPath,
  };
  const wsProperties = {
    port: Config.wsPort,
  };
  const httpServer = new HTTPServer(httpProperties);
  const wsServer = new WebSocketServer(wsProperties);
  const clients = wsServer.webSocketServer.clients;

  httpServer.webSocketServer = wsServer;

  httpServer.photoCaptureStartEndpoint((req, res) => {
    if (wsServer.robotClient) {
      wsServer.sendWSClient(wsServer.robotClient, "photo_capture_start");
    }
    if (clients) {
      clients.forEach((client) => {
        if (client.path === "ui")
          wsServer.sendWSClient(
            client,
            JSON.stringify({ message: "pc_start" })
          );
      });
    }
  });

  // once the user clicks the "WELD SEAM DETECTION" tab
  // run the method defined in HTTPServer.js with a callback that signals
  // "wsd_start" to the UI.
  // Also send "init" to the wsdClient

  httpServer.weldSeamDetectionStartEndpoint((req, res) => {
    if (wsServer.wsdClient) {
      wsServer.sendWSClient(
        wsServer.wsdClient,
        JSON.stringify({ message: "start_weld_seam_detection" })
      );
      console.log("WS message sent to wsdClient.");
    }
    if (clients) {
      clients.forEach((client) => {
        if (client.path === "ui")
          wsServer.sendWSClient(
            client,
            JSON.stringify({
              message: "start_weld_seam_detection_message_sent",
            })
          );
      });
    }
  });

  //  runs the method defined in HTTPServer.js with a callback that signals
  // "weld_seam_detection_complete" to the UI and "start" to the welding client after the trajectory uploading from the client is complete.

  // startWeldingCallback = ;

  httpServer.cacheWeldingTrajectoryEndpoint((req, res) => {
    if (wsServer.robotClient) {
      wsServer.sendWSClient(
        wsServer.robotClient,
        JSON.stringify({ message: "welding_start" })
      );
    }
    if (clients) {
      clients.forEach((client) => {
        if (client.path === "ui") {
          wsServer.sendWSClient(
            client,
            JSON.stringify({ message: "wsd_complete" })
          );
        }
      });
    }
  });

  //  runs the method defined in HTTPServer.js with a callback that signals
  // "sfm_complete" to the UI after the mesh uploading from the client is complete.

  httpServer.cacheImagesEndpoint((req, res) => {
    if (wsServer.sfmClient) {
      wsServer.sendWSClient(
        wsServer.sfmClient,
        JSON.stringify({ message: "start" })
      );
    }
    if (clients) {
      clients.forEach((client) => {
        if (client.path === "ui") {
          wsServer.sendWSClient(
            client,
            JSON.stringify({ message: "pc_complete" })
          );
        }
      });
    }
  });

  httpServer.cacheMeshEndpoint((req, res) => {
    if (clients) {
      clients.forEach((client) => {
        if (client.path === "ui") {
          wsServer.sendWSClient(
            client,
            JSON.stringify({ message: "sfm_complete" })
          );
        }
      });
    }
  });

  httpServer.weldingStartEndpoint((req, res) => {
    if (wsServer.robotClient) {
      wsServer.sendWSClient(
        wsServer.robotClient,
        JSON.stringify({ message: "welding_start" })
      );
    }
    if (clients) {
      clients.forEach((client) => {
        if (client.path === "ui") {
          wsServer.sendWSClient(
            client,
            JSON.stringify({ message: "wsd_complete" })
          );
        }
      });
    }
  });

  logger.success(`WebSocket server initialized, port: ${wsProperties.port}`);
  logger.success(`HTTP server initialized, port: ${httpProperties.port}`);
}

runMe();
