import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, InlineField, InlineSwitch, useStyles2, Tooltip } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface EndpointStat {
	path: string;
	method: string;
	avg_time_ms: number;
	max_time_ms: number;
	request_count: number;
}

interface ApiPerformanceData {
	total_requests: number;
	avg_response_time_ms: number;
	slowest_endpoints: EndpointStat[];
	error_rate: number;
	error_rate_percentage: number;
	status_distribution: Record<string, number>;
}

export default function ApiPerformancePage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<ApiPerformanceData | null>(null);
	const [loading, setLoading] = useState(true);
	const [autoRefresh, setAutoRefresh] = useState(false);

	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'api-performance',
				text: 'API Performance',
				icon: 'graph-bar',
				url: '/api-performance',
				parentItem: {
					id: 'api-performance-parent',
					text: 'System',
					children: [
						{
							id: 'api-performance',
							text: 'API Performance',
							icon: 'graph-bar',
							url: '/api-performance',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<ApiPerformanceData>('/api/performance/analytics');
				setData(result);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	useEffect(() => {
		if (!autoRefresh) return;
		const interval = window.setInterval(async () => {
			try {
				const result = await getBackendSrv().get<ApiPerformanceData>('/api/performance/analytics');
				setData(result);
			} catch (err) {
				console.error(err);
			}
		}, 10000);
		return () => clearInterval(interval);
	}, [autoRefresh]);

	const StatCard = ({ title, value, unit, icon, tooltipText }: { title: string; value: number; unit?: string; icon: string; tooltipText?: string }) => (
		<Card>
			<Card.Heading>
				<Stack gap={2} alignItems="center">
					<Icon name={icon as any} />
					<span>{title}</span>
				</Stack>
			</Card.Heading>
			<Card.Description>
				<Tooltip content={tooltipText || ''} placement="top">
					<span className={styles.statValue}>
						{typeof value === 'number' ? value.toLocaleString() : value}
						{unit && <span className={styles.statUnit}>{unit}</span>}
					</span>
				</Tooltip>
			</Card.Description>
		</Card>
	);

	return (
		<Page navId="home">
			<Page.Contents>
				<Stack direction="column" gap={3}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<h1>API Performance Analyzer</h1>
						<InlineField label="Live Refresh" grow={false}>
							<InlineSwitch value={autoRefresh} onChange={(e) => setAutoRefresh(e.currentTarget.checked)} />
						</InlineField>
					</Stack>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							<Stack direction="row" gap={2} wrap>
								<StatCard title="Total Requests" value={data.total_requests} icon="graph-bar" tooltipText="Total API requests served" />
								<StatCard title="Avg Response Time" value={data.avg_response_time_ms} unit="ms" icon="clock-nine" tooltipText="Average latency across all endpoints" />
								<StatCard title="Error Rate" value={data.error_rate_percentage} unit="%" icon="exclamation-triangle" tooltipText="Percentage of failed requests (4xx/5xx)" />
							</Stack>

							<Card>
								<Card.Heading>Slowest Endpoints</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.slowest_endpoints.map((ep, idx) => (
											<Stack key={idx} direction="row" gap={2} alignItems="center" justifyContent="space-between">
												<Stack direction="row" gap={2} alignItems="center">
													<span className={styles.badge}>{ep.method}</span>
													<span className={styles.path}>{ep.path}</span>
												</Stack>
												<Stack direction="row" gap={3}>
													<span className={styles.metric}>Avg: {ep.avg_time_ms.toFixed(1)} ms</span>
													<span className={styles.metric}>Peak: {ep.max_time_ms.toFixed(1)} ms</span>
													<span className={styles.metric}>{ep.request_count.toLocaleString()} req</span>
												</Stack>
											</Stack>
										))}
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>HTTP Status Distribution</Card.Heading>
								<Card.Description>
									<Stack direction="row" gap={2} wrap>
										{Object.entries(data.status_distribution).map(([code, count]) => (
											<Stack key={code} direction="column" gap={0} alignItems="center">
												<span className={styles.statusCode}>{code}</span>
												<span className={styles.statusCount}>{count.toLocaleString()}</span>
											</Stack>
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

const getStyles = (theme: GrafanaTheme2) => ({
	statValue: css({
		fontSize: theme.typography.fontSize,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.text.primary,
	}),
	statUnit: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.secondary,
		marginLeft: theme.spacing(1),
	}),
	badge: css({
		backgroundColor: theme.colors.primary.transparent,
		color: theme.colors.primary.main,
		border: `1px solid ${theme.colors.primary.main}`,
		borderRadius: theme.shape.borderRadius(1),
		padding: theme.spacing(0.5, 1),
		fontSize: theme.typography.size.xs,
		fontWeight: theme.typography.fontWeightBold,
		textTransform: 'uppercase',
	}),
	path: css({
		fontFamily: 'monospace',
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.primary,
	}),
	metric: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.secondary,
		minWidth: '100px',
		textAlign: 'right',
	}),
	statusCode: css({
		fontSize: theme.typography.size.lg,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.text.primary,
	}),
	statusCount: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.secondary,
	}),
});