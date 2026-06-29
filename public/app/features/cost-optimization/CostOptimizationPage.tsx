import { useEffect, useState } from 'react';

import { GrafanaTheme2, IconName } from '@grafana/data';
import { css } from '@emotion/css';
import { Badge, Card, Icon, Stack, useStyles2 } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { updateNavIndex } from 'app/core/reducers/navModel';
import { useDispatch } from 'app/types/store';

interface CloudProviderCost {
	provider: string;
	cost: number;
	unit: string;
	trend: string;
}

interface IdleResource {
	id: string;
	type: string;
	name: string;
	age: string;
	cost: string;
	last_used: string;
}

interface CostRecommendation {
	id: string;
	resource: string;
	region: string;
	savings: number;
	description: string;
	priority: string;
}

interface CostOptimizationData {
	providers: CloudProviderCost[];
	total_cost: number;
	idle_resources: IdleResource[];
	recommendations: CostRecommendation[];
}

export default function CostOptimizationPage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<CostOptimizationData | null>(null);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'cost-optimization',
				text: 'Cost Optimization',
				icon: 'dollar-alt',
				url: '/cost-optimization',
				parentItem: {
					id: 'cost-optimization-parent',
					text: 'System',
					children: [
						{
							id: 'cost-optimization',
							text: 'Cost Optimization',
							icon: 'dollar-alt',
							url: '/cost-optimization',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<CostOptimizationData>('/api/cost-optimization');
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
					<h1>Cost Optimization Dashboard</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							<Card>
								<Card.Heading>Total Monthly Cost</Card.Heading>
								<Card.Description>
									<span className={styles.totalCost}>${data.total_cost.toFixed(2)}</span>
									<span className={styles.costUnit}>/month</span>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Cloud Provider Breakdown</Card.Heading>
								<Card.Description>
									<Stack direction="row" gap={2} wrap>
										{data.providers.map((p) => (
											<ProviderCard key={p.provider} provider={p} styles={styles} />
										))}
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Idle Resources ({data.idle_resources.length})</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.idle_resources.map((r) => (
											<div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
												<Stack gap={1}>
													<Icon name={getResourceIcon(r.type)} />
													<span>{r.type}: {r.name}</span>
												</Stack>
												<span>{r.age}</span>
												<span>{r.cost}</span>
												<span>{r.last_used}</span>
											</div>
										))}
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Savings Recommendations (${data.recommendations.reduce((sum, r) => sum + r.savings, 0)}/month potential)</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1.5}>
										{data.recommendations.map((r) => (
											<div key={r.id} className={styles.recommendationCard}>
												<Stack direction="row" justifyContent="space-between" alignItems="center">
													<Stack direction="row" gap={2} alignItems="center">
														<Badge text={r.priority} color={r.priority === 'high' ? 'red' : 'orange'} />
														<span>{r.resource}</span>
													</Stack>
													<span className={styles.savings}>~${r.savings}/mo</span>
												</Stack>
												<span className={styles.recDescription}>{r.description}</span>
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

const ProviderCard = ({ provider, styles }: { provider: CloudProviderCost; styles: ReturnType<typeof getStyles> }) => (
	<div className={styles.providerCard}>
		<Stack direction="column" alignItems="center" gap={0.5}>
			<span className={styles.providerName}>{provider.provider}</span>
			<span className={styles.providerCost}>${provider.cost.toFixed(2)}</span>
			<Icon name={getTrendIcon(provider.trend)} />
		</Stack>
	</div>
);

const getResourceIcon = (type: string): IconName => {
	switch (type) {
		case 'EC2': return 'kubernetes';
		case 'RDS': return 'database';
		case 'EBS': return 'database';
		case 'S3': return 'folder';
		default: return 'cube';
	}
};

const getTrendIcon = (trend: string): IconName => {
	switch (trend) {
		case 'up': return 'arrow-up';
		case 'down': return 'arrow-down';
		default: return 'sync';
	}
};

const getStyles = (theme: GrafanaTheme2) => ({
	totalCost: css({
		fontSize: theme.typography.h1.fontSize,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.primary.main,
	}),
	costUnit: css({
		fontSize: theme.typography.h4.fontSize,
		color: theme.colors.text.secondary,
	}),
	providerCard: css({
		padding: theme.spacing(2),
		border: `1px solid ${theme.colors.border.medium}`,
		borderRadius: theme.shape.borderRadius(2),
		minWidth: '120px',
		textAlign: 'center',
	}),
	providerName: css({
		fontSize: theme.typography.fontSize,
		fontWeight: theme.typography.fontWeightBold,
	}),
	providerCost: css({
		fontSize: theme.typography.h4.fontSize,
	}),
	recommendationCard: css({
		padding: theme.spacing(1.5),
		borderLeft: `3px solid ${theme.colors.warning.main}`,
		backgroundColor: theme.colors.background.secondary,
		borderRadius: theme.shape.borderRadius(1),
	}),
	savings: css({
		fontSize: theme.typography.size.sm,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.success.main,
	}),
	recDescription: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.secondary,
		marginTop: theme.spacing(0.5),
	}),
});