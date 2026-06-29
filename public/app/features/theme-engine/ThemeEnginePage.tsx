import { useEffect, useState } from 'react';

import { Badge, Button, Card, Icon, Stack, Text } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { updateNavIndex } from 'app/core/reducers/navModel';
import { useDispatch } from 'app/types/store';

interface ThemeInfo {
	id: string;
	name: string;
	isExtra?: boolean;
}

export default function ThemeEnginePage() {
	const dispatch = useDispatch();
	const [currentTheme, setCurrentTheme] = useState<string>('system');
	const [themes, setThemes] = useState<ThemeInfo[]>([]);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'theme-engine',
				text: 'Theme Engine',
				icon: 'palette',
				url: '/theme-engine',
				parentItem: {
					id: 'theme-engine-parent',
					text: 'System',
					children: [
						{
							id: 'theme-engine',
							text: 'Theme Engine',
							icon: 'palette',
							url: '/theme-engine',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		getBackendSrv().get<ThemeInfo[]>('/api/theme-engine/themes').then((t) => {
			setThemes(t);
		}).catch(console.error);
	}, []);

	const handleChange = (themeId: string) => {
		setCurrentTheme(themeId);
	};

	return (
		<Page navId="home">
			<Page.Contents>
				<Stack direction="column" gap={3}>
					<h1>Custom Theme Engine</h1>
					<Card>
						<Card.Heading>Current Theme: {currentTheme}</Card.Heading>
						<Card.Description>
							<Stack direction="row" gap={2} alignItems="center">
								<Icon name="palette" />
								<Text>Choose a theme to personalize your Grafana experience.</Text>
							</Stack>
						</Card.Description>
					</Card>

					<Card>
						<Card.Heading>Select Theme</Card.Heading>
						<Card.Description>
							<Stack direction="row" gap={2} wrap>
								{themes.map((t) => (
									<Button
										key={t.id}
										variant={currentTheme === t.id ? 'primary' : 'secondary'}
										onClick={() => handleChange(t.id)}
									>
										<Stack gap={1} alignItems="center">
											<Icon name="palette" />
											<span>{t.name}</span>
											{t.isExtra && <Badge text="Extra" color="orange" />}
										</Stack>
									</Button>
								))}
							</Stack>
						</Card.Description>
					</Card>

					<Card>
						<Card.Heading>Theme Modes</Card.Heading>
						<Card.Description>
							<Stack direction="row" gap={2}>
								<Button variant="secondary" onClick={() => handleChange('light')}>
									Light Mode
								</Button>
								<Button variant="secondary" onClick={() => handleChange('dark')}>
									Dark Mode
								</Button>
								<Button variant="secondary" onClick={() => handleChange('system')}>
									System Preference
								</Button>
							</Stack>
						</Card.Description>
					</Card>
				</Stack>
			</Page.Contents>
		</Page>
	);
}