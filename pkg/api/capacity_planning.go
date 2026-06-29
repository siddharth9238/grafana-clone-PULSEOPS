package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type CapacityPlan struct {
	Resource string `json:"resource"`
	Current  string `json:"current"`
	Forecast string `json:"forecast"`
	Need     string `json:"need"`
}

func (hs *HTTPServer) GetCapacityPlanning(c *contextmodel.ReqContext) response.Response {
	plans := []CapacityPlan{
		{Resource: "CPU Cores", Current: "8 cores", Forecast: "12 cores", Need: "Scale in 30 days"},
		{Resource: "Memory", Current: "16 GB", Forecast: "32 GB", Need: "Scale in 45 days"},
	}

	return response.JSON(http.StatusOK, map[string]interface{}{"plans": plans})
}