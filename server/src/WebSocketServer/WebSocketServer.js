const WebSocket = require( 'ws' );
const uuid = require('uuid'); /* unique id for ws clients */

class WebSocketServer {
  constructor( props ) {
    this.port = props.port;
    this.httpServer = props.httpApp;
    this.webSocketServer = 
      new WebSocket.Server( { port: this.port } );
    this.setEvents();
  }

  setEvents() {
    this.webSocketServer.on( 'connection', ( client, req ) => {
      const clientPath = req.url.substring(1) /* removes "/" (eg from /ui) */
      client.path = clientPath
      client.id = uuid.v4();
      if (
        clientPath === 'photo_capture' &&
        !this.photoCaptureClient
      ) this.setPhotoCaptureClient( client );
      else if (
        clientPath === 'sfm' &&
        !this.SfMClient
      ) this.setSfMClient( client );
      else if ( clientPath === 'ui' )
        this.addUIClient( client );
      else client.close();
    });
  }

  /*
   - iterate through webSocketServers.clients 
   - find the one that closed, make sure no zombies 
   */
  addUIClient( client ) {
    client.on('close', () => {
      //console.log(client)
    });
  }

  setPhotoCaptureClient( client ) {
    client.on( 'message', ( message ) => {
      if (message.status)
        this.pcStatus = message.status
      console.log('received: %s', message );
    } );
    client.on('close', () => {
      this.photoCaptureClient = undefined;
    });
    this.photoCaptureClient = client;
  }

  setSfMClient( client ) {
    client.on( 'message' , ( message ) => {
      if (message.status)
        this.SfMStatus = message.status
      console.log( 'received: %s', message );
    } );
    client.on('close', () => {
       this.SfMClient = undefined;
    });
    this.SfMClient = client;
  }

  sendWSClient( client, message ) {
    client.send( message );
  }

}

module.exports.WebSocketServer = WebSocketServer;
