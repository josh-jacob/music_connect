import "./SearchServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";
import {Alert, Button, CircularProgress} from "@mui/material";
import {useNavigate, useSearchParams} from "react-router";
import {useEffect, useState} from "react";
import {fetchSpotifyPlaylists, fetchSpotifyUser, searchSpotify} from "../slices/SpotifySlice.ts";
import {fetchYouTubePlaylists, fetchYouTubeUser, searchYouTubeMusic} from "../slices/YouTubeMusicSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import SearchResult from "../components/SearchResult";
import {search} from "../slices/SearchSlice.ts";

const SearchServicePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [resultCount, setResultCount] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const spotifySearchResults = useSelector((state) => state.spotify.searchResults);
    const musicConnectSearchResults = useSelector((state) => state.search.searchResults.tracks);
    const musicConnectSearchResultsLoading = useSelector((state) => state.search.loading);
    const spotifySearchResultsLoading = useSelector((state) => state.spotify.loading);
    const youTubeMusicSearchResults = useSelector((state) => state.youtubeMusic.searchResults);
    const youTubeMusicSearchResultsLoading = useSelector((state) => state.youtubeMusic.loading);
    const youTubeUserAuthenticated = useSelector((state) => state.youtubeMusic.user.isAuthenticated);
    const spotifyUserAuthenticated = useSelector((state) => state.spotify.user.authenticated);

    const username = localStorage.getItem("username");

    const serviceId = searchParams.get("sid");
    const searchQuery = searchParams.get("q") || "";

    const onBack = () => {
        if (serviceId === "YouTube Music"){
            navigate("/youtube-music");
        }
        else if (serviceId === "Spotify"){
            navigate("/spotify");
        }
        else {
            navigate("/");
        }
    };

    const clearSearchResults = async() => {
        setSearchResults([]);
        setResultCount(0);
    }

    // Fetch authentication status on component mount
    useEffect(() => {
        dispatch(fetchSpotifyUser(username));
        dispatch(fetchYouTubeUser());
    }, []);

    useEffect(() => {
        clearSearchResults();
        if (serviceId === "Spotify") {
            setSearchResults(spotifySearchResults);
            setResultCount(spotifySearchResults.length);
        }
        else if (serviceId === "YouTube Music") { //YouTube Music
            setSearchResults(youTubeMusicSearchResults);
            setResultCount(youTubeMusicSearchResults.length);
        }
        else {
            setSearchResults(musicConnectSearchResults);
            setResultCount(musicConnectSearchResults.length);
        }
    }, [searchQuery, spotifySearchResults, youTubeMusicSearchResults, musicConnectSearchResults]);

    // Update authentication state when auth status changes
    useEffect(() => {
        if (serviceId === "Spotify") {
            setIsAuthenticated(spotifyUserAuthenticated);
        }
        else if (serviceId === "YouTube Music") {
            setIsAuthenticated(youTubeUserAuthenticated);
        }
        else {
            setIsAuthenticated(youTubeUserAuthenticated || spotifyUserAuthenticated);
        }
    }, [spotifyUserAuthenticated, youTubeUserAuthenticated, serviceId]);

    useEffect(() => {
        fetchPlaylists();
        if (serviceId === "Spotify") {
            searchSpotifyService();
        }
        else if (serviceId === "YouTube Music") {
            searchYouTubeService();
        }
        else {
            searchMusicConnect();
        }
    }, [searchQuery]);

    const fetchPlaylists = async () => {
        if (serviceId === "YouTube Music") {
            await dispatch(fetchYouTubePlaylists());
        }
        else if (serviceId === "Spotify") {
            await dispatch(fetchSpotifyPlaylists(username));
        }
        else {
            await dispatch(fetchSpotifyPlaylists(username));
            await dispatch(fetchYouTubePlaylists());
        }
    }
    const searchSpotifyService = async () => {
        await dispatch(searchSpotify({ userId: username, query: searchQuery}));
    }

    const searchYouTubeService = async () => {
        await dispatch(searchYouTubeMusic(searchQuery));
    }

    const searchMusicConnect = async () => {
        await dispatch(search({userId: username, query: searchQuery}));
    }

    return (
        <div className="search-service-page">
            <Header />
            <div className="search-header">
                <Button className="back-button" onClick={onBack} >Back</Button>
                <SearchBar service={serviceId} q={searchQuery} />
            </div>
            {!isAuthenticated ?
                <Alert severity="error">You need to connect your account to search.</Alert>
                :
                <div className="search-results">
                    {!(musicConnectSearchResultsLoading || spotifySearchResultsLoading || youTubeMusicSearchResultsLoading) ?
                        <p className="result-count">{resultCount} Results</p>
                    : null }
                    {(musicConnectSearchResultsLoading || spotifySearchResultsLoading || youTubeMusicSearchResultsLoading) ? <div className={"results-loading-container"}>
                        <CircularProgress className={"loading-spinner"} sx={{ alignSelf: "center" }}/>
                    </div> : null}
                    {!(musicConnectSearchResultsLoading || spotifySearchResultsLoading || youTubeMusicSearchResultsLoading) ? searchResults.map((result) => (
                            <SearchResult name={result.name} artist={result.artist ?? result.channel} album={result.album} uri={result.uri ?? result.id} image={result.albumCover} serviceId={result.serviceId}/>
                        )) : null }
                </div>
            }
        </div>
    );
};

export default SearchServicePage;