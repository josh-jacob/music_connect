import "./PlaylistPage.css";
import PlaylistHeader from "../components/PlaylistHeader";
import {useEffect, useState} from "react";
import TrackItem from "../components/TrackItem";
import {useNavigate, useParams} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {fetchSpotifyPlaylistTracks, removeSpotifyTrackFromPlaylist} from "../slices/SpotifySlice.ts";
import {Button} from "@mui/material";
import Header from "../components/Header";
import BlankAlbumCover from "../files/blank-album-cover.png";
import {fetchYouTubePlaylistTracks, removeYouTubeTrackFromPlaylist} from "../slices/YouTubeMusicSlice.ts";

const PlaylistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { service, playlistId } = useParams();

    const [serviceURL, setServiceURL] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [playlistCover, setPlaylistCover] = useState("");
    const [tracks, setTracks] = useState([]);

    const spotifyPlaylist = useSelector((state) => state.spotify.playlists.find((playlist) => playlist.id === playlistId));
    const youtubePlaylist = useSelector((state) => state.youtubeMusic.playlists.find((playlist) => playlist.id === playlistId));
    const username = localStorage.getItem("username");

    useEffect(() => {
        fetchTracks();
    }, []);

    useEffect(() => {
        if (service === 'spotify') {
            setTracks(spotifyPlaylist?.tracks);
            setPlaylistName(spotifyPlaylist?.name);
            setPlaylistCover(spotifyPlaylist?.image !== "" ? spotifyPlaylist?.image : BlankAlbumCover);
            setServiceURL("/spotify");
        }
        else { // service === YouTube
            setTracks(youtubePlaylist?.tracks);
            setPlaylistName(youtubePlaylist?.name);
            setPlaylistCover(youtubePlaylist?.image !== "" ? youtubePlaylist?.image : BlankAlbumCover);
            setServiceURL("/youtube-music");
        }
    }, [spotifyPlaylist, youtubePlaylist])


    const removeTrackFromPlaylist = async (trackId) => {
        if (service === 'spotify') {
            const removeTrackRequest = {
                uris: [trackId],
            }
            await dispatch(removeSpotifyTrackFromPlaylist({
                userId: username,
                playlistId: playlistId,
                tracks: removeTrackRequest
            }));
        }
        else {
            await dispatch(removeYouTubeTrackFromPlaylist({
                playlistId: playlistId,
                videoId: trackId,
            }));
        }
        await fetchTracks();
    };

    const fetchTracks = async () => {
        if (service === 'spotify') {
            await dispatch(fetchSpotifyPlaylistTracks({userId: username, playlistId: playlistId}));
        }
        else { // service === YouTube
            await dispatch(fetchYouTubePlaylistTracks(playlistId));
        }
    };

    return (
        <div className={"playlist-container"}>
            <Header />
            <Button className={"back-button"} onClick={() => navigate(serviceURL)} variant="outlined">Back</Button>
            <PlaylistHeader name={playlistName} playlistCover={playlistCover} numTracks={tracks?.length} />
            <div className={"playlist-tracks-container"}>
                {tracks?.map((track) => (
                    <TrackItem name={track.name} artist={track.artist ?? track.channel} albumName={track.albumName} albumCover={track.albumCover} trackId={track.uri ?? track.id} onDelete={removeTrackFromPlaylist}/>
                ))}
            </div>
        </div>
    );
};

export default PlaylistPage;