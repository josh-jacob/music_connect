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
    results: SearchResponse | null;
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
    async (userId: string) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for YouTube login");
            }

            // Prepare headers
            const headers = new Headers();
            headers.set("X-User-Id", userId);

            // Call backend to get the OAuth URL
            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/auth/youtube/login`,
                {
                    method: "GET",
                    headers: headers,
                }
            );

            const data = await response.json();

            if (!data.auth_url) {
                console.error("YouTube login: Missing auth_url", data);
                throw new Error("Failed to start YouTube OAuth flow");
            }

            // Redirect user to Google OAuth
            window.location.href = data.auth_url;

            return data;
        } catch (error: any) {
            throw error.message ?? error;
        }
    }
);

export const fetchYouTubeUser = createAsyncThunk(
    "YouTubeMusic/fetchUser",
    async (userId: string) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for YouTube user fetch");
            }

            const headers = new Headers();
            headers.set("X-User-Id", userId);

            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/youtube/me`,
                {
                    method: "GET",
                    headers: headers,
                }
            );

            const result = await response.json();
            return { status: response.ok, result };
        } catch (error: any) {
            throw error.message ?? error;
        }
    }
);

export const searchYouTubeMusic = createAsyncThunk(
    "YouTubeMusic/search",
    async ({ query, userId }: { query: string; userId: string }) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for YouTube search");
            }

            const headers = new Headers();
            headers.set("X-User-Id", userId);

            const requestOptions = {
                method: "GET",
                headers: headers,
            };

            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/youtube/search?q=${encodeURIComponent(query)}`,
                requestOptions
            );

            const data = await response.json();
            return data;
        } catch (error: any) {
            throw (error.message ?? error);
        }
    }
);

export const fetchYouTubePlaylists = createAsyncThunk(
    "YouTubeMusic/fetchPlaylists",
    async (userId: string) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for YouTube playlists fetch");
            }

            const headers = new Headers();
            headers.set("X-User-Id", userId);

            const requestOptions = {
                method: "GET",
                headers: headers,
            };

            // Call to fetch user playlists
            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/youtube/playlists`,
                requestOptions
            );

            const data = await response.json();
            return data;
        } catch (error: any) {
            throw (error.message ?? error);
        }
    }
);


export const fetchYouTubePlaylistTracks = createAsyncThunk(
    "YouTubeMusic/fetchPlaylistTracks",
    async ({ playlistId, userId }: { playlistId: string; userId: string }) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for YouTube playlist tracks fetch");
            }

            const headers = new Headers();
            headers.set("X-User-Id", userId);

            const requestOptions = {
                method: "GET",
                headers: headers,
            };

            // Call to fetch all tracks in the playlist
            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/youtube/playlist/${playlistId}/items`,
                requestOptions
            );

            const result = await response.json();
            return { playlistId, result };
        } catch (error: any) {
            throw (error.message ?? error);
        }
    }
);

export const createYouTubePlaylist = createAsyncThunk(
    "YouTubeMusic/createPlaylist",
    async ({
        name,
        description,
        isPrivate,
        userId,
    }: {
        name: string;
        description: string;
        isPrivate: boolean;
        userId: string;
    }) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for playlist creation");
            }

            const headers = new Headers();
            headers.set("Content-Type", "application/json");
            headers.set("X-User-Id", userId);

            const body = JSON.stringify({
                title: name,
                description,
                privacy: isPrivate ? "private" : "public",
            });

            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/youtube/playlists/create`,
                {
                    method: "POST",
                    headers,
                    body,
                }
            );

            return await response.json();
        } catch (error: any) {
            throw error.message ?? error;
        }
    }
);

export const addYouTubeTrackToPlaylist = createAsyncThunk(
    "YouTubeMusic/addTrackToPlaylist",
    async ({
        playlistId,
        videoId,
        userId,
    }: {
        playlistId: string;
        videoId: string;
        userId: string;
    }) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for adding track");
            }

            const headers = new Headers();
            headers.set("Content-Type", "application/json");
            headers.set("X-User-Id", userId);

            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/youtube/playlist/${playlistId}/add?videoId=${videoId}`,
                {
                    method: "POST",
                    headers,
                }
            );

            return await response.json();
        } catch (error: any) {
            throw error.message ?? error;
        }
    }
);

export const removeYouTubeTrackFromPlaylist = createAsyncThunk(
    "YouTubeMusic/removeTrackFromPlaylist",
    async ({
        playlistId,
        videoId,
        userId,
    }: {
        playlistId: string;
        videoId: string;
        userId: string;
    }) => {
        try {
            if (!userId) {
                throw new Error("Missing userId for removing track from playlist");
            }

            const headers = new Headers();
            headers.set("Content-Type", "application/json");
            headers.set("X-User-Id", userId);

            const requestOptions = {
                method: "DELETE",
                headers: headers,
            };

            // Call to remove track from playlist
            const response = await fetch(
                `${YOUTUBE_SERVICE_URL}/youtube/playlist/${playlistId}/remove?videoId=${videoId}`,
                requestOptions
            );

            return await response.json();
        } catch (error: any) {
            throw error.message ?? error;
        }
    }
);

const YouTubeMusicSlice = createSlice({
    name: "YouTubeMusic",
    initialState,
    reducers: {
        clearYouTubeAuth: (state) => {
            state.user = {
                id: "",
                name: "",
                isAuthenticated: false,
            };
            state.playlists = [];
            state.searchResults = [];
        }
    },
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

export const { clearYouTubeAuth } = YouTubeMusicSlice.actions;
export default YouTubeMusicSlice.reducer;