import { useEffect, useState } from "react"
import { getStreams, ServerStream } from "./api"
import { StreamPlayer } from "./Player"


export const Setup = () => {
    const [streams, setStreams] = useState<ServerStream[]>()
    const [selectedStream, setSelectedStream] = useState<ServerStream>()

    const loadData = async () => {
        setStreams(undefined)
        const apiStreams = await getStreams()

        setStreams(apiStreams)
    }

    useEffect(() => {
        loadData()
    }, [])

    if (selectedStream) {
        const url = getFlvStreamUrl(selectedStream.server, selectedStream.streamName)
        return <StreamPlayer url={url} />
    }

    if (streams == undefined) {
        return <div>Loading...</div>
    }
    if (streams.length == 0) {
        return <button onClick={loadData}>No streams. Reload?</button>
    }

    const selectStream = (stream: ServerStream) => {
        console.log("Select: ", stream)
        setSelectedStream(stream)
    }

    return <div style={{display: "flex", flexDirection: "column"}}>
        <span>Streams found: {streams.length}</span>
        {streams.map(stream => <button onClick={() => selectStream(stream)}>
            Server: {stream.server}, Stream: {stream.streamName}
        </button>)}
        <button onClick={loadData}>Reload streams</button>
    </div>
}

const getFlvStreamUrl = (server: string, streamName: string) => `${server}/live/${streamName}.flv`