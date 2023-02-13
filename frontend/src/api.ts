import axios from 'axios'
import md5 from 'md5'
import { StreamInfo } from './streams'

const BASE_URL = '/api'
const timeout = 5000

export type ServerStream = {
    server: string,
    streamName: string,
    stream: StreamInfo
}


export const getStreams = async (): Promise<ServerStream[]> => {
    const url = apiPath(BASE_URL, "/streams")

    const res = await axios({
        method: 'get',
        url,
        timeout,
    })

    if (res.status === 200) {
        return res.data as ServerStream[]
    }

    throw "Error"
}

type SyncResponse = {
    streamServer: string,
    now: number
}
export const sync = async (): Promise<SyncResponse> => {
    const url = apiPath(BASE_URL, "/sync")

    const res = await axios({
        method: 'get',
        url,
        timeout,
    })

    if (res.status === 200) {
        return res.data as SyncResponse
    }

    throw "Error"
}

export const uploadStream = async (blob: Blob): Promise<void> => {

    const jsonBody = {
        streamKey: "test",
        blob: blob
    }

    const url = apiPath(BASE_URL, "/upload")

    const res = await axios({
        method: 'post',
        url,
        data: jsonBody,
    })

    if (res.status === 200) {
        return
    }

    throw "Error"
}

const apiPath = (baseUrl: string, endpoint: string) => {
    return baseUrl + endpoint
}

export const getHash = (streamName: string, secret: string, timeDiff: number, authTimeDays: number) => {
    const tomorrovMillis = new Date().getTime() + (1000 * 60 * 60 * 24 * authTimeDays) - timeDiff
    const tomorrowEpoch = Math.round(tomorrovMillis / 1000)
    const hash = md5(`/live/${streamName}-${tomorrowEpoch}-${secret}`)
    return { hash, tomorrowEpoch }
}

export const startStreamUpload = (stream: MediaStream, streamKey: string, statusEvents: (s: string) => void) => {
    const ws = new WebSocket("ws://localhost:5000/");
    // set ws.binaryType = 'arraybuffer' if you want to send ArrayBuffer instead of Blob
    ws.binaryType = 'blob';
    const recorderOptions = {
        mimeType: 'video/webm',
        //videoBitsPerSecond: 20000000 // 20 Mbit/sec.,
    };
    const mediaRecorder = new MediaRecorder(stream, recorderOptions);
    mediaRecorder.start(1000); // 1000 - the number of milliseconds to record into each Blob
    mediaRecorder.ondataavailable = (event) => {
        statusEvents('Got blob data: ' + event.data.size + ' bytes')
        if (event.data && event.data.size > 0) {
            ws.send(event.data);
        }
    };

    ws.onclose = () => {
        try {
            mediaRecorder.stop();
        } catch (e) {
            console.log(e)
        }
    }

    return ws;
}