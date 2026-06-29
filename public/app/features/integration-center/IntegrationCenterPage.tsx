import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Badge, Button } from '@grafana/ui';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface Integration {
	id: string;
	name: string;
	type: string;
	status: string;
	channels: number;
}

export default function IntegrationCenterPage() {
	const dispatch = useDispatch();
	const [integrations, setIntegrations] = useState<Integration[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'integration-center',
				text: 'Integration Center',
				icon: 'plug',
				url: '/integration-center',
				parentItem: {
					id: 'integration-center-parent',
					text: 'System',
					children: [
						{
							id: 'integration-center',
							text: 'Integration Center',
							icon: 'plug',
							url: '/integration-center',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ integrations: Integration[] }>('/api/integration-center');
				setIntegrations(result.integrations);
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
					<h1>Integration Center</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Card>
						<Card.Heading>Configured Integrations</Card.Heading>
						<Card.Description>
							<Stack direction="column" gap={1}>
								{integrations.map((i) => (
									<div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
										<span>{i.name}</span>
										<Badge text={i.type} color="blue" />
										<Badge text={i.status} color={i.status === 'active' ? 'green' : 'orange'} />
										<span>{i.channels}</span>
										<Button size="sm" variant="secondary">Configure</Button>
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