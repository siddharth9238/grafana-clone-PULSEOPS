import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface ExecutiveMetric {
	name: string;
	value: string;
	trend: string;
}

export default function ExecutiveDashboardPage() {
	const dispatch = useDispatch();
	const [metrics, setMetrics] = useState<ExecutiveMetric[]>([]);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'executive-dashboard',
				text: 'Executive Dashboard',
				icon: 'rocket',
				url: '/executive-dashboard',
				parentItem: {
					id: 'executive-dashboard-parent',
					text: 'System',
					children: [
						{
							id: 'executive-dashboard',
							text: 'Executive Dashboard',
							icon: 'rocket',
							url: '/executive-dashboard',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ metrics: ExecutiveMetric[] }>('/api/executive-dashboard');
				setMetrics(result.metrics);
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
					<h1>Executive Dashboard</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Stack direction="row" gap={2} wrap>
						{metrics.map((m) => (
							<Card key={m.name} className={styles.metricCard}>
								<Card.Heading>{m.name}</Card.Heading>
								<Card.Description>
									<Stack direction="row" gap={1} alignItems="center">
										<span className={styles.metricValue}>{m.value}</span>
										<Icon name={m.trend === 'up' ? 'arrow-up' : m.trend === 'down' ? 'arrow-down' : 'sync'} />
									</Stack>
								</Card.Description>
							</Card>
						))}
					</Stack>
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const getStyles = (theme: GrafanaTheme2) => ({
	metricCard: css({
		minWidth: 180,
	}),
	metricValue: css({
		fontSize: theme.typography.h2.fontSize,
		fontWeight: theme.typography.fontWeightBold,
	}),
});