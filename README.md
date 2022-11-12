# EZ-Stream

## Purpose

Discord streaming costs money at higher qualities. But you can now host your own streaming service. For free!

## How to use
### Streaming
You can use OBS to stream. Set the stream mode to custom and enter the stream details:

- Stream url: `rtmp://IP_ADDRESS/live`
- Stream key: `YOUR_STREAM_NAME`

### Watching
You can use either the browser UI to stream or VLC player.

#### Browser

- URL: `IP_ADDRESS:BACKEND_PORT`
- Follow the instructions

#### VLC media player

- Click media
- Open network stream
- Enter URL: `rtmp://IP_ADDRESS/live/STREAM_TO_WATCH`

## Hosting

Hosting is very simple

- Clone this repo
- In `backend/` and `relay-server/` directories make `.env` files (.env.examples included)
- `relay-server/` configuration file has the `SERVERS=` value. Enter the IP address of you machine there in the correct format (format in .env.example). You can use multiple servers or host the media server on a different machine. No instructions for that but source is very simple.
- Run the `run.sh` script in the root directory

Done.

## To do

- Authentication (anyone can stream and watch now)
