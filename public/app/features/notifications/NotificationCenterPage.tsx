import { useEffect, useState } from 'react';

import { GrafanaTheme2, IconName } from '@grafana/data';
import { css } from '@emotion/css';
import { Badge, Button, Card, Icon, Stack, useStyles2 } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { updateNavIndex } from 'app/core/reducers/navModel';
import { useDispatch } from 'app/types/store';

interface Notification {
	id: number;
	type: string;
	message: string;
	created_at: string;
	read: boolean;
}

interface NotificationResponse {
	notifications: Array<Notification>;
	unread_count: number;
}

export default function NotificationCenterPage() {
	const dispatch = useDispatch();
	const [data, setData] = useState<NotificationResponse | null>(null);
	const [loading, setLoading] = useState(true);

	const styles = useStyles2(getStyles);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'notification-center',
				text: 'Notification Center',
				icon: 'bell',
				url: '/notification-center',
				parentItem: {
					id: 'notification-center-parent',
					text: 'System',
					children: [
						{
							id: 'notification-center',
							text: 'Notification Center',
							icon: 'bell',
							url: '/notification-center',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<NotificationResponse>('/api/notifications');
				setData(result);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
		const interval = window.setInterval(fetchData, 8000);
		return () => clearInterval(interval);
	}, []);

	const markRead = async (id: number) => {
		try {
			await getBackendSrv().post(`/api/notifications/${id}/read`, { read: true });
			setData((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
					unread_count: prev.notifications.filter((n) => !n.read && n.id !== id).length,
				};
			});
		} catch (err) {
			console.error(err);
		}
	};

	const getIcon = (type: string): IconName => {
		switch (type) {
			case 'success': return 'check-circle';
			case 'warning': return 'exclamation-triangle';
			case 'error': return 'times-circle';
			default: return 'info-circle';
		}
	};

	const getBadgeColor = (type: string) => {
		switch (type) {
			case 'success': return 'green';
			case 'warning': return 'orange';
			case 'error': return 'red';
			default: return 'blue';
		}
	};

	return (
		<Page navId="home">
			<Page.Contents>
				<Stack direction="column" gap={3}>
					<h1>Notification Center</h1>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					{data && (
						<>
							{data.unread_count > 0 && (
								<Card>
									<Card.Heading>Unread Notifications</Card.Heading>
									<Card.Description>
										<span className={styles.unreadBadge}>{data.unread_count} unread</span>
									</Card.Description>
								</Card>
							)}

							<Stack direction="column" gap={2}>
								{data.notifications.map((n) => (
									<Card key={n.id} className={n.read ? styles.readCard : styles.unreadCard}>
										<Card.Heading>
											<Stack gap={2} alignItems="center">
												<Icon name={getIcon(n.type)} />
												<span className={styles.notifTitle}>{n.type.toUpperCase()}</span>
												<Badge text={n.type} color={getBadgeColor(n.type)} />
											</Stack>
										</Card.Heading>
										<Card.Description>
											<div className={styles.notifMessage}>{n.message}</div>
											<Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
												<span className={styles.notifTime}>{new Date(n.created_at).toLocaleString()}</span>
												{!n.read && (
													<Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
														Mark as read
													</Button>
												)}
											</Stack>
										</Card.Description>
									</Card>
								))}
							</Stack>
						</>
					)}
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const getStyles = (theme: GrafanaTheme2) => ({
	unreadBadge: css({
		fontSize: theme.typography.size.lg,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.warning.main,
	}),
	unreadCard: css({
		borderLeft: `3px solid ${theme.colors.primary.main}`,
	}),
	readCard: css({
		opacity: 0.7,
	}),
	notifTitle: css({
		fontWeight: theme.typography.fontWeightBold,
	}),
	notifMessage: css({
		fontSize: theme.typography.size.md,
		color: theme.colors.text.primary,
		margin: theme.spacing(1, 0),
	}),
	notifTime: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.secondary,
	}),
});
