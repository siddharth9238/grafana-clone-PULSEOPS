package notifications

import (
	"context"
	"time"

	_ "github.com/grafana/grafana/pkg/util/sqlite"
	"github.com/grafana/grafana/pkg/util/xorm"
)

type Store struct {
	engine *xorm.Engine
}

func NewStore(dataSource string) (*Store, error) {
	engine, err := xorm.NewEngine("sqlite3", dataSource)
	if err != nil {
		return nil, err
	}

	store := &Store{engine: engine}
	if err := store.migrate(); err != nil {
		return nil, err
	}
	return store, nil
}

func (s *Store) migrate() error {
	return s.engine.Sync(new(Notification))
}

func (s *Store) Create(ctx context.Context, n *Notification) error {
	session := s.engine.NewSession()
	defer session.Close()
	session = session.Context(ctx)

	n.CreatedAt = time.Now()
	n.Read = false
	_, err := session.Insert(n)
	return err
}

func (s *Store) List(ctx context.Context) ([]Notification, error) {
	session := s.engine.NewSession()
	defer session.Close()
	session = session.Context(ctx)

	var notifications []Notification
	err := session.Desc("created").Find(&notifications)
	return notifications, err
}

func (s *Store) GetUnreadCount(ctx context.Context) (int64, error) {
	session := s.engine.NewSession()
	defer session.Close()
	session = session.Context(ctx)

	count, err := session.Where("is_read = 0").Count(new(Notification))
	return count, err
}

func (s *Store) MarkAsRead(ctx context.Context, id int64) error {
	session := s.engine.NewSession()
	defer session.Close()
	session = session.Context(ctx)

	_, err := session.ID(id).Update(&Notification{Read: true})
	return err
}

func (s *Store) Delete(ctx context.Context, id int64) error {
	session := s.engine.NewSession()
	defer session.Close()
	session = session.Context(ctx)

	_, err := session.ID(id).Delete(new(Notification))
	return err
}
