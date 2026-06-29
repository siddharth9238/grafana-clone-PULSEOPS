package api

import (
	"net/http"
	"sync"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

var (
	costCache     *CostOptimizationResponse
	costCacheOnce sync.Once
)

type CloudProviderCost struct {
	Provider string  `json:"provider"`
	Cost     float64 `json:"cost"`
	Unit     string  `json:"unit"`
	Trend    string  `json:"trend"`
}

type CostRecommendation struct {
	ID          string  `json:"id"`
	Resource    string  `json:"resource"`
	Region      string  `json:"region"`
	Savings     float64 `json:"savings"`
	Description string  `json:"description"`
	Priority    string  `json:"priority"`
}

type IdleResource struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Name     string `json:"name"`
	Age      string `json:"age"`
	Cost     string `json:"cost"`
	LastUsed string `json:"last_used"`
}

type CostOptimizationResponse struct {
	Providers       []CloudProviderCost    `json:"providers"`
	TotalCost       float64              `json:"total_cost"`
	IdleResources   []IdleResource       `json:"idle_resources"`
	Recommendations []CostRecommendation `json:"recommendations"`
}

func (hs *HTTPServer) GetCostOptimization(c *contextmodel.ReqContext) response.Response {
	costCacheOnce.Do(func() {
		providers := []CloudProviderCost{
			{Provider: "AWS", Cost: 1250.50, Unit: "USD/month", Trend: "up"},
			{Provider: "Azure", Cost: 890.25, Unit: "USD/month", Trend: "down"},
			{Provider: "GCP", Cost: 650.75, Unit: "USD/month", Trend: "flat"},
		}

		idleResources := []IdleResource{
			{ID: "r1", Type: "EC2", Name: "web-server-01", Age: "14 days", Cost: "$75/month", LastUsed: "2026-06-15"},
			{ID: "r2", Type: "RDS", Name: "dev-database", Age: "7 days", Cost: "$45/month", LastUsed: "2026-06-22"},
		}

		recommendations := []CostRecommendation{
			{ID: "rec-1", Resource: "EC2 web-server-01", Region: "us-east-1", Savings: 75, Description: "Instance is underutilized.", Priority: "high"},
		}

		totalCost := 0.0
		for _, p := range providers {
			totalCost += p.Cost
		}

		costCache = &CostOptimizationResponse{
			Providers:       providers,
			TotalCost:       totalCost,
			IdleResources:   idleResources,
			Recommendations: recommendations,
		}
	})

	return response.JSON(http.StatusOK, costCache)
}