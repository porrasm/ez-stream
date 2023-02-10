require('dotenv').config()
const NodeMediaServer = require('node-media-server');


const rtmpPort = process.env.RTMP_PORT ?? 1935
const httpPort = process.env.HTTP_PORT ?? 8000
const secret = process.env.SECRET

const auth = secret.length ? {
  play: true,
  // todo fix publish auth
  publish: false,
  secret
} : undefined

const config = {
  rtmp: {
    port: rtmpPort,
    chunk_size: 1000,
    gop_cache: false,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: httpPort,
    allow_origin: '*'
  },
  auth
};

var nms = new NodeMediaServer(config)
nms.run();

