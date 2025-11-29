import "./SearchServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";
import {Button, CircularProgress} from "@mui/material";
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
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultsLoading, setSearchResultsLoading] = useState(true);

    const spotifySearchResults = useSelector((state) => state.spotify.searchResults);
    const spotifySearchResultsLoading = useSelector((state) => state.spotify.loading);

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
        setSearchResultsLoading(true);
    }

    useEffect(() => {
        clearSearchResults();
        if (serviceId === "MusicConnect"){
            //TODO
        }
        else if (serviceId === "Spotify") {
            setSearchResults(spotifySearchResults);
            setSearchResultsLoading(spotifySearchResultsLoading);
            setResultCount(spotifySearchResults.length);
        }
        else { //YouTube Music
            //TODO
        }
    }, [searchQuery, spotifySearchResults]);

    useEffect(() => {
        searchSpotifyService();
    }, [searchQuery]);

    const searchSpotifyService = async () => {
        await dispatch(searchSpotify({ userId: 'user123', query: searchQuery}));
    }

    return (
        <div className="search-service-page">
            <Header />
            <div className="search-header">
                <Button className="back-button" onClick={onBack} >Back</Button>
                <SearchBar service={serviceId} q={searchQuery} />
            </div>
            <div className="search-results">
                {!searchResultsLoading ?
                    <p className="result-count">{resultCount} Results</p>
                : null }
                {searchResultsLoading ? <div className={"results-loading-container"}>
                    <CircularProgress className={"loading-spinner"} sx={{ alignSelf: "center" }}/>
                </div> : null}
                {!searchResultsLoading ? searchResults.map((result) => (
                        <SearchResult name={result.name} artist={result.artist} album={result.album} uri={result.uri} image={result.albumCover} />
                    )) : null }
            </div>
        </div>
    );
};

export default SearchServicePage;