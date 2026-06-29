import { useEffect, useState } from 'react';

import { GrafanaTheme2, IconName } from '@grafana/data';
import { css } from '@emotion/css';
import { Badge, Button, Card, Icon, Stack, useStyles2 } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { updateNavIndex } from 'app/core/reducers/navModel';
import { useDispatch } from 'app/types/store';

interface SecurityMetric {
	name: string;
	value: string;
	trend: string;
}

interface SecurityEvent {
	id: string;
	severity: string;
	event: string;
	source_ip: string;
	time: string;
	blocked: boolean;
}

interface SecurityCenterData {
	metrics: SecurityMetric[];
	events: SecurityEvent[];
	threat_level: string;
}

export default function SecurityCenterPage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<SecurityCenterData | null>(null);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'security-center',
				text: 'Security Center',
				icon: 'shield',
				url: '/security-center',
				parentItem: {
					id: 'security-center-parent',
					text: 'System',
					children: [
						{
							id: 'security-center',
							text: 'Security Center',
							icon: 'shield',
							url: '/security-center',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<SecurityCenterData>('/api/security-center');
				setData(result);
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
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<h1>Security Center</h1>
						<Button variant="secondary" icon="shield">
							Threat Level: {data?.threat_level}
						</Button>
					</Stack>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							<Stack direction="row" gap={2} wrap>
								{data.metrics.map((m) => (
									<Card key={m.name} className={styles.metricCard}>
										<Card.Heading>{m.name}</Card.Heading>
										<Card.Description>
											<Stack direction="row" gap={1} alignItems="center">
												<span className={styles.metricValue}>{m.value}</span>
												<Icon name={getTrendIcon(m.trend)} />
											</Stack>
										</Card.Description>
									</Card>
								))}
							</Stack>

							<Card>
								<Card.Heading>Security Events</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.events.map((e) => (
											<div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
												<Badge text={e.severity} color={getSeverityColor(e.severity)} />
												<span>{e.event}</span>
												<span>{e.source_ip}</span>
												<span>{new Date(e.time).toLocaleTimeString()}</span>
												<span>{e.blocked ? 'Blocked' : 'Allowed'}</span>
											</div>
										))}
									</Stack>
								</Card.Description>
							</Card>
						</>
					)}
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const getTrendIcon = (trend: string): IconName => {
	switch (trend) {
		case 'up': return 'arrow-up';
		case 'down': return 'arrow-down';
		default: return 'sync';
	}
};

const getSeverityColor = (severity: string) => {
	switch (severity) {
		case 'high': return 'red';
		case 'medium': return 'orange';
		default: return 'blue';
	}
};

const getStyles = (theme: GrafanaTheme2) => ({
	metricCard: css({
		minWidth: 150,
	}),
	metricValue: css({
		fontSize: theme.typography.h4.fontSize,
		fontWeight: theme.typography.fontWeightBold,
	}),
});