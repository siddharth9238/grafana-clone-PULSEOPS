package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func BenchmarkGetCostOptimization(b *testing.B) {
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = httptest.NewRequest(http.MethodGet, "/api/cost-optimization", nil)
	}
}