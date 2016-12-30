package main

import (
  "fmt"
  "net"
)

type Server struct {
  Port uint
  Target HttPurr
  IPv4 net.Listener
  IPv6 net.Listener
  Clients []*Proxy
  Mutex *Semaphore
}

type ServerMap map[uint]*Server

func newServer(url string) (*Server, error) {
  // Retrieve the remote host and generate the upgrade request
  target, err := newHttPurr(url)
  if err != nil {
    return &Server{}, err
  }

  // Listen on IPv4 on a randomly assigned port
  v4, err := net.Listen("tcp4", "127.0.0.1:0")
  if err != nil {
    return &Server{}, err
  }

  // Determine the randomly assigned port
  port := uint(v4.Addr().(*net.TCPAddr).Port)

  // Listen on IPv6 on the same port
  v6, err := net.Listen("tcp6", fmt.Sprintf("[::1]:%d", port))
  if err != nil {
    v4.Close()
    return &Server{}, err
  }

  // Create the data structure representing the server
  server := &Server{
    IPv4: v4,
    IPv6: v6,
    Clients: []*Proxy{},
    Target: *target,
    Port: port,
    Mutex: newSemaphore(2),
  }

  // Accept incoming connections separately
  go server.accept()
  return server, nil
}

func (server *Server) Close() {
  // Close the listening servers first
  server.IPv4.Close()
  server.IPv6.Close()

  server.Mutex.Lock(2)
  // Disconnect the connected clients
  for _, client := range server.Clients {
    client.Close()
  }
  server.Clients = []*Proxy{}
  server.Mutex.Unlock(2)

}

func (server *Server) accept() {
  // Separate goroutine for the IPv6 clients
  go func(){
    defer server.Close()

    for {
      // FIXME: create the proxy asynchronously to reduce the size of the critical section
      server.Mutex.Lock(1)

      client, err := server.IPv6.Accept()
      if (err != nil) {
        server.Mutex.Unlock(1)
        break
      }

      proxy, err := newProxy(client, &server.Target)
      if err != nil {
        server.Mutex.Unlock(1)
        break;
      }

      server.Clients = append(server.Clients, proxy)
      server.Mutex.Unlock(1)
    }
  }()

  // Close the server if this method exits
  defer server.Close()

  for {
    server.Mutex.Lock(1)
    // Wait for an incoming connection
    client, err := server.IPv4.Accept()
    if (err != nil) {
      server.Mutex.Unlock(1)
      break
    }
    // Create the proxy from using clien
    proxy, err := newProxy(client, &server.Target)
    if err != nil {
      server.Mutex.Unlock(1)
      break;
    }
    // Append the proxy to the list of clients
    server.Clients = append(server.Clients, proxy)
    server.Mutex.Unlock(1)
  }
}
