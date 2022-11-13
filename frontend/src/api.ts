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

const apiPath = (baseUrl: string, endpoint: string) => {
    return baseUrl + endpoint
}

export const getHash = (streamName: string, secret: string, timeDiff: number, authTimeDays: number) => {
    const tomorrovMillis = new Date().getTime() + (1000 * 60 * 60 * 24 * authTimeDays) - timeDiff
    const tomorrowEpoch = Math.round(tomorrovMillis / 1000)
    const hash = md5(`/live/${streamName}-${tomorrowEpoch}-${secret}`)
    return { hash, tomorrowEpoch }
}
