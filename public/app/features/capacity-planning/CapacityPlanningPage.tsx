import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon } from '@grafana/ui';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface CapacityPlan {
	resource: string;
	current: string;
	forecast: string;
	need: string;
}

export default function CapacityPlanningPage() {
	const dispatch = useDispatch();
	const [plans, setPlans] = useState<CapacityPlan[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'capacity-planning',
				text: 'Capacity Planning',
				icon: 'calculator-alt',
				url: '/capacity-planning',
				parentItem: {
					id: 'capacity-planning-parent',
					text: 'System',
					children: [
						{
							id: 'capacity-planning',
							text: 'Capacity Planning',
							icon: 'calculator-alt',
							url: '/capacity-planning',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ plans: CapacityPlan[] }>('/api/capacity-planning');
				setPlans(result.plans);
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
					<h1>Capacity Planning</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Stack direction="column" gap={2}>
						{plans.map((p) => (
							<Card key={p.resource}>
								<Card.Heading>
									<Stack gap={2} alignItems="center">
										<Icon name="calculator-alt" />
										<span>{p.resource}</span>
									</Stack>
								</Card.Heading>
								<Card.Description>
									<Stack direction="row" gap={4}>
										<Stack direction="column">
											<span>Current: {p.current}</span>
										</Stack>
										<Stack direction="column">
											<span>Forecast: {p.forecast}</span>
										</Stack>
										<Stack direction="column">
											<span>{p.need}</span>
										</Stack>
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