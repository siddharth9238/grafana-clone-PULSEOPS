package api

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/web"
)

type AiDashboardRequest struct {
	Prompt string `json:"prompt"`
}

type DashboardPanel struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Type        string `json:"type"`
	Datasource  string `json:"datasource"`
	Field       string `json:"field"`
	Unit        string `json:"unit"`
}

type AiDashboardResponse struct {
	DashboardID   string          `json:"dashboard_id"`
	DashboardName string          `json:"dashboard_name"`
	Panels        []DashboardPanel `json:"panels"`
	Query         string          `json:"query"`
}

func (hs *HTTPServer) GenerateDashboard(c *contextmodel.ReqContext) response.Response {
	var req AiDashboardRequest
	if err := web.Bind(c.Req, &req); err != nil {
		return response.Error(http.StatusBadRequest, "Invalid request", err)
	}

	if len(req.Prompt) == 0 {
		return response.Error(http.StatusBadRequest, "Prompt is required", nil)
	}
	if len(req.Prompt) > 500 {
		return response.Error(http.StatusBadRequest, "Prompt too long", nil)
	}

	result := generateDashboardFromPrompt(req.Prompt)
	return response.JSON(http.StatusOK, result)
}

func generateDashboardFromPrompt(prompt string) AiDashboardResponse {
	promptLower := strings.ToLower(prompt)

	var dashboardName string
	var panels []DashboardPanel

	switch {
	case strings.Contains(promptLower, "kubernetes") || strings.Contains(promptLower, "k8s"):
		dashboardName = "Kubernetes Monitoring"
		panels = []DashboardPanel{
			{ID: 1, Title: "CPU Usage", Type: "timeseries", Datasource: "prometheus", Field: "rate(node_cpu_seconds_total[5m])", Unit: "percent"},
		}
	case strings.Contains(promptLower, "postgresql") || strings.Contains(promptLower, "postgres"):
		dashboardName = "PostgreSQL Monitoring"
		panels = []DashboardPanel{
			{ID: 1, Title: "Active Connections", Type: "timeseries", Datasource: "postgres", Field: "pg_stat_activity_count", Unit: "short"},
		}
	default:
		dashboardName = "General Metrics Dashboard"
		panels = []DashboardPanel{
			{ID: 1, Title: "CPU Usage", Type: "timeseries", Datasource: "prometheus", Field: "rate(cpu_seconds_total[5m])", Unit: "percent"},
		}
	}

	return AiDashboardResponse{
		DashboardID:   fmt.Sprintf("dashboard-%d", time.Now().Unix()%900000+100000),
		DashboardName: dashboardName,
		Panels:        panels,
		Query:         fmt.Sprintf("Generated from prompt: \"%s\"", prompt),
	}
}