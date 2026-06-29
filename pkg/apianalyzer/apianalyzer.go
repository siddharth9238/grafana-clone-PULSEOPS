package apianalyzer

import (
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/grafana/grafana/pkg/web"
)

type Metric struct {
	Endpoint string
	Method   string
	Status   int
	Duration time.Duration
}

type EndpointStats struct {
	Endpoint string
	Method   string
	AvgMs    float64
	MaxMs    float64
	Count    int64
}

type endpointEntry struct {
	totalMs int64
	maxMs   float64
	count   int64
}

var (
	metrics    []Metric
	metricsMu  sync.RWMutex
	maxMetrics = 10000
)

func Record(metric Metric) {
	metricsMu.Lock()
	defer metricsMu.Unlock()

	metrics = append(metrics, metric)
	if len(metrics) > maxMetrics {
		metrics = metrics[len(metrics)-maxMetrics:]
	}
}

func GetStats() (total int64, avgMs float64, slowest []EndpointStats, errorRate float64, statusDist map[string]int64) {
	metricsMu.RLock()
	defer metricsMu.RUnlock()

	if len(metrics) == 0 {
		return 0, 0, nil, 0, nil
	}

	var totalDuration int64
	errorCount := int64(0)
	endpoints := make(map[string]*endpointEntry)
	statusDist = make(map[string]int64)

	for _, m := range metrics {
		totalDuration += m.Duration.Milliseconds()
		if m.Status >= 400 {
			errorCount++
		}

		key := m.Method + " " + m.Endpoint
		if entry, ok := endpoints[key]; ok {
			entry.totalMs += m.Duration.Milliseconds()
			entry.count++
			ms := m.Duration.Seconds() * 1000
			if ms > entry.maxMs {
				entry.maxMs = ms
			}
		} else {
			endpoints[key] = &endpointEntry{
				totalMs: m.Duration.Milliseconds(),
				maxMs:   m.Duration.Seconds() * 1000,
				count:   1,
			}
		}

		statusDist[fmt.Sprintf("%d", m.Status)]++
	}

	total = int64(len(metrics))
	avgMs = float64(totalDuration) / float64(total)
	errorRate = float64(errorCount) / float64(total)

	slowest = make([]EndpointStats, 0, len(endpoints))
	for key, entry := range endpoints {
		method, endpoint, _ := strings.Cut(key, " ")
		slowest = append(slowest, EndpointStats{
			Endpoint: endpoint,
			Method:   method,
			AvgMs:    float64(entry.totalMs) / float64(entry.count),
			MaxMs:    entry.maxMs,
			Count:    entry.count,
		})
	}
	sort.Slice(slowest, func(i, j int) bool {
		return slowest[i].MaxMs > slowest[j].MaxMs
	})

	return
}

func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/api/") {
			next.ServeHTTP(w, r)
			return
		}

		start := time.Now()
		rw := web.Rw(w, r)
		next.ServeHTTP(rw, r)

		Record(Metric{
			Endpoint: r.URL.Path,
			Method:   r.Method,
			Status:   rw.Status(),
			Duration: time.Since(start),
		})
	})
}
