export default class WebSocketClient {
  constructor(properties) {
    const hostname = properties.hostname;
    const port = properties.port;
    const endpoint = properties.endpoint;
    this.webSocket = new WebSocket(`ws://${hostname}:${port}/${endpoint}`);
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
