import "./AddTrackToPlaylistModal.css";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Select} from "@mui/material";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";

const AddTrackToPlaylistModal = ({open, onClose, serviceId, onSubmit}) => {
    const [playlistId, setPlaylistId] = useState("");
    const selectSpotifyPlaylists = useSelector((state) => state.spotify.playlists);
    const selectYouTubeMusicPlaylists = useSelector((state) => state.youtubeMusic.playlists);
    const [playlists, setPlaylists] = useState(null);

    const clearFields = () => {
        setPlaylistId("");
        setPlaylists([]);
    };

    useEffect(() => {
        clearFields();

        if(serviceId === 'spotify') {
            setPlaylists(selectSpotifyPlaylists);
        }
        else { //serviceId === 'youtube-music'
            setPlaylists(selectYouTubeMusicPlaylists);
        }
    }, [open])

    const onCreate = () => {
        onSubmit(playlistId);
    };

    return (
        <Dialog
            open={open}
            className={"add-track-to-playlist-modal"}
            fullWidth
        >
            <DialogTitle>Add Track to Playlist</DialogTitle>
            <DialogContent className={"dialog-content"}>
                <p className={"playlist-label"}>Playlist:</p>
                <div className={"playlist-selector"}>
                    <Select
                        native
                        value={playlistId}
                        defaultValue={null}
                        onChange={e => setPlaylistId(e.target.value)}
                        label="Native"
                        variant={'outlined'}
                        sx={{ width: '300px' }}
                    >
                        <option key={""} value={""}>
                            Select Playlist
                        </option>
                        {playlists?.map((playlist) => (
                            <option key={playlist.id} value={playlist.id}>
                                {playlist.name}
                            </option>
                        ))}
                    </Select>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onCreate} autoFocus disabled={!playlistId}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddTrackToPlaylistModal;