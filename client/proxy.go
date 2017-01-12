package main

import "net"

type Proxy struct {
  Source net.Conn
  Destination net.Conn
}

func newProxy(src net.Conn, target *HttPurr) (*Proxy, error) {
  // Open the remote endpoint
  dst, err := net.Dial("tcp", target.Host)
  if err != nil {
    return &Proxy{}, err
  }

  proxy := &Proxy{
    Source: src,
    Destination: dst,
  }

  // Handle the proxying asynchronously
  go proxy.handle(target)
  return proxy, nil
}

func (proxy *Proxy) Close() {
  proxy.Source.Close()
  proxy.Destination.Close()
}

func (proxy *Proxy) handle(target *HttPurr) {
  // Upgrade the HTTP connection
  payload, err := target.Upgrade(proxy.Destination)
  if err != nil {
    proxy.Close()
    return
  }

  // Flush the payload to the source connection
  _, err = proxy.Source.Write(payload)
  if err != nil {
    proxy.Close()
    return
  }

  // Connect the two remote endpoints
  go connect(proxy.Source, proxy.Destination)
  connect(proxy.Destination, proxy.Source)
}

func connect(left net.Conn, right net.Conn) {
  defer right.Close()

  buffer := make([]byte, 4096)
  for {
    // Read max 4096 bytes from the left
    rd, err := left.Read(buffer)
    if err != nil {
      break
    }
    // Write rd bytes to the right
    _, err = right.Write(buffer[:rd])
    if err != nil {
      break
    }
  }
}
