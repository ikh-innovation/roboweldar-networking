const logger = require( './logger.js' );
const HTTPServer =
  require( './HTTPServer/HTTPServer.js' ).HTTPServer;  
const WebSocketServer =
  require( './WebSocketServer/WebSocketServer.js' ).WebSocketServer;

function runMe() {
  const httpProperties = {
    port: 3000
  };
  const wsProperties = {
    port: 3001
  };
  const httpServer = new HTTPServer(httpProperties);
  const wsServer = new WebSocketServer(wsProperties);
  const clients = wsServer.webSocketServer.clients
  
  httpServer.webSocketServer = wsServer;
  httpServer.initPhotoCapture( ( req, res ) => {
    if (wsServer.photoCaptureClient) 
      wsServer.sendWSClient( wsServer.photoCaptureClient, 'init' );
    if (clients) clients.forEach( ( client ) => { 
      if ( client.path === 'ui' ) wsServer.sendWSClient( client, "{ 'message': 'pc_init' }")
    } );
  });
  httpServer.photoCaptureComplete( ( req, res ) => {
    if (wsServer.SfMClient) 
      wsServer.sendWSClient( wsServer.SfMClient, 'init' );
    if (clients) clients.forEach( ( client ) => { 
      if ( client.path === 'ui' ) 
        wsServer.sendWSClient( 
          client,
          JSON.stringify( 
            { message: 'pc_complete' }
          )
        )
    } );
  } );

  httpServer.cachePointCloud( ( req, res ) => {
    if (clients) clients.forEach( ( client ) => { 
      if ( client.path === 'ui' ) 
        wsServer.sendWSClient( 
          client,
          JSON.stringify( 
            { message: 'sfm_complete' }
          )
        )
    });
  })
  
  logger.success( `WebSocket server initialized, port: ${wsProperties.port}` );
  logger.success( `HTTP server initialized, port: ${httpProperties.port}` );
}

runMe();
