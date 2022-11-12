import axios from 'axios'
import { StreamCollection, StreamInfo } from './streams'

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
        timeout
    })

    if (res.status === 200) {
        return res.data as ServerStream[]
    }

    throw "Error"
}

const apiPath = (baseUrl: string, endpoint: string) => {
    return baseUrl + endpoint
}
