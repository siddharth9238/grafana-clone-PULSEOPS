package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type Alert struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Severity string `json:"severity"`
	Value  string `json:"value"`
	Active bool   `json:"active"`
}

type RootCauseGroup struct {
	ID         string  `json:"id"`
	Title      string  `json:"title"`
	Confidence string  `json:"confidence"`
	Description string `json:"description"`
	Alerts     []Alert `json:"alerts"`
}

type RootCauseResponse struct {
	RootCauseGroups []RootCauseGroup `json:"root_cause_groups"`
	TotalAlerts     int            `json:"total_alerts"`
	GroupedAlerts   int          `json:"grouped_alerts"`
}

func (hs *HTTPServer) GetRootCauseAnalysis(c *contextmodel.ReqContext) response.Response {
	alerts := []Alert{
		{ID: "a1", Name: "CPU Usage High", Severity: "critical", Value: "98%", Active: true},
		{ID: "a2", Name: "Memory Usage High", Severity: "critical", Value: "92%", Active: true},
		{ID: "a3", Name: "Disk I/O High", Severity: "warning", Value: "85%", Active: true},
	}

	groups := []RootCauseGroup{
		{
			ID: "group-1", Title: "Resource Saturation", Confidence: "high",
			Description: "Multiple resource alerts indicate system stress.",
			Alerts: alerts,
		},
	}

	return response.JSON(http.StatusOK, RootCauseResponse{
		RootCauseGroups: groups,
		TotalAlerts:     len(alerts),
		GroupedAlerts:   1,
	})
}