# PulseOps Deployment Guide

## Docker

### Quick Start

```bash
docker run -d \
  --name pulseops \
  -p 3000:3000 \
  -e "GF_SECURITY_ADMIN_USER=admin" \
  -e "GF_SECURITY_ADMIN_PASSWORD=admin" \
  pulseops/platform:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  pulseops:
    image: pulseops/platform:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin}
      - GF_DATABASE_TYPE=sqlite3
    volumes:
      - pulseops-data:/var/lib/pulseops
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  pulseops-data:
```

## Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pulseops
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pulseops
  template:
    metadata:
      labels:
        app: pulseops
    spec:
      containers:
      - name: pulseops
        image: pulseops/platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: pulseops-secret
              key: admin-password
---
apiVersion: v1
kind: Service
metadata:
  name: pulseops
spec:
  selector:
    app: pulseops
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Linux Deployment

```bash
# Download binary
wget https://github.com/pulseops/pulseops/releases/latest/download/pulseops-linux-amd64.tar.gz
tar xzf pulseops-linux-amd64.tar.gz
cd pulseops

# Run as systemd service
sudo tee /etc/systemd/system/pulseops.service << EOF
[Unit]
Description=PulseOps Monitoring
After=network.target

[Service]
User=pulseops
ExecStart=/opt/pulseops/bin/grafana-server
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable pulseops
sudo systemctl start pulseops
```

## Cloud Deployment

### AWS ECS

```bash
aws ecs create-cluster --cluster pulseops
aws ecs register-task-definition --cli-input-json file://ecs-task.json
aws ecs run-task --cluster pulseops --task-definition pulseops
```

### Azure Container Instances

```bash
az container create \
  --resource-group pulseops-rg \
  --name pulseops \
  --image pulseops/platform:latest \
  --dns-name-label pulseops-demo \
  --ports 3000
```

### GCP Cloud Run

```bash
gcloud run deploy pulseops \
  --image pulseops/platform:latest \
  --port 3000 \
  --allow-unauthenticated
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GF_SECURITY_ADMIN_PASSWORD` | Admin password | `admin` |
| `GF_DATABASE_TYPE` | Database type (sqlite3/postgres/mysql) | `sqlite3` |
| `GF_LOG_LEVEL` | Log level | `info` |
| `GF_SERVER_DOMAIN` | Server domain | `localhost` |