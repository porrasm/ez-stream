export interface StreamCollection {
    live: LiveInfo
  }
  
  export interface LiveInfo {
    [name: string]: StreamInfo
  }
  
  export interface StreamInfo {
    publisher: Publisher
    subscribers: Subscriber[]
  }
  
  export interface Publisher {
    app: string
    stream: string
    clientId: string
    connectCreated: string
    bytes: number
    ip: string
    audio: Audio
    video: Video
  }
  
  export interface Audio {
    codec: string
    profile: string
    samplerate: number
    channels: number
  }
  
  export interface Video {
    codec: string
    width: number
    height: number
    profile: string
    level: number
    fps: number
  }
  
  export interface Subscriber {
    app: string
    stream: string
    clientId: string
    connectCreated: string
    bytes: number
    ip: string
    protocol: string
  }