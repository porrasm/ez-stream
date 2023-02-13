import { Readable, Writable } from 'stream'
import * as child from 'child_process';

export function webmBufferToFlv(buffer: Uint8Array): Uint8Array[] {

  // ffmpeg -re -i INPUT_FILE_NAME -c copy -f flv rtmp://localhost/live/STREAM_NAME
  //const process = child.spawn('ffmpeg', ["-re", "-i", "-", "-c", "copy", "-f", "flv", "rtmp://127.0.0.1/live/livestream"])
  // debug save to file
  const process = child.spawn('ffmpeg', ["-re", "-i", "-", "-c", "copy", "-f", "flv", "P:/Stuff/Temp/ffmpeg.flv"], {stdio: 'pipe'})

  

  process.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  const asStream = Readable.from(buffer)
  const output = new ArrayWriter()

  return []
}

class ArrayWriter extends Writable {
  _write(chunk: string | Buffer | Uint8Array, encoding: BufferEncoding, callback: (error: Error | null | undefined) => void) {

    console.log('Got encoding: ', encoding)
    console.log('Got chunk: ', chunk.toString())

    callback(undefined)

    // if (chunk.toString().indexOf('a') >= 0) {
    //   callback(new Error('chunk is invalid'));
    // } else {
    //   callback(undefined);
    // }
  }
}
