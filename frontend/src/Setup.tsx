import { useEffect, useState } from "react"
import { getHash, getStreams, ServerStream } from "./api"
import { StreamPlayer } from "./Player"
import { useSearchParams } from "react-router-dom";

type StreamNameSetup = {
    name: string
    validForDays: number
    key?: string
}

type Streams = {
    [name: string]: ServerStream
}

const streamParam = "stream"
const streamHashParam = "passwordHash"

export const Setup = () => {
    console.log("render")
    const [streams, setStreams] = useState<Streams>({})
    const [streamConnected, setStreamConnected] = useState(false)
    const [secret, setSecret] = useState("")
    const [streamKey, setStreamKey] = useState<StreamNameSetup>({
        name: "name",
        validForDays: 30
    })

    const [urlParams, setUrlParams] = useSearchParams()

    const currentStreamName = urlParams.get(streamParam)
    const existingSign = urlParams.get(streamHashParam) ?? undefined

    const setCurrentStreamName = (name: string) => {
        if (name.length) {
            urlParams.set(streamParam, name)
        } else {
            urlParams.delete(streamParam)
        }
        urlParams.delete(streamHashParam)

        setUrlParams(urlParams)
    }

    const currentStream = currentStreamName ? streams[currentStreamName] : undefined

    const loadData = async () => {
        const apiStreams = await getStreams()

        const dict: Streams = {}
        for (let stream of apiStreams) {
            dict[stream.streamName] = stream
        }

        if (currentStreamName?.length) {
            const existStream = dict[currentStreamName]

            if (!existStream) {
                setStreamConnected(false)
            }
            if (existStream && !streamConnected) {
                setStreamConnected(true)
            }
        }

        setStreams(dict)
    }

    const onStreamError = (e: any) => {
        console.log("stream error: ", e)
        setStreamConnected(false)
    }

    useEffect(() => {
        loadData()
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            loadData()
        }, 3500);
        return () => clearInterval(timer);
    }, [loadData]);

    const selectStream = (stream: ServerStream) => {
        console.log("Select: ", stream)
        setStreamConnected(true)
        setCurrentStreamName(stream.streamName)
    }

    const getContent = () => {
        if (currentStream) {
            const url = getFlvStreamUrl(currentStream, secret, existingSign)

            if (!streamConnected) {
                return <>
                    <button onClick={() => setCurrentStreamName("")}>Stop watching</button>
                    <span>Stream disconnected (or invalid password). Trying to reconnect... </span>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <span>Enter password: </span>
                        <input value={secret} onChange={(e) => setSecret(e.target.value)}></input>
                    </div>
                </>
            }

            const hashLink = `${window.location.origin}?${streamParam}=${currentStreamName}?${streamHashParam}=${getSign("")}`

            return <>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button onClick={() => setStreamConnected(false)}>Refresh</button>
                    <button onClick={() => setCurrentStreamName("")}>Stop watching</button>
                </div>
                <span>People with this link can view without password: {hashLink}</span>
                <StreamPlayer url={url} onError={onStreamError} />
            </>
        }

        const streamList = Object.keys(streams).map(k => streams[k])

        if (streamList.length === 0) {
            return <span>No streams found...</span>
        }

        return <>
            <span>Streams found: {streams.length}</span>
            {streamList.map(s => <button onClick={() => selectStream(s)}>
                {s.streamName} (on server: {s.server})
            </button>)}
        </>
    }

    const generateKey = () => {
        if (!secret.length) {
            alert("Without the password set the stream key is only your stream name")
            return
        }
        const keySign = getStreamNameSign(streamKey.name, streamKey.validForDays, secret)
        setStreamKey({ ...streamKey, key: keySign })
    }

    return <div style={{ display: "flex", flexDirection: "column" }}>
        {!currentStream ? <div style={{ display: "flex", flexDirection: "row" }}>
            <span>Enter password: </span>
            <input value={secret} onChange={(e) => setSecret(e.target.value)}></input>
        </div> : null}
        {getContent()}

        {!currentStream ? <>
            <br /><br /><br />
            <span>Generate stream key (required for stream upload setup): </span>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <span>Enter stream name: </span>
                <input value={streamKey.name} onChange={(e) => setStreamKey({
                    ...streamKey, name: e.target.value
                })}></input>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <span>Valid for days (integer): </span>
                <input value={streamKey.validForDays} onChange={(e) => setStreamKey({
                    ...streamKey, validForDays: Number(e.target.value)
                })}></input>
            </div>
            <button onClick={generateKey}>Generate key</button>
            {streamKey.key ? <span>Generated key: {streamKey.key}</span> : null}
        </> : null}
    </div>
}

const getSign = (streamName: string, secret?: string) => {
    let sign = ""
    if (secret?.length) {
        const hash = getHash(streamName, secret, 1)
        sign = `?sign=${hash.tomorrowEpoch}-${hash.hash}`
    }
}

const getFlvStreamUrl = (stream: ServerStream, secret?: string, existingSign?: string) => {
    const sign = existingSign ?? getSign(stream.streamName, secret)
    return `${stream.server}/live/${stream.streamName}.flv${sign}`
}

const getStreamNameSign = (streamName: string, validForDays: number, secret: string) => {
    const hash = getHash(streamName, secret, validForDays)
    const sign = `?sign=${hash.tomorrowEpoch}-${hash.hash}`
    return `${streamName}${sign}`
} 