import WebSocket from 'ws';
import * as uuid from 'uuid';

export class WebSocketServer {
  constructor( props ) {
    this.port = props.port;
    this.httpServer = props.httpApp;
    this.webSocketServer =
      new WebSocket.Server( { port: this.port } );
    this.setEvents();
    this.pcStatus = 0;
    this.sfmStatus = 0;
  }

  setEvents() {
    this.webSocketServer.on( 'connection', ( client, req ) => {
      /* removes "/" (eg from /ui) */
      const clientPath = req.url.substring(1);
      client.path = clientPath;
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

  transmitStatus( status ) {
    const key =
      ( status === this.pcStatus )?
        'pcStatus' :
        'sfmStatus' ;
    this.webSocketServer.clients.forEach( ( client ) => {
      if ( client.path === 'ui' ) {
        this.sendWSClient(
          client,
          `{ \"${key}\" : ${status} }`
        );
      }
    });
  }

  setPhotoCaptureClient( client ) {
    client.on( 'message', ( message ) => {
      try {
        const parsedMessage = JSON.parse( message );
        if (parsedMessage.status) {
          this.pcStatus = parsedMessage.status;
          this.transmitStatus( this.pcStatus );
        }
      } catch ( exception ) {
        console.log( exception );
      }
    } );
    client.on('close', () => {
      this.photoCaptureClient = undefined;
    });
    this.photoCaptureClient = client;
  }

  setSfMClient( client ) {
    client.on( 'message' , ( message ) => {
      try {
        const parsedMessage = JSON.parse( message );
        if (parsedMessage.status) {
          this.sfmStatus = parsedMessage.status
          this.transmitStatus( this.sfmStatus );
        }
        console.log(parsedMessage)
      } catch ( exception ) {
        console.log( exception );
      }
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
