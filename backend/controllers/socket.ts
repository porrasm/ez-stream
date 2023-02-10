import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

let wss: WebSocketServer = null as any;

export function createSocket(server: Server) {
  wss = new WebSocketServer({ server });
  createSocketBase();
}

function createSocketBase() {
  wss.on('connection', (ws, req) => {
    ws.on('message', message => {
      const buffer = new Uint8Array(message as ArrayBuffer);

      console.log('Got message: ', buffer.length);
    });
  });
}