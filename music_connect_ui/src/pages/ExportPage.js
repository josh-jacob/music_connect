import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authentication/AuthContext';
import Header from '../components/Header';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

const ExportPage = () => {
    const navigate = useNavigate();
    const { user, exportUserData } = useAuth();
    
    const [exportLoading, setExportLoading] = useState(false);
    const [exportSuccess, setExportSuccess] = useState('');
    const [exportError, setExportError] = useState('');
    const [selectedFormat, setSelectedFormat] = useState(null);

    // Generate CSV from user data - Excel friendly format
    const generateCSV = (userData) => {
        // Excel-friendly format with proper escaping
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape double quotes and wrap in quotes if contains comma, quote, or newline
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const headers = ['Username', 'Email', 'Full Name', 'Active Status', 'Email Verified', 'Account Created', 'Last Updated', 'Email Verified Date', 'Avatar URL'];
        
        const row = [
            escapeCSV(userData.username),
            escapeCSV(userData.email),
            escapeCSV(userData.fullName),
            escapeCSV(userData.isActive ? 'Active' : 'Inactive'),
            escapeCSV(userData.verified ? 'Yes' : 'No'),
            escapeCSV(userData.createdAt ? new Date(userData.createdAt).toLocaleString() : ''),
            escapeCSV(userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : ''),
            escapeCSV(userData.verifiedAt ? new Date(userData.verifiedAt).toLocaleString() : 'Not verified'),
            escapeCSV(userData.avatarUrl || 'No avatar')
        ];

        const csvContent = headers.join(',') + '\n' + row.join(',');

        return csvContent;
    };

    // Generate XML from user data
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
    <verifiedAt>${userData.verifiedAt || ''}</verifiedAt>
    <avatarUrl>${userData.avatarUrl || ''}</avatarUrl>
</user>`;
    };

    // Download file helper
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

    // Handle export
    const handleExport = async (format) => {
        setSelectedFormat(format);
        setExportLoading(true);
        setExportError('');
        setExportSuccess('');

        try {
            // Try backend export first
            const result = await exportUserData(format);
            let content, filename, mimeType;

            if (format === 'json') {
                // Backend returns JSON object with user data
                if (result.user) {
                    content = JSON.stringify(result.user, null, 2);
                    filename = `user_data_${user.username}_${Date.now()}.json`;
                    mimeType = 'application/json';
                } else {
                    throw new Error('Invalid JSON response from server');
                }
            } else if (format === 'csv') {
                // Backend returns CSV text content
                if (result.format === 'csv' && result.content) {
                    content = result.content;
                    filename = `user_data_${user.username}_${Date.now()}.csv`;
                    mimeType = 'text/csv';
                } else {
                    throw new Error('Invalid CSV response from server');
                }
            } else if (format === 'xml') {
                // Backend returns XML text content
                if (result.format === 'xml' && result.content) {
                    content = result.content;
                    filename = `user_data_${user.username}_${Date.now()}.xml`;
                    mimeType = 'application/xml';
                } else {
                    throw new Error('Invalid XML response from server');
                }
            }

            downloadFile(content, filename, mimeType);
            setExportSuccess(`Successfully exported your data as ${format.toUpperCase()}! Check your downloads folder.`);

        } catch (error) {
            console.warn('Backend export failed, using client-side generation:', error);
            
            // Fallback to client-side generation
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
                    // JSON
                    content = JSON.stringify(user, null, 2);
                    filename = `user_data_${user.username}_${Date.now()}.json`;
                    mimeType = 'application/json';
                }

                downloadFile(content, filename, mimeType);
                setExportSuccess(`Successfully exported your data as ${format.toUpperCase()}! Check your downloads folder.`);
            } catch (clientError) {
                setExportError(`Export failed: ${clientError.message}`);
            }
        }

        setExportLoading(false);
        setSelectedFormat(null);
    };

    const formatOptions = [
        {
            id: 'json',
            name: 'JSON',
            icon: <CodeIcon sx={{ fontSize: 48, color: '#20B654' }} />,
            title: 'JSON Format',
            description: 'Machine-readable format, best for developers and data processing',
            features: ['Structured data', 'Easy to parse', 'Developer-friendly']
        },
        {
            id: 'csv',
            name: 'CSV',
            icon: <TableChartIcon sx={{ fontSize: 48, color: '#20B654' }} />,
            title: 'CSV Format',
            description: 'Spreadsheet format that can be opened in Excel or Google Sheets',
            features: ['Human-readable', 'Excel compatible', 'Easy to edit']
        },
        {
            id: 'xml',
            name: 'XML',
            icon: <InsertDriveFileIcon sx={{ fontSize: 48, color: '#20B654' }} />,
            title: 'XML Format',
            description: 'Structured format compatible with many enterprise systems',
            features: ['Structured markup', 'System compatible', 'Standardized']
        }
    ];

    return (
        <div>
            <Header />
            <Box sx={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{ marginRight: '1rem' }}
                    >
                        Back to Dashboard
                    </Button>
                    <Typography variant="h4" sx={{ color: '#20B654', fontWeight: 600 }}>
                        Export Your Data
                    </Typography>
                </Box>

                {/* Success/Error Messages */}
                {exportSuccess && (
                    <Alert 
                        severity="success" 
                        sx={{ marginBottom: '2rem' }}
                        onClose={() => setExportSuccess('')}
                        icon={<CheckCircleIcon />}
                    >
                        {exportSuccess}
                    </Alert>
                )}
                {exportError && (
                    <Alert 
                        severity="error" 
                        sx={{ marginBottom: '2rem' }}
                        onClose={() => setExportError('')}
                    >
                        {exportError}
                    </Alert>
                )}

                {/* Info Card */}
                <Card sx={{ marginBottom: '3rem', backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <InfoIcon sx={{ color: '#20B654', marginRight: '0.5rem' }} />
                            <Typography variant="h6" fontWeight="600">
                                What will be exported?
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Your export will include all your account information in your chosen format.
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText 
                                    primary="✓ Username and email address"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="✓ Full name and profile information"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="✓ Account status and verification state"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText 
                                    primary="✓ Account creation and update timestamps"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                        </List>
                        <Divider sx={{ marginY: '1rem' }} />
                        <Alert severity="info" variant="outlined">
                            <Typography variant="caption">
                                <strong>Security Note:</strong> Your password is never exported for security reasons. 
                                All exports are logged in your activity history.
                            </Typography>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Export Format Cards */}
                <Typography variant="h5" sx={{ marginBottom: '2rem', fontWeight: 600 }}>
                    Choose Export Format
                </Typography>

                <Grid container spacing={3}>
                    {formatOptions.map((format) => (
                        <Grid item xs={12} md={4} key={format.id}>
                            <Paper
                                elevation={3}
                                sx={{
                                    padding: '2rem',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    cursor: exportLoading ? 'not-allowed' : 'pointer',
                                    '&:hover': {
                                        transform: exportLoading ? 'none' : 'translateY(-4px)',
                                        boxShadow: exportLoading ? 3 : 6,
                                        borderColor: '#20B654'
                                    },
                                    border: '2px solid transparent',
                                    opacity: exportLoading && selectedFormat !== format.id ? 0.5 : 1
                                }}
                                onClick={() => !exportLoading && handleExport(format.id)}
                            >
                                {/* Icon */}
                                <Box sx={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    {format.icon}
                                </Box>

                                {/* Title */}
                                <Typography 
                                    variant="h6" 
                                    align="center" 
                                    sx={{ marginBottom: '1rem', fontWeight: 600 }}
                                >
                                    {format.title}
                                </Typography>

                                {/* Description */}
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    align="center"
                                    sx={{ marginBottom: '1.5rem', flexGrow: 1 }}
                                >
                                    {format.description}
                                </Typography>

                                {/* Features */}
                                <Box sx={{ marginBottom: '1.5rem' }}>
                                    {format.features.map((feature, index) => (
                                        <Box 
                                            key={index}
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                marginBottom: '0.5rem'
                                            }}
                                        >
                                            <CheckCircleIcon 
                                                sx={{ 
                                                    fontSize: 16, 
                                                    color: '#20B654', 
                                                    marginRight: '0.5rem' 
                                                }} 
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {feature}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Export Button */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={
                                        exportLoading && selectedFormat === format.id ? 
                                        <CircularProgress size={20} sx={{ color: 'white' }} /> : 
                                        <DownloadIcon />
                                    }
                                    disabled={exportLoading}
                                    sx={{
                                        backgroundColor: '#20B654',
                                        '&:hover': {
                                            backgroundColor: '#1a9445'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#ccc'
                                        }
                                    }}
                                >
                                    {exportLoading && selectedFormat === format.id ? 
                                        'Exporting...' : 
                                        `Export as ${format.name}`
                                    }
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Additional Info */}
                <Card sx={{ marginTop: '3rem', backgroundColor: '#fafafa' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 600 }}>
                            Need Help?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Your exported file will be saved to your browser's default download location. 
                            The filename will include your username and a timestamp for easy identification.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            If you encounter any issues with the export, please contact support or check your 
                            activity logs in your account settings.
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </div>
    );
};

export default ExportPage;