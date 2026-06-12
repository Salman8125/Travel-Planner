package cache

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestTTL_getExpires(t *testing.T) {
	c := NewTTL[int](0)
	c.Set("a", 1, time.Millisecond)
	time.Sleep(5 * time.Millisecond)
	_, ok := c.Get("a")
	assert.False(t, ok)
}

func TestTTL_janitorSweepDropsExpired(t *testing.T) {
	c := NewTTL[int](0)
	c.Set("a", 1, time.Millisecond)
	c.Set("b", 2, time.Hour)
	time.Sleep(5 * time.Millisecond)

	assert.Equal(t, 2, c.Len(), "expired entry lingers until swept (lazy)")
	c.sweep(time.Now())
	assert.Equal(t, 1, c.Len(), "sweep removes only the expired entry")

	_, ok := c.Get("b")
	assert.True(t, ok)
}

func TestTTL_deletePrefix(t *testing.T) {
	c := NewTTL[int](0)
	c.Set("loc-1|a", 1, time.Hour)
	c.Set("loc-1|b", 2, time.Hour)
	c.Set("loc-2|a", 3, time.Hour)
	c.DeletePrefix("loc-1|")
	assert.Equal(t, 1, c.Len())
}
