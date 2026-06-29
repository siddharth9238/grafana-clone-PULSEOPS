import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Badge } from '@grafana/ui';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface NetworkInterface {
	name: string;
	status: string;
	speed: string;
	in_traffic: string;
	out_traffic: string;
}

interface NetworkTopTalker {
	source: string;
	destination: string;
	bytes: string;
	protocol: string;
}

export default function NetworkMonitoringPage() {
	const dispatch = useDispatch();
	const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
	const [topTalkers, setTopTalkers] = useState<NetworkTopTalker[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'network-monitoring',
				text: 'Network Monitoring',
				icon: 'share-alt',
				url: '/network-monitoring',
				parentItem: {
					id: 'network-monitoring-parent',
					text: 'System',
					children: [
						{
							id: 'network-monitoring',
							text: 'Network Monitoring',
							icon: 'share-alt',
							url: '/network-monitoring',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{
					interfaces: NetworkInterface[];
					top_talkers: NetworkTopTalker[];
				}>('/api/network');
				setInterfaces(result.interfaces);
				setTopTalkers(result.top_talkers);
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
					<h1>Network Monitoring</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{interfaces.length > 0 && (
						<Card>
							<Card.Heading>Network Interfaces</Card.Heading>
							<Card.Description>
								<Stack direction="column" gap={1}>
									{interfaces.map((i) => (
										<div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
											<span>{i.name}</span>
											<Badge text={i.status} color={i.status === 'up' ? 'green' : 'red'} />
											<span>{i.speed}</span>
											<span>{i.in_traffic}</span>
											<span>{i.out_traffic}</span>
										</div>
									))}
								</Stack>
							</Card.Description>
						</Card>
					)}

					{topTalkers.length > 0 && (
						<Card>
							<Card.Heading>Top Talkers</Card.Heading>
							<Card.Description>
								<Stack direction="column" gap={1}>
									{topTalkers.map((t, idx) => (
										<div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
											<span>{t.source}</span>
											<span>{t.destination}</span>
											<Badge text={t.protocol} color="blue" />
											<span>{t.bytes}</span>
										</div>
									))}
								</Stack>
							</Card.Description>
						</Card>
					)}
				</Stack>
			</Page.Contents>
		</Page>
	);
}