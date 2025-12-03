import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {SEARCH_SERVICE_URL} from "../config.js";

interface SearchResults {
    tracks: Track[],
    numTracks: number
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
            // Call to search all apps
            console.log("seaching...")
            const response = await fetch(`${SEARCH_SERVICE_URL}?q=${query}`, {});

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const addTrackToPlaylist = createAsyncThunk(
    "search/addTrackToPlaylist",
    async () => {
        try {
            // Call to search all apps
            const response = await fetch(`${SEARCH_SERVICE_URL}/playlist/add`);

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
                state.searchResults = action.payload;
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