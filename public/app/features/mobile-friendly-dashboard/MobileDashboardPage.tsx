import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface MobileDashboard {
	id: string;
	name: string;
	views: number;
}

export default function MobileDashboardPage() {
	const dispatch = useDispatch();
	const [dashboards, setDashboards] = useState<MobileDashboard[]>([]);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'mobile-friendly-dashboard',
				text: 'Mobile Dashboard',
				icon: 'mobile-android',
				url: '/mobile-friendly-dashboard',
				parentItem: {
					id: 'mobile-friendly-dashboard-parent',
					text: 'System',
					children: [
						{
							id: 'mobile-friendly-dashboard',
							text: 'Mobile Dashboard',
							icon: 'mobile-android',
							url: '/mobile-friendly-dashboard',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ dashboards: MobileDashboard[] }>('/api/mobile-dashboard');
				setDashboards(result.dashboards);
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
					<h1>Mobile-Friendly Dashboard</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Stack direction="row" gap={2} wrap>
						{dashboards.map((d) => (
							<Card key={d.id} className={styles.mobileCard}>
								<Card.Heading>
									<Stack gap={1} alignItems="center">
										<Icon name="mobile-android" />
										<span>{d.name}</span>
									</Stack>
								</Card.Heading>
								<Card.Description>
									<span>{d.views} views</span>
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
	mobileCard: css({
		minWidth: 150,
	}),
});