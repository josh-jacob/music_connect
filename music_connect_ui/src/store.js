import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/UserSlice";
import searchReducer from "./slices/SearchSlice";
import spotifyReducer from "./slices/SpotifySlice";
import youtubeMusicReducer from "./slices/YouTubeMusicSlice";

const store = configureStore({
    reducer: {
        users: userReducer,
        search: searchReducer,
        spotify: spotifyReducer,
        youtubeMusic: youtubeMusicReducer
    },
});

export default store;