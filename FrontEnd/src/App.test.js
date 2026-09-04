import { render } from '@testing-library/react';
import App from './App';

beforeAll(() => {
    // jsdom lacks matchMedia (needed by MUI)
    window.matchMedia =
        window.matchMedia ||
        ((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));

    // Pages fetch data on mount; keep the smoke test offline.
    global.fetch = jest.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
});

test('renders the app without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
});
