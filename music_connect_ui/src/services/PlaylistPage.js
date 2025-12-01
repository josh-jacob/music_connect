import "./PlaylistPage.css";
import PlaylistHeader from "../components/PlaylistHeader";
import {useEffect, useState} from "react";
import TrackItem from "../components/TrackItem";
import {useParams} from "react-router";

const PlaylistPage = () => {
    const { service, playlistId } = useParams();
    const [tracks, setTracks] = useState([]);

    // const useSelector = useSelector((state) => state.spotify.);

    useEffect(() => {
        // TODO Call slice to get list of playlist tracks
    }, []);

    useEffect(() => {
        // TODO Get service type, and set tracks based on service type
        if (service === 'Spotify') {

        }
        else { // service === YouTube
            //
        }
    }, [service]);

    return (
        <div className={"playlist-container"}>
            <PlaylistHeader />
            <div className={"playlist-tracks-container"}>
                {tracks.map((track, index) => (
                    <TrackItem />
                ))}
            </div>
        </div>
    );
};

export default PlaylistPage;