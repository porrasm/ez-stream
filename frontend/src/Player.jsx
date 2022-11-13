import {ReactFlvPlayer} from 'react-flv-player'

export const StreamPlayer = (props) => {
    return (
        <div>
          <ReactFlvPlayer
            url = {props.url}
            //heigh = "800px"
            //width = "800px"
            isMuted={false}
            isLive={true}
            handleError={(e) => props.onError(e)}
          />
        </div>
      )
}