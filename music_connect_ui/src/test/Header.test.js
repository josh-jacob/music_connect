import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './../components/Header';
import '@testing-library/jest-dom';

// Mock the UserSlice logout function, if needed.
jest.mock('../slices/UserSlice', () => ({
    logout: jest.fn(),
}));

describe('Header Component', () => {
    test('renders Header with logo', () => {
        render(<Header />);
        const logo = screen.getByAltText('MusicConnect Logo');
        expect(logo).toBeInTheDocument();
    });

    test('renders Help and Logout buttons', () => {
        render(<Header />);
        expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    test.skip('logout button calls handleLogout on click', () => {
        // You may want to mock out the logout function as needed
        const { logout } = require('../slices/UserSlice');
        render(<Header />);

        const logoutButton = screen.getByRole('button', { name: /logout/i });
        fireEvent.click(logoutButton);

        // Assuming handleLogout will call logout
        // Check if logout was called
        expect(logout).toHaveBeenCalled();
    });
});
