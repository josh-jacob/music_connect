import "./TrackItem.css";
import {IconButton, Tooltip} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMinusCircle} from "@fortawesome/free-solid-svg-icons";

const TrackItem = ({name, artist, albumName, albumCover}) => {
    const removeTrackFromPlaylist = () => {
        // TODO Call Slice to remove
    };

    return (
        <div className="track-container">
            <div className="track-content">
                <img src={albumCover} alt={`${albumName} album cover`} />
                <div className="search-result-data">
                    <p className={"song-title"}>{name}</p>
                    <p className={"song-artist"}>{artist}</p>
                    <p className={"song-album"}>{albumName}</p>
                </div>
            </div>
            <Tooltip className={"remove-playlist-button"} title="Remove From Playlist" placement="top-end">
                <IconButton onClick={removeTrackFromPlaylist}>
                    <FontAwesomeIcon icon={faMinusCircle} color="#1ED760" />
                </IconButton>
            </Tooltip>
        </div>
    );
}

export default TrackItem;