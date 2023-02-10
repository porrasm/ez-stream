import axios from 'axios'
import { Router } from 'express'
import { StreamCollection, StreamInfo } from './streams'

const router = Router()
const timeout = 5000
const externalServer = process.env.EXTERNAL_SERVER
const isLocal = Number(process.env.IS_LOCAL) === 1

let clientMediaServerHost = ""
const localMediaServerHost = externalServer ?? `http://127.0.0.1:${process.env.HTTP_PORT}`

console.log('Setup with server: ', localMediaServerHost)

router.get('/streams', async (req, res) => {
    const streams = await getStreams()
    return res.json(streams.filter(s => s.stream.publisher))
})

router.get('/sync', async (req, res) => {
    return res.json({ now: new Date().getTime(), streamServer: clientMediaServerHost })
})

type StreamUploadType = {
    streamKey: string
    blob: Blob
}

router.post('/upload', async (req, res) => {
    const jsonBody: StreamUploadType = req.body

    console.log('Got upload request: ', jsonBody)

    res.status(200).send()
})

export type ServerStream = {
    server: string,
    streamName: string
    stream: StreamInfo
}

export const getStreams = async (): Promise<ServerStream[]> => {
    try {
        const streams: ServerStream[] = []
        const collection = await getStream(localMediaServerHost)

        for (let key in collection.live) {
            const stream = collection.live[key];
            streams.push({
                server: clientMediaServerHost,
                streamName: key,
                stream,
            })
        }


        return streams
    } catch {
        return []
    }
}

const getStream = async (server: string): Promise<StreamCollection> => {
    try {

        const url = apiPath(server, "/api/streams")
        const res = await axios({
            method: 'get',
            url,
            timeout
        })

        if (res.status === 200) {
            console.log('Got streams from server: ', server)
            return res.data as StreamCollection
        }

        console.log('Error getting streams: ', res.status, res.statusText)

    } catch (error) {
        console.log('Error getting streams: ', error)
    }

    throw "Error getting streams"
}

const apiPath = (baseUrl: string, endpoint: string) => {
    return baseUrl + endpoint
}

const setMediaServerAddress = () => {
    if (externalServer) {
        clientMediaServerHost = externalServer
        return
    }
    if (isLocal) {
        clientMediaServerHost = "http://localhost:" + process.env.HTTP_PORT
        return
    }

    const { execSync } = require("child_process");

    const cmd = `curl -s http://checkip.amazonaws.com || printf "0.0.0.0"`;
    clientMediaServerHost = "http://" + execSync(cmd).toString().trim();
}

setMediaServerAddress()

export default router;