import { useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Dropdown, ToolbarButton, Stack, Card, Badge, Button, Icon, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

interface Notification {
	id: number;
	type: string;
	message: string;
	created_at: string;
	read: boolean;
}

export const NotificationBellButton = () => {
	const [open, setOpen] = useState(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unread, setUnread] = useState(0);
	const styles = useStyles2(getStyles);

	const fetchNotifications = async () => {
		try {
			const res = await getBackendSrv().get<{ notifications: Notification[]; unread_count: number }>('/api/notifications');
			setNotifications(res.notifications);
			setUnread(res.unread_count);
		} catch (err) {
			console.error(err);
		}
	};

	const markRead = async (id: number) => {
		try {
			await getBackendSrv().post(`/api/notifications/${id}/read`, { read: true });
			setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
			setUnread((prev) => Math.max(0, prev - 1));
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<Dropdown
			overlay={() => (
				<Card className={styles.dropdown}>
					<Card.Heading>
						<Stack gap={2} alignItems="center">
							<Icon name="bell" />
							<span>Notifications</span>
							{unread > 0 && <Badge text={`${unread} new`} color="orange" />}
						</Stack>
					</Card.Heading>
					<Stack direction="column" gap={1}>
						{notifications.length === 0 && (
							<div className={styles.empty}>No notifications</div>
						)}
						{notifications.slice(0, 5).map((n) => (
							<div key={n.id} className={n.read ? styles.readItem : styles.unreadItem}>
								<Stack gap={1} alignItems="center">
									<Icon name={n.type === 'success' ? 'check-circle' : n.type === 'warning' ? 'exclamation-triangle' : 'info-circle'} size="sm" />
									<span className={styles.itemText}>{n.message}</span>
								</Stack>
								{!n.read && (
									<Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
										Read
									</Button>
								)}
							</div>
						))}
					</Stack>
					<Button variant="secondary" size="sm" fill="text" onClick={() => {
						window.location.href = '/notification-center';
					}}>
						View all notifications
					</Button>
				</Card>
			)}
			placement="bottom-end"
			onVisibleChange={(visible) => {
				setOpen(visible);
				if (visible) fetchNotifications();
			}}
		>
			<ToolbarButton
				iconOnly
				icon="bell"
				aria-label="Notifications"
				tooltip="Notifications"
				variant={open ? 'active' : 'default'}
			/>
		</Dropdown>
	);
};

const getStyles = (theme: GrafanaTheme2) => ({
	dropdown: css({
		width: '360px',
		maxHeight: '480px',
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'column',
	}),
	list: css({
		overflowY: 'auto',
		flexGrow: 1,
	}),
	empty: css({
		padding: theme.spacing(3),
		textAlign: 'center',
		color: theme.colors.text.secondary,
	}),
	readItem: css({
		opacity: 0.7,
		padding: theme.spacing(1),
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: theme.spacing(1),
	}),
	unreadItem: css({
		padding: theme.spacing(1),
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: theme.spacing(1),
		backgroundColor: theme.colors.primary.transparent,
		borderRadius: theme.shape.borderRadius(1),
	}),
	itemText: css({
		fontSize: theme.typography.size.sm,
		color: theme.colors.text.primary,
		flexGrow: 1,
	}),
});
