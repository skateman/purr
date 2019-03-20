package main

import (
  "bufio"
  "bytes"
  "errors"
  "net"
  "net/http"
  "net/http/httputil"
)

type HttPurr struct {
  Host string
  Request []byte
}

func newHttPurr(url string) (*HttPurr, error) {
  // Initialize an empty HTTP request
  req, err := http.NewRequest("GET", url, nil)
  if err != nil {
    return &HttPurr{}, err
  }

  // Set the HTTP request headers
  req.Header.Add("Upgrade", "purr")
  req.Header.Add("Purr-Request", "MEOW")
  req.Header.Add("Purr-Version", "0.1.2")
  req.Header.Add("Connection", "Upgrade")
  req.Header.Add("User-Agent", "Purr Client 0.1.2")

  // Convert the request into a binary slice
  dump, _ := httputil.DumpRequestOut(req, false)
  if err != nil {
    return &HttPurr{}, err
  }

  httpurr := &HttPurr{
    Host: req.Host,
    Request: dump,
  }

  return httpurr, nil
}

func (httpurr *HttPurr) Upgrade(conn net.Conn) (error) {
  // Send the HTTP upgrade request
  _, err := conn.Write(httpurr.Request)
  if err != nil {
    return err
  }

  // Fetch the HTTP response
  buffer := make([]byte, 512)
  _, err = conn.Read(buffer)

  if err != nil {
    return err
  }

  // Parse the HTTP response
  return parseResponse(buffer)
}

func validateResponse(response http.Response) error {
  switch {
  case response.StatusCode != 101:
    return errors.New("Invalid HTTP status code")
  case response.Header.Get("Upgrade") != "purr":
    return errors.New("Invalid Upgrade header")
  case response.Header.Get("Connection") != "Upgrade":
    return errors.New("Invalid Connection header")
  case response.Header.Get("Purr-Request") != "MEOW":
    return errors.New("Invalid Purr request")
  }
  return nil
}

func parseResponse(body []byte) (error) {
  io := bufio.NewReader(bytes.NewReader(body))
  // Parse the HTTP response
  res, err := http.ReadResponse(io, nil)
  if err != nil {
    return err
  }
  defer res.Body.Close()
  return validateResponse(*res)
}
