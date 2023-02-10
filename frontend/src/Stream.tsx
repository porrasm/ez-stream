import axios from "axios";
import { useState } from "react";
import { startStreamUpload, uploadStream } from "./api";

export function Stream() {
  // const startSream = async () => {
  //   const captureStream = await navigator.mediaDevices.getDisplayMedia(
  //     displayMediaOptions
  //   );
  // };

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ws, setWs] = useState<WebSocket>();
  const [status, setStatus] = useState("Not recording");

  const closeSocket = () => { 
    if (ws) {
      ws.close();
    }
    setStatus("Not recording");
  }

  async function startCapture(displayMediaOptions: DisplayMediaStreamOptions) {
    await stopCapture();

    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions
      );

      console.log("captureStream: ", captureStream);
      setStream(captureStream);
      setWs(startStreamUpload(captureStream, "key", setStatus));
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  async function stopCapture() {
    closeSocket();
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }

  return (
    <div>
      <p>Status: {status}</p>
      <button
        onClick={() =>
          startCapture({
            video: true,
            audio: true,
          })
        }
      >
        Start Recording
      </button>
      <button onClick={stopCapture}>Stop Recording</button>
    </div>
  );
}
