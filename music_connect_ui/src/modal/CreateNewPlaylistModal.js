import "./CreateNewPlaylistModal.css";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Switch} from "@mui/material";
import TextField from "@mui/material/TextField";
import {useEffect, useState} from "react";

const CreateNewPlaylistModal = ({open, onClose, onSubmit}) => {
    const [playlistName, setPlaylistName ] = useState("");
    const [playlistDescription, setPlaylistDescription ] = useState("");
    const [isPlaylistPrivate, setIsPlaylistPrivate ] = useState(false);

    const clearFields = () => {
        setPlaylistName("");
        setPlaylistDescription("");
        setIsPlaylistPrivate(false);
    };

    useEffect(() => {
        clearFields();
    }, [open])

    const onCreate = () => {
        onSubmit(playlistName, playlistDescription, isPlaylistPrivate)
    };

    return (
        <Dialog
            open={open}
            className={"add-playlist-modal"}
            maxWidth={"500px"}
        >
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogContent>
                <div className={"name-entry"}>
                    <p className={"name-label"}>Name:</p>
                    <TextField value={playlistName} onChange={e => setPlaylistName(e.target.value)} />
                </div>
                <div className={"description-entry"}>
                    <p className={"description-label"}>Description:</p>
                    <TextField value={playlistDescription} onChange={e => setPlaylistDescription(e.target.value)} />
                </div>
                <div className={"public-entry"}>
                    <p className={"public-label"}>Public:</p>
                    <Switch checked={isPlaylistPrivate} onChange={e => setIsPlaylistPrivate(e.target.checked)} />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onCreate} autoFocus>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateNewPlaylistModal;