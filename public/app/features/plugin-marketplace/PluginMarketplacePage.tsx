import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, useStyles2, Badge } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface PluginInfo {
	id: string;
	name: string;
	type: string;
	version: string;
	downloads: string;
	rating: string;
	author: string;
	description: string;
}

export default function PluginMarketplacePage() {
	const dispatch = useDispatch();
	const [plugins, setPlugins] = useState<PluginInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'plugin-marketplace',
				text: 'Plugin Marketplace',
				icon: 'plug',
				url: '/plugin-marketplace',
				parentItem: {
					id: 'plugin-marketplace-parent',
					text: 'Admin',
					children: [
						{
							id: 'plugin-marketplace',
							text: 'Plugin Marketplace',
							icon: 'plug',
							url: '/plugin-marketplace',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ plugins: PluginInfo[] }>('/api/plugin-marketplace');
				setPlugins(result.plugins);
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
					<h1>Plugin Marketplace</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Stack direction="row" gap={2} wrap>
						{plugins.map((p) => (
							<Card key={p.id} className={styles.pluginCard}>
								<Card.Heading>
									<Stack direction="row" gap={1} alignItems="center">
										<Icon name="plug" />
										<span>{p.name}</span>
									</Stack>
								</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										<span>{p.description}</span>
										<span>v{p.version} by {p.author}</span>
										<Stack direction="row" gap={2}>
											<Badge text={p.downloads} color="green" />
											<Badge text={"★ " + p.rating} color="orange" />
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

const getStyles = (theme: GrafanaTheme2) => ({
	pluginCard: css({
		minWidth: 200,
		maxWidth: 250,
	}),
});