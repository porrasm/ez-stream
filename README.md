# EZ-Stream

## Purpose

Discord streaming costs money at higher qualities. But you can now host your own streaming service. For free!

## How to use
### Streaming
You can use OBS to stream. Set the stream mode to custom and enter the stream details:

- Stream url: `rtmp://IP_ADDRESS/live`
- Stream key: `YOUR_STREAM_NAME`

If you use a password you can generate a stream key from the web UI.

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

Hosting is very simple.

- Clone this repo
- In `backend/` and `relay-server/` directories make `.env` files (.env.examples included)
- `relay-server/` configuration file has the `SERVER=` value. Enter the IP address of you machine there in the correct format (format in .env.example). In theory you could host the media server on a different machine.
- `SECRET=` is the password for you users. It's optional in the `relay-server/` .env file.
- Run the `build.sh` script in the root directory
- Run the `run.sh` script in the root directory

Done.

PS: In the `/backend` directory the HTTP and RTMP ports need to match the values given in the .env.example. If you want to change them you will have some problems because of the media server package I used (it has hardcoded port values).

## To do

- Publish authentication (anyone can stream now)
