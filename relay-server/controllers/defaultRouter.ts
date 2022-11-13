import axios from 'axios'
import { Router } from 'express'
import { StreamCollection, StreamInfo } from './streams'

const router = Router()
const timeout = 5000
const servers = process.env.SERVERS?.split(',')

if (!servers) {
    console.log("servers env: ", process.env.SERVERS)
    throw "No servers defined"
}

console.log('Setuped with servers: ', servers)

router.get('/streams', async (req, res) => {
    const streams = await getStreams(servers)
    return res.json(streams)
})

export type ServerStream = {
    server: string
    streamName: string
    stream: StreamInfo
}

export const getStreams = async (servers: string[]): Promise<ServerStream[]> => {
    try {
        const streams: ServerStream[] = []
        for (const server of servers) {
            const collection = await getStream(server)

            for (let key in collection.live) {
                const stream = collection.live[key];
                streams.push({
                    server,
                    streamName: key,
                    stream,
                })
            }
        }

        return streams
    } catch {
        return []
    }
}

const getStream = async (server: string): Promise<StreamCollection> => {
    const url = apiPath(server, "/api/streams")
    const res = await axios({
        method: 'get',
        url,
        timeout
    })

    if (res.status === 200) {
        return res.data as StreamCollection
    }

    throw "Error"
}

const apiPath = (baseUrl: string, endpoint: string) => {
    return baseUrl + endpoint
}

export default router;