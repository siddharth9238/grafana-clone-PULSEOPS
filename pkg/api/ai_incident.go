package api

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type AlertInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	State     string `json:"state"`
	Value     string `json:"value"`
	Severity  string `json:"severity"`
	Duration  string `json:"duration"`
}

type IncidentAnalysis struct {
	IncidentID      string          `json:"incident_id"`
	Summary         string          `json:"summary"`
	RootCause       string          `json:"root_cause"`
	Impact          string          `json:"impact"`
	Recommendations []string        `json:"recommendations"`
	RelatedAlerts   []AlertInfo     `json:"related_alerts"`
	Timeline        []TimelineEvent `json:"timeline"`
}

type TimelineEvent struct {
	Timestamp string `json:"timestamp"`
	Event     string `json:"event"`
}

func (hs *HTTPServer) GetAiIncidentAnalysis(c *contextmodel.ReqContext) response.Response {
	alerts := []AlertInfo{
		{ID: "alert-001", Name: "CPU Usage High", State: "firing", Value: "98%", Severity: "critical", Duration: "18m"},
		{ID: "alert-002", Name: "Memory Usage High", State: "firing", Value: "92%", Severity: "critical", Duration: "15m"},
		{ID: "alert-003", Name: "Disk I/O High", State: "firing", Value: "85%", Severity: "warning", Duration: "12m"},
		{ID: "alert-004", Name: "Request Latency", State: "firing", Value: "2.5s", Severity: "warning", Duration: "22m"},
	}

	var criticalCount int
	for _, a := range alerts {
		if a.Severity == "critical" {
			criticalCount++
		}
	}

	cpuHigh := false
	memHigh := false
	for _, a := range alerts {
		if strings.Contains(strings.ToLower(a.Name), "cpu") {
			cpuHigh = true
		}
		if strings.Contains(strings.ToLower(a.Name), "memory") {
			memHigh = true
		}
	}

	summary := "System under stress: "
	if cpuHigh && memHigh {
		summary += "CPU and memory usage elevated. "
	}
	if cpuHigh {
		summary += "CPU spike detected. "
	}
	if memHigh {
		summary += "Memory pressure detected. "
	}
	summary += fmt.Sprintf("%d active alerts.", len(alerts))

	var rootCause string
	if cpuHigh && memHigh {
		rootCause = "Likely root cause: Memory pressure causing CPU thrashing with increased load."
	} else if cpuHigh {
		rootCause = "CPU spike likely caused by increased query load."
	} else {
		rootCause = "Resource constraints detected."
	}

	var impact string
	if criticalCount >= 2 {
		impact = "Critical: Multiple system resources affected."
	} else {
		impact = "High: Alert conditions present."
	}

	return response.JSON(http.StatusOK, IncidentAnalysis{
		IncidentID:      "incident-" + time.Now().Format("20060102150405"),
		Summary:         summary,
		RootCause:       rootCause,
		Impact:          impact,
		Recommendations: []string{"Check recent deployments", "Scale server resources", "Review slow queries"},
		RelatedAlerts:   alerts,
		Timeline: []TimelineEvent{
			{Timestamp: "2026-06-29T13:47:00Z", Event: "CPU alert fired"},
			{Timestamp: "2026-06-29T13:50:00Z", Event: "Memory alert fired"},
		},
	})
}