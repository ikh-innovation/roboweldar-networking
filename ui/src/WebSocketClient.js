export default class WebSocketClient {
  constructor(properties) {
    this.hostname = properties.hostname
    this.webSocket = new WebSocket(`ws://${this.hostname}:3001/ui`);
    this.setEvents();
  }
  
  /* gets overloaded in TabsPanel */
  overloadOnMessage( onMessage ) {
    this.webSocket.onmessage = onMessage;
  }
  
  setEvents() {
    this.webSocket.onopen = ( e ) => {
      
    };
    this.webSocket.onmessage = ( message ) => {
      console.log(message)
      const parsed = JSON.parse(message.data);
    };
  }
}
