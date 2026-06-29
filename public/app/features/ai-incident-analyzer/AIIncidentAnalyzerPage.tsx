import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, Badge, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface AlertInfo {
	id: string;
	name: string;
	state: string;
	value: string;
	severity: string;
	duration: string;
}

interface TimelineEvent {
	timestamp: string;
	event: string;
}

interface IncidentAnalysis {
	incident_id: string;
	summary: string;
	root_cause: string;
	impact: string;
	recommendations: string[];
	related_alerts: AlertInfo[];
	timeline: TimelineEvent[];
}

export default function AIIncidentAnalyzerPage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<IncidentAnalysis | null>(null);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'ai-incident-analyzer',
				text: 'AI Incident Analyzer',
				icon: 'brain',
				url: '/ai-incident-analyzer',
				parentItem: {
					id: 'ai-incident-analyzer-parent',
					text: 'AI Tools',
					children: [
						{
							id: 'ai-incident-analyzer',
							text: 'Incident Analyzer',
							icon: 'brain',
							url: '/ai-incident-analyzer',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<IncidentAnalysis>('/api/ai/incident-analysis');
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
					<h1>AI Incident Analyzer</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							<Card>
								<Card.Heading>
									<Stack gap={2} alignItems="center">
										<Icon name="brain" />
										<span>Incident {data.incident_id}</span>
									</Stack>
								</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										<span className={styles.summary}>{data.summary}</span>
										<span className={styles.impact}>{data.impact}</span>
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>AI Root Cause Analysis</Card.Heading>
								<Card.Description>
									<span className={styles.rootCause}>{data.root_cause}</span>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Recommendations</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.recommendations.map((r, idx) => (
											<Stack key={idx} direction="row" gap={1} alignItems="center">
												<Icon name="arrow-right" />
												<span>{r}</span>
											</Stack>
										))}
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Related Alerts ({data.related_alerts.length})</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.related_alerts.map((a) => (
											<AlertCard key={a.id} alert={a} styles={styles} />
										))}
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Incident Timeline</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.timeline.map((t, idx) => (
											<div key={idx} className={styles.timelineEvent}>
												<span className={styles.timelineTime}>{t.timestamp.replace('T', ' ').replace('Z', '')}</span>
												<Icon name="circle" />
												<span>{t.event}</span>
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

const AlertCard = ({ alert, styles }: { alert: AlertInfo; styles: ReturnType<typeof getStyles> }) => (
	<div className={styles.alertCard}>
		<Stack direction="row" gap={2} alignItems="center" justifyContent="space-between">
			<Stack direction="row" gap={2} alignItems="center">
				<span>{alert.name}</span>
				<Badge text={alert.severity} color={alert.severity === 'critical' ? 'red' : 'orange'} />
			</Stack>
			<Stack direction="row" gap={2} alignItems="center">
				<span>{alert.value}</span>
				<span className={styles.duration}>({alert.duration})</span>
			</Stack>
		</Stack>
	</div>
);

const getStyles = (theme: GrafanaTheme2) => ({
	summary: css({
		fontSize: theme.typography.fontSize,
		color: theme.colors.text.primary,
	}),
	impact: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.warning.main,
		fontWeight: theme.typography.fontWeightBold,
	}),
	rootCause: css({
		fontSize: theme.typography.fontSize,
		color: theme.colors.text.primary,
		lineHeight: 1.6,
	}),
	alertCard: css({
		padding: theme.spacing(1),
		border: `1px solid ${theme.colors.border.medium}`,
		borderRadius: theme.shape.borderRadius(1),
	}),
	duration: css({
		fontSize: theme.typography.size.xs,
		color: theme.colors.text.secondary,
	}),
	timelineEvent: css({
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing(1),
		padding: theme.spacing(0.5),
	}),
	timelineTime: css({
		fontSize: theme.typography.size.xs,
		color: theme.colors.text.secondary,
		fontFamily: 'monospace',
	}),
});