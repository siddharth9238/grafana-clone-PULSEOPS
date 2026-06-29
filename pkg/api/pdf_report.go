package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type PDFReport struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Format  string `json:"format"`
	Created string `json:"created"`
	Size    string `json:"size"`
	URL     string `json:"url"`
}

type PDFReportResponse struct {
	Reports []PDFReport `json:"reports"`
}

func (hs *HTTPServer) GetPDFReports(c *contextmodel.ReqContext) response.Response {
	reports := []PDFReport{
		{ID: "r1", Name: "System Health Report", Format: "PDF", Created: "2026-06-29T13:00:00Z", Size: "2.3 MB", URL: "/api/reports/r1.pdf"},
	}

	return response.JSON(http.StatusOK, PDFReportResponse{Reports: reports})
}

func (hs *HTTPServer) GeneratePDFReport(c *contextmodel.ReqContext) response.Response {
	return response.JSON(http.StatusOK, map[string]string{
		"status": "generated",
		"url":    "/api/reports/report.pdf",
	})
}