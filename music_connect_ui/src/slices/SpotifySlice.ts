import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {SPOTIFY_SERVICE_URL} from '../config';

interface SpotifyUser {
    id: string
    username: string
    email: string
    authenticated: boolean
}

interface Song {
    id: string,
    name: string,
    artist: string,
    album: string,
    albumCover: string,
    uri: string,
    serviceId: string,
}

interface Playlist {
    id: string,
    name: string,
    image: string,
    tracks: Song[]
}

interface CreatePlaylistRequest {
    name: string,
    description: string,
    public: boolean
}

interface AddTrackToPlaylistRequest {
    uris: string[]
}

interface SpotifySlice {
    user: SpotifyUser,
    playlists: Playlist[],
    searchResults: Song[],
    query: string,
    error: string,
    loading: boolean,
}

const initialState: SpotifySlice = {
    user: {
        id: null,
        username: null,
        email: null,
        authenticated: false,
    },
    playlists: [],
    searchResults: [],
    query: "",
    error: "",
    loading: false,
};

export const loginToSpotify = createAsyncThunk(
    "spotify/login",
    async (userId: string) => {
        try {
            console.log(userId);
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to authenticate Spotify user
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/auth/login`, requestOptions);
            return await response.json();
        } catch (error) {
            throw (error.message());
        }
    }
);

export const fetchSpotifyUser = createAsyncThunk(
    "spotify/fetchUser",
    async (userId: string) => {
        try {
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to fetch user
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/me`, requestOptions);
            const result = await response.json();
            return {status: response.ok, result};
        } catch (error) {
            throw (error.message);
        }
    }
);

export const searchSpotify = createAsyncThunk(
    "spotify/search",
    async (props: {userId: string, query: string}) => {
        try {
            const {userId, query} = props;

            const headers = new Headers();
            headers.set('X-User-Id', userId);
            const requestOptions = {
                method: 'GET',
                headers: headers,
            };
            // Call to search spotify
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/search?q=${query}`, requestOptions);
            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);


export const getSavedSpotifyTracks = createAsyncThunk(
    "spotify/getSavedTracks",
    async (props: { userId: string, tracks: AddTrackToPlaylistRequest }) => {
        try {
            const {userId, tracks} = props;
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            headers.set('Content-Type', 'application/json');
            const requestOptions = {
                method: 'GET',
                headers: headers,
                body: JSON.stringify(tracks)
            };

            // Call to get saved tracks
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/tracks`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const fetchSpotifyPlaylists = createAsyncThunk(
    "spotify/fetchPlaylists",
    async (userId: string) => {
        try {
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to fetch user playlists
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/playlists`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const fetchSpotifyPlaylistTracks = createAsyncThunk(
    "spotify/fetchPlaylistTracks",
    async (props: {userId: string, playlistId: string}) => {
        try {
            const {userId, playlistId} = props;
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            const requestOptions = {
                method: 'GET',
                headers: headers
            };

            // Call to fetch user playlists
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/playlist/${playlistId}/tracks`, requestOptions);
            const result = await response.json();
            return {playlistId, result};
        } catch (error) {
            throw (error.message);
        }
    }
);

export const createSpotifyPlaylist = createAsyncThunk(
    "spotify/createPlaylist",
    async (props: {userId: string, playlistRequest: CreatePlaylistRequest}) => {
        try {
            const {userId, playlistRequest} = props;
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            headers.set('Content-Type', 'application/json');
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(playlistRequest)
            };

            // Call to create new playlist for user
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/playlists`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const addSpotifyTrackToPlaylist = createAsyncThunk(
    "spotify/addTrackToPlaylist",
    async (props: { userId: string, playlistId: string, tracks: AddTrackToPlaylistRequest }) => {
        try {
            const {userId, playlistId, tracks} = props;
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            headers.set('Content-Type', 'application/json');
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(tracks)
            };

            // Call to add track to existing playlist
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/playlist/${playlistId}/add`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

export const removeSpotifyTrackFromPlaylist = createAsyncThunk(
    "spotify/removeTrackFromPlaylist",
    async (props: { userId: string, playlistId: string, tracks: AddTrackToPlaylistRequest }) => {
        try {
            const {userId, playlistId, tracks} = props;
            const headers = new Headers();
            headers.set('X-User-Id', userId);
            headers.set('Content-Type', 'application/json');
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(tracks)
            };

            // Call to remove track from existing playlist
            const response = await fetch(`${SPOTIFY_SERVICE_URL}/music/playlist/${playlistId}/remove`, requestOptions);

            return await response.json();
        } catch (error) {
            throw (error.message);
        }
    }
);

const SpotifySlice = createSlice({
    name: "spotify",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loginToSpotify.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginToSpotify.fulfilled, (state, action) => {
                state.loading = false;
                window.open(action.payload.auth_url, '_self');
            })
            .addCase(loginToSpotify.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(fetchSpotifyUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSpotifyUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.status) {
                    state.user = {
                        id: action.payload.result.id,
                        username: action.payload.result.display_name,
                        email: action.payload.result.email,
                        authenticated: true,
                    };
                }
            })
            .addCase(fetchSpotifyUser.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(searchSpotify.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchSpotify.fulfilled, (state, action) => {
                state.loading = false;
                state.searchResults = [];
                const results = [];
                for (let pos in action.payload) {
                    results.push({
                        id: action.payload[pos].id,
                        name: action.payload[pos].name,
                        artist: action.payload[pos].artists[0].name,
                        album: action.payload[pos].album.name,
                        albumCover: action.payload[pos].album.images[0].url,
                        uri: action.payload[pos].uri,
                        serviceId: "spotify"
                    });
                }
                state.searchResults = results;
            })
            .addCase(searchSpotify.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(getSavedSpotifyTracks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSavedSpotifyTracks.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(getSavedSpotifyTracks.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(fetchSpotifyPlaylists.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSpotifyPlaylists.fulfilled, (state, action) => {
                state.loading = false;
                state.playlists = [];
                for (let i in action.payload.items) {
                    state.playlists.push({
                        id: action.payload.items[i].id,
                        name: action.payload.items[i].name,
                        image: action.payload.items[i].images ? action.payload.items[i].images[0]?.url : "",
                        tracks: []
                    });
                }
            })
            .addCase(fetchSpotifyPlaylists.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(fetchSpotifyPlaylistTracks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSpotifyPlaylistTracks.fulfilled, (state, action) => {
                state.loading = false;
                // Find playlist and add tracks
                const playlists = state.playlists;
                for (let pos in playlists) {
                    if (playlists[pos].id === action.payload.playlistId) {
                        playlists[pos].tracks = action.payload.result.items.map((track) => ({
                            id: track.track.id,
                            name: track.track.name,
                            artist: track.track.artists[0].name,
                            album: track.track.album.name,
                            albumCover: track.track.album.images[0].url,
                            uri: track.track.uri,
                        }));
                    }
                }
            })
            .addCase(fetchSpotifyPlaylistTracks.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(createSpotifyPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSpotifyPlaylist.fulfilled, (state, action) => {
                state.loading = false;
                state.playlists.push({
                    id: action.payload.id,
                    name: action.payload.name,
                    image: action.payload.images?.url ?? "",
                    tracks: []
                });
            })
            .addCase(createSpotifyPlaylist.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(addSpotifyTrackToPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addSpotifyTrackToPlaylist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addSpotifyTrackToPlaylist.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            })
            .addCase(removeSpotifyTrackFromPlaylist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeSpotifyTrackFromPlaylist.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(removeSpotifyTrackFromPlaylist.rejected, (state) => {
                state.loading = false;
                state.error = "An error occurred";
            });
    },
});

export default SpotifySlice.reducer;