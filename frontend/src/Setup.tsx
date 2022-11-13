import { useEffect, useState } from "react"
import { getHash, getStreams, ServerStream } from "./api"
import { StreamPlayer } from "./Player"

type StreamNameSetup = {
    name: string
    validForDays: number
    key?: string
}

export const Setup = () => {
    const [streams, setStreams] = useState<ServerStream[]>()
    const [selectedStream, setSelectedStream] = useState<ServerStream>()
    const [streamConnected, setStreamConnected] = useState(false)
    const [secret, setSecret] = useState("")
    const [streamKey, setStreamKey] = useState<StreamNameSetup>({
        name: "name",
        validForDays: 30
    })

    const loadData = async () => {
        const apiStreams = await getStreams()

        if (selectedStream) {
            const existStream = apiStreams.find(s => s.server === selectedStream.server && s.streamName === selectedStream.streamName)

            if (!existStream) {
                setStreamConnected(false)
            }
            if (existStream && !streamConnected) {
                setStreamConnected(true)
                setSelectedStream(existStream)
            }

            return
        }


        setStreams(apiStreams)
    }

    const onStreamError = () => {
        console.log("stream error")
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
        setSelectedStream(stream)
    }

    const getContent = () => {
        if (streams == undefined) {
            return <div>Loading...</div>
        }


        if (selectedStream) {
            const url = getFlvStreamUrl(selectedStream, secret)

            if (!streamConnected) {
                return <>
                    <button onClick={() => setSelectedStream(undefined)}>Stop watching</button>
                    <span>Stream disconnected (or invalid password). Trying to reconnect... </span>
                </>
            }

            return <>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button onClick={() => setStreamConnected(false)}>Refresh</button>
                    <button onClick={() => setSelectedStream(undefined)}>Stop watching</button>
                </div>
                <StreamPlayer url={url} onError={onStreamError} />
            </>
        }

        if (streams.length == 0) {
            return <span>No streams found...</span>
        }

        return <>
            <span>Streams found: {streams.length}</span>
            {streams.map(stream => <button onClick={() => selectStream(stream)}>
                Server: {stream.server}, Stream: {stream.streamName}
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
        {!selectedStream ? <div style={{ display: "flex", flexDirection: "row" }}>
            <span>Enter password: </span>
            <input value={secret} onChange={(e) => setSecret(e.target.value)}></input>
        </div> : null}
        {getContent()}

        {!selectedStream ? <>
            <br/><br/><br/>
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

const getFlvStreamUrl = (stream: ServerStream, secret?: string) => {
    let sign = ""
    if (secret?.length) {
        const hash = getHash(stream.streamName, secret, 1)
        sign = `?sign=${hash.tomorrowEpoch}-${hash.hash}`
    }
    return `${stream.server}/live/${stream.streamName}.flv${sign}`
}

const getStreamNameSign = (streamName: string, validForDays: number, secret: string) => {
    const hash = getHash(streamName, secret, validForDays)
    const sign = `?sign=${hash.tomorrowEpoch}-${hash.hash}`
    return `${streamName}${sign}`
} 