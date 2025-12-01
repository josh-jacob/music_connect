import "./Header.css";
import musicConnectLogo from '../files/music-connect-logo.png';
import {Button, ButtonGroup} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {deleteAccount, logout} from "../slices/UserSlice.ts";
import ConfirmAccountDeletionModal from "../modal/ConfirmAccountDeletionModal";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
    const [accountDeleted, setAccountDeleted] = useState(false);
    const [loggedOut, setLoggedOut] = useState(false);

    const user = useSelector((state) => state.users.user);
    const selectErrorMessage = useSelector((state) => state.users.error);

    const handleLogout = async () => {
        await dispatch(logout(user.token));
        setLoggedOut(true);
    };

    const handleAccountDeletion = async (password) => {
        await dispatch(deleteAccount({user, password}));
        await dispatch(logout(user.token));
        setAccountDeleted(true);
        setLoggedOut(true);
    }

    useEffect(() => {
        if (!selectErrorMessage && accountDeleted) {
            setDeleteAccountModalOpen(false);
        }
        if (!user.token && loggedOut) {
            localStorage.removeItem("accessToken");
            navigate("/login");
        }
    }, [loggedOut, accountDeleted])

    return (
        <div className={"header-container"} aria-labelledby="header-container">
            <a href={'/'}><img src={musicConnectLogo} className={"logo"} alt={"MusicConnect Logo"}/></a>
            <ButtonGroup variant="text" sx={{ borderColor: "#20B654" }}>
                <Button sx={{ color: "#20B654" }} onClick={() => setDeleteAccountModalOpen(true)}>Delete Account</Button>
                <Button sx={{ color: "#20B654" }} onClick={handleLogout}>Logout</Button>
            </ButtonGroup>
            <ConfirmAccountDeletionModal open={deleteAccountModalOpen} error={selectErrorMessage} onClose={() => setDeleteAccountModalOpen(false)} onSubmit={handleAccountDeletion} />
        </div>
    );
}

export default Header;