package main

import (
  "encoding/binary"
  "encoding/json"
  "os"
)

type nativeRequest struct {
  Source uint `json:"src"`
  SeqNum uint `json:"seq"`
  Command string `json:"cmd"`
  Parameters map[string]interface{} `json:"args"`
}

type nativeResponse struct {
  Destination uint `json:"dst"`
  SeqNum uint `json:"seq"`
  Status string `json:"status`
  Details interface{} `json:"args"`
}

type nativeError struct {
  Destination uint `json:"dst"`
  SeqNum uint `json:"seq"`
  Message string `json:"error"`
}

// Receive a message from the Native Messaging API
func recvNative() (message nativeRequest, err error) {
  // Determine the length of the incoming message
  var length uint32
  err = binary.Read(os.Stdin, binary.LittleEndian, &length)
  if err != nil || length == 0 {
    return
  }

  // Read the message based on the previously determined length
  buffer := make([]byte, int(length))
  rd, err := os.Stdin.Read(buffer)
  if err != nil || rd != int(length) {
    return
  }

  // Decode the message from JSON
  err = json.Unmarshal(buffer, &message)
  return
}

// Send a message to the Native Messaging API
func sendNative(message interface{}) (err error) {
  // Marshal the JSON into a binary array
  buffer, err := json.Marshal(message)
  if err != nil {
    return
  }

  // Send the length of the encoded JSON
  err = binary.Write(os.Stdout, binary.LittleEndian, uint32(len(buffer)))
  if err != nil {
    return
  }

  // Send the JSON itself
  _, err = os.Stdout.Write(buffer)
  return
}

func errNative(dst uint, seq uint, msg string) {
  sendNative(nativeError{
    Destination: dst,
    SeqNum: seq,
    Message: msg,
  })
}

func resNative(req nativeRequest, status string, details interface{}) {
  sendNative(nativeResponse{
    Destination: req.Source,
    SeqNum: req.SeqNum,
    Status: status,
    Details: details,
  })
}
