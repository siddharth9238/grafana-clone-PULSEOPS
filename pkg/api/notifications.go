package api

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/grafana/grafana/pkg/notifications"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/web"

	"github.com/grafana/grafana/pkg/api/response"
)

var notificationStore *notifications.Store
var initStoreOnce sync.Once

func getNotificationStore() *notifications.Store {
	initStoreOnce.Do(func() {
		store, err := notifications.NewStore("file:notifications.db?cache=shared")
		if err != nil {
			panic(err)
		}
		notificationStore = store
	})
	return notificationStore
}

type NotificationDTO struct {
	ID        int64  `json:"id"`
	Type      string `json:"type"`
	Message   string `json:"message"`
	CreatedAt string `json:"created_at"`
	Read      bool   `json:"read"`
}

type NotificationResponse struct {
	Notifications []NotificationDTO `json:"notifications"`
	UnreadCount   int64             `json:"unread_count"`
}

func (hs *HTTPServer) GetNotifications(c *contextmodel.ReqContext) response.Response {
	store := getNotificationStore()
	notifs, err := store.List(c.Req.Context())
	if err != nil {
		return response.Error(http.StatusInternalServerError, "Failed to get notifications", err)
	}

	dtos := make([]NotificationDTO, len(notifs))
	for i, n := range notifs {
		dtos[i] = NotificationDTO{
			ID:        n.ID,
			Type:      n.Type,
			Message:   n.Message,
			CreatedAt: n.CreatedAt.Format(http.TimeFormat),
			Read:      n.Read,
		}
	}

	unread, err := store.GetUnreadCount(c.Req.Context())
	if err != nil {
		unread = 0
	}

	return response.JSON(http.StatusOK, NotificationResponse{
		Notifications: dtos,
		UnreadCount:   unread,
	})
}

func (hs *HTTPServer) MarkNotificationRead(c *contextmodel.ReqContext) response.Response {
	id := web.Params(c.Req)["id"]

	var nid int64
	if _, err := fmt.Sscanf(id, "%d", &nid); err != nil {
		return response.Error(http.StatusBadRequest, "Invalid id", err)
	}

	getNotificationStore().MarkAsRead(c.Req.Context(), nid)
	return response.JSON(http.StatusOK, map[string]string{"status": "ok"})
}