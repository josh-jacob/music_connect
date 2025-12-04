require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 900000; 

// ===== DATABASE COMMENTED OUT - USING IN-MEMORY STORAGE =====
// Uncomment this section when you're ready to use PostgreSQL

/*
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'musicconnect',
  user: process.env.DB_USER || 'musiconnect_app',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Database connected successfully');
    release();
  }
});
*/

// ===== TEMPORARY IN-MEMORY USER STORAGE =====
const users = new Map(); // Stores user data: { username, email, password, fullName, verified, createdAt }

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Middleware 
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory storage for tokens and rate limiting
const resetTokens = new Map();
const verificationTokens = new Map(); 
const tokenBlacklist = new Set();
const loginAttempts = new Map();
const activityLogs = new Map();

// Functions
const logActivity = (username, activity, details = {}) => {
  if (!activityLogs.has(username)) activityLogs.set(username, []);
  
  const log = {
    timestamp: new Date().toISOString(),
    activity,
    details,
    id: crypto.randomBytes(8).toString('hex')
  };
  
  const logs = activityLogs.get(username);
  logs.push(log);
  if (logs.length > 50) logs.shift();
  return log;
};

const isAccountLocked = (username) => {
  const attempts = loginAttempts.get(username);
  if (!attempts) return { locked: false };

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeSinceLock = Date.now() - attempts.lockTime;
    if (timeSinceLock < LOCKOUT_TIME) {
      return {
        locked: true,
        remainingTime: Math.ceil((LOCKOUT_TIME - timeSinceLock) / 60000)
      };
    } else {
      loginAttempts.delete(username);
      return { locked: false };
    }
  }
  return { locked: false };
};

const recordFailedAttempt = (username) => {
  const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: Date.now() };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockTime = Date.now();
    loginAttempts.set(username, attempts);
    logActivity(username, 'ACCOUNT_LOCKED');
    return { locked: true, remainingTime: Math.ceil(LOCKOUT_TIME / 60000) };
  }
  
  loginAttempts.set(username, attempts);
  return { locked: false, attempts: attempts.count };
};

const clearLoginAttempts = (username) => loginAttempts.delete(username);

//Send verification email
const sendVerificationEmail = async (email, username, token) => {
  const verificationUrl = `${FRONTEND_URL}/music-connect/verify-email?token=${token}`;
  
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Verify your MusicConnect account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #20B654;">Welcome to MusicConnect, ${username}!</h2>
        <p>Thank you for creating an account. Please verify your email address to complete your registration.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #20B654; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours.<br>
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, username, token) => {
  const resetUrl = `${FRONTEND_URL}/music-connect/reset-password?token=${token}`;
  
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Reset your MusicConnect password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #20B654;">Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #20B654; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour.<br>
          If you didn't request this, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Token verifier
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  if (tokenBlacklist.has(token)) return res.status(401).json({ error: 'Token revoked' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};


// Routes


// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Auth Service', 
    timestamp: new Date().toISOString(), 
    version: '2.2.0',
    database: 'in-memory (PostgreSQL disabled)'
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email, and password required' });

    // Check if username exists
    if (users.has(username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check if email exists
    for (const [, userData] of users) {
      if (userData.email === email) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Store user in memory
    const newUser = {
      username,
      email,
      password: hashedPassword,
      fullName: fullName || username,
      verified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.set(username, newUser);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    verificationTokens.set(verificationToken, {
      username,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, username, verificationToken);
      logActivity(username, 'ACCOUNT_CREATED');
      logActivity(username, 'VERIFICATION_EMAIL_SENT');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({ 
      message: 'Account created! Please check your email to verify your account.',
      user: { username, email, fullName: newUser.fullName }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const tokenData = verificationTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (Date.now() > tokenData.expiresAt) {
      verificationTokens.delete(token);
      return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });
    }

    const user = users.get(tokenData.username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.verified = true;
    user.updatedAt = new Date().toISOString();
    users.set(tokenData.username, user);
    
    verificationTokens.delete(token);
    
    logActivity(tokenData.username, 'EMAIL_VERIFIED');

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resend Verification Email
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    let foundUser = null;
    let foundUsername = null;
    
    for (const [username, userData] of users) {
      if (userData.email === email) {
        foundUser = userData;
        foundUsername = username;
        break;
      }
    }

    if (!foundUser) {
      return res.json({ message: 'If the email exists and is not verified, a verification link has been sent.' });
    }

    if (foundUser.verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    verificationTokens.set(verificationToken, {
      username: foundUsername,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    await sendVerificationEmail(email, foundUsername, verificationToken);
    logActivity(foundUsername, 'VERIFICATION_EMAIL_RESENT');

    res.json({ message: 'Verification email sent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Login 
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const lock = isAccountLocked(username);
    if (lock.locked) return res.status(423).json({ error: `Account locked. Try again in ${lock.remainingTime} minutes.` });

    const user = users.get(username);
    
    if (!user) {
      const result = recordFailedAttempt(username);
      return res.status(401).json({ error: 'Invalid credentials', attemptsRemaining: 5 - result.attempts });
    }

    if (!await bcrypt.compare(password, user.password)) {
      const result = recordFailedAttempt(username);
      return res.status(401).json({ error: 'Invalid credentials', attemptsRemaining: 5 - result.attempts });
    }

    if (!user.verified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true 
      });
    }

    clearLoginAttempts(username);
    logActivity(username, 'LOGIN_SUCCESS');

    const token = jwt.sign({ 
      username, 
      email: user.email,
      userId: username 
    }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      message: 'Logged in successfully', 
      user: { 
        username, 
        email: user.email, 
        fullName: user.fullName 
      }, 
      token 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) tokenBlacklist.add(token);
  setTimeout(() => tokenBlacklist.delete(token), 86400000);
  logActivity(req.user.username, 'LOGOUT');
  res.json({ message: 'Logged out successfully' });
});

// Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Get Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = users.get(req.user.username);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
      verified: user.verified
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email, currentPassword, newPassword } = req.body;
    
    const user = users.get(req.user.username);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    let updated = false;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required to change password' });
      if (!await bcrypt.compare(currentPassword, user.password)) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      
      user.password = await bcrypt.hash(newPassword, 12);
      updated = true;
      
      logActivity(req.user.username, 'PASSWORD_CHANGED');
    }

    if (fullName && fullName !== user.fullName) {
      user.fullName = fullName;
      updated = true;
    }
    
    if (email && email !== user.email) {
      user.email = email;
      updated = true;
    }

    if (updated) {
      user.updatedAt = new Date().toISOString();
      users.set(req.user.username, user);
      res.json({ message: 'Profile updated successfully', user });
    } else {
      res.json({ message: 'No changes made', user });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Avatar
app.post('/api/auth/avatar', authenticateToken, async (req, res) => {
  try {
    const user = users.get(req.user.username);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.updatedAt = new Date().toISOString();
    users.set(req.user.username, user);

    logActivity(req.user.username, 'AVATAR_UPDATED');

    res.json({ message: 'Avatar updated successfully', avatarUrl: req.body.avatarUrl });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password 
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    let foundUser = null;
    let foundUsername = null;
    
    for (const [username, userData] of users) {
      if (userData.email === email) {
        foundUser = userData;
        foundUsername = username;
        break;
      }
    }

    if (!foundUser) {
      return res.json({ message: 'If the email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    resetTokens.set(resetToken, {
      username: foundUsername,
      expiresAt: Date.now() + 60 * 60 * 1000 
    });

    await sendPasswordResetEmail(email, foundUser.fullName, resetToken);
    logActivity(foundUsername, 'PASSWORD_RESET_REQUESTED');

    res.json({ message: 'Password reset link sent! Please check your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset Password 
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (Date.now() > tokenData.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    const user = users.get(tokenData.username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date().toISOString();
    users.set(tokenData.username, user);
    
    resetTokens.delete(token);
    
    logActivity(tokenData.username, 'PASSWORD_RESET_COMPLETED');

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Activity Logs
app.get('/api/auth/activity-logs', authenticateToken, (req, res) => {
  const logs = activityLogs.get(req.user.username) || [];
  res.json({ totalLogs: logs.length, logs: logs.slice(-20).reverse() });
});

// Export User Data (JSON/CSV/XML)
app.get('/api/auth/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const user = users.get(req.user.username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exportData = {
      username: user.username,
      email: user.email,
      fullName: user.fullName || '',
      isActive: user.isActive,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      verifiedAt: user.updatedAt || null,
      avatarUrl: null
    };

    logActivity(req.user.username, 'DATA_EXPORTED', { format });

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="user_data_${user.username}_${Date.now()}.json"`);
        return res.json({ user: exportData });

      case 'csv':
        const escapeCSV = (value) => {
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const headers = ['Username', 'Email', 'Full Name', 'Active Status', 'Email Verified', 'Account Created', 'Last Updated', 'Email Verified Date', 'Avatar URL'];
        
        const row = [
          escapeCSV(exportData.username),
          escapeCSV(exportData.email),
          escapeCSV(exportData.fullName),
          escapeCSV(exportData.isActive ? 'Active' : 'Inactive'),
          escapeCSV(exportData.verified ? 'Yes' : 'No'),
          escapeCSV(exportData.createdAt ? new Date(exportData.createdAt).toLocaleString() : ''),
          escapeCSV(exportData.updatedAt ? new Date(exportData.updatedAt).toLocaleString() : ''),
          escapeCSV(exportData.verifiedAt ? new Date(exportData.verifiedAt).toLocaleString() : 'Not verified'),
          escapeCSV(exportData.avatarUrl || 'No avatar')
        ];

        const csvContent = headers.join(',') + '\n' + row.join(',');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="user_data_${user.username}_${Date.now()}.csv"`);
        return res.send(csvContent);

      case 'xml':
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<user>
    <username>${exportData.username}</username>
    <email>${exportData.email}</email>
    <fullName>${exportData.fullName}</fullName>
    <isActive>${exportData.isActive}</isActive>
    <verified>${exportData.verified}</verified>
    <createdAt>${exportData.createdAt}</createdAt>
    <updatedAt>${exportData.updatedAt}</updatedAt>
    <verifiedAt>${exportData.verifiedAt || ''}</verifiedAt>
    <avatarUrl>${exportData.avatarUrl || ''}</avatarUrl>
</user>`;
        
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="user_data_${user.username}_${Date.now()}.xml"`);
        return res.send(xmlContent);

      default:
        return res.status(400).json({ error: 'Invalid format. Use json, csv, or xml' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Server error during export' });
  }
});

// Delete Account
app.delete('/api/auth/account', authenticateToken, async (req, res) => {
  try {
    const { password, confirmation } = req.body;
    
    const user = users.get(req.user.username);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    if (confirmation !== 'DELETE') {
      return res.status(400).json({ error: 'Confirmation required' });
    }
    
    logActivity(req.user.username, 'ACCOUNT_DELETED');
    
    users.delete(req.user.username);
    activityLogs.delete(req.user.username);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Start Server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email configured: ${EMAIL_USER}`);
  console.log(`Storage: In-memory (PostgreSQL disabled)`);
  console.log(`NOTE: Data will be lost when server restarts`);
});
