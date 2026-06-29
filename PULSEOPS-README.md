# PulseOps - Enterprise Monitoring & AI Operations Platform

**A powerful open-source monitoring platform with AI-powered analytics**

[![Go Report](https://goreportcard.com/badge/github.com/grafana/grafana)](https://goreportcard.com)
[![License](https://img.shields.io/github/license/grafana/grafana)](https://github.com/grafana/grafana/blob/main/LICENSE)

> Based on Grafana - retains original Apache 2.0 license with attribution

## Features

### Enterprise Monitoring
- **System Monitor Pro** - Real-time system metrics with CPU, memory, disk, network monitoring
- **Notification Center** - Centralized alert management with read/unread status
- **API Performance Analytics** - Request tracking, error rates, and endpoint performance
- **User Activity Dashboard** - User analytics and login tracking

### AI-Powered Operations (AI Ops)
- **AI Dashboard Assistant** - Natural language queries about system metrics
- **AI Incident Analyzer** - Automated root cause analysis with recommendations
- **AI Dashboard Generator** - Generate monitoring dashboards from natural language
- **Predictive Monitoring** - Forecast metric breaches before they happen
- **AI Operations Center** - Centralized AI operations management

### Cost & Capacity Management
- **Cost Optimization Dashboard** - Multi-cloud cost tracking with savings recommendations
- **Capacity Planning** - Resource forecasting and scaling recommendations

### Infrastructure Monitoring
- **Multi-Cluster Monitoring** - Kubernetes cluster health overview
- **Network Monitoring** - Interface statistics and top talkers analysis

### Developer Tools
- **Intelligent Log Search** - Fast log filtering and search
- **PDF Report Generator** - Automated report generation
- **Plugin Marketplace** - Plugin discovery and management

### Integrations
- **Integration Center** - Email, Slack, PagerDuty integration hub
- **Custom Theme Engine** - Personalized dashboard themes

## Quick Start

### Docker Deployment

```bash
docker run -d \
  --name pulseops \
  -p 3000:3000 \
  -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
  ghcr.io/pulseops/pulseops:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  pulseops:
    image: ghcr.io/pulseops/pulseops:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - pulseops-data:/var/lib/pulseops
volumes:
  pulseops-data:
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PulseOps Platform                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)         │  Backend (Go)       │
│  ┌──────────────────────────────┐    │  ┌──────────────┐   │
│  │  Feature Pages              │    │  │  API Handlers│   │
│  │  - System Monitor           │◄──►│  │  - Metrics   │   │
│  │  - AI Assistant             │    │  │  - Alerts    │   │
│  │  - Cost Optimization        │    │  │  - Reports   │   │
│  └──────────────────────────────┘    │  └──────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/system-health` | GET | System metrics (CPU, memory, disk) |
| `/api/user-activity` | GET | User analytics data |
| `/api/performance/analytics` | GET | API performance metrics |
| `/api/notifications` | GET | Notification list |
| `/api/ai/chat` | POST | AI assistant chat |
| `/api/ai/incident-analysis` | GET | AI incident analysis |
| `/api/ai/generate-dashboard` | POST | Generate dashboard from prompt |
| `/api/cost-optimization` | GET | Cloud cost data |
| `/api/predictive-alerts` | GET | Predictive alerts |
| `/api/security-center` | GET | Security metrics and events |
| `/api/reports` | GET | PDF report list |

## Development

### Prerequisites
- Go 1.22+
- Node.js 18+
- Yarn 1.22+

### Build Backend

```bash
go build ./pkg/...
```

### Run Frontend

```bash
yarn start
```

## License

Based on Grafana - retains original Apache 2.0 license with attribution.