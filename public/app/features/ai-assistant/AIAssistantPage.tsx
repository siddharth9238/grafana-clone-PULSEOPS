import { useEffect, useState, useRef } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Icon, Button, Input, useStyles2, Spinner } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

interface AiMessage {
	role: string;
	content: string;
}

export default function AIAssistantPage() {
	const [messages, setMessages] = useState<AiMessage[]>([
		{ role: 'assistant', content: 'Hello! I am your AI Dashboard Assistant. Ask me about CPU usage, dashboards with most alerts, or memory usage.' },
	]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const styles = useStyles2(getStyles);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const sendMessage = async () => {
		if (!input.trim()) return;
		const userMsg = input.trim();
		setInput('');
		setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
		setLoading(true);
		try {
			const res = await getBackendSrv().post<{ reply: string }>('/api/ai/chat', { message: userMsg });
			setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
		} catch (err) {
			setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Page navId="home">
			<Page.Contents>
				<Stack direction="column" gap={3} height="100%">
					<h1>AI Dashboard Assistant</h1>
					<Card className={styles.chatContainer}>
						<Stack direction="column" gap={2} height="100%">
							<div className={styles.messagesArea}>
								{messages.map((m, idx) => (
									<div key={idx} className={m.role === 'user' ? styles.userBubble : styles.assistantBubble}>
										<Stack gap={1} alignItems="center">
											<Icon name={m.role === 'user' ? 'user' : 'brain'} />
											<span className={styles.roleLabel}>{m.role === 'user' ? 'You' : 'Assistant'}</span>
										</Stack>
										<div className={styles.messageText}>{m.content}</div>
									</div>
								))}
								{loading && (
									<div className={styles.assistantBubble}>
										<Spinner />
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
							<Stack direction="row" gap={1}>
								<Input
									value={input}
									onChange={(e) => setInput(e.currentTarget.value)}
									placeholder="Ask about CPU, dashboards, memory..."
									onKeyDown={(e) => {
										if (e.key === 'Enter') sendMessage();
									}}
								/>
								<Button onClick={sendMessage} icon="arrow-right" variant="primary">
									Send
								</Button>
							</Stack>
						</Stack>
					</Card>
				</Stack>
			</Page.Contents>
		</Page>
	);
}

const getStyles = (theme: GrafanaTheme2) => ({
	chatContainer: css({
		display: 'flex',
		flexDirection: 'column',
		height: '600px',
	}),
	messagesArea: css({
		flexGrow: 1,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: theme.spacing(2),
		padding: theme.spacing(2),
	}),
	userBubble: css({
		alignSelf: 'flex-end',
		backgroundColor: theme.colors.primary.transparent,
		border: `1px solid ${theme.colors.primary.main}`,
		borderRadius: theme.shape.borderRadius(2),
		padding: theme.spacing(1.5),
		maxWidth: '70%',
	}),
	assistantBubble: css({
		alignSelf: 'flex-start',
		backgroundColor: theme.colors.background.secondary,
		borderRadius: theme.shape.borderRadius(2),
		padding: theme.spacing(1.5),
		maxWidth: '70%',
	}),
	roleLabel: css({
		fontSize: theme.typography.size.sm,
		fontWeight: theme.typography.fontWeightBold,
		color: theme.colors.text.secondary,
	}),
	messageText: css({
		fontSize: theme.typography.fontSize,
		color: theme.colors.text.primary,
		marginTop: theme.spacing(0.5),
	}),
});
