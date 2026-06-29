package notifications

import "time"

type Notification struct {
	ID        int64     `xorm:"pk autoincr 'id'"`
	Type      string    `xorm:"type"`
	Message   string    `xorm:"message"`
	CreatedAt time.Time `xorm:"created"`
	Read      bool      `xorm:"is_read"`
}

func (n Notification) TableName() string {
	return "notification"
}
