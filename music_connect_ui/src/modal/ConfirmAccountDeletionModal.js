import "./ConfirmAccountDeletion.css";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import TextField from "@mui/material/TextField";
import {useEffect, useState} from "react";

const ConfirmAccountDeletionModal = ({open, error, onClose, onSubmit}) => {
    const [password, setPassword ] = useState("");


    const clearFields = () => {
        setPassword("");
    };

    useEffect(() => {
        clearFields();
    }, [open])

    const onDelete = () => {
        onSubmit(password);
        clearFields();
    };

    return (
        <Dialog
            open={open}
            className={"delete-account-modal"}
            maxWidth={"500px"}
        >
            <DialogTitle>Delete Account</DialogTitle>
            <DialogContent>
                <p className={"delete-message"}>Are You Sure You Want To Delete Your Account?</p>
                <div className={"password-entry"}>
                    <p className={"password-label"}>Enter Password:</p>
                    <TextField value={password} type={"password"} onChange={e => setPassword(e.target.value)} />
                </div>
                {error ? <p className={"error-message"}>There was a problem deleting your account. Re-enter your password and try again.</p>: null}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onDelete} disabled={password.length === 0}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmAccountDeletionModal;