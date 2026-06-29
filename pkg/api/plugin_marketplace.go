package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type PluginInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Type        string `json:"type"`
	Version     string `json:"version"`
	Downloads   string `json:"downloads"`
	Author      string `json:"author"`
}

type PluginMarketplaceResponse struct {
	Plugins []PluginInfo `json:"plugins"`
}

func (hs *HTTPServer) GetPluginMarketplace(c *contextmodel.ReqContext) response.Response {
	plugins := []PluginInfo{
		{ID: "prometheus", Name: "Prometheus", Type: "datasource", Version: "2.0.0", Downloads: "500K", Author: "Grafana Labs"},
		{ID: "loki", Name: "Loki", Type: "datasource", Version: "2.9.0", Downloads: "300K", Author: "Grafana Labs"},
	}

	return response.JSON(http.StatusOK, PluginMarketplaceResponse{Plugins: plugins})
}