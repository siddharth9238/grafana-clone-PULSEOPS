package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type ThemeInfo struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	IsExtra bool   `json:"is_extra"`
}

func (hs *HTTPServer) GetThemes(c *contextmodel.ReqContext) response.Response {
	return response.JSON(http.StatusOK, []ThemeInfo{
		{ID: "system", Name: "System Preference", IsExtra: false},
		{ID: "light", Name: "Light", IsExtra: false},
		{ID: "dark", Name: "Dark", IsExtra: false},
		{ID: "blue", Name: "Blue Theme", IsExtra: true},
		{ID: "tron", Name: "Tron", IsExtra: true},
		{ID: "gloom", Name: "Gloom", IsExtra: true},
	})
}