import { useEffect, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';

import { Page } from 'app/core/components/Page/Page';
import { Card, Stack, Button } from '@grafana/ui';
import { useDispatch } from 'app/types/store';
import { updateNavIndex } from 'app/core/reducers/navModel';

interface PDFReport {
	id: string;
	dashboard_id: string;
	name: string;
	format: string;
	created: string;
	size: string;
	url: string;
}

export default function PDFReportGeneratorPage() {
	const dispatch = useDispatch();
	const [reports, setReports] = useState<PDFReport[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		dispatch(
			updateNavIndex({
				id: 'pdf-report-generator',
				text: 'PDF Report Generator',
				icon: 'file-download',
				url: '/pdf-report-generator',
				parentItem: {
					id: 'pdf-report-generator-parent',
					text: 'System',
					children: [
						{
							id: 'pdf-report-generator',
							text: 'PDF Reports',
							icon: 'file-download',
							url: '/pdf-report-generator',
						},
					],
				},
			})
		);
	}, [dispatch]);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getBackendSrv().get<{ reports: PDFReport[] }>('/api/reports');
				setReports(result.reports);
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
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<h1>PDF Report Generator</h1>
						<Button variant="primary" icon="file-download">
							Generate New
						</Button>
					</Stack>

					{loading && <Card><Card.Description>Loading...</Card.Description></Card>}

					<Card>
						<Card.Heading>Generated Reports</Card.Heading>
						<Card.Description>
							<Stack direction="column" gap={1}>
								{reports.map((r) => (
									<div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-medium)' }}>
										<span>{r.name}</span>
										<span>{r.format}</span>
										<span>{new Date(r.created).toLocaleString()}</span>
										<span>{r.size}</span>
										<Button size="sm" variant="secondary" icon="download-alt">
											Download
										</Button>
									</div>
								))}
							</Stack>
						</Card.Description>
					</Card>
				</Stack>
			</Page.Contents>
		</Page>
	);
}