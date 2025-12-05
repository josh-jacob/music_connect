import './PlaylistMigrationServicePage.css';
import Header from "../components/Header";
import { useState, useEffect } from "react";
import PlaylistDropdown from "../components/PlaylistDropdown";
import {
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Button,
    Slider,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    LinearProgress,
    Chip
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from 'axios';

const PlaylistMigrationServicePage = () => {
    // Redux selectors - replace with your actual selectors
    const userId = useSelector((state) => state.user?.userId || "testuser123");
    
    // State
    const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
    const [youTubePlaylists, setYouTubePlaylists] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [destinationPlaylists, setDestinationPlaylists] = useState([]);
    const [selectedDestinationPlaylist, setSelectedDestinationPlaylist] = useState(null);
    
    const services = ["Spotify", "YouTube Music"];
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("");
    
    // Migration settings
    const [threshold, setThreshold] = useState(60);
    const [loading, setLoading] = useState(false);
    const [fetchingPlaylists, setFetchingPlaylists] = useState(false);
    const [migrationResult, setMigrationResult] = useState(null);
    const [error, setError] = useState(null);

    // API Configuration
    const SPOTIFY_BASE =
      process.env.REACT_APP_SPOTIFY_SERVICE_URL || "http://localhost:8081";

    const YOUTUBE_BASE =
      process.env.REACT_APP_YOUTUBE_SERVICE_URL || "http://localhost:8082"; // browser talks to 8082, not 8000

    const MIGRATION_BASE =
      process.env.REACT_APP_PLAYLIST_MIGRATION_SERVICE_URL || "http://localhost:8006";


    // Fetch playlists when source changes
    useEffect(() => {
        if (selectedSource) {
            fetchSourcePlaylists();
        } else {
            setPlaylists([]);
            setSelectedPlaylist(null);
        }
    }, [selectedSource]);

    // Fetch destination playlists when destination changes
    useEffect(() => {
        if (selectedDestination) {
            fetchDestinationPlaylists();
        } else {
            setDestinationPlaylists([]);
            setSelectedDestinationPlaylist(null);
        }
    }, [selectedDestination]);

    const fetchSourcePlaylists = async () => {
        setFetchingPlaylists(true);
        setError(null);
        
        try {
            if (selectedSource === "Spotify") {
                const response = await axios.get(`${SPOTIFY_BASE}/music/playlists`, {
                    headers: { "X-User-Id": userId }
                });
                
                const formattedPlaylists = response.data.items.map(playlist => ({
                    id: playlist.id,
                    name: playlist.name,
                    trackCount: playlist.tracks.total,
                    image: playlist.images?.[0]?.url || null,
                    owner: playlist.owner?.display_name || "Unknown"
                }));
                
                setSpotifyPlaylists(formattedPlaylists);
                setPlaylists(formattedPlaylists);
                
            } else if (selectedSource === "YouTube Music") {
                const response = await axios.get(`${YOUTUBE_BASE}/youtube/playlists`);
                
                const formattedPlaylists = response.data.map(playlist => ({
                    id: playlist.id,
                    name: playlist.title,
                    trackCount: playlist.videoCount,
                    image: playlist.thumbnail || null,
                    owner: "You"
                }));
                
                setYouTubePlaylists(formattedPlaylists);
                setPlaylists(formattedPlaylists);
            }
        } catch (err) {
            console.error("Error fetching playlists:", err);
            setError(`Failed to fetch ${selectedSource} playlists. Make sure you're authenticated.`);
        } finally {
            setFetchingPlaylists(false);
        }
    };

    const fetchDestinationPlaylists = async () => {
        try {
            if (selectedDestination === "Spotify") {
                const response = await axios.get(`${SPOTIFY_BASE}/music/playlists`, {
                    headers: { "X-User-Id": userId }
                });
                
                const formattedPlaylists = response.data.items.map(playlist => ({
                    id: playlist.id,
                    name: playlist.name,
                    trackCount: playlist.tracks.total,
                    image: playlist.images?.[0]?.url || null
                }));
                
                setDestinationPlaylists(formattedPlaylists);
                
            } else if (selectedDestination === "YouTube Music") {
                const response = await axios.get(`${YOUTUBE_BASE}/youtube/playlists`);
                
                const formattedPlaylists = response.data.map(playlist => ({
                    id: playlist.id,
                    name: playlist.title,
                    trackCount: playlist.videoCount,
                    image: playlist.thumbnail || null
                }));
                
                setDestinationPlaylists(formattedPlaylists);
            }
        } catch (err) {
            console.error("Error fetching destination playlists:", err);
        }
    };

    const handleServiceChange = (value, type) => {
        if (type === "source") {
            setSelectedSource(value);
            setSelectedPlaylist(null);
            setMigrationResult(null);
            
            if (selectedDestination === value) {
                setSelectedDestination("");
            }
        } else {
            setSelectedDestination(value);
            setSelectedDestinationPlaylist(null);
            
            if (selectedSource === value) {
                setSelectedSource("");
                setPlaylists([]);
                setSelectedPlaylist(null);
            }
        }
    };

    const handlePlaylistSelect = (playlist) => {
        setSelectedPlaylist(playlist);
        setMigrationResult(null);
    };

    const handleDestinationPlaylistSelect = (playlist) => {
        setSelectedDestinationPlaylist(playlist);
    };

    const handleMigrate = async () => {
        if (!selectedPlaylist || !selectedDestination) {
            setError("Please select a source playlist and destination service");
            return;
        }

        setLoading(true);
        setError(null);
        setMigrationResult(null);

        try {
            const endpoint = selectedSource === "YouTube Music" 
                ? "youtube-to-spotify"
                : "spotify-to-youtube";

            const body = {
                user_id: userId,
                min_score: threshold
            };

            // Set source playlist ID
            if (selectedSource === "YouTube Music") {
                body.source_youtube_playlist_id = selectedPlaylist.id;
            } else {
                body.source_playlist_id = selectedPlaylist.id;
            }

            // Set destination playlist ID (if existing playlist selected)
            if (selectedDestinationPlaylist) {
                if (selectedDestination === "Spotify") {
                    body.target_spotify_playlist_id = selectedDestinationPlaylist.id;
                } else {
                    body.target_youtube_playlist_id = selectedDestinationPlaylist.id;
                }
            }

            const response = await axios.post(
                `${MIGRATION_BASE}/migrate/${endpoint}`,
                body,
                { timeout: 300000 } // 5 minute timeout
            );

            setMigrationResult(response.data);
            
        } catch (err) {
            console.error("Migration error:", err);
            setError(err.response?.data?.detail || "Migration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getThresholdLabel = () => {
        if (threshold >= 80) return "Very High - Exact matches only";
        if (threshold >= 70) return "High - Recommended";
        if (threshold >= 60) return "Medium - Balanced";
        if (threshold >= 50) return "Low - More matches";
        return "Very Low - Maximum matches";
    };

    const getThresholdColor = () => {
        if (threshold >= 80) return "error";
        if (threshold >= 70) return "success";
        if (threshold >= 60) return "warning";
        return "info";
    };

    return (
        <div className="playlist-migration-service-page">
            <Header />
            
            {/* Service Selection */}
            <div className="playlist-service">
                <div className="playlist-source">
                    <PlaylistDropdown 
                        listItems={services} 
                        label="Source" 
                        selectedService={selectedSource} 
                        handleServiceChange={(newValue) => handleServiceChange(newValue, "source")}
                    />
                </div>
                <div className="playlist-destination">
                    <PlaylistDropdown 
                        listItems={services} 
                        label="Destination" 
                        selectedService={selectedDestination} 
                        handleServiceChange={(newValue) => handleServiceChange(newValue, "destination")}
                    />
                </div>
            </div>

            {error && (
                <Box sx={{ my: 2, px: 2 }}>
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Box>
            )}

            {/* Source Playlists */}
            {selectedSource && (
                <Box sx={{ px: 2, my: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Select {selectedSource} Playlist
                    </Typography>
                    
                    {fetchingPlaylists ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List dense>
                            {playlists.map((playlist) => (
                                <ListItem
                                    key={playlist.id}
                                    button
                                    selected={selectedPlaylist?.id === playlist.id}
                                    onClick={() => handlePlaylistSelect(playlist)}
                                    sx={{
                                        mb: 1,
                                        border: 1,
                                        borderColor: selectedPlaylist?.id === playlist.id ? 'primary.main' : 'divider',
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar 
                                            alt={playlist.name} 
                                            src={playlist.image} 
                                            variant="rounded"
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={playlist.name}
                                        secondary={`${playlist.trackCount} tracks • ${playlist.owner}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            )}

            {/* Destination Options */}
            {selectedPlaylist && selectedDestination && (
                <Box sx={{ px: 2, my: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Destination Options
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant={!selectedDestinationPlaylist ? "contained" : "outlined"}
                            onClick={() => setSelectedDestinationPlaylist(null)}
                            sx={{ mr: 2 }}
                        >
                            Create New Playlist
                        </Button>
                        <Button
                            variant={selectedDestinationPlaylist ? "contained" : "outlined"}
                            onClick={() => {/* Show existing playlists */}}
                        >
                            Add to Existing
                        </Button>
                    </Box>

                    {selectedDestinationPlaylist === undefined && destinationPlaylists.length > 0 && (
                        <List dense>
                            {destinationPlaylists.map((playlist) => (
                                <ListItem
                                    key={playlist.id}
                                    button
                                    onClick={() => handleDestinationPlaylistSelect(playlist)}
                                    sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={playlist.image} variant="rounded" />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={playlist.name}
                                        secondary={`${playlist.trackCount} tracks`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            )}

            {/* Threshold Slider */}
            {selectedPlaylist && selectedDestination && (
                <Box sx={{ px: 2, my: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Match Threshold: {threshold}%
                    </Typography>
                    
                    <Slider
                        value={threshold}
                        onChange={(_, value) => setThreshold(value)}
                        min={30}
                        max={100}
                        marks={[
                            { value: 30, label: '30%' },
                            { value: 60, label: '60%' },
                            { value: 100, label: '100%' }
                        ]}
                        valueLabelDisplay="auto"
                    />
                    
                    <Chip 
                        label={getThresholdLabel()} 
                        color={getThresholdColor()}
                        sx={{ mt: 1 }}
                    />
                    
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Higher threshold = more accurate matches but fewer total matches
                    </Typography>
                </Box>
            )}

            {/* Migrate Button */}
            {selectedPlaylist && selectedDestination && (
                <Box sx={{ px: 2, my: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={handleMigrate}
                        disabled={loading}
                        sx={{ py: 2 }}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={24} sx={{ mr: 1 }} />
                                Migrating...
                            </>
                        ) : (
                            `Migrate to ${selectedDestination}`
                        )}
                    </Button>
                </Box>
            )}

            {/* Migration Results */}
            {migrationResult && (
                <Card sx={{ mx: 2, my: 3 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom color="success.main">
                            Migration Complete!
                        </Typography>
                        
                        <Box sx={{ my: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Total Tracks:</Typography>
                                <Typography fontWeight="bold">
                                    {migrationResult.summary.total_tracks}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Successfully Added:</Typography>
                                <Typography fontWeight="bold" color="success.main">
                                    {migrationResult.summary.added}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography>Failed:</Typography>
                                <Typography fontWeight="bold" color="error.main">
                                    {migrationResult.summary.failed}
                                </Typography>
                            </Box>
                            
                            <LinearProgress 
                                variant="determinate" 
                                value={(migrationResult.summary.added / migrationResult.summary.total_tracks) * 100}
                                sx={{ height: 10, borderRadius: 1 }}
                            />
                            
                            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                Success Rate: {Math.round((migrationResult.summary.added / migrationResult.summary.total_tracks) * 100)}%
                            </Typography>
                        </Box>

                        {migrationResult.created_new_playlist && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                New playlist created with ID: {migrationResult.target_playlist_id}
                            </Alert>
                        )}

                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={() => {
                                const url = selectedDestination === "Spotify"
                                    ? `https://open.spotify.com/playlist/${migrationResult.target_playlist_id}`
                                    : `https://www.youtube.com/playlist?list=${migrationResult.target_playlist_id}`;
                                window.open(url, '_blank');
                            }}
                        >
                            Open Playlist in {selectedDestination}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PlaylistMigrationServicePage;
