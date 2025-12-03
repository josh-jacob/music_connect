import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import store from '../../store'
import { AuthProvider } from '../../services/authentication/AuthContext'
import DashboardPage from '../../services/Dashboard'

// Mock child components to focus on Dashboard layout
jest.mock('../../components/Header', () => () => <div data-testid="header">Header</div>)
jest.mock('../../components/SearchBar', () => () => <div data-testid="search-bar">SearchBar</div>)
jest.mock('../../components/ServiceButton', () => ({ service, serviceURL, icon, colour }) => (
  <a href={serviceURL} data-testid={`service-button-${service}`} data-colour={colour}>
    {service}
  </a>
))

const renderWithProviders = (ui) =>
  render(
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthProvider>
    </Provider>
  )

describe('DashboardPage component', () => {
  test('renders without crashing', () => {
    renderWithProviders(<DashboardPage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  test('renders Header component', () => {
    renderWithProviders(<DashboardPage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  test('renders SearchBar component', () => {
    renderWithProviders(<DashboardPage />)
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })

  test('renders all four service buttons with correct URLs', () => {
    renderWithProviders(<DashboardPage />)

    expect(screen.getByTestId('service-button-YouTube Music')).toHaveAttribute('href', '/youtube-music')
    expect(screen.getByTestId('service-button-Spotify')).toHaveAttribute('href', '/spotify')
    expect(screen.getByTestId('service-button-Migrate Playlists')).toHaveAttribute('href', '/playlist-migration')
    expect(screen.getByTestId('service-button-Export Data')).toHaveAttribute('href', '/export')
  })

  test('renders service buttons with correct colours', () => {
    renderWithProviders(<DashboardPage />)

    expect(screen.getByTestId('service-button-YouTube Music')).toHaveAttribute('data-colour', 'red')
    expect(screen.getByTestId('service-button-Spotify')).toHaveAttribute('data-colour', '#1ED760')
    expect(screen.getByTestId('service-button-Migrate Playlists')).toHaveAttribute('data-colour', 'orange')
    expect(screen.getByTestId('service-button-Export Data')).toHaveAttribute('data-colour', 'blue')
  })

  test('renders service button labels correctly', () => {
    renderWithProviders(<DashboardPage />)

    expect(screen.getByText(/YouTube Music/i)).toBeInTheDocument()
    expect(screen.getByText(/Spotify/i)).toBeInTheDocument()
    expect(screen.getByText(/Migrate Playlists/i)).toBeInTheDocument()
    expect(screen.getByText(/Export Data/i)).toBeInTheDocument()
  })

  test('service cards container exists', () => {
    const { container } = renderWithProviders(<DashboardPage />)
    const serviceCards = container.querySelector('.service-cards')
    expect(serviceCards).toBeInTheDocument()
    expect(serviceCards.children).toHaveLength(4)
  })

  test('matches snapshot', () => {
    const { container } = renderWithProviders(<DashboardPage />)
    expect(container).toMatchSnapshot()
  })
})