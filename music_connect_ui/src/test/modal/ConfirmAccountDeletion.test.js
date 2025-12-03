import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmAccountDeletionModal from '../../modal/ConfirmAccountDeletionModal'

describe('ConfirmAccountDeletionModal', () => {
  test('does not render content when open is false', () => {
    render(<ConfirmAccountDeletionModal open={false} error={null} onClose={jest.fn()} onSubmit={jest.fn()} />)
    // Dialog title should not be in the document when closed
    expect(screen.queryByText(/Delete Account/i)).toBeNull()
  })

  test('renders title, password field and buttons when open is true', () => {
    render(<ConfirmAccountDeletionModal open={true} error={null} onClose={jest.fn()} onSubmit={jest.fn()} />)

    expect(screen.getByText(/Delete Account/i)).toBeInTheDocument()
    expect(screen.getByText(/Are You Sure You Want To Delete Your Account\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument()
    expect(screen.getByText(/^Delete$/i)).toBeInTheDocument()
  })

  test('Delete button is disabled when password is empty', () => {
    render(<ConfirmAccountDeletionModal open={true} error={null} onClose={jest.fn()} onSubmit={jest.fn()} />)
    const deleteBtn = screen.getByText(/^Delete$/i);

    expect(deleteBtn).toBeDisabled();
  })

  test('onClose is called when Cancel is clicked', () => {
    const onClose = jest.fn()
    render(<ConfirmAccountDeletionModal open={true} error={null} onClose={onClose} onSubmit={jest.fn()} />)

    fireEvent.click(screen.getByText(/Cancel/i))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('shows error message when error prop is provided', () => {
    render(<ConfirmAccountDeletionModal open={true} error={'failed to delete'} onClose={jest.fn()} onSubmit={jest.fn()} />)
    expect(screen.getByText(/There was a problem deleting your account/i)).toBeInTheDocument()
  })
})