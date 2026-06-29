import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, Badge, useStyles2, Button } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface Alert {
	id: string;
	name: string;
	severity: string;
	value: string;
	active: boolean;
}

interface RootCauseGroup {
	id: string;
	title: string;
	confidence: string;
	description: string;
	alerts: Alert[];
}

interface RootCauseResponse {
	root_cause_groups: RootCauseGroup[];
	total_alerts: number;
	grouped_alerts: number;
}

export default function RootCauseAnalysisPage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<RootCauseResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'root-cause-analysis',
				text: 'Root Cause Analysis',
				icon: 'sitemap',
				url: '/root-cause-analysis',
				parentItem: {
					id: 'root-cause-analysis-parent',
					text: 'AI Tools',
					children: [
						{
							id: 'root-cause-analysis',
							text: 'Root Cause Analysis',
							icon: 'sitemap',
							url: '/root-cause-analysis',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<RootCauseResponse>('/api/root-cause-analysis');
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
						<h1>Root Cause Analysis</h1>
						<Button variant="secondary" icon="sync" onClick={() => window.location.reload()}>
							Refresh
						</Button>
					</Stack>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							<Stack direction="row" gap={2} wrap>
								<Card>
									<Card.Heading>Total Alerts</Card.Heading>
									<Card.Description>
										<span className={styles.statValue}>{data.total_alerts}</span>
									</Card.Description>
								</Card>
								<Card>
									<Card.Heading>Grouped</Card.Heading>
									<Card.Description>
										<span className={styles.statValue}>{data.grouped_alerts}</span>
									</Card.Description>
								</Card>
							</Stack>

							{data.root_cause_groups.map((group) => (
								<Card key={group.id}>
									<Card.Heading>
										<Stack gap={2} alignItems="center">
											<Icon name="sitemap" />
											<span>{group.title}</span>
											<Badge text={group.confidence} color={group.confidence === 'high' ? 'red' : 'orange'} />
										</Stack>
									</Card.Heading>
									<Card.Description>
										<Stack direction="column" gap={2}>
											<span className={styles.description}>{group.description}</span>
											<Stack direction="column" gap={1}>
												{group.alerts.map((alert) => (
													<div key={alert.id} className={styles.alertRow}>
														<Stack direction="row" gap={2} alignItems="center">
															<Icon name="exclamation-triangle" />
															<span>{alert.name}</span>
															<Badge text={alert.value} color={alert.severity === 'critical' ? 'red' : 'orange'} />
														</Stack>
													</div>
												))}
											</Stack>
										</Stack>
									</Card.Description>
								</Card>
							))}
						</>
					)}
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const getStyles = (theme: GrafanaTheme2) => ({
	statValue: css({
		fontSize: theme.typography.h2.fontSize,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.primary.main,
	}),
	description: css({
		fontSize: theme.typography.fontSize,
		color: theme.colors.text.primary,
		lineHeight: 1.5,
	}),
	alertRow: css({
		padding: theme.spacing(0.5),
		paddingLeft: theme.spacing(1),
		backgroundColor: theme.colors.background.secondary,
		borderRadius: theme.shape.borderRadius(1),
	}),
});