import { useEffect, useState } from "react"
import { getStreams, ServerStream } from "./api"
import { StreamPlayer } from "./Player"


export const Setup = () => {
    const [streams, setStreams] = useState<ServerStream[]>()
    const [selectedStream, setSelectedStream] = useState<ServerStream>()
    const [streamConnected, setStreamConnected] = useState(false)

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

    if (streams == undefined) {
        return <div>Loading...</div>
    }


    if (selectedStream) {
        const url = getFlvStreamUrl(selectedStream.server, selectedStream.streamName)

        if (!streamConnected) {
            return <>
                <button onClick={() => setSelectedStream(undefined)}>Stop watching</button>
                <span>Stream disconnected. Trying to reconnect... </span>
            </>
        }

        return <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <button onClick={() => setStreamConnected(false)}>Refresh</button>
                <button onClick={() => setSelectedStream(undefined)}>Stop watching</button>
            </div>
            <StreamPlayer url={url} onError={onStreamError} />
        </div>
    }




    if (streams.length == 0) {
        return <span>No streams found...</span>
    }

    const selectStream = (stream: ServerStream) => {
        console.log("Select: ", stream)
        setStreamConnected(true)
        setSelectedStream(stream)
    }

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <span>Streams found: {streams.length}</span>
        {streams.map(stream => <button onClick={() => selectStream(stream)}>
            Server: {stream.server}, Stream: {stream.streamName}
        </button>)}
    </div>
}

const getFlvStreamUrl = (server: string, streamName: string) => `${server}/live/${streamName}.flv`