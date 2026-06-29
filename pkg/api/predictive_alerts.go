package api

import (
	"net/http"
	"time"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/web"

	"github.com/grafana/grafana/pkg/api/response"
)

type PredictiveAlert struct {
	ID            string `json:"id"`
	Metric        string `json:"metric"`
	CurrentValue  string `json:"current_value"`
	PredictedValue string `json:"predicted_value"`
	ForecastTime  string `json:"forecast_time"`
	Confidence    string `json:"confidence"`
	Severity      string `json:"severity"`
	Recommendation string `json:"recommendation"`
}

type PredictiveAlertsResponse struct {
	Alerts []PredictiveAlert `json:"alerts"`
}

func (hs *HTTPServer) GetPredictiveAlerts(c *contextmodel.ReqContext) response.Response {
	now := time.Now().Add(12 * time.Minute)

	alerts := []PredictiveAlert{
		{
			ID: "pred-1", Metric: "CPU Usage", CurrentValue: "78%",
			PredictedValue: "96%", ForecastTime: now.Format(time.RFC3339),
			Confidence: "high", Severity: "warning",
			Recommendation: "Scale up the server.",
		},
	}

	return response.JSON(http.StatusOK, PredictiveAlertsResponse{Alerts: alerts})
}

func (hs *HTTPServer) GetPredictiveAlert(c *contextmodel.ReqContext) response.Response {
	id := web.Params(c.Req)["id"]
	if len(id) == 0 {
		return response.Error(http.StatusBadRequest, "Invalid alert ID", nil)
	}
	now := time.Now().Add(12 * time.Minute)

	alert := PredictiveAlert{
		ID: id, Metric: "CPU Usage", CurrentValue: "78%",
		PredictedValue: "96%", ForecastTime: now.Format(time.RFC3339),
		Confidence: "high", Severity: "warning",
		Recommendation: "Scale up the server.",
	}

	return response.JSON(http.StatusOK, alert)
}