import "./TrackItem.css";
import {IconButton, Tooltip} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinusCircle} from "@fortawesome/free-solid-svg-icons";

const TrackItem = ({name, artist, albumName, albumCover, trackId, onDelete}) => {
    return (
        <div className="track-container">
            <div className="track-content">
                <img src={albumCover} alt={`${albumName} album cover`} />
                <div className="track-data">
                    <p className={"song-title"}>{name}</p>
                    <p className={"song-artist"}>{artist}</p>
                    <p className={"song-album"}>{albumName}</p>
                </div>
            </div>
            <Tooltip className={"remove-playlist-button"} title="Remove From Playlist" placement="top-end">
                <IconButton onClick={() => onDelete(trackId)}>
                    <FontAwesomeIcon icon={faMinusCircle} color="#1ED760" />
                </IconButton>
            </Tooltip>
        </div>
    );
}

export default TrackItem;