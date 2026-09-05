import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobFilters from './JobFilters';

const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    salaryRange: [0, 1000000],
    onSalaryChange: vi.fn(),
    selectedCategories: [],
    onCategoryChange: vi.fn(),
    jobType: '',
    onJobTypeChange: vi.fn(),
};

test('renders the filter sections', () => {
    render(<JobFilters {...defaultProps} />);
    expect(screen.getByText('Search Jobs')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
});

test('clicking a category chip fires onCategoryChange', () => {
    render(<JobFilters {...defaultProps} />);
    // chips are inside an Accordion; expand it by clicking the summary
    fireEvent.click(screen.getByText('Categories'));
    fireEvent.click(screen.getByText('Engineering'));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('Engineering');
});