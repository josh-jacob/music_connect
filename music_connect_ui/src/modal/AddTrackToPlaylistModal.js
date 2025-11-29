import "./AddTrackToPlaylistModal.css";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Select} from "@mui/material";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";

const AddTrackToPlaylistModal = ({open, onClose, onSubmit}) => {
    const [playlistId, setPlaylistId] = useState("");
    const selectSpotifyPlaylists = useSelector((state) => state.spotify.playlists);

    const clearFields = () => {
        setPlaylistId("");
    };

    useEffect(() => {
        clearFields();
    }, [open])

    const onCreate = () => {
        console.log(playlistId);
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
                        onChange={e => setPlaylistId(e.target.value)}
                        label="Native"
                        variant={'outlined'}
                        sx={{ width: '300px' }}
                    >
                        {selectSpotifyPlaylists.map((playlist) => (
                            <option key={playlist.id} value={playlist.id}>
                                {playlist.name}
                            </option>
                        ))}
                    </Select>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onCreate} autoFocus>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddTrackToPlaylistModal;