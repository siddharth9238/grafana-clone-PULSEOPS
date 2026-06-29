package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type LogEntry struct {
	Timestamp string `json:"timestamp"`
	Level     string `json:"level"`
	Source    string `json:"source"`
	Message   string `json:"message"`
}

type LogSearchResponse struct {
	Logs   []LogEntry `json:"logs"`
	Total  int        `json:"total"`
	QueryTime string  `json:"query_time"`
}

func (hs *HTTPServer) SearchLogs(c *contextmodel.ReqContext) response.Response {
	query := c.Query("q")
	if len(query) > 100 {
		return response.Error(http.StatusBadRequest, "Query too long", nil)
	}

	logs := []LogEntry{
		{Timestamp: "2026-06-29T14:30:00Z", Level: "error", Source: "api", Message: "Connection timeout"},
		{Timestamp: "2026-06-29T14:25:00Z", Level: "info", Source: "dashboard", Message: "Dashboard loaded"},
	}

	return response.JSON(http.StatusOK, LogSearchResponse{
		Logs:      logs,
		Total:     len(logs),
		QueryTime: "42ms",
	})
}