package main

type Tab struct {
  Id uint
  Channel chan nativeRequest
  Servers ServerMap
}

type TabMap map[uint]*Tab

func (tabs TabMap) Fetch(id uint) (tab *Tab) {
  tab, ok := tabs[id]
  if !ok {
    tab = &Tab{
      Id: id,
      Channel: make(chan nativeRequest),
    }
    tabs[id] = tab
    // Handle the requests for the tab asynchronously
    go tab.handle()
  }
  return
}

func (tab *Tab) handle() {
  tab.Servers = make(ServerMap)

  for {
    // Read nativeRequest from the main loop
    msg := <-tab.Channel
    switch msg.Command {
    case "open":
      // Fetch the URL from the nativeRequest
      url, ok := msg.Parameters["url"]
      if !ok {
        errNative(msg.Source, msg.SeqNum, "Open command received without a URL")
        break
      }
      // Create a new server
      server, err := newServer(url.(string))
      if err != nil {
        errNative(msg.Source, msg.SeqNum, err.Error())
        break
      }
      // Store the server in the current tab
      tab.Servers[server.Port] = server
      // Inform the browser about the server
      resNative(msg, "listening", server.Port)

    case "close":
      // Try to retrieve a port number
      pnum, ok := msg.Parameters["port"]
      if !ok {
        errNative(msg.Source, msg.SeqNum, "Close command received without a valid port")
        break
      }
      // Try to fetch a server with the given port
      port := uint(pnum.(float64))
      server, ok := tab.Servers[port]
      if !ok {
        errNative(msg.Source, msg.SeqNum, "There is no active connection on the given port")
        break
      }
      // Close the server
      server.Close()
      // Inform the browser
      resNative(msg, "closed", nil)
      // Deallocate it from the current tab
      delete(tab.Servers, server.Port)

    case "status":
      // Map ports of all servers to a slice
      servers := make([]uint, 0, len(tab.Servers))
      for _, server := range tab.Servers {
        servers = append(servers, server.Port)
      }
      // Inform the browser
      resNative(msg, "running", servers)
    }
  }
}
