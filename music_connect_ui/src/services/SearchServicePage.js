import "./SearchServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";
import {Button, CircularProgress, Divider} from "@mui/material";
import {useNavigate, useSearchParams} from "react-router";
import {useEffect, useState} from "react";
import {searchSpotify} from "../slices/SpotifySlice.ts";
import {useDispatch, useSelector} from "react-redux";
import SearchResult from "../components/SearchResult";

const SearchServicePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [resultCount, setResultCount] = useState(0);

    const spotifySearchResults = useSelector((state) => state.spotify.searchResults);
    const spotifySearchResultsLoading = useSelector((state) => state.spotify.loading);

    const serviceId = searchParams.get("sid");
    const searchQuery = searchParams.get("q") || "";

    let searchResults;
    let searchResultsLoading = true;

    // Call search on page render to display initial search results.
    useEffect(() => {
        handleSearch();
        setResultCount(spotifySearchResults.length);
    }, [searchQuery]);

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

    const handleSearch = () => {
        if (serviceId === "MusicConnect"){
            //TODO
        }
        else if (serviceId === "Spotify"){
            searchSpotifyService();
            searchResults = spotifySearchResults;
            searchResultsLoading = spotifySearchResultsLoading;
        }
        else { //YouTube Music
            //TODO
        }
    }

    const searchSpotifyService = async () => {
        await dispatch(searchSpotify({ userId: 'user123', query: searchQuery}));
    };

    return (
        <div className="search-service-page">
            <Header />
            <div className="search-header">
                <Button className="back-button" onClick={onBack} >Back</Button>
                <SearchBar service={serviceId} q={searchQuery} />
            </div>
            <div className="search-results">
                <p className="result-count">{resultCount} Results</p>
                <Divider fullWidth />
                <div className={"results-loading-container"}>
                    {spotifySearchResultsLoading ? <CircularProgress className={"loading-spinner"} sx={{ alignSelf: "center" }}/> : null}
                </div>
                {!spotifySearchResultsLoading ? spotifySearchResults.map((result) => (
                        <SearchResult name={result.name} artist={result.artist} album={result.album} uri={result.uri} image={result.albumCover} />
                    )) : null }
            </div>
        </div>
    );
};

export default SearchServicePage;