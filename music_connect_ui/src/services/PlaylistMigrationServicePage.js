import './PlaylistMigrationServicePage.css';
import Header from "../components/Header";
import {useState, useEffect} from "react";
import PlaylistDropdown from "../components/PlaylistDropdown";
import {Avatar, List, ListItem, ListItemAvatar, ListItemText, Button, CircularProgress, Alert} from "@mui/material";

const PlaylistMigrationServicePage = () => {
    const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
    const [youtubePlaylists, setYoutubePlaylists] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    const services = ["Spotify", "YouTube Music"];
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("");
    const userId = "testuser123"; // TODO: Get from auth

    // Fetch playlists when source changes
    useEffect(() => {
        if (selectedSource === "Spotify") {
            fetchSpotifyPlaylists();
        } else if (selectedSource === "YouTube Music") {
            fetchYoutubePlaylists();
        }
    }, [selectedSource]);

    const fetchSpotifyPlaylists = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8081/music/playlists', {
                headers: { 'X-User-Id': userId }
            });
            const data = await response.json();
            const formattedPlaylists = data.items.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                thumbnail: p.images?.[0]?.url,
                trackCount: p.tracks?.total
            }));
            setSpotifyPlaylists(formattedPlaylists);
            setPlaylists(formattedPlaylists);
        } catch (err) {
            setError("Failed to fetch Spotify playlists: " + err.message);
        }
        setLoading(false);
    };

    const fetchYoutubePlaylists = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/youtube/playlists');
            const data = await response.json();
            const formattedPlaylists = data.map(p => ({
                id: p.id,
                name: p.title,
                description: '',
                thumbnail: p.thumbnail,
                trackCount: p.videoCount
            }));
            setYoutubePlaylists(formattedPlaylists);
            setPlaylists(formattedPlaylists);
        } catch (err) {
            setError("Failed to fetch YouTube playlists: " + err.message);
        }
        setLoading(false);
    };

    const handleServiceChange = (value, type) => {
        if (type === "source") {
            setSelectedSource(value);
            setSelectedPlaylist(null);
            setResult(null);
            if (selectedDestination === value) {
                setSelectedDestination("");
            }
        } else {
            setSelectedDestination(value);
            setResult(null);
            if (selectedSource === value) {
                setSelectedSource("");
                setPlaylists([]);
            }
        }
    };

    const handleMigrate = async () => {
        if (!selectedPlaylist || !selectedSource || !selectedDestination) {
            setError("Please select source, destination, and a playlist");
            return;
        }

        setMigrating(true);
        setError(null);
        setResult(null);

        try {
            let endpoint, body;

            if (selectedSource === "Spotify" && selectedDestination === "YouTube Music") {
                endpoint = "http://localhost:8083/migrate/spotify-to-youtube";
                body = {
                    user_id: userId,
                    source_playlist_id: selectedPlaylist.id,
                    target_youtube_playlist_id: null,
                    min_score: 70.0
                };
            } else if (selectedSource === "YouTube Music" && selectedDestination === "Spotify") {
                endpoint = "http://localhost:8083/migrate/youtube-to-spotify";
                body = {
                    user_id: userId,
                    source_youtube_playlist_id: selectedPlaylist.id,
                    target_spotify_playlist_id: null,
                    min_score: 70.0
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || "Migration failed");
            }

            setResult(data);
        } catch (err) {
            setError("Migration failed: " + err.message);
        }
        setMigrating(false);
    };

    return (
        <div className="playlist-migration-service-page">
            <Header />
            
            <div className={"playlist-service"}>
                <div className={"playlist-source"}>
                    <PlaylistDropdown 
                        listItems={services} 
                        label={"Source"} 
                        selectedService={selectedSource} 
                        handleServiceChange={(newValue) => handleServiceChange(newValue, "source")}
                    />
                </div>
                <div className={"playlist-destination"}>
                    <PlaylistDropdown 
                        listItems={services} 
                        label={"Destination"} 
                        selectedService={selectedDestination} 
                        handleServiceChange={(newValue) => handleServiceChange(newValue, "destination")}
                    />
                </div>
            </div>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} style={{margin: '20px'}}>
                    {error}
                </Alert>
            )}

            {result && (
                <Alert severity="success" onClose={() => setResult(null)} style={{margin: '20px'}}>
                    Migration complete! Added {result.summary.added} out of {result.summary.total_tracks} tracks.
                    {selectedDestination === "Spotify" && (
                        <a href={`https://open.spotify.com/playlist/${result.target_playlist_id}`} target="_blank" rel="noreferrer">
                            Open in Spotify
                        </a>
                    )}
                    {selectedDestination === "YouTube Music" && (
                        <a href={`https://www.youtube.com/playlist?list=${result.target_playlist_id}`} target="_blank" rel="noreferrer">
                            Open in YouTube
                        </a>
                    )}
                </Alert>
            )}

            <div className={"source-playlists"}>
                {loading && <CircularProgress />}
                
                {!loading && playlists.length > 0 && (
                    <>
                        <h3>Select a playlist to migrate:</h3>
                        <List dense>
                            {playlists.map((playlist) => (
                                <ListItem 
                                    key={playlist.id}
                                    button
                                    selected={selectedPlaylist?.id === playlist.id}
                                    onClick={() => setSelectedPlaylist(playlist)}
                                >
                                    <ListItemAvatar>
                                        <Avatar 
                                            alt={playlist.name} 
                                            src={playlist.thumbnail} 
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={playlist.name}
                                        secondary={`${playlist.trackCount || 0} tracks`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handleMigrate}
                            disabled={!selectedPlaylist || !selectedDestination || migrating}
                            style={{margin: '20px'}}
                        >
                            {migrating ? <CircularProgress size={24} /> : 'Migrate Playlist'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlaylistMigrationServicePage;
