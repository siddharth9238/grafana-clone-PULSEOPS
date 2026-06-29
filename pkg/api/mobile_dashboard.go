package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type MobileDashboard struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Views int    `json:"views"`
}

func (hs *HTTPServer) GetMobileDashboard(c *contextmodel.ReqContext) response.Response {
	dashboards := []MobileDashboard{
		{ID: "m1", Name: "System Overview", Views: 1250},
		{ID: "m2", Name: "Alerts", Views: 890},
	}

	return response.JSON(http.StatusOK, map[string]interface{}{"dashboards": dashboards})
}