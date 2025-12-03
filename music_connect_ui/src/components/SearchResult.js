import "./SearchResult.css";
import {IconButton, Tooltip} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import AddTrackToPlaylistModal from "../modal/AddTrackToPlaylistModal";
import {useState} from "react";
import {addSpotifyTrackToPlaylist} from "../slices/SpotifySlice.ts";
import {useDispatch} from "react-redux";

const SearchResultItem = ({name, artist, album, uri, image}) => {
    const dispatch = useDispatch();
    const [openAddTrackToPlaylistModal, setOpenAddTrackToPlaylistModal] = useState(false);

    const addToPlaylist = async (id) => {
        const track = { uris: [uri] }
        await dispatch(addSpotifyTrackToPlaylist({userId: 'user123', playlistId: id, tracks: track })); //TODO replace with username
        setOpenAddTrackToPlaylistModal(false);
    };

    return (
        <div className="search-result-container">
            <div className="search-result-content">
                <img src={image} alt={`${album} album cover`} />
                <div className="search-result-data">
                    <p className={"song-title"}>{name}</p>
                    <p className={"song-artist"}>{artist}</p>
                    <p className={"song-album"}>{album}</p>
                </div>
            </div>
            <Tooltip className={"add-playlist-button"} title="Add To Playlist" placement="top-end">
                <IconButton onClick={() => setOpenAddTrackToPlaylistModal(true)}>
                    <FontAwesomeIcon icon={faPlusCircle} color="#1ED760" />
                </IconButton>
            </Tooltip>
            <AddTrackToPlaylistModal open={openAddTrackToPlaylistModal} onClose={() => setOpenAddTrackToPlaylistModal(false)} onSubmit={addToPlaylist} />
        </div>
    );
}

export default SearchResultItem;