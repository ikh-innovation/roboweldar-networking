const logger = require( './logger.js' );
const Config = require('./Config');
const HTTPServer =
  require( './HTTPServer/HTTPServer.js' ).HTTPServer;
const WebSocketServer =
  require( './WebSocketServer/WebSocketServer.js' ).WebSocketServer;

function runMe() {
  const httpProperties = {
    port: Config.httpPort,
    imagesPath: Config.imageUploadPath,
    meshPath: Config.meshUploadPath
  };
  const wsProperties = {
    port: Config.wsPort
  };
  const httpServer =
    new HTTPServer( httpProperties );
  const wsServer =
    new WebSocketServer( wsProperties );
  const clients = wsServer.webSocketServer.clients

  httpServer.webSocketServer = wsServer;
  httpServer.photoCaptureEndpoint(( req, res ) => {
    if (wsServer.photoCaptureClient) {
      wsServer.sendWSClient(
        wsServer.photoCaptureClient,
        'init'
      );
    }
    if (clients) {
      clients.forEach( ( client ) => {
        if ( client.path === 'ui' )
          wsServer.sendWSClient(
            client,
            JSON.stringify(
              { message: 'pc_init' }
            )
          )
      } );
    }
  });

  httpServer.cacheImagesEndpoint( ( req, res ) => {
    if (wsServer.SfMClient)
      wsServer.sendWSClient( wsServer.SfMClient, 'init' );
    if (clients) {
      clients.forEach( ( client ) => {
        if ( client.path === 'ui' ) {
          wsServer.sendWSClient(
            client,
            JSON.stringify(
              { message: 'pc_complete' }
            )
          )
        }
      } );
    }
  } );

  httpServer.cacheMeshEndpoint( ( req, res ) => {
    if (clients) {
      clients.forEach( ( client ) => {
        if ( client.path === 'ui' ) {
          wsServer.sendWSClient(
            client,
            JSON.stringify(
              { message: 'sfm_complete' }
            )
          )
        }
      });
    }
  })

  logger.success( `WebSocket server initialized, port: ${wsProperties.port}` );
  logger.success( `HTTP server initialized, port: ${httpProperties.port}` );
}

runMe();
