import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobCard from './JobCard';

const job = {
    job_id: 5,
    title: 'Frontend Dev',
    company_name: 'ACME',
    location: 'Athens',
    salary: 50000,
    job_type: 'Full-time',
    remote_option: 1,
    description: 'Build user interfaces',
};

const defaultProps = {
    job,
    saved: false,
    applied: false,
    rating: null,
    renderStars: () => null,
    onOpen: vi.fn(),
    onApply: vi.fn(),
    onMessage: vi.fn(),
    onSave: vi.fn(),
};

test('renders the job title and company', () => {
    render(<JobCard {...defaultProps} />);
    expect(screen.getByText('Frontend Dev')).toBeInTheDocument();
    expect(screen.getByText('ACME')).toBeInTheDocument();
});

test('clicking Apply Now calls onApply with the job id', () => {
    render(<JobCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Apply Now'));
    expect(defaultProps.onApply).toHaveBeenCalledWith(5);
});