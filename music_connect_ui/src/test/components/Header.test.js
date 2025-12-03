// ...existing code...
/**
 * Unit tests for src/components/Header.js
 *
 * Notes:
 * - react-redux hooks are mocked so no Provider/store is required.
 * - ConfirmAccountDeletionModal is mocked to expose `open` prop and simple submit/close buttons.
 * - User slice thunks (logout, deleteAccount) are mocked to return plain actions so we can assert dispatch args.
 */

import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate} from 'react-router'
import Header from '../../components/Header'

// Mock UserSlice thunks used by Header so dispatch receives predictable actions
jest.mock('../../slices/UserSlice.ts', () => ({
  logout: jest.fn((token) => ({ type: 'LOGOUT_ACTION', payload: token })),
  deleteAccount: jest.fn((payload) => ({ type: 'DELETE_ACCOUNT_ACTION', payload }))
}))

// Mock the ConfirmAccountDeletionModal to keep the test focused on Header behavior.
// The mock exposes the open prop and triggers onSubmit/onClose via buttons.
jest.mock('../../modal/ConfirmAccountDeletionModal', () => (props) => {
  const { open, error, onClose, onSubmit } = props
  return (
    <div data-testid="confirm-modal" data-open={open ? 'true' : 'false'} data-error={error || ''}>
      <button data-testid="modal-submit" onClick={() => onSubmit && onSubmit('password')}>
        modal-submit
      </button>
      <button data-testid="modal-close" onClick={() => onClose && onClose()}>
        modal-close
      </button>
    </div>
  )
})

// Mock react-redux hooks
jest.mock('react-redux', () => {
  const Actual = jest.requireActual('react-redux')
  return {
    ...Actual,
    useSelector: jest.fn(),
    useDispatch: jest.fn()
  }
})

// Mock react-router's useNavigate
jest.mock('react-router', () => ({
  useNavigate: jest.fn()
}))

describe('Header component', () => {
  const mockDispatch = jest.fn(() => Promise.resolve())
  const mockNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // default mocked app state: a logged in user with token and no error
    const mockState = {
      users: {
        user: { token: 'token-abc', username: 'testuser' },
        error: null
      }
    }

    // useSelector should call the selector function with mockState and return result
    useSelector.mockImplementation((selector) => selector(mockState))

    // useDispatch returns our mockDispatch
    useDispatch.mockReturnValue(mockDispatch)

    // react-router navigate
    useNavigate.mockReturnValue(mockNavigate)
  })

  test('renders logo link and buttons', () => {
    render(<Header />)
    const logo = screen.getByAltText('MusicConnect Logo')
    expect(logo).toBeInTheDocument()
    // Logo is wrapped in anchor
    expect(logo.closest('a')).toHaveAttribute('href', '/')

    // Buttons present
    expect(screen.getByText(/Delete Account/i)).toBeInTheDocument()
    expect(screen.getByText(/Logout/i)).toBeInTheDocument()
  })

  test('clicking "Delete Account" opens the ConfirmAccountDeletionModal', () => {
    render(<Header />)
    const deleteBtn = screen.getByText(/Delete Account/i)
    fireEvent.click(deleteBtn)

    const modal = screen.getByTestId('confirm-modal')
    expect(modal).toBeInTheDocument()
    expect(modal.getAttribute('data-open')).toBe('true')
  })
});