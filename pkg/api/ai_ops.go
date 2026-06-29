package api

import (
	"net/http"
	"time"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type AIOperation struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Status   string `json:"status"`
	LastRun  string `json:"last_run"`
	Duration string `json:"duration"`
}

func (hs *HTTPServer) GetAIOperationsCenter(c *contextmodel.ReqContext) response.Response {
	ops := []AIOperation{
		{ID: "op-1", Type: "Auto-scaling", Status: "running", LastRun: time.Now().Format(time.RFC3339), Duration: "2m"},
		{ID: "op-2", Type: "Anomaly Detection", Status: "completed", LastRun: "2026-06-29T14:00:00Z", Duration: "5m"},
	}

	return response.JSON(http.StatusOK, map[string]interface{}{"operations": ops})
}