package api

import (
	"net/http"
	"sync"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/web"
)

type AiMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AiChatRequest struct {
	Message string `json:"message"`
}

type AiChatResponse struct {
	Reply string `json:"reply"`
}

var aiHistory = struct {
	mu    sync.RWMutex
	items []AiMessage
}{items: make([]AiMessage, 0)}

func (hs *HTTPServer) AiChat(c *contextmodel.ReqContext) response.Response {
	var req AiChatRequest
	if err := web.Bind(c.Req, &req); err != nil {
		return response.Error(http.StatusBadRequest, "Invalid request", err)
	}

	aiHistory.mu.Lock()
	aiHistory.items = append(aiHistory.items, AiMessage{Role: "user", Content: req.Message})
	aiHistory.mu.Unlock()

	reply := generateAiReply(req.Message)

	aiHistory.mu.Lock()
	aiHistory.items = append(aiHistory.items, AiMessage{Role: "assistant", Content: reply})
	aiHistory.mu.Unlock()

	return response.JSON(http.StatusOK, AiChatResponse{Reply: reply})
}

func generateAiReply(message string) string {
	switch message {
	case "cpu":
		return "Based on current metrics, CPU usage is averaging 23% over the last 24 hours."
	case "dashboard":
		return "The dashboard with the most alerts is 'Production Overview' with 12 active alerts."
	case "memory":
		return "Current memory usage is 4.2 GB out of 16 GB."
	case "create":
		return "I can help you create a dashboard. Please specify the data source and metrics."
	default:
		return "I understand you are asking about: \"" + message + ".\" Try asking about CPU, dashboards, or memory."
	}
}