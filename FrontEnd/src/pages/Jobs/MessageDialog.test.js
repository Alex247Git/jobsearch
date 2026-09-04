import { render, screen, fireEvent } from '@testing-library/react';
import MessageDialog from './MessageDialog';

test('renders the dialog title when open', () => {
    render(
        <MessageDialog
            open
            onClose={jest.fn()}
            title="Frontend Dev"
            messageText=""
            onMessageChange={jest.fn()}
            onSend={jest.fn()}
        />
    );
    expect(screen.getByText(/Frontend Dev/)).toBeInTheDocument();
});

test('clicking Send Message calls onSend', () => {
    const onSend = jest.fn();
    render(
        <MessageDialog
            open
            onClose={jest.fn()}
            title="Frontend Dev"
            messageText="Hello"
            onMessageChange={jest.fn()}
            onSend={onSend}
        />
    );
    fireEvent.click(screen.getByText('Send Message'));
    expect(onSend).toHaveBeenCalled();
});