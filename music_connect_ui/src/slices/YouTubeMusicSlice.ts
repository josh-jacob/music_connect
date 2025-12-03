import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {YOUTUBE_SERVICE_URL} from "../config";

interface YouTubeMusicUser {
    id: string,
    name: string,
    isAuthenticated: boolean
}

interface Track {
    id: string,
    name: string,
    channel: string,
    albumCover: string,
    serviceId: string,
}

interface Playlist {
    id: string,
    name: string,
    image: string,
    numTracks: number,
    tracks: Track[],
}

interface SearchResponse {
    results: Track[]
}

interface YouTubeMusicSlice {
    user: YouTubeMusicUser,
    playlists: Playlist[],
    searchResults: Track[],
    query: string,
    error: string,
    loading: boolean,
    results: SearchResponse,
}

const initialState: YouTubeMusicSlice = {
    user: {
        id: "",
        name: "",
        isAuthenticated: false,
    },
    playlists: [],
    searchResults: [],
    query: "",
    error: "",
    loading: false,
    results: null,
};

export const loginToYouTubeMusic = createAsyncThunk(
    "YouTubeMusic/login",
    async () => {
        try {

            // Call to login
            window.location.href = `${YOUTUBE_SERVICE_URL}/auth/youtube/login`;
        } catch (error) {
            throw (error.message);
        }
    }
);

export const fetchYouTubeUser = createAsyncThunk(
    "YouTubeMusic/fetchUser",
    async () => {
        try {
            const headers = new Headers();
            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to get user
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/youtube/me`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const searchYouTubeMusic = createAsyncThunk(
    "YouTubeMusic/search",
    async (query) => {
        try {
            const headers = new Headers();

            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to search YouTubeMusic
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/youtube/search?q=${query}`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const fetchYouTubePlaylists = createAsyncThunk(
    "YouTubeMusic/fetchPlaylists",
    async () => {
        try {
            const headers = new Headers();
            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to fetch user playlists
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/youtube/playlists`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);


export const fetchYouTubePlaylistTracks = createAsyncThunk(
    "YouTubeMusic/fetchPlaylistTracks",
    async (playlistId: string) => {
        try {
            const headers = new Headers();
            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to fetch all track in the playlist
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/youtube/playlist/${playlistId}/items`, requestOptions);

            const result = await response.json();
            return {playlistId, result};
        } catch (error) {
            throw (error.message);
        }
    }
);

export const createYouTubePlaylist = createAsyncThunk(
    "YouTubeMusic/createPlaylist",
    async (params: {name: string, description: string, isPrivate: boolean}) => {
        try {
            const {name, description, isPrivate} = params;
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({title: name, description, privacy: isPrivate ? "private" : "public"}),
            };

            // Call to create new playlist for user
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/youtube/playlists/create`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const addYouTubeTrackToPlaylist = createAsyncThunk(
    "YouTubeMusic/addTrackToPlaylist",
    async (params: {playlistId: string, videoId: string}) => {
        try {
            const {playlistId, videoId} = params;
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            const requestOptions = {
                method: 'POST',
                headers: headers
            };

            // Call to add track to playlist
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/youtube/playlist/${playlistId}/add?videoId=${videoId}`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const removeYouTubeTrackFromPlaylist = createAsyncThunk(
    "YouTubeMusic/removeTrackFromPlaylist",
    async (params: {playlistId: string, videoId: string}) => {
        try {
            const {playlistId, videoId} = params;
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            const requestOptions = {
                method: 'DELETE',
                headers: headers
            };

            // Call to remove track from playlist
            const response = await fetch(`${YOUTUBE_SERVICE_URL}/youtube/playlist/${playlistId}/remove?videoId=${videoId}`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

const YouTubeMusicSlice = createSlice({
    name: "YouTubeMusic",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginToYouTubeMusic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginToYouTubeMusic.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(loginToYouTubeMusic.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(fetchYouTubeUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchYouTubeUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.channelId) {
                    state.user = {
                        id: action.payload.channelId,
                        name: action.payload.title,
                        isAuthenticated: true
                    };
                }
            })
            .addCase(fetchYouTubeUser.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(searchYouTubeMusic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchYouTubeMusic.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = [];
                const tracks = action.payload.results;
                const trackResults: Track[] = [];
                for (let pos in tracks) {
                    trackResults.push(
                        {
                            id: action.payload.results[pos].videoId,
                            name: action.payload.results[pos].title,
                            channel: action.payload.results[pos].channel,
                            albumCover: action.payload.results[pos].thumbnail,
                            serviceId: "youtube"
                        }
                    );
                }
                state.searchResults = trackResults;
            })
            .addCase(searchYouTubeMusic.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(fetchYouTubePlaylists.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchYouTubePlaylists.fulfilled, (state, action) => {
                state.loading = false;
                state.playlists = [];
                if (action.payload.length > 0) {
                    state.user = {
                        ...state.user,
                        isAuthenticated: true,
                    }

                    for (let pos in action.payload) {
                        state.playlists.push({
                            id: action.payload[pos].id,
                            name: action.payload[pos].title,
                            image: action.payload[pos].thumbnail,
                            numTracks: action.payload[pos].videoCount,
                            tracks: []
                        });
                    }
                }
            })
            .addCase(fetchYouTubePlaylists.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(fetchYouTubePlaylistTracks.pending, (state) => {
            state.loading = true;
            state.error = null;
            })
            .addCase(fetchYouTubePlaylistTracks.fulfilled, (state, action) => {
                state.loading = false;
                const playlists = state.playlists;
                for (let pos in playlists) {
                    if (playlists[pos].id === action.payload.playlistId) {
                        playlists[pos].tracks = action.payload.result.map((track) => ({
                            id: track.videoId,
                            name: track.title,
                            channel: track.channel,
                            albumCover: track.thumbnail
                        }));
                    }
                }
            })
            .addCase(fetchYouTubePlaylistTracks.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(createYouTubePlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createYouTubePlaylist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createYouTubePlaylist.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(addYouTubeTrackToPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addYouTubeTrackToPlaylist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addYouTubeTrackToPlaylist.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(removeYouTubeTrackFromPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeYouTubeTrackFromPlaylist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(removeYouTubeTrackFromPlaylist.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            });
    },
});

export default YouTubeMusicSlice.reducer;