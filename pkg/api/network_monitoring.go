package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type NetworkInterface struct {
	Name      string `json:"name"`
	Status    string `json:"status"`
	Speed     string `json:"speed"`
	InTraffic string `json:"in_traffic"`
	OutTraffic string `json:"out_traffic"`
}

type NetworkTopTalker struct {
	Source   string `json:"source"`
	Dest     string `json:"destination"`
	Bytes    string `json:"bytes"`
	Protocol string `json:"protocol"`
}

type NetworkMonitoringResponse struct {
	Interfaces []NetworkInterface   `json:"interfaces"`
	TopTalkers []NetworkTopTalker `json:"top_talkers"`
	TotalBytes string             `json:"total_bytes"`
}

func (hs *HTTPServer) GetNetworkMonitoring(c *contextmodel.ReqContext) response.Response {
	interfaces := []NetworkInterface{
		{Name: "eth0", Status: "up", Speed: "1 Gbps", InTraffic: "1.2 MB/s", OutTraffic: "0.8 MB/s"},
	}

	return response.JSON(http.StatusOK, NetworkMonitoringResponse{
		Interfaces: interfaces,
		TopTalkers: []NetworkTopTalker{},
		TotalBytes: "1.2 TB",
	})
}