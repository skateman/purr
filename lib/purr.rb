require 'purr/version'
require 'purr/server'

# A Rack-based server capable of smuggling TCP traffic through a persisent HTTP connection
#
# It uses the Rack socket hijacking API for accessing the TCP level of an incoming HTTP session.
# The remote endpoint selection should be implemented as a block passed to the server returning
# an two element array containing a host string and a port integer.
#
# @example Simple rackup file for a local SSH connection
#    require 'purr'
#
#    # This middleware is to support optional logging
#    use Rack::Logger
#
#    app = Purr.server do |env|
#      ['localhost', 22]
#    end
#
#    run app
#
# @see http://www.rubydoc.info/github/rack/rack/master/file/SPEC#Hijacking

module Purr
  class << self
    # Creates or returns a singleton instance of the Rack-server
    #
    # @see Purr::Server.initialize
    def server(&block)
      @server ||= Server.new(&block)
    end
  end
end
