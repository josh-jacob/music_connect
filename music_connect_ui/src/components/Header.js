import "./Header.css";
import musicConnectLogo from '../files/music-connect-logo.png';
import {Button, ButtonGroup} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {deleteAccount, logout} from "../slices/UserSlice.ts";
import ConfirmAccountDeletionModal from "../modal/ConfirmAccountDeletionModal";
import {useState} from "react";

const Header = () => {
    const dispatch = useDispatch();

    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

    const user = useSelector((state) => state.users.user);

    const handleLogout = async () => {
        await dispatch(logout());
    }

    const handleAccountDeletion = async (password) => {
        setDeleteAccountModalOpen(false);
        await dispatch(deleteAccount({user, password}));
        await handleLogout();
    }

    return (
        <div className={"header-container"} aria-labelledby="header-container">
            <a href={'/'}><img src={musicConnectLogo} className={"logo"} alt={"MusicConnect Logo"}/></a>
            <ButtonGroup variant="text" sx={{ borderColor: "#20B654" }}>
                <Button sx={{ color: "#20B654" }} onClick={() => setDeleteAccountModalOpen(true)}>Delete Account</Button>
                <Button sx={{ color: "#20B654" }} onClick={handleLogout}>Logout</Button>
            </ButtonGroup>
            <ConfirmAccountDeletionModal open={deleteAccountModalOpen} onClose={() => setDeleteAccountModalOpen(false)} onSubmit={handleAccountDeletion} />
        </div>
    );
}

export default Header;