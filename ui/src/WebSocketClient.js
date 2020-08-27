export default class WebSocketClient {
  constructor(properties) {
    this.hostname = properties.hostname
    this.webSocket = new WebSocket(`ws://${this.hostname}:3001/ui`);
    this.setEvents();
  }
  
  setEvents() {
    this.webSocket.onopen = ( e ) => {
      
    };
    this.webSocket.onmessage = ( data ) => {
      
      console.log( data );
    };
  }
}
