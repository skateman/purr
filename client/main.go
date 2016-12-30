package main

import (
  "fmt"
  "os"
)

func main() {
  tabs := make(TabMap)

  // Listen continously for incoming commands from the STDIN
  for {
    recv, err := recvNative()
    if err != nil {
      fmt.Fprintln(os.Stderr, "Error: ", err)
      os.Exit(0)
    }

    // FIXME: Remove this line from the production code
    fmt.Fprintln(os.Stderr, "From:", recv.Source, "Command:", recv.Command, "Parameters:", recv.Parameters)

    if recv.Command == "exit" {
      // Break out form the main loop and exit the program
      fmt.Fprintln(os.Stderr, "Exit command received from", recv.Source)
      break
    } else {
      if recv.Source == 0 {
        fmt.Fprintln(os.Stderr, "Received invalid native message without a source field")
        break
      }
      // Forward the incoming command to a channel handler
      tab := tabs.Fetch(recv.Source)
      tab.Channel <- recv
    }
  }
}

func debug(str string) {
  fmt.Fprintln(os.Stderr, str)
}
