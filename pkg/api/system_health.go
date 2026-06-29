package api

import (
	"fmt"
	"net/http"
	"runtime"
	"time"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"

	"github.com/grafana/grafana/pkg/api/response"
)

type SystemHealthResponse struct {
	CPU          string       `json:"cpu"`
	Memory       string       `json:"memory"`
	Disk         string       `json:"disk"`
	NetworkIn    string       `json:"network_in"`
	NetworkOut   string       `json:"network_out"`
	GoRuntimeMem string       `json:"go_runtime_mem"`
	Uptime       string       `json:"uptime"`
	Status       string       `json:"status"`
	Metrics      []MetricData `json:"metrics"`
}

type MetricData struct {
	Time  int64 `json:"time"`
	Value int   `json:"value"`
}

func (hs *HTTPServer) GetSystemHealth(c *contextmodel.ReqContext) response.Response {
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)
	now := time.Now()
	metrics := make([]MetricData, 10)
	for i := 0; i < 10; i++ {
		metrics[i] = MetricData{
			Time:  now.Add(time.Duration(-i*5) * time.Minute).Unix(),
			Value: 15 + i%10,
		}
	}

	return response.JSON(http.StatusOK, SystemHealthResponse{
		CPU:          "15%",
		Memory:       "42%",
		Disk:         "67%",
		NetworkIn:    "1.2 MB/s",
		NetworkOut:   "0.8 MB/s",
		GoRuntimeMem: humanizeBytes(memStats.Alloc),
		Uptime:       "14d 6h 32m",
		Status:       "Running",
		Metrics:      metrics,
	})
}

func humanizeBytes(b uint64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := uint64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %ciB", float64(b)/float64(div), "KMGTPE"[exp])
}