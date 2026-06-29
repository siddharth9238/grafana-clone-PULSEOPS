import { useEffect, useState } from 'react';

import { GrafanaTheme2, IconName } from '@grafana/data';
import { css } from '@emotion/css';
import { Badge, Button, Card, Icon, Stack, Spinner, Input, useStyles2 } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { updateNavIndex } from 'app/core/reducers/navModel';
import { useDispatch } from 'app/types/store';

interface DashboardPanel {
	id: number;
	title: string;
	type: string;
	datasource: string;
	field: string;
	unit: string;
}

interface AiDashboardResponse {
	dashboard_id: string;
	dashboard_name: string;
	panels: Array<DashboardPanel>;
	query: string;
}

const EXAMPLE_PROMPTS = [
	"Create a Kubernetes monitoring dashboard",
	"Create a PostgreSQL monitoring dashboard",
	"Create a Redis monitoring dashboard",
	"Create a Docker monitoring dashboard",
];

export default function AIDashboardGeneratorPage() {
	const dispatch = useDispatch();
	const [prompt, setPrompt] = useState('');
	const [dashboard, setDashboard] = useState<AiDashboardResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'ai-dashboard-generator',
				text: 'AI Dashboard Generator',
				icon: 'ai',
				url: '/ai-dashboard-generator',
				parentItem: {
					id: 'ai-dashboard-generator-parent',
					text: 'AI Tools',
					children: [
						{
							id: 'ai-dashboard-generator',
							text: 'Dashboard Generator',
							icon: 'ai',
							url: '/ai-dashboard-generator',
						},
					],
				},
			})
		);
	}, [dispatch]);

	const generateDashboard = async () => {
		if (!prompt.trim()) return;
		setLoading(true);
		try {
			const result = await getBackendSrv().post<AiDashboardResponse>('/api/ai/generate-dashboard', { prompt });
			setDashboard(result);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Page navId="home">
			<Page.Contents>
				<Stack direction="column" gap={3}>
					<h1>AI Dashboard Generator</h1>

					<Card>
						<Card.Heading>Create Dashboard from Natural Language</Card.Heading>
						<Card.Description>
							<Stack direction="row" gap={2}>
								<Input
									value={prompt}
									onChange={(e) => setPrompt(e.currentTarget.value)}
									placeholder="e.g., Create a Kubernetes monitoring dashboard"
									onKeyDown={(e) => e.key === 'Enter' && generateDashboard()}
									width={40}
								/>
								<Button onClick={generateDashboard} icon="ai" variant="primary" disabled={!prompt.trim() || loading}>
									{loading ? <Spinner /> : 'Generate'}
								</Button>
							</Stack>
							<Stack direction="row" gap={1} wrap>
								{EXAMPLE_PROMPTS.map((p, idx) => (
									<Button key={idx} size="sm" variant="secondary" onClick={() => setPrompt(p)}>
										{p.replace('Create a ', '').replace(' monitoring dashboard', '')}
									</Button>
								))}
							</Stack>
						</Card.Description>
					</Card>

					{dashboard && (
						<Card>
							<Card.Heading>
								<Stack gap={2} alignItems="center">
									<Icon name="dashboard" />
									<span>{dashboard.dashboard_name}</span>
									<Badge text={dashboard.dashboard_id} color="blue" />
								</Stack>
							</Card.Heading>
							<Card.Description>
								<Stack direction="column" gap={2}>
									{dashboard.panels.map((panel) => (
										<div key={panel.id} className={styles.panelCard}>
											<Stack direction="row" gap={2} alignItems="center" justifyContent="space-between">
												<Stack direction="row" gap={2} alignItems="center">
													<Icon name={getPanelIcon(panel.type)} />
													<span>{panel.title}</span>
												</Stack>
												<Stack direction="row" gap={2} alignItems="center">
													<Badge text={panel.datasource} color="green" />
													<span className={styles.panelField}>{panel.field}</span>
												</Stack>
											</Stack>
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

const getPanelIcon = (type: string): IconName => {
		switch (type) {
			case 'timeseries': return 'chart-line';
			case 'gauge': return 'chart-line';
			case 'stat': return 'calculator-alt';
			default: return 'panel-add';
		}
	};

const getStyles = (theme: GrafanaTheme2) => ({
	panelCard: css({
		padding: theme.spacing(1.5),
		border: `1px solid ${theme.colors.border.medium}`,
		borderRadius: theme.shape.borderRadius(1),
	}),
	panelField: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.secondary,
		fontFamily: 'monospace',
	}),
});