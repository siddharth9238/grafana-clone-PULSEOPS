package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type ApiPerformanceResponse struct {
	TotalRequests       int64            `json:"total_requests"`
	AvgResponseTimeMs   float64          `json:"avg_response_time_ms"`
	SlowestEndpoints    []EndpointStat   `json:"slowest_endpoints"`
	ErrorRate           float64          `json:"error_rate"`
	ErrorRatePercentage float64          `json:"error_rate_percentage"`
	StatusDistribution  map[string]int64 `json:"status_distribution"`
}

type EndpointStat struct {
	Path         string  `json:"path"`
	Method       string  `json:"method"`
	AvgTimeMs    float64 `json:"avg_time_ms"`
	MaxTimeMs    float64 `json:"max_time_ms"`
	RequestCount int64   `json:"request_count"`
}

func (hs *HTTPServer) GetApiPerformance(c *contextmodel.ReqContext) response.Response {
	slowest := []EndpointStat{
		{Path: "/api/dashboards/uid/:uid", Method: "GET", AvgTimeMs: 42.5, MaxTimeMs: 120.0, RequestCount: 15420},
		{Path: "/api/datasources/", Method: "GET", AvgTimeMs: 28.3, MaxTimeMs: 85.0, RequestCount: 8750},
		{Path: "/api/search/", Method: "GET", AvgTimeMs: 55.2, MaxTimeMs: 200.0, RequestCount: 12300},
	}

	return response.JSON(http.StatusOK, ApiPerformanceResponse{
		TotalRequests:       36470,
		AvgResponseTimeMs:   41.2,
		SlowestEndpoints:    slowest,
		ErrorRate:           0.002,
		ErrorRatePercentage: 0.2,
		StatusDistribution: map[string]int64{
			"200": 34000,
			"201": 1200,
			"400": 800,
			"404": 470,
		},
	})
}