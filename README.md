# Purr

[![Build Status](https://travis-ci.org/skateman/purr.svg?branch=master)](https://travis-ci.org/skateman/purr)
[![Dependency Status](https://gemnasium.com/skateman/purr.svg)](https://gemnasium.com/skateman/purr)
[![Inline docs](http://inch-ci.org/github/skateman/purr.svg?branch=master)](http://inch-ci.org/github/skateman/purr)
[![Code Climate](https://codeclimate.com/github/skateman/purr/badges/gpa.svg)](https://codeclimate.com/github/skateman/purr)
[![codecov](https://codecov.io/gh/skateman/purr/branch/master/graph/badge.svg)](https://codecov.io/gh/skateman/purr)

Purr is a TCP-over-HTTP solution which consists:
- a Rack-based web server implemented in Ruby
- a browser extension implemented in ES6 using Chrome App JavaScript API

Using Purr it's possible to "smuggle" any kind of TCP traffic (SSH, VNC, etc.) through an HTTP connection.

**Note: this is a highly experimental implementation for demonstration purposes only!**

## How it works

**TODO**

## Installation

### Server

Add this line to your application's Gemfile:

```ruby
gem 'purr'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install purr

### Client

Currently, the client is available as a Chrome App only and it requires manual installation. It is available under the `contrib/chrome` folder and it needs to be installed manually. Note that the Chrome Apps will be [retired](https://blog.chromium.org/2016/08/from-chrome-apps-to-web.html) on other platforms than ChromeOS and this client might get unsupported in future versions of Chrome. It is planned to implement the client using a different approach in the future.

## Usage

### Server
The server needs to be wrapped as a Rack application and it's necessary to pass a block that takes one argument. This block should implement the TCP remote endpoint selection based on the **env** variable passed from the Rack context. The endpoint should be in the form of a two element array containing the host as a string and the port as an integer. There is a basic logging support implemented, but it is requires the `Rack::Logger` middleware to be included.

```ruby
# purr.ru
require 'purr'

# Turn on the optional logging feature
use Rack::Logger

app = Purr.server do |env|
  # Maybe do some database lookup based on the Rack environment
  # ...
  # Return with the remote endpoint
  ['localhost', 22]
end

run app
```

The application can be started using `rackup`:
```sh
rackup purr.ru
```

Note that the application requires a web server with [socket hijacking](http://www.rubydoc.info/github/rack/rack/file/SPEC#Hijacking) support, i.e. you can't use WEBrick.

### Client
The client can be invoked by pointing your browser to an URL in the form: `http://purr/<URL>`

Where the `<URL>` is an URL encoded using [`encodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) pointing to the server described above.

Because the client catches the URL, it will never appear in the browser's address bar. Therefore, it is not recommended to use `window.open` or `window.location.href` for invoking the client as it will create an empty window. A better solution is to use `window.location.assign` from and existing window with "useful data":

```js
window.location.assign(`http://purr/${encodeURIComponent('http://example.com/vnc?id=1234')}`)
```

### Reverse proxy support

- TODO: Describe websocket compatibility mode and how it works with Apache mod_proxy_wstunnel
- TODO: Test with nginx

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake spec` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/skateman/purr.


## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).

