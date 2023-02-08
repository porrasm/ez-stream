import axios from "axios";
import { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { uploadStream } from "./api";

export function Stream() {
  // const startSream = async () => {
  //   const captureStream = await navigator.mediaDevices.getDisplayMedia(
  //     displayMediaOptions
  //   );
  // };

  const [stream, setStream] = useState<MediaStream | null>(null);

  async function startCapture(displayMediaOptions: DisplayMediaStreamOptions) {
    await stopCapture();

    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions
      );
      const mediaRecorder = new MediaRecorder(captureStream);

      mediaRecorder.start(250);
      mediaRecorder.ondataavailable = (e) => {
        console.log("ondataavailable: ", e);
        uploadStream(e.data)
      };

      console.log("captureStream: ", captureStream);
      setStream(captureStream);
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  async function stopCapture() {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  }

  const { status, startRecording, stopRecording, previewStream, mediaBlobUrl } =
    useReactMediaRecorder({ video: true, screen: true, audio: true });

  if (previewStream) {
    console.log("previewStream: ", previewStream);
  }

  return (
    <div>
      <p>{status}</p>
      <button onClick={startRecording}>Start Recording</button>
      <button
        onClick={() =>
          startCapture({
            video: true,
            audio: true,
          })
        }
      >
        Start Recording 2
      </button>
      <button onClick={stopRecording}>Stop Recording</button>
      <button onClick={stopCapture}>Stop Recording 2</button>
      <video src={mediaBlobUrl} controls autoPlay loop />
    </div>
  );
}
