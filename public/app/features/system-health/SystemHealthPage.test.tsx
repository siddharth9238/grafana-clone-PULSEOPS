import { render, screen, waitFor } from '@testing-library/react';
import SystemHealthPage from './SystemHealthPage';

jest.mock('@grafana/runtime', () => ({
	getBackendSrv: () => ({
		get: jest.fn().mockResolvedValue({
			cpu: '15%',
			memory: '42%',
			disk: '67%',
			network_in: '1.2 MB/s',
			network_out: '0.8 MB/s',
			go_runtime_mem: '12 MB',
			uptime: '14d 6h 32m',
			status: 'Running',
			metrics: [],
		}),
	}),
}));

jest.mock('app/types/store', () => ({
	useDispatch: () => jest.fn(),
}));

jest.mock('app/core/reducers/navModel', () => ({
	updateNavIndex: jest.fn(),
}));

describe('SystemHealthPage', () => {
	it('renders loading state initially', () => {
		render(<SystemHealthPage />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('renders metrics after loading', async () => {
		render(<SystemHealthPage />);
		
		await waitFor(() => {
			expect(screen.getByText('System Monitor')).toBeInTheDocument();
		});

		expect(screen.getByText('CPU Usage')).toBeInTheDocument();
		expect(screen.getByText('RAM Usage')).toBeInTheDocument();
	});
});