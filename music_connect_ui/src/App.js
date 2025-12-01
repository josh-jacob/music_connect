import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {AuthProvider} from './services/authentication/AuthContext'
import PrivateRoute from './services/authentication/PrivateRoute';
import LoginPage from './services/authentication/LoginPage';
import CreateAccountPage from "./services/authentication/CreateAccountPage";
import ResetPasswordPage from "./services/authentication/ResetPasswordPage";
import Dashboard from "./services/Dashboard";
import SpotifyServicePage from "./services/SpotifyServicePage";
import YouTubeMusicServicePage from "./services/YouTubeMusicServicePage";
import SearchServicePage from "./services/SearchServicePage";
import ExportServicePage from "./services/ExportServicePage";
import PlaylistMigrationPage from "./services/PlaylistMigrationServicePage";

function App() {

  return (
    <div className="App">
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage type="music-connect"/>} />
                    <Route path="/create-account" element={<CreateAccountPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/spotify" element={<SpotifyServicePage />} />
                    <Route path="/youtube-music" element={<YouTubeMusicServicePage />} />
                    <Route path="/youtube-music/login" element={<LoginPage type="youtube-music"/>} />
                    <Route path="/search" element={<SearchServicePage />} />
                    <Route path="/export" element={<ExportServicePage />} />
                    <Route path="/playlist-migration" element={<PlaylistMigrationPage />} />
                    {/* authenticated routes */}
                    <Route element={<PrivateRoute />}>
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    </div>
  );
}

export default App;
