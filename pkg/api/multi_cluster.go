package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type ClusterInfo struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Region string `json:"region"`
	Status string `json:"status"`
	Nodes  int    `json:"nodes"`
	Pods   int    `json:"pods"`
	CPU    string `json:"cpu"`
	Memory string `json:"memory"`
}

type MultiClusterResponse struct {
	Clusters    []ClusterInfo `json:"clusters"`
	TotalClusters int        `json:"total_clusters"`
	Healthy     int         `json:"healthy"`
	Unhealthy   int         `json:"unhealthy"`
}

func (hs *HTTPServer) GetMultiClusterMonitoring(c *contextmodel.ReqContext) response.Response {
	clusters := []ClusterInfo{
		{ID: "c1", Name: "Production", Region: "us-east-1", Status: "healthy", Nodes: 5, Pods: 42, CPU: "45%", Memory: "62%"},
		{ID: "c2", Name: "Staging", Region: "us-west-2", Status: "healthy", Nodes: 3, Pods: 18, CPU: "23%", Memory: "38%"},
	}

	return response.JSON(http.StatusOK, MultiClusterResponse{
		Clusters: clusters,
		TotalClusters: len(clusters),
		Healthy: 2,
		Unhealthy: 0,
	})
}