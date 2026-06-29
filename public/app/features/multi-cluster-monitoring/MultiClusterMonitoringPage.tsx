import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Badge } from '@grafana/ui';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface ClusterInfo {
	id: string;
	name: string;
	region: string;
	status: string;
	nodes: number;
	pods: number;
	cpu: string;
	memory: string;
}

export default function MultiClusterMonitoringPage() {
	const dispatch = useDispatch();
	const [clusters, setClusters] = useState<ClusterInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'multi-cluster-monitoring',
				text: 'Multi-Cluster Monitoring',
				icon: 'kubernetes',
				url: '/multi-cluster-monitoring',
				parentItem: {
					id: 'multi-cluster-monitoring-parent',
					text: 'System',
					children: [
						{
							id: 'multi-cluster-monitoring',
							text: 'Multi-Cluster',
							icon: 'kubernetes',
							url: '/multi-cluster-monitoring',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ clusters: ClusterInfo[] }>('/api/multi-cluster');
				setClusters(result.clusters);
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
					<h1>Multi-Cluster Monitoring</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Card>
						<Card.Heading>Kubernetes Clusters</Card.Heading>
						<Card.Description>
							<Stack direction="column" gap={1}>
								{clusters.map((c) => (
									<div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
										<span>{c.name}</span>
										<span>{c.region}</span>
										<Badge text={c.status} color={c.status === 'healthy' ? 'green' : 'red'} />
										<span>{c.nodes}</span>
										<span>{c.pods}</span>
										<span>{c.cpu}</span>
										<span>{c.memory}</span>
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