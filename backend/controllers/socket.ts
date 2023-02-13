import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { webmBufferToFlv } from '../video';
import * as child from 'child_process';

let wss: WebSocketServer = null as any;

export function createSocket(server: Server) {
  wss = new WebSocketServer({ server });
  createSocketBase();
}

function createSocketBase() {
  wss.on('connection', (ws, req) => {
    console.log('Got connection');
    // ffmpeg -re -i - -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100 -f flv rtmp://localhost/live/livestream
    // const ffmpeg = child.spawn('ffmpeg', ["-re", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency", "-c:a", "aac", "-ar", "44100", "-f", "flv", "rtmp://localhost/live/livestream"])
    // debug save to file
    const ffmpeg = child.spawn('ffmpeg', [
      "-re",
      "-i",
      "-",
      "-vf",
      "scale=1920:1080",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-tune",
      "zerolatency",
      "-c:a",
      "aac",
      "-ar",
      "44100",
      "-f",
      "flv",
      "rtmp://localhost/live/livestream"
    ], { stdio: 'pipe' });

    ffmpeg.stdout.pipe(process.stdout);

    ws.on('message', message => {
      const buffer = new Uint8Array(message as ArrayBuffer);
      console.log('Got message: ', buffer.length);
      ffmpeg.stdin.write(message)
    });

    ws.on('close', () => {
      console.log('Got close');
      ffmpeg.stdin.end()
      ffmpeg.kill()
    });
  });
}
