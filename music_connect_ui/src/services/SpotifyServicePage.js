import "./SpotifyServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpotify} from "@fortawesome/free-brands-svg-icons";
import Badge from "@mui/material/Badge";
import {faPlusCircle, faUserCircle} from "@fortawesome/free-solid-svg-icons";
import {Button, CircularProgress, IconButton, Tooltip} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {
    createSpotifyPlaylist,
    fetchSpotifyPlaylists,
    fetchSpotifyUser,
    loginToSpotify
} from "../slices/SpotifySlice.ts";
import {useEffect, useState} from "react";
import PlaylistItem from "../components/PlaylistItem";
import BlankAlbumCover from "../files/blank-album-cover.png";
import CreateNewPlaylistModal from "../modal/CreateNewPlaylistModal";

const SpotifyServicePage = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.spotify.user.authenticated);
    const playlists = useSelector((state) => state.spotify.playlists);
    const playlistsLoading = useSelector((state) => state.spotify.loading);
    // TODO: const userName = useSelector() userSlice selectUsername

    const [openCreatePlaylistModal, setOpenCreatePlaylistModal] = useState(false);

    // Ignoring dependencies so the fetchUser is only called when the page loads.
    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        fetchPlaylists();
    }, [playlists.length]);

    const fetchPlaylists = async () => {
        await dispatch(fetchSpotifyPlaylists('user123')); //TODO: replace with userName
    }

    const getUser = async () => {
        await dispatch(fetchSpotifyUser('user123')); //TODO: replace with userName
    };

    const createPlaylist = async (name, description, isPrivate) => {
        const createPlaylistRequest = {
            name: name,
            description: description,
            public: !isPrivate,
        };

        await dispatch(createSpotifyPlaylist({userId: 'user123', playlistRequest: createPlaylistRequest}));
        setOpenCreatePlaylistModal(false);
    };

    const authenticateUser = async () => {
        await dispatch(loginToSpotify('user123')); //TODO: replace with userName
    };

    return (
        <div className="spotify-service-page">
            <Header />
            <div className="service-content">
                <FontAwesomeIcon icon={faSpotify} size="3x" color="#1ED760" />
                <SearchBar service="Spotify"/>
                <div className="user-profile">
                    <Badge variant="dot" color={isAuthenticated ? "success" : "error"}>
                        <FontAwesomeIcon icon={faUserCircle} size="2x" />
                    </Badge>
                    {isAuthenticated ? <p className={"account-connected"}>Account Connected</p> : null}
                </div>
            </div>
            {!isAuthenticated ? <Button onClick={authenticateUser} sx={{ color: "#1ED760", background: "#FAFAFA" }}>Connect Spotify Account</Button> : null }
            <div className={"playlists"}>
                <div className={"playlist-header"}>
                    <h2 className={"playlist-title"}>My Playlists</h2>
                    {isAuthenticated ? <Tooltip title="Create New Playlist" placement="top-end">
                        <IconButton onClick={() => setOpenCreatePlaylistModal(true)}>
                            <FontAwesomeIcon icon={faPlusCircle} color="#1ED760" />
                        </IconButton>
                    </Tooltip> : null }
                </div>
                <div className={"playlists-container"}>
                    {isAuthenticated && playlistsLoading ? <div className={"results-loading-container"}>
                        <CircularProgress className={"loading-spinner"} sx={{ alignSelf: "center" }}/>
                    </div> : null}
                    {!isAuthenticated ? <p className="playlist-unauthenticated">Sign into Spotify to see user playlists.</p> : null }
                    {isAuthenticated ? playlists.map((playlist) => (
                        <PlaylistItem playlistName={playlist.name} playlistImage={playlist.image !== "" ? playlist.image : BlankAlbumCover} />
                    )) : null}
                    <CreateNewPlaylistModal open={openCreatePlaylistModal} onClose={() => setOpenCreatePlaylistModal(false)} onSubmit={createPlaylist} />
                </div>
            </div>
        </div>
    );
};

export default SpotifyServicePage;