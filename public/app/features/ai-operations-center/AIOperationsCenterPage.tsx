import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Card, Stack, Icon, Badge } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface AIOperation {
	id: string;
	type: string;
	status: string;
	last_run: string;
	duration: string;
}

export default function AIOperationsCenterPage() {
	const dispatch = useDispatch();
	const [operations, setOperations] = useState<AIOperation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'ai-operations-center',
				text: 'AI Operations Center',
				icon: 'brain',
				url: '/ai-operations-center',
				parentItem: {
					id: 'ai-operations-center-parent',
					text: 'AI Tools',
					children: [
						{
							id: 'ai-operations-center',
							text: 'Operations Center',
							icon: 'brain',
							url: '/ai-operations-center',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ operations: AIOperation[] }>('/api/ai-ops');
				setOperations(result.operations);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	return (
		<Page navId="home">
			<Page.Contents>
				<Stack direction="column" gap={3}>
					<h1>AI Operations Center</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Card>
						<Card.Heading>AI Operations</Card.Heading>
						<Card.Description>
							<Stack direction="column" gap={2}>
								{operations.map((op) => (
									<div key={op.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
										<Stack direction="row" gap={1} alignItems="center">
											<Icon name="brain" />
											<span>{op.type}</span>
										</Stack>
										<Stack direction="row" gap={2} alignItems="center">
											<Badge text={op.status} color={getStatusColor(op.status)} />
											<span>{new Date(op.last_run).toLocaleString()}</span>
											<span>{op.duration}</span>
										</Stack>
									</div>
								))}
							</Stack>
						</Card.Description>
					</Card>
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const getStatusColor = (status: string) => {
	switch (status) {
		case 'running': return 'blue';
		case 'completed': return 'green';
		default: return 'orange';
	}
};