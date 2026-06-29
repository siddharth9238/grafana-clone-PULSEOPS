import { useEffect, useState } from 'react';

import { GrafanaTheme2, IconName } from '@grafana/data';
import { css } from '@emotion/css';
import { Card, InlineField, Icon, InlineSwitch, Stack, useStyles2 } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { updateNavIndex } from 'app/core/reducers/navModel';
import { useDispatch } from 'app/types/store';

interface SystemHealthData {
	metrics: MetricPoint[];
	cpu: string;
	memory: string;
	disk: string;
	network_in: string;
	network_out: string;
	go_runtime_mem: string;
	uptime: string;
	status: string;
}

interface MetricPoint {
	time: number;
	value: number;
}

export default function SystemHealthPage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<SystemHealthData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [autoRefresh, setAutoRefresh] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'system-health',
				text: 'System Health',
				icon: 'heart-rate',
				url: '/system-health',
				parentItem: {
					id: 'system-health-parent',
					text: 'System',
					children: [
						{
							id: 'system-health',
							text: 'System Health',
							icon: 'heart-rate',
							url: '/system-health',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchHealth() {
			try {
				const result = await getBackendSrv().get<SystemHealthData>('/api/system-health');
				setData(result);
				setError(null);
			} catch (err) {
				setError('Failed to fetch system health');
			} finally {
				setLoading(false);
			}
		}

		fetchHealth();

		let interval: number;
		if (autoRefresh) {
			interval = window.setInterval(fetchHealth, 5000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [autoRefresh]);

	const StatCard = ({ title, value, icon }: { title: string; value: string; icon: IconName }) => (
		<Card className={styles.statCard}>
			<Card.Heading>
				<Stack gap={2} alignItems="center">
					<Icon name={icon} />
					<span>{title}</span>
				</Stack>
			</Card.Heading>
			<Card.Description>
				<span className={styles.statValue}>{value}</span>
			</Card.Description>
		</Card>
	);

	return (
		<Page navId="system-health">
			<Page.Contents>
				<Stack direction="column" gap={3}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<h1>System Monitor</h1>
						<InlineField label="Auto Refresh" grow={false}>
							<InlineSwitch
								value={autoRefresh}
								onChange={(e) => setAutoRefresh(e.currentTarget.checked)}
							/>
						</InlineField>
					</Stack>

					{error && (
						<Card>
							<Card.Heading>Error</Card.Heading>
							<Card.Description>{error}</Card.Description>
						</Card>
					)}

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							<Stack direction="row" gap={2} wrap>
								<StatCard title="CPU Usage" value={data.cpu} icon="heart-rate" />
								<StatCard title="RAM Usage" value={data.memory} icon="database" />
								<StatCard title="Disk Usage" value={data.disk} icon="database" />
								<StatCard title="Network In" value={data.network_in} icon="arrow-down" />
								<StatCard title="Network Out" value={data.network_out} icon="arrow-up" />
							</Stack>

							<Stack direction="row" gap={2}>
								<Card className={styles.chartCard}>
									<Card.Heading>CPU Usage</Card.Heading>
									<Card.Description>
										<MockChart value={data.cpu} color="red" />
									</Card.Description>
								</Card>
								<Card className={styles.chartCard}>
									<Card.Heading>RAM Usage</Card.Heading>
									<Card.Description>
										<MockChart value={data.memory} color="blue" />
									</Card.Description>
								</Card>
								<Card className={styles.chartCard}>
									<Card.Heading>Disk Usage</Card.Heading>
									<Card.Description>
										<GaugeCard value={parseInt(data.disk, 10)} unit="%" />
									</Card.Description>
								</Card>
							</Stack>

							<Stack direction="row" gap={2}>
								<StatCard title="Go Runtime Memory" value={data.go_runtime_mem} icon="cog" />
								<StatCard title="Uptime" value={data.uptime} icon="clock-nine" />
								<StatCard title="Status" value={data.status} icon="check-square" />
							</Stack>
						</>
					)}
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const MockChart = ({ value, color }: { value: string; color: string }) => {
	const val = parseInt(value, 10) || 0;
	return (
		<div style={{ height: 60, background: 'linear-gradient(90deg, var(--grph-grn) 0%, var(--grph-' + color + ') ' + val + '%, var(--grph-grn) ' + val + '%)' }} />
	);
};

const GaugeCard = ({ value, unit }: { value: number; unit: string }) => (
	<div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
		<span style={{ fontSize: 32, fontWeight: 'bold' }}>{value}{unit}</span>
	</div>
);

const getStyles = (theme: GrafanaTheme2) => ({
	statCard: css({
		minWidth: 140,
	}),
	statValue: css({
		fontSize: theme.typography.h4.fontSize,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.text.primary,
	}),
	chartCard: css({
		flex: 1,
		minWidth: 200,
	}),
});