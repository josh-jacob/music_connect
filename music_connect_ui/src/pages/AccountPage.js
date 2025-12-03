import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authentication/AuthContext';
import Header from '../components/Header';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    Menu,
    MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';

const AccountPage = () => {
    const navigate = useNavigate();
    const { user, deleteAccount, getActivityLogs, exportUserData } = useAuth();

    // Delete Account State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Activity Logs State
    const [activityLogs, setActivityLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Export State
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError] = useState("");
    const [exportSuccess, setExportSuccess] = useState("");

    useEffect(() => {
        loadActivityLogs();
    }, []);

    const loadActivityLogs = async () => {
        setLogsLoading(true);
        const result = await getActivityLogs();
        if (result.success) {
            setActivityLogs(result.logs);
        }
        setLogsLoading(false);
    };

    const handleDeleteAccount = async () => {
        setDeleteError("");

        if (!deletePassword) {
            setDeleteError("Password is required");
            return;
        }

        if (deleteConfirmation !== "DELETE") {
            setDeleteError("Please type DELETE to confirm");
            return;
        }

        setDeleteLoading(true);

        const result = await deleteAccount(deletePassword);

        if (result.success) {
            navigate('/music-connect/login');
        } else {
            setDeleteError(result.error || "Failed to delete account");
            setDeleteLoading(false);
        }
    };

    const handleExportClick = (event) => {
        setExportAnchorEl(event.currentTarget);
        setExportError("");
        setExportSuccess("");
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const generateCSV = (userData) => {
        const headers = ['Field', 'Value'];
        const rows = [
            ['Username', userData.username || ''],
            ['Email', userData.email || ''],
            ['Full Name', userData.fullName || ''],
            ['Active', userData.isActive ? 'Yes' : 'No'],
            ['Verified', userData.verified ? 'Yes' : 'No'],
            ['Created At', userData.createdAt || ''],
            ['Updated At', userData.updatedAt || '']
        ];

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    };

    const generateXML = (userData) => {
        return `<?xml version="1.0" encoding="UTF-8"?>
<user>
    <username>${userData.username || ''}</username>
    <email>${userData.email || ''}</email>
    <fullName>${userData.fullName || ''}</fullName>
    <isActive>${userData.isActive || false}</isActive>
    <verified>${userData.verified || false}</verified>
    <createdAt>${userData.createdAt || ''}</createdAt>
    <updatedAt>${userData.updatedAt || ''}</updatedAt>
</user>`;
    };

    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleExport = async (format) => {
        setExportLoading(true);
        setExportError("");
        setExportSuccess("");

        try {
            // Try to get data from backend first
            const result = await exportUserData(format);

            if (result.success && result.data) {
                // Backend returned data
                let content, filename, mimeType;

                if (format === 'csv') {
                    content = generateCSV(result.data.user);
                    filename = `user_data_${user.username}_${Date.now()}.csv`;
                    mimeType = 'text/csv';
                } else if (format === 'xml') {
                    content = generateXML(result.data.user);
                    filename = `user_data_${user.username}_${Date.now()}.xml`;
                    mimeType = 'application/xml';
                } else {
                    // JSON format
                    content = JSON.stringify(result.data.user, null, 2);
                    filename = `user_data_${user.username}_${Date.now()}.json`;
                    mimeType = 'application/json';
                }

                downloadFile(content, filename, mimeType);
                setExportSuccess(`Successfully exported data as ${format.toUpperCase()}`);
            }
        } catch (error) {
            // If backend fails, use client-side generation with user data from context
            console.warn('Backend export failed, using client-side generation:', error);
            
            try {
                let content, filename, mimeType;

                if (format === 'csv') {
                    content = generateCSV(user);
                    filename = `user_data_${user.username}_${Date.now()}.csv`;
                    mimeType = 'text/csv';
                } else if (format === 'xml') {
                    content = generateXML(user);
                    filename = `user_data_${user.username}_${Date.now()}.xml`;
                    mimeType = 'application/xml';
                } else {
                    content = JSON.stringify(user, null, 2);
                    filename = `user_data_${user.username}_${Date.now()}.json`;
                    mimeType = 'application/json';
                }

                downloadFile(content, filename, mimeType);
                setExportSuccess(`Successfully exported data as ${format.toUpperCase()}`);
            } catch (clientError) {
                setExportError(`Export failed: ${clientError.message}`);
            }
        }

        setExportLoading(false);
        handleExportClose();
    };

    const getActivityIcon = (activity) => {
        switch (activity) {
            case 'LOGIN_SUCCESS': return '✅';
            case 'LOGIN_FAILED': return '❌';
            case 'ACCOUNT_LOCKED': return '🔒';
            case 'SECURITY_ALERT': return '⚠️';
            case 'LOGOUT': return '🚪';
            case 'PASSWORD_RESET_REQUESTED': return '🔑';
            case 'PASSWORD_RESET_SUCCESS': return '✔️';
            case 'ACCOUNT_CREATED': return '🎉';
            default: return '📝';
        }
    };

    const getActivityColor = (activity) => {
        switch (activity) {
            case 'LOGIN_SUCCESS': return 'success';
            case 'LOGIN_FAILED': return 'error';
            case 'ACCOUNT_LOCKED': return 'error';
            case 'SECURITY_ALERT': return 'warning';
            case 'LOGOUT': return 'default';
            case 'PASSWORD_RESET_REQUESTED': return 'info';
            case 'PASSWORD_RESET_SUCCESS': return 'success';
            case 'ACCOUNT_CREATED': return 'success';
            default: return 'default';
        }
    };

    return (
        <div>
            <Header />
            <Box sx={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <Typography variant="h4" sx={{ marginBottom: '2rem', color: '#20B654' }}>
                    My Account
                </Typography>

                {/* Export Success/Error Messages */}
                {exportSuccess && (
                    <Alert severity="success" sx={{ marginBottom: '1rem' }} onClose={() => setExportSuccess("")}>
                        {exportSuccess}
                    </Alert>
                )}
                {exportError && (
                    <Alert severity="error" sx={{ marginBottom: '1rem' }} onClose={() => setExportError("")}>
                        {exportError}
                    </Alert>
                )}

                {/* User Profile Card */}
                <Card sx={{ marginBottom: '2rem' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <Avatar sx={{ width: 64, height: 64, marginRight: '1rem', bgcolor: '#20B654' }}>
                                <PersonIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5">{user?.fullName || user?.username}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    @{user?.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ marginY: '1rem' }} />
                        <Typography variant="body2" color="text.secondary">
                            Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Activity Logs Card */}
                <Card sx={{ marginBottom: '2rem' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <HistoryIcon sx={{ marginRight: '0.5rem', color: '#20B654' }} />
                            <Typography variant="h6">Recent Activity</Typography>
                        </Box>
                        
                        {logsLoading ? (
                            <Typography>Loading activity logs...</Typography>
                        ) : activityLogs.length > 0 ? (
                            <List>
                                {activityLogs.map((log, index) => (
                                    <ListItem key={log.id} divider={index !== activityLogs.length - 1}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{getActivityIcon(log.activity)}</span>
                                                    <Typography variant="body1">
                                                        {log.activity.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Chip 
                                                        label={log.activity} 
                                                        size="small" 
                                                        color={getActivityColor(log.activity)}
                                                        sx={{ marginLeft: 'auto' }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="caption" display="block">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </Typography>
                                                    {log.details && Object.keys(log.details).length > 0 && (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            {JSON.stringify(log.details)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography color="text.secondary">No activity logs available</Typography>
                        )}
                    </CardContent>
                </Card>

                {/* Security Actions Card */}
                <Card sx={{ marginBottom: '2rem' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <SecurityIcon sx={{ marginRight: '0.5rem', color: '#20B654' }} />
                            <Typography variant="h6">Security & Data</Typography>
                        </Box>
                        
                        <Button
                            variant="outlined"
                            sx={{ marginRight: '1rem' }}
                            onClick={() => navigate('/forgot-password')}
                        >
                            Change Password
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportClick}
                            disabled={exportLoading}
                            sx={{ 
                                color: '#20B654',
                                borderColor: '#20B654',
                                '&:hover': {
                                    borderColor: '#1a9445',
                                    backgroundColor: 'rgba(32, 182, 84, 0.04)'
                                }
                            }}
                        >
                            {exportLoading ? 'Exporting...' : 'Export My Data'}
                        </Button>

                        <Menu
                            anchorEl={exportAnchorEl}
                            open={Boolean(exportAnchorEl)}
                            onClose={handleExportClose}
                        >
                            <MenuItem onClick={() => handleExport('json')}>
                                Export as JSON
                            </MenuItem>
                            <MenuItem onClick={() => handleExport('csv')}>
                                Export as CSV
                            </MenuItem>
                            <MenuItem onClick={() => handleExport('xml')}>
                                Export as XML
                            </MenuItem>
                        </Menu>
                    </CardContent>
                </Card>

                {/* Danger Zone Card */}
                <Card sx={{ borderColor: '#f44336', border: '1px solid' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <DeleteIcon sx={{ marginRight: '0.5rem', color: '#f44336' }} />
                            <Typography variant="h6" color="error">Danger Zone</Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '1rem' }}>
                            Once you delete your account, there is no going back. Please be certain.
                        </Typography>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>

                {/* Delete Account Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => !deleteLoading && setDeleteDialogOpen(false)}>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ marginBottom: '1rem' }}>
                            This action cannot be undone. This will permanently delete your account and remove all your data.
                        </Typography>

                        {deleteError && (
                            <Alert severity="error" sx={{ marginBottom: '1rem' }}>
                                {deleteError}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            type="password"
                            label="Enter your password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            sx={{ marginBottom: '1rem' }}
                            disabled={deleteLoading}
                        />

                        <TextField
                            fullWidth
                            label='Type "DELETE" to confirm'
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            sx={{ marginBottom: '1rem' }}
                            disabled={deleteLoading}
                            helperText='Please type DELETE in capital letters'
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteAccount} 
                            color="error" 
                            variant="contained"
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? 'Deleting...' : 'Delete Account'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
};

export default AccountPage;