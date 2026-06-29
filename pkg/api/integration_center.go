package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type Integration struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	Status   string `json:"status"`
	Channels int    `json:"channels"`
}

type IntegrationCenterResponse struct {
	Integrations []Integration `json:"integrations"`
}

func (hs *HTTPServer) GetIntegrationCenter(c *contextmodel.ReqContext) response.Response {
	integrations := []Integration{
		{ID: "email", Name: "Email", Type: "email", Status: "configured", Channels: 3},
		{ID: "slack", Name: "Slack", Type: "messaging", Status: "active", Channels: 2},
	}

	return response.JSON(http.StatusOK, IntegrationCenterResponse{Integrations: integrations})
}