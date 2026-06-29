import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Input, Button, Badge, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface LogEntry {
	timestamp: string;
	level: string;
	source: string;
	message: string;
}

interface LogSearchResponse {
	logs: LogEntry[];
	total: number;
	query_time: string;
}

export default function IntelligentLogSearchPage() {
	const dispatch = useDispatch();
	const [query, setQuery] = useState('');
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<LogSearchResponse | null>(null);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'intelligent-log-search',
				text: 'Intelligent Log Search',
				icon: 'search-minus',
				url: '/intelligent-log-search',
				parentItem: {
					id: 'intelligent-log-search-parent',
					text: 'System',
					children: [
						{
							id: 'intelligent-log-search',
							text: 'Log Search',
							icon: 'search-minus',
							url: '/intelligent-log-search',
						},
					],
				},
			})
		);
	}, [dispatch]);

	const searchLogs = async () => {
		if (!query.trim()) return;
		setLoading(true);
		try {
			const result = await getBackendSrv().get<LogSearchResponse>(`/api/logs/search?q=${encodeURIComponent(query)}`);
			setLogs(result.logs);
			setResult(result);
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
					<h1>Intelligent Log Search</h1>

					<Card>
						<Card.Heading>Search Query</Card.Heading>
						<Card.Description>
							<Stack direction="row" gap={2}>
								<Input
									value={query}
									onChange={(e) => setQuery(e.currentTarget.value)}
									placeholder="Search logs... e.g., error, timeout"
									onKeyDown={(e) => e.key === 'Enter' && searchLogs()}
									width={40}
								/>
								<Button onClick={searchLogs} icon="search" variant="primary" disabled={!query.trim() || loading}>
									Search
								</Button>
							</Stack>
							<Stack direction="row" gap={1} wrap>
								{['error', 'warning', 'info', 'database', 'api'].map((q) => (
									<Button key={q} size="sm" variant="secondary" onClick={() => setQuery(q)}>
										{q}
									</Button>
								))}
							</Stack>
						</Card.Description>
					</Card>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{result && (
						<Card>
							<Card.Heading>
								<Stack direction="row" gap={2} alignItems="center">
									Results: {result.total} logs
									<span className={styles.queryTime}>({result.query_time})</span>
								</Stack>
							</Card.Heading>
							<Card.Description>
								<Stack direction="column" gap={1}>
									{logs.map((log, idx) => (
										<div key={idx} style={{ display: 'flex', gap: '8px', padding: '4px', borderBottom: '1px solid var(--border-medium)' }}>
											<Badge text={log.level} color={getLevelColor(log.level)} />
											<span>{new Date(log.timestamp).toLocaleTimeString()}</span>
											<span>{log.source}</span>
											<span>{log.message}</span>
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

const getLevelColor = (level: string) => {
	switch (level) {
		case 'error': return 'red';
		case 'warning': return 'orange';
		default: return 'green';
	}
};

const getStyles = (theme: GrafanaTheme2) => ({
	queryTime: css({
		fontSize: theme.typography.size.xs,
		color: theme.colors.text.secondary,
	}),
});