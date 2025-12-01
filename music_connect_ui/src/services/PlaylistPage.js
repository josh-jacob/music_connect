import "./PlaylistPage.css";
import PlaylistHeader from "../components/PlaylistHeader";
import {useEffect, useState} from "react";
import TrackItem from "../components/TrackItem";
import {useNavigate, useParams} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {fetchSpotifyPlaylistTracks, removeSpotifyTrackFromPlaylist} from "../slices/SpotifySlice.ts";
import {Button} from "@mui/material";
import Header from "../components/Header";

const PlaylistPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { service, playlistId } = useParams();

    const [serviceURL, setServiceURL] = useState("");
    const [playlistName, setPlaylistName] = useState("");
    const [playlistCover, setPlaylistCover] = useState("");
    const [tracks, setTracks] = useState([]);

    const spotifyPlaylist = useSelector((state) => state.spotify.playlists.find((playlist) => playlist.id === playlistId));
    useEffect(() => {
        fetchTracks();
    }, []);

    useEffect(() => {
        if (service === 'spotify') {
            setTracks(spotifyPlaylist?.tracks);
            setPlaylistName(spotifyPlaylist?.name);
            setPlaylistCover(spotifyPlaylist?.image);
            setServiceURL("/spotify");
        }
        else { // service === YouTube
            // TODO Get YouTube Music Playlists
            setServiceURL("/youtube-music");
        }
    }, [spotifyPlaylist])


    const removeTrackFromPlaylist = async (trackId) => {
        const removeTrackRequest = {
            uris: [trackId],
        }
        await dispatch(removeSpotifyTrackFromPlaylist({userId: "user123", playlistId: playlistId, tracks: removeTrackRequest}));
        await fetchTracks();
    };

    const fetchTracks = async () => {
        if (service === 'spotify') {
            await dispatch(fetchSpotifyPlaylistTracks({userId: 'user123', playlistId: playlistId}));
        }
        else { // service === YouTube
            //
        }
    };

    return (
        <div className={"playlist-container"}>
            <Header />
            <Button className={"back-button"} onClick={() => navigate(serviceURL)} variant="outlined">Back</Button>
            <PlaylistHeader name={playlistName} playlistCover={playlistCover} numTracks={tracks?.length} />
            <div className={"playlist-tracks-container"}>
                {tracks?.map((track) => (
                    <TrackItem name={track.name} artist={track.artist} albumName={track.albumName} albumCover={track.albumCover} trackId={track.uri} onDelete={removeTrackFromPlaylist}/>
                ))}
            </div>
        </div>
    );
};

export default PlaylistPage;