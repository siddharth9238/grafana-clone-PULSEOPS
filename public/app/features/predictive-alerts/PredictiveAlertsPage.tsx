import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, Badge, useStyles2, Button, Tooltip } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface PredictiveAlert {
	id: string;
	metric: string;
	current_value: string;
	predicted_value: string;
	forecast_time: string;
	confidence: string;
	severity: string;
	recommendation: string;
}

export default function PredictiveAlertsPage() {
	const dispatch = useDispatch();
	const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'predictive-alerts',
				text: 'Predictive Alerts',
				icon: 'heart-rate',
				url: '/predictive-alerts',
				parentItem: {
					id: 'predictive-alerts-parent',
					text: 'AI Tools',
					children: [
						{
							id: 'predictive-alerts',
							text: 'Predictive Alerts',
							icon: 'heart-rate',
							url: '/predictive-alerts',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ alerts: PredictiveAlert[] }>('/api/predictive-alerts');
				setAlerts(result.alerts);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	const formatTime = (time: string) => {
		return new Date(time).toLocaleString();
	};

	return (
		<Page navId="home">
			<Page.Contents>
				<Stack direction="column" gap={3}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<h1>Predictive Alerts</h1>
						<Button variant="secondary" icon="sync" onClick={() => window.location.reload()}>
							Refresh
						</Button>
					</Stack>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{alerts.length === 0 && !loading && (
						<Card>
							<Card.Description>No predictive alerts at this time.</Card.Description>
						</Card>
					)}

					{alerts.map((alert) => (
						<Card key={alert.id}>
							<Card.Heading>
								<Stack direction="row" gap={2} alignItems="center">
									<Icon name="heart-rate" />
									<span>{alert.metric} will breach threshold</span>
									<Badge text={alert.severity} color={alert.severity === 'warning' ? 'orange' : 'blue'} />
								</Stack>
							</Card.Heading>
							<Card.Description>
								<Stack direction="column" gap={1}>
									<Stack direction="row" gap={4}>
										<Stack direction="column">
											<span>Current</span>
											<span className={styles.currentValue}>{alert.current_value}</span>
										</Stack>
										<Stack direction="column">
											<span>Predicted</span>
											<span className={styles.predictedValue}>{alert.predicted_value}</span>
										</Stack>
										<Stack direction="column">
											<span>Forecast</span>
											<span className={styles.forecastTime}>{formatTime(alert.forecast_time)}</span>
										</Stack>
										<Stack direction="column">
											<span>Confidence</span>
											<Badge text={alert.confidence} color={alert.confidence === 'high' ? 'green' : 'orange'} />
										</Stack>
									</Stack>
									<Tooltip content={alert.recommendation} placement="top">
										<span className={styles.recommendation}>{alert.recommendation}</span>
									</Tooltip>
								</Stack>
							</Card.Description>
						</Card>
					))}
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const getStyles = (theme: GrafanaTheme2) => ({
	currentValue: css({
		fontSize: theme.typography.h4.fontSize,
		fontWeight: theme.typography.fontWeightBold,
	}),
	predictedValue: css({
		fontSize: theme.typography.h4.fontSize,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.warning.main,
	}),
	forecastTime: css({
		fontSize: theme.typography.size.sm,
	}),
	recommendation: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.secondary,
		fontStyle: 'italic',
		maxWidth: '500px',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	}),
});