# Purr Server

This is the server part of Purr responsible for socket hijacking and forwarding TCP traffic to the remote endpoint.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'purr'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install purr

## Usage

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

### Reverse proxy support

- TODO: Describe websocket compatibility mode and how it works with Apache mod_proxy_wstunnel
- TODO: Test with nginx

## Development

After checking out the repo, run `bin/setup` in the `server` subdirectory to install dependencies. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/skateman/purr.

## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
