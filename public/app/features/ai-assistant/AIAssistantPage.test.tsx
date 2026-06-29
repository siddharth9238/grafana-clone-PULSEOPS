import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIAssistantPage from './AIAssistantPage';

jest.mock('@grafana/runtime', () => ({
	getBackendSrv: () => ({
		post: jest.fn().mockResolvedValue({ reply: 'Hello from AI' }),
	}),
}));

jest.mock('app/types/store', () => ({
	useDispatch: () => jest.fn(),
}));

describe('AIAssistantPage', () => {
	it('renders initial welcome message', () => {
		render(<AIAssistantPage />);
		expect(screen.getByText(/AI Dashboard Assistant/i)).toBeInTheDocument();
	});

	it('sends message on button click', async () => {
		render(<AIAssistantPage />);
		
		const input = screen.getByPlaceholderText(/Ask about/i);
		const sendButton = screen.getByRole('button');

		fireEvent.change(input, { target: { value: 'test message' } });
		fireEvent.click(sendButton);

		await waitFor(() => {
			expect(screen.getByText('test message')).toBeInTheDocument();
		});
	});
});