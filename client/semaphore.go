package main

import "sync"

type Semaphore struct {
  Channel chan uint
  Mutex sync.Mutex
}

func newSemaphore(size uint) *Semaphore {
  return &Semaphore{
    Channel: make(chan uint, size),
    Mutex: sync.Mutex{},
  }
}

func (s *Semaphore) Lock(size uint) {
  s.Mutex.Lock()
  for i:=uint(0); i<size; i++ {
    s.Channel <- i
  }
  s.Mutex.Unlock()
}

func (s *Semaphore) Unlock(size uint) {
  for i:=uint(0); i<size; i++ {
    <- s.Channel
  }
}
