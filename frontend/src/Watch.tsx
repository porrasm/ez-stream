import { useEffect, useState } from "react";
import { getHash, getStreams, ServerStream, sync } from "./api";
import { StreamPlayer } from "./Player";
import { useQueryContext } from "./queryContext";

type StreamNameSetup = {
  name: string;
  validForDays: number;
  key?: string;
};

type Streams = {
  [name: string]: ServerStream;
};

const streamParam = "stream";
const streamHashParam = "passwordHash";

export const Watch = () => {
  const [timeDiff, setTimeDiff] = useState(0);
  const [streams, setStreams] = useState<Streams>({});
  const [streamConnected, setStreamConnected] = useState(false);
  const [secret, setSecretFunc] = useState(localStorage.getItem("secret") ?? "");
  const [streamKey, setStreamKey] = useState<StreamNameSetup>({
    name: "name",
    validForDays: 30,
  });
  const urlParams = useQueryContext();

  const setSecret = (secret: string) => {
    setSecretFunc(secret);
    localStorage.setItem("secret", secret);
  };

  console.log("location: ", window.location.search);

  if (!window.location.search.length) {
    window.location.search = `?${streamParam}=name&${streamHashParam}=hash`;
  }

  const currentStreamName = urlParams.getUrlParam(streamParam);
  const existingSign = urlParams.getUrlParam(streamHashParam) ?? undefined;

  const setCurrentStreamName = (name: string) => {
    if (name.length) {
      urlParams.setUrlParam(streamParam, name);
    } else {
      urlParams.delete(streamParam);
    }
    urlParams.delete(streamHashParam);
  };

  const currentStream = currentStreamName
    ? streams[currentStreamName]
    : undefined;

  const loadData = async () => {
    const apiStreams = await getStreams();

    const dict: Streams = {};
    for (let stream of apiStreams) {
      dict[stream.streamName] = stream;
    }

    if (currentStreamName?.length) {
      const existStream = dict[currentStreamName];

      if (!existStream) {
        setStreamConnected(false);
      }
      if (existStream && !streamConnected) {
        setStreamConnected(true);
      }
    }

    setStreams(dict);
  };

  const getHashValue = (name: string, daysValid: number) => {
    if (!secret?.length) {
      return;
    }
    const hash = getHash(name, secret, timeDiff, daysValid);
    return `${hash.tomorrowEpoch}-${hash.hash}`;
  };

  const getFlvStreamUrl = (stream: ServerStream, existingHash?: string) => {
    const hashValue = existingHash ?? getHashValue(stream.streamName, 1);
    const sign = hashValue ? `?sign=${hashValue}` : "";
    return `${stream.server}/live/${stream.streamName}.flv${sign}`;
  };

  const getStreamNameSign = (streamName: string, validForDays: number) => {
    const sign = `?sign=${getHashValue(streamName, validForDays)}`;
    return `${streamName}${sign}`;
  };

  const onStreamError = (e: any) => {
    setStreamConnected(false);
  };

  useEffect(() => {
    loadData();
    sync().then((res) => {
      const diff = new Date().getTime() - res.now;
      setTimeDiff(diff);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      loadData();
    }, 3500);
    return () => clearInterval(timer);
  }, [loadData]);

  const selectStream = (stream: ServerStream) => {
    setStreamConnected(true);
    setCurrentStreamName(stream.streamName);
  };

  const getContent = () => {
    if (currentStream) {
      const url = getFlvStreamUrl(currentStream, existingSign);

      if (!streamConnected) {
        return (
          <>
            <button onClick={() => setCurrentStreamName("")}>
              Stop watching
            </button>
            <span>
              Stream disconnected (or invalid password). Trying to reconnect...{" "}
            </span>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <span>Enter password: </span>
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              ></input>
            </div>
          </>
        );
      }

      const hashLink = secret.length
        ? `${window.location.origin}/?${streamParam}=${currentStream.streamName
        }&${streamHashParam}=${getHashValue(currentStream.streamName, 0.125)}`
        : undefined;

      return (
        <>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button onClick={() => setStreamConnected(false)}>Refresh</button>
            <button onClick={() => setCurrentStreamName("")}>
              Stop watching
            </button>
          </div>
          {hashLink === undefined ? null : (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <span>Guest stream link (valid for 3 hours): </span>
              <a href={hashLink}>Stream of {currentStream.streamName}</a>
            </div>
          )}
          <StreamPlayer url={url} onError={onStreamError} />
        </>
      );
    }

    const streamList = Object.keys(streams).map((k) => streams[k]);

    if (streamList.length === 0) {
      return <span>No streams found...</span>;
    }

    return (
      <>
        <span>{"Streams found: " + streams.length}</span>
        {streamList.map((s) => (
          <button onClick={() => selectStream(s)}>
            {s.streamName} (on server: {s.server})
          </button>
        ))}
      </>
    );
  };

  const generateKey = () => {
    if (!secret.length) {
      alert("Without the password set the stream key is only your stream name");
      return;
    }
    const keySign = getStreamNameSign(streamKey.name, streamKey.validForDays);
    setStreamKey({ ...streamKey, key: keySign });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {!currentStream ? (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <span>Enter password: </span>
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          ></input>
        </div>
      ) : null}
      {getContent()}

      {!currentStream ? (
        <>
          <br />
          <br />
          <br />
          <span>Generate stream key (required for stream upload setup): </span>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span>Enter stream name: </span>
            <input
              value={streamKey.name}
              onChange={(e) =>
                setStreamKey({
                  ...streamKey,
                  name: e.target.value,
                })
              }
            ></input>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span>Valid for days (integer): </span>
            <input
              value={streamKey.validForDays}
              onChange={(e) =>
                setStreamKey({
                  ...streamKey,
                  validForDays: Number(e.target.value),
                })
              }
            ></input>
          </div>
          <button onClick={generateKey}>Generate key</button>
          {streamKey.key ? <span>Generated key: {streamKey.key}</span> : null}
        </>
      ) : null}
    </div>
  );
};
