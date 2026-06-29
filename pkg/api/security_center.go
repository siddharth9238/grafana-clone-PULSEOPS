package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type SecurityMetric struct {
	Name  string `json:"name"`
	Value string `json:"value"`
	Trend string `json:"trend"`
}

type SecurityEvent struct {
	ID       string `json:"id"`
	Severity string `json:"severity"`
	Event    string `json:"event"`
	SourceIP string `json:"source_ip"`
	Time     string `json:"time"`
	Blocked  bool   `json:"blocked"`
}

type SecurityCenterResponse struct {
	Metrics     []SecurityMetric `json:"metrics"`
	Events      []SecurityEvent  `json:"events"`
	ThreatLevel string           `json:"threat_level"`
}

func (hs *HTTPServer) GetSecurityCenter(c *contextmodel.ReqContext) response.Response {
	metrics := []SecurityMetric{
		{Name: "Failed Logins (24h)", Value: "12", Trend: "down"},
		{Name: "Blocked IPs", Value: "5", Trend: "up"},
	}

	events := []SecurityEvent{
		{ID: "e1", Severity: "high", Event: "Brute force attempt detected", SourceIP: "203.0.113.45", Time: "2026-06-29T14:30:00Z", Blocked: true},
		{ID: "e2", Severity: "medium", Event: "Suspicious API access", SourceIP: "198.51.100.22", Time: "2026-06-29T13:45:00Z", Blocked: false},
	}

	return response.JSON(http.StatusOK, SecurityCenterResponse{
		Metrics: metrics,
		Events:  events,
		ThreatLevel: "medium",
	})
}