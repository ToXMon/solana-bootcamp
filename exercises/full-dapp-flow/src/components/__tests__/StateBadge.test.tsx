import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StateBadge } from '../StateBadge'

describe('StateBadge', () => {
  it.each([
    [{ draft: {} }, 'Draft'],
    [{ active: {} }, 'Active'],
    [{ closed: {} }, 'Closed'],
  ] as const)('renders the %s state label and status name', (state, label) => {
    render(<StateBadge state={state} />)

    expect(screen.getByRole('status', { name: `Proposal status: ${label}` })).toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
