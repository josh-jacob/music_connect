import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {SEARCH_SERVICE_URL} from "../config.js";

interface SearchResults {
    tracks: Track[],
    numTracks: number
}

interface SpotifyTrack {
    source: string,
    title: string,
    artist: string,
    trackId: string,
    thumbnail: string
}

interface YouTubeTrack {
    source: string,
    title: string,
    channel: string,
    videoId: string,
    thumbnail: string
}

interface Track {
    serviceId: string,
    name: string,
    channel: string | null,
    artist: string | null,
    uri: string | null,
    id: string,
    albumCover: string,
}

interface SearchSlice {
    query: string,
    error: string,
    loading: boolean,
    searchResults: SearchResults,
}

const initialState: SearchSlice = {
    query: "",
    error: "",
    loading: false,
    searchResults: {
        tracks: [],
        numTracks: 0
    },
};

export const search = createAsyncThunk(
    "search",
    async (params: {userId: string, query: string}) => {
        try {
            const {userId, query} = params;
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            const requestOptions = {
                method: 'GET',
                headers: headers
            };
            // Call to search all apps
            const response = await fetch(`${SEARCH_SERVICE_URL}/search?q=${query}`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const addTrackToPlaylist = createAsyncThunk(
    "search/addTrackToPlaylist",
    async (track: SpotifyTrack | YouTubeTrack) => {
        try {
            const headers = new Headers();
            const requestOptions = {
                method: 'GET',
                headers: headers,
                body: JSON.stringify(track),
            };
            // Call to add track to playlist
            const response = await fetch(`${SEARCH_SERVICE_URL}/playlist/add`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

const SearchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(search.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(search.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults.tracks = [];
                const searchTracks = [];
                const spotifyTracks = action.payload.spotify;
                const youtubeTracks = action.payload.youtube;

                for (let pos in spotifyTracks) {
                    searchTracks.push({
                        serviceId: spotifyTracks[pos].source,
                        name: spotifyTracks[pos].title,
                        channel: null,
                        artist: spotifyTracks[pos].artist,
                        uri: spotifyTracks[pos].trackId,
                        id: null,
                        albumCover: spotifyTracks[pos].thumbnail,
                    });
                }

                for (let pos in youtubeTracks) {
                    searchTracks.push({
                        serviceId: youtubeTracks[pos].source,
                        name: youtubeTracks[pos].title,
                        channel: youtubeTracks[pos].channel,
                        artist: null,
                        uri: null,
                        id: youtubeTracks[pos].videoId,
                        albumCover: youtubeTracks[pos].thumbnail,
                    });
                }

                state.searchResults.numTracks = action.payload.count;
                state.searchResults.tracks = searchTracks;
            })
            .addCase(search.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(addTrackToPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addTrackToPlaylist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addTrackToPlaylist.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            });
    },
});

export default SearchSlice.reducer;