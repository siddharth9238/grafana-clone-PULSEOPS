package api

import (
	"net/http"
	"time"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/api/response"
)

type UserActivity struct {
	UserID        int64     `json:"user_id"`
	UserName      string    `json:"user_name"`
	Email         string    `json:"email"`
	LastSeenAt    time.Time `json:"last_seen_at"`
	Active        bool      `json:"active"`
	LoginCount    int64     `json:"login_count"`
	DashboardCount int64    `json:"dashboard_count"`
	OrgName       string    `json:"org_name"`
}

type UserActivityResponse struct {
	ActiveUsers   []UserActivity `json:"active_users"`
	InactiveUsers []UserActivity `json:"inactive_users"`
	TotalUsers    int64          `json:"total_users"`
	ActiveCount   int64          `json:"active_count"`
	InactiveCount int64          `json:"inactive_count"`
	DailyLogins   []LoginStat    `json:"daily_logins"`
}

type LoginStat struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

func (hs *HTTPServer) GetUserActivity(c *contextmodel.ReqContext) response.Response {
	now := time.Now()
	users := []UserActivity{
		{UserID: 1, UserName: "admin", Email: "admin@example.com", LastSeenAt: now.Add(-5 * time.Minute), Active: true, LoginCount: 42, DashboardCount: 15, OrgName: "Main Org"},
		{UserID: 2, UserName: "john.doe", Email: "john@example.com", LastSeenAt: now.Add(-2 * time.Hour), Active: true, LoginCount: 18, DashboardCount: 7, OrgName: "Main Org"},
		{UserID: 3, UserName: "inactive.user", Email: "inactive@example.com", LastSeenAt: now.Add(-14 * 24 * time.Hour), Active: false, LoginCount: 3, DashboardCount: 1, OrgName: "Main Org"},
	}

	dailyLogins := []LoginStat{
		{Date: now.AddDate(0, 0, -2).Format("2006-01-02"), Count: 44},
		{Date: now.AddDate(0, 0, -1).Format("2006-01-02"), Count: 58},
		{Date: now.Format("2006-01-02"), Count: 39},
	}

	activeUsers := make([]UserActivity, 0)
	inactiveUsers := make([]UserActivity, 0)
	for _, u := range users {
		if u.Active {
			activeUsers = append(activeUsers, u)
		} else {
			inactiveUsers = append(inactiveUsers, u)
		}
	}

	return response.JSON(http.StatusOK, UserActivityResponse{
		ActiveUsers:   activeUsers,
		InactiveUsers: inactiveUsers,
		TotalUsers:    int64(len(users)),
		ActiveCount:   int64(len(activeUsers)),
		InactiveCount: int64(len(inactiveUsers)),
		DailyLogins:   dailyLogins,
	})
}