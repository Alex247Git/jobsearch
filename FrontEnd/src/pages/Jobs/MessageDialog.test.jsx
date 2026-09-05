import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageDialog from './MessageDialog';

test('renders the dialog title when open', () => {
    render(
        <MessageDialog
            open
            onClose={vi.fn()}
            title="Frontend Dev"
            messageText=""
            onMessageChange={vi.fn()}
            onSend={vi.fn()}
        />
    );
    expect(screen.getByText(/Frontend Dev/)).toBeInTheDocument();
});

test('clicking Send Message calls onSend', () => {
    const onSend = vi.fn();
    render(
        <MessageDialog
            open
            onClose={vi.fn()}
            title="Frontend Dev"
            messageText="Hello"
            onMessageChange={vi.fn()}
            onSend={onSend}
        />
    );
    fireEvent.click(screen.getByText('Send Message'));
    expect(onSend).toHaveBeenCalled();
});