import { useEffect, useState } from 'react';

import { GrafanaTheme2, IconName } from '@grafana/data';
import { css } from '@emotion/css';
import { Card, Icon, Stack, useStyles2 } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { updateNavIndex } from 'app/core/reducers/navModel';
import { useDispatch } from 'app/types/store';

interface UserActivity {
	user_id: number;
	user_name: string;
	email: string;
	last_seen_at: string;
	active: boolean;
	login_count: number;
	dashboard_count: number;
	org_name: string;
}

interface UserActivityResponse {
	active_users: Array<UserActivity>;
	inactive_users: Array<UserActivity>;
	total_users: number;
	active_count: number;
	inactive_count: number;
	daily_logins: Array<{ date: string; count: number }>;
}

export default function UserActivityAnalyticsPage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<UserActivityResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'user-activity',
				text: 'User Activity Analytics',
				icon: 'users-alt',
				url: '/user-activity',
				parentItem: {
					id: 'user-activity-parent',
					text: 'System',
					children: [
						{
							id: 'user-activity',
							text: 'User Activity Analytics',
							icon: 'users-alt',
							url: '/user-activity',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<UserActivityResponse>('/api/user-activity');
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
					<h1>User Activity Analytics</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							<Stack direction="row" gap={2} wrap>
								<StatCard title="Total Users" value={data.total_users} icon="users-alt" />
								<StatCard title="Active Users" value={data.active_count} icon="check-square" />
								<StatCard title="Inactive Users" value={data.inactive_count} icon="clock-nine" />
							</Stack>

							<Card>
								<Card.Heading>Active Users ({data.active_count})</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.active_users.map((u) => (
											<div key={u.user_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
												<span>{u.user_name}</span>
												<span>{u.email}</span>
												<span>{new Date(u.last_seen_at).toLocaleString()}</span>
												<span>{u.login_count}</span>
												<span>{u.dashboard_count}</span>
											</div>
										))}
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Inactive Users ({data.inactive_count})</Card.Heading>
								<Card.Description>
									<Stack direction="column" gap={1}>
										{data.inactive_users.map((u) => (
											<div key={u.user_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
												<span>{u.user_name}</span>
												<span>{u.email}</span>
												<span>{new Date(u.last_seen_at).toLocaleDateString()}</span>
												<span>{u.login_count}</span>
												<span>{u.dashboard_count}</span>
											</div>
										))}
									</Stack>
								</Card.Description>
							</Card>

							<Card>
								<Card.Heading>Daily Login Trends</Card.Heading>
								<Card.Description>
									<Stack direction="row" gap={1} alignItems="flex-end">
										{data.daily_logins.map((d) => (
											<Bar key={d.date} count={d.count} date={d.date} styles={styles} />
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

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: IconName }) => (
	<Stack direction="row" gap={2} alignItems="center">
		<Icon name={icon} />
		<Stack direction="column">
			<span>{title}</span>
			<strong>{value}</strong>
		</Stack>
	</Stack>
);

const Bar = ({ count, date, styles }: { count: number; date: string; styles: ReturnType<typeof getStyles> }) => (
	<Stack direction="column" alignItems="center" gap={0.5}>
		<div className={styles.bar} style={{ height: `${Math.min(count * 2, 100)}%` }} />
		<span className={styles.barLabel}>{date.slice(5)}</span>
		<span className={styles.barCount}>{count}</span>
	</Stack>
);

const getStyles = (theme: GrafanaTheme2) => ({
	bar: css({
		width: '24px',
		backgroundColor: theme.colors.primary.main,
		borderRadius: theme.shape.borderRadius(1),
		minHeight: '4px',
	}),
	barLabel: css({
		fontSize: theme.typography.size.xs,
		color: theme.colors.text.secondary,
	}),
	barCount: css({
		fontSize: theme.typography.size.xs,
		color: theme.colors.text.primary,
		fontWeight: theme.typography.fontWeightBold,
	}),
});