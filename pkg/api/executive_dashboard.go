package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type ExecutiveMetric struct {
	Name  string `json:"name"`
	Value string `json:"value"`
	Trend string `json:"trend"`
}

type ExecutiveDashboardResponse struct {
	Metrics []ExecutiveMetric `json:"metrics"`
}

func (hs *HTTPServer) GetExecutiveDashboard(c *contextmodel.ReqContext) response.Response {
	metrics := []ExecutiveMetric{
		{Name: "Monthly Revenue", Value: "$125K", Trend: "up"},
		{Name: "Active Users", Value: "1,254", Trend: "up"},
		{Name: "Uptime", Value: "99.9%", Trend: "flat"},
	}

	return response.JSON(http.StatusOK, ExecutiveDashboardResponse{Metrics: metrics})
}