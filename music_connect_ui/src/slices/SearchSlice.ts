import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {SEARCH_SERVICE_URL} from "../config.js";

interface SearchResults {
    tracks: Track[],
    numTracks: number
}

interface SpotifyTrack {
    id: string,
    name: string,
    artist: string,
    album: string,
    albumCover: string,
    uri: string,
    source: string,
}

interface YouTubeTrack {
    id: string,
    name: string,
    channel: string,
    albumCover: string,
    source: string,
}

interface Track {
    id: string,
    name: string,
    channel: string | null,
    artist: string | null,
    album: string | null,
    albumCover: string,
    uri: string | null,
    serviceId: string,
}

interface SearchSlice {
    query: string,
    error: string,
    loading: boolean,
    searchResults: SearchResults[],
}

const initialState: SearchSlice = {
    query: "",
    error: "",
    loading: false,
    searchResults: [],
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
            const response = await fetch(`${SEARCH_SERVICE_URL}?q=${query}`, requestOptions);

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
                console.log(action.payload);
                state.searchResults = [];
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