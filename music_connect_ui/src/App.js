import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router";
import {AuthProvider} from './services/authentication/AuthContext'
import PrivateRoute from './services/authentication/PrivateRoute';
import LoginPage from './services/authentication/LoginPage';
import CreateAccountPage from "./services/authentication/CreateAccountPage";
import RequestResetPasswordPage from "./services/authentication/RequestResetPasswordPage";
import VerifyEmailPage from "./services/authentication/VerifyEmailPage";
import Dashboard from "./services/Dashboard";
import SpotifyServicePage from "./services/SpotifyServicePage";
import YouTubeMusicServicePage from "./services/YouTubeMusicServicePage";
import SearchServicePage from "./services/SearchServicePage";
import ExportServicePage from "./services/ExportServicePage";
import PlaylistMigrationPage from "./services/PlaylistMigrationServicePage";
import PlaylistPage from "./services/PlaylistPage";
import ResetPasswordPage from "./services/authentication/ResetPasswordPage";

function App() {

  return (
    <div className="App">
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage type="music-connect"/>} />
                    <Route path="/create-account" element={<CreateAccountPage />} />
                    <Route path="/reset-password" element={<RequestResetPasswordPage />} />
                    <Route path="/music-connect/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/music-connect/reset-password" element={<ResetPasswordPage />} />
                    {/* authenticated routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/spotify" element={<SpotifyServicePage />} />
                        <Route path="/youtube-music" element={<YouTubeMusicServicePage />} />
                        <Route path="/youtube-music/login" element={<LoginPage type="youtube-music"/>} />
                        <Route path="/:service/playlist/:playlistId" element={<PlaylistPage />} />
                        <Route path="/search" element={<SearchServicePage />} />
                        <Route path="/playlist-migration" element={<PlaylistMigrationPage/>} />
                        <Route path="/export" element={<ExportServicePage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    </div>
  );
}

export default App;
