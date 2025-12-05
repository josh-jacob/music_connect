import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    TrendingUp,
    MusicNote,
    QueueMusic,
    Person
} from '@mui/icons-material';
import { faSpotify, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../components/Header';
import { fetchSpotifyPlaylists, fetchSpotifyUser } from '../slices/SpotifySlice.ts';
import { fetchYouTubePlaylists, fetchYouTubeUser } from '../slices/YouTubeMusicSlice.ts';

const TrendsPage = () => {
    const dispatch = useDispatch();
    const username = localStorage.getItem("username");

    const spotifyPlaylists = useSelector((state) => state.spotify.playlists);
    const youtubePlaylists = useSelector((state) => state.youtubeMusic.playlists);

    const [topArtists, setTopArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (username) {
                await dispatch(fetchSpotifyUser(username));
                await dispatch(fetchSpotifyPlaylists(username));
                await dispatch(fetchYouTubeUser(username));
                await dispatch(fetchYouTubePlaylists(username));
            }
            setLoading(false);
        };
        loadData();
    }, [dispatch, username]);

    useEffect(() => {
        // Calculate top artists from playlists
        const artistCount = {};

        [...spotifyPlaylists, ...youtubePlaylists].forEach(playlist => {
            if (playlist.tracks) {
                playlist.tracks.forEach(track => {
                    const artist = track.artist || 'Unknown Artist';
                    artistCount[artist] = (artistCount[artist] || 0) + 1;
                });
            }
        });

        const sortedArtists = Object.entries(artistCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([artist, count]) => ({ artist, count }));

        setTopArtists(sortedArtists);
    }, [spotifyPlaylists, youtubePlaylists]);

    const getTotalTracks = () => {
        return [...spotifyPlaylists, ...youtubePlaylists].reduce(
            (total, playlist) => total + (playlist.tracks?.length || 0),
            0
        );
    };

    const getTotalPlaylists = () => {
        return spotifyPlaylists.length + youtubePlaylists.length;
    };

    const getTopPlaylists = () => {
        return [...spotifyPlaylists, ...youtubePlaylists]
            .sort((a, b) => (b.tracks?.length || 0) - (a.tracks?.length || 0))
            .slice(0, 5);
    };

    const StatCard = ({ icon, title, value, color }) => (
        <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    {icon}
                    <Typography variant="h6" ml={1} fontWeight="600">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h3" fontWeight="700" color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
                <Header />
                <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                    <CircularProgress size={60} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
            <Header />

            <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: 3 }}>
                <Box display="flex" alignItems="center" mb={4}>
                    <TrendingUp sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                    <Typography variant="h3" fontWeight="700">
                        Your Music Trends
                    </Typography>
                </Box>

                {/* Stats Overview */}
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<QueueMusic sx={{ fontSize: 32, color: '#1976d2' }} />}
                            title="Total Playlists"
                            value={getTotalPlaylists()}
                            color="#1976d2"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<MusicNote sx={{ fontSize: 32, color: '#2e7d32' }} />}
                            title="Total Tracks"
                            value={getTotalTracks()}
                            color="#2e7d32"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<FontAwesomeIcon icon={faSpotify} style={{ fontSize: 32, color: '#1ED760' }} />}
                            title="Spotify Playlists"
                            value={spotifyPlaylists.length}
                            color="#1ED760"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<FontAwesomeIcon icon={faYoutube} style={{ fontSize: 32, color: '#FF0000' }} />}
                            title="YouTube Playlists"
                            value={youtubePlaylists.length}
                            color="#FF0000"
                        />
                    </Grid>
                </Grid>

                {/* Top Playlists and Artists */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={3}>
                                    Largest Playlists
                                </Typography>
                                <List>
                                    {getTopPlaylists().map((playlist, index) => (
                                        <ListItem
                                            key={`${playlist.id}-${index}`}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: index % 2 === 0 ? '#f9f9f9' : 'transparent'
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={playlist.image}
                                                    sx={{ width: 56, height: 56, mr: 2 }}
                                                >
                                                    <QueueMusic />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" fontWeight="600">
                                                        {playlist.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                        <Chip
                                                            label={`${playlist.tracks?.length || 0} tracks`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                {getTopPlaylists().length === 0 && (
                                    <Typography color="text.secondary" textAlign="center" py={4}>
                                        Connect your Spotify or YouTube Music to see playlists
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={3}>
                                    Top Artists
                                </Typography>
                                <List>
                                    {topArtists.map((artist, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: index % 2 === 0 ? '#f9f9f9' : 'transparent'
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        mr: 2,
                                                        bgcolor: '#1976d2'
                                                    }}
                                                >
                                                    <Person sx={{ fontSize: 32 }} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" fontWeight="600">
                                                        {artist.artist}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                        <Chip
                                                            label={`${artist.count} tracks`}
                                                            size="small"
                                                            color="secondary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                {topArtists.length === 0 && (
                                    <Typography color="text.secondary" textAlign="center" py={4}>
                                        Connect your music services to see top artists
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default TrendsPage;
