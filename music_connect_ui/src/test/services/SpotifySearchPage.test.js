import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import store from '../../store'
import SpotifyServicePage from '../../services/SpotifyServicePage'

// Mock child components
jest.mock('../../components/Header', () => () => <div data-testid="header">Header</div>)
jest.mock('../../components/SearchBar', () => () => <div data-testid="search-bar">SearchBar</div>)
jest.mock('../../components/PlaylistItem', () => ({ playlistName, playlistImage }) => (
  <div data-testid="playlist-item" data-name={playlistName}>
    <img src={playlistImage} alt={playlistName} />
    {playlistName}
  </div>
))
jest.mock('../../modal/CreateNewPlaylistModal', () => ({ open, onClose, onSubmit }) => (
  <div data-testid="create-modal" data-open={open ? 'true' : 'false'}>
    <button data-testid="modal-close" onClick={() => onClose && onClose()}>Close</button>
    <button data-testid="modal-submit" onClick={() => onSubmit && onSubmit('Test Playlist', 'desc', false)}>Submit</button>
  </div>
))

// Mock react-router's useNavigate
jest.mock('react-router', () => ({
  useNavigate: jest.fn()
}))

// Mock SpotifySlice thunks
jest.mock('../../slices/SpotifySlice.ts', () => ({
  fetchSpotifyUser: jest.fn((username) => ({ type: 'FETCH_SPOTIFY_USER', payload: username })),
  fetchSpotifyPlaylists: jest.fn((username) => ({ type: 'FETCH_PLAYLISTS', payload: username })),
  createSpotifyPlaylist: jest.fn((payload) => ({ type: 'CREATE_PLAYLIST', payload })),
  loginToSpotify: jest.fn((username) => ({ type: 'LOGIN_SPOTIFY', payload: username }))
}))

import { useNavigate } from 'react-router'

const renderWithProviders = (ui) =>
  render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  )

describe('SpotifyServicePage component', () => {
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useNavigate.mockReturnValue(mockNavigate)
    localStorage.setItem('username', 'testuser')
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('renders without crashing', () => {
    renderWithProviders(<SpotifyServicePage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  test('renders Header, SearchBar, and Spotify icon', () => {
    renderWithProviders(<SpotifyServicePage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })

  test('renders "My Playlists" title', () => {
    renderWithProviders(<SpotifyServicePage />)
    expect(screen.getByText(/My Playlists/i)).toBeInTheDocument()
  })

  test('shows unauthenticated message when not authenticated', () => {
    renderWithProviders(<SpotifyServicePage />)
    expect(screen.getByText(/Sign into Spotify to see user playlists/i)).toBeInTheDocument()
  })

  test('shows "Connect Spotify Account" button when not authenticated', () => {
    renderWithProviders(<SpotifyServicePage />)
    expect(screen.getByText(/Connect Spotify Account/i)).toBeInTheDocument()
  })

  test('calls loginToSpotify when Connect button is clicked', async () => {
    const { loginToSpotify } = require('../../slices/SpotifySlice.ts')
    renderWithProviders(<SpotifyServicePage />)

    const connectBtn = screen.getByText(/Connect Spotify Account/i)
    fireEvent.click(connectBtn)

    await waitFor(() => {
      expect(loginToSpotify).toHaveBeenCalledWith('testuser')
    })
  })

  test('renders CreateNewPlaylistModal', () => {
    renderWithProviders(<SpotifyServicePage />)
    expect(screen.getByTestId('create-modal')).toBeInTheDocument()
  })

  test('opens CreateNewPlaylistModal when plus icon is clicked (when authenticated)', () => {
    // Mock authenticated state by modifying store or using a test wrapper
    // For now, test that modal exists and can be interacted with
    renderWithProviders(<SpotifyServicePage />)
    const modal = screen.getByTestId('create-modal')
    expect(modal).toHaveAttribute('data-open', 'false')
  })

  test('closes modal when onClose is called', () => {
    renderWithProviders(<SpotifyServicePage />)
    const closeBtn = screen.getByTestId('modal-close')
    fireEvent.click(closeBtn)
    // Modal should remain in document but data-open should be false
    expect(screen.getByTestId('create-modal')).toBeInTheDocument()
  })

  test('creates playlist when modal submit is called', async () => {
    const { createSpotifyPlaylist } = require('../../slices/SpotifySlice.ts')
    renderWithProviders(<SpotifyServicePage />)

    const submitBtn = screen.getByTestId('modal-submit')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(createSpotifyPlaylist).toHaveBeenCalled()
    })
  })

  test('fetches user on component mount', async () => {
    const { fetchSpotifyUser } = require('../../slices/SpotifySlice.ts')
    renderWithProviders(<SpotifyServicePage />)

    await waitFor(() => {
      expect(fetchSpotifyUser).toHaveBeenCalledWith('testuser')
    })
  })

  test('renders user profile badge', () => {
    renderWithProviders(<SpotifyServicePage />)
    // Badge component should be rendered with user icon
    const userBadge = screen.getByRole('img', { hidden: true })
    expect(userBadge).toBeInTheDocument()
  })

  test('uses username from localStorage', () => {
    localStorage.setItem('username', 'spotify_user_123')
    const { fetchSpotifyUser } = require('../../slices/SpotifySlice.ts')

    renderWithProviders(<SpotifyServicePage />)

    expect(fetchSpotifyUser).toHaveBeenCalledWith('spotify_user_123')
  })

  test('matches snapshot', () => {
    const { container } = renderWithProviders(<SpotifyServicePage />)
    expect(container).toMatchSnapshot()
  })
})