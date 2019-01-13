# Purr

<img src="https://rawgit.com/skateman/purr/master/logo.svg" width="300" align="right" />

[![Gem Version](https://badge.fury.io/rb/purr.svg)](https://badge.fury.io/rb/purr)
[![Build Status](https://travis-ci.org/skateman/purr.svg?branch=master)](https://travis-ci.org/skateman/purr)
[![Inline docs](http://inch-ci.org/github/skateman/purr.svg?branch=master)](http://inch-ci.org/github/skateman/purr)
[![Code Climate](https://codeclimate.com/github/skateman/purr/badges/gpa.svg)](https://codeclimate.com/github/skateman/purr)
[![codecov](https://codecov.io/gh/skateman/purr/branch/master/graph/badge.svg)](https://codecov.io/gh/skateman/purr)

Purr is a TCP-over-HTTP solution which consists:
- a Rack-based web server implemented in Ruby
- a desktop client application written in Go
- a browser extension with the ability to interact with the client
- a JS library functioning as the control interface of the extension (TODO)

Using Purr it's possible to "smuggle" any kind of TCP traffic (SSH, VNC, etc.) through an HTTP connection.

## How it works

1. Using the (FIXME: not yet implemented) frontend library, the extension triggers the Go client to listen on a local TCP port
1. If a client application (VNC, SSH, etc.) connects to this local port, the Go client opens a HTTP upgrade request to the Rack server
1. The Rack server parses the upgrade request and if everything is alright, responds back with a correct response
1. The Go client establishes proxying between the local TCP port and the remote connection to the Rack server
1. Based on the user-defined logic in the block passed to the Rack server, it opens a remote TCP connection
1. The Rack server establishes proxying between the incoming request and the remote TCP connection
1. The data flows freely in both directions

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/skateman/purr.

## License

The application is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
