package cache

import (
	"strings"
	"sync"
	"time"
)

type entry[V any] struct {
	val V
	exp time.Time
}

type TTL[V any] struct {
	mu       sync.RWMutex
	data     map[string]entry[V]
	stop     chan struct{}
	stopOnce sync.Once
}

func NewTTL[V any](cleanup time.Duration) *TTL[V] {
	c := &TTL[V]{data: make(map[string]entry[V]), stop: make(chan struct{})}
	if cleanup > 0 {
		go c.janitor(cleanup)
	}
	return c
}

func (c *TTL[V]) Get(key string) (V, bool) {
	c.mu.RLock()
	e, ok := c.data[key]
	c.mu.RUnlock()
	var zero V
	if !ok {
		return zero, false
	}
	if time.Now().After(e.exp) {
		c.mu.Lock()
		delete(c.data, key)
		c.mu.Unlock()
		return zero, false
	}
	return e.val, true
}

func (c *TTL[V]) Set(key string, val V, ttl time.Duration) {
	c.mu.Lock()
	c.data[key] = entry[V]{val: val, exp: time.Now().Add(ttl)}
	c.mu.Unlock()
}

func (c *TTL[V]) Delete(key string) {
	c.mu.Lock()
	delete(c.data, key)
	c.mu.Unlock()
}

func (c *TTL[V]) DeletePrefix(prefix string) {
	c.mu.Lock()
	for k := range c.data {
		if strings.HasPrefix(k, prefix) {
			delete(c.data, k)
		}
	}
	c.mu.Unlock()
}

func (c *TTL[V]) Len() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.data)
}

func (c *TTL[V]) Stop() {
	c.stopOnce.Do(func() { close(c.stop) })
}

func (c *TTL[V]) janitor(interval time.Duration) {
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-c.stop:
			return
		case <-t.C:
			c.sweep(time.Now())
		}
	}
}

func (c *TTL[V]) sweep(now time.Time) {
	c.mu.Lock()
	for k, e := range c.data {
		if now.After(e.exp) {
			delete(c.data, k)
		}
	}
	c.mu.Unlock()
}
