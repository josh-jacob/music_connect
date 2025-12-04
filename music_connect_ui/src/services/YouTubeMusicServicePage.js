import "./YouTubeMusicServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";
import Badge from '@mui/material/Badge';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faYoutube} from "@fortawesome/free-brands-svg-icons";
import {faPlusCircle, faUserCircle} from "@fortawesome/free-solid-svg-icons";
import {Button, CircularProgress, IconButton, Tooltip} from "@mui/material";
import {useNavigate} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {
    createYouTubePlaylist,
    fetchYouTubePlaylists,
    fetchYouTubeUser,
    loginToYouTubeMusic
} from "../slices/YouTubeMusicSlice.ts";
import {useEffect, useState} from "react";
import CreateNewPlaylistModal from "../modal/CreateNewPlaylistModal";
import PlaylistItem from "../components/PlaylistItem";
import BlankAlbumCover from "../files/blank-album-cover.png";

const YouTubeMusicServicePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector((state) => state.youtubeMusic.user.isAuthenticated);
    const playlists = useSelector((state) => state.youtubeMusic.playlists);
    const playlistsLoading = useSelector((state) => state.youtubeMusic.loading);

    const [openCreatePlaylistModal, setOpenCreatePlaylistModal] = useState(false);

    // Ignoring dependencies so the fetchUser is only called when the page loads.
    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        fetchPlaylists();
    }, [playlists.length]);

    const fetchPlaylists = async () => {
        await dispatch(fetchYouTubePlaylists());
    };

    const getUser = async () => {
        await dispatch(fetchYouTubeUser());
    };

    const createPlaylist = async (name, description, isPrivate) => {
        const createPlaylistRequest = {
            name: name,
            description: description,
            isPrivate: isPrivate,
        };

        await dispatch(createYouTubePlaylist(createPlaylistRequest));
        setOpenCreatePlaylistModal(false);
    };

    const authenticateUser = async () => {
        await dispatch(loginToYouTubeMusic());
    };

    return (
        <div className="youtube-service-page">
            <Header />
            <div className="service-content">
                <FontAwesomeIcon icon={faYoutube} size="3x" color="red" />
                <SearchBar service="YouTube Music"/>
                <div className="user-profile">
                    <Badge variant="dot" color={isAuthenticated ? "success" : "error"}>
                        <FontAwesomeIcon icon={faUserCircle} size="2x" />
                    </Badge>
                    {isAuthenticated ? <p className={"account-connected"}>Account Connected</p> : null}
                </div>
            </div>
            {!isAuthenticated ? <Button onClick={authenticateUser} sx={{ color: "red", background: "#FAFAFA" }}>Connect YouTube Music Account</Button> : null }
            <div className={"playlists"}>
                <div className={"playlist-header"}>
                    <h2 className={"playlist-title"}>My Playlists</h2>
                    {isAuthenticated ? <Tooltip title="Create New Playlist" placement="top-end">
                        <IconButton onClick={() => setOpenCreatePlaylistModal(true)}>
                            <FontAwesomeIcon icon={faPlusCircle} color="red" />
                        </IconButton>
                    </Tooltip> : null }
                </div>
                <div className={"playlists-container"}>
                    {playlistsLoading ? <div className={"results-loading-container"}>
                        <CircularProgress className={"loading-spinner"} sx={{ alignSelf: "center" }}/>
                    </div> : null}
                    {!isAuthenticated ? <p className="playlist-unauthenticated">Sign into YouTube Music to see user playlists.</p> : null}
                    {isAuthenticated ? playlists.map((playlist) => (
                        <Button onClick={() => navigate(`./playlist/${playlist.id}`)}><PlaylistItem playlistName={playlist.name} playlistImage={playlist.image !== '' ? playlist.image : BlankAlbumCover} /></Button>
                    )) : null}
                    <CreateNewPlaylistModal open={openCreatePlaylistModal} onClose={() => setOpenCreatePlaylistModal(false)} onSubmit={createPlaylist} />
                </div>
            </div>
        </div>
    );
};

export default YouTubeMusicServicePage;