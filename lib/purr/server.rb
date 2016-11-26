require 'surro-gate'

module Purr
  # This class implements a Rack-based server with socket hijacking and proxying to a remote TCP endpoint.
  #
  # The remote TCP endpoint selection is implemented by passing a block to the class instantiation.
  # If any kind of error happens during the hijacking process a 404 error is returned to the requester.
  class Server
    # @yield [env] The block responsible for the remote TCP endpoint selection
    # @yieldparam env [Hash] The environment hash returned by the Rack middleware
    # @yieldreturn [Array[String, Integer]] The host:port pair as a two element array
    # @raise [ArgumentError] If the passed block takes other number of arguments than one
    def initialize(&block)
      raise ArgumentError, 'The method requires a block with a single argument' unless block && block.arity == 1

      @remote = block
      @proxy = SurroGate.new
    end

    # Method required by the Rack API
    #
    # @see https://rack.github.io/
    def call(env)
      upgrade = parse_headers(env)
      # Return with a 404 error if the upgrade header is not present
      return not_found unless %i(websocket purr).include?(upgrade)

      host, port = @remote.call(env)
      # Return with a 404 error if no host:port pair was determined
      if host.nil? || port.nil?
        logger(env, :error, "No matching endpoint found for request incoming from #{env['REMOTE_ADDR']}")
        return not_found
      end

      # Hijack the HTTP socket from the Rack middleware
      http = env['rack.hijack'].call
      # Write a proper HTTP response
      http.write(http_response(upgrade))
      # Open the remote TCP socket
      sock = TCPSocket.new(host, port)

      # Start proxying
      @proxy.push(http, sock)
      logger(env, :info, "Redirecting incoming request from #{env['REMOTE_ADDR']} to [#{host}]:#{port}")

      # Rack requires this line below
      return [200, {}, []]
    rescue => ex
      logger(env, :error, "#{ex.class} happened for #{env['REMOTE_ADDR']} trying to access #{host}:#{port}")
      # Clean up the opened sockets if available
      http.close unless http.nil? || http.closed?
      sock.close unless sock.nil? || sock.closed?
      # Return with a 404 error
      return not_found
    end

    private

    def parse_headers(env)
      case true
      when env['HTTP_PURR_REQUEST'] != 'MEOW'
        logger(env, :error, "Invalid request from #{env['REMOTE_ADDR']}")
      when !SUPPORT.include?(env['HTTP_PURR_VERSION'])
        logger(env, :error, "Unsupported client from #{env['REMOTE_ADDR']}")
      when %w(websocket purr).include?(env['HTTP_UPGRADE'])
        logger(env, :info, "Upgrading to #{env['HTTP_UPGRADE']}")
        return env['HTTP_UPGRADE'].to_sym
      else
        logger(env, :error, "Invalid upgrade request from #{env['REMOTE_ADDR']}")
      end
    end

    def http_response(upgrade)
      <<~HEREDOC.sub(/\n$/, "\n\n").gsub(/ {2,}/, '').gsub("\n", "\r\n")
      HTTP/1.1 101 Switching Protocols
      Upgrade: #{upgrade}
      Purr-Version: #{Purr::VERSION}
      Purr-Request: MEOW
      Connection: Upgrade
      HEREDOC
    end

    def not_found
      [404, { 'Content-Type' => 'text/plain' }, ['Not found!']]
    end

    def logger(env, level, message)
      # Do logging only if Rack::Logger is loaded as a middleware
      env['rack.logger'].send(level, message) if env['rack.logger']
    end
  end
end
