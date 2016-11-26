require 'selenium-webdriver'
require 'spec_helper'

describe 'Client' do
  Plugin = Struct.new(:host, :port, :pid)

  describe 'Chrome' do
    let(:path) { 'contrib/chrome' }

    let(:driver) do
      switches = %w(--ignore-certificate-errors --disable-popup-blocking --disable-translate)
      switches << "--load-extension=#{path}"
      Selenium::WebDriver.for :chrome, :switches => switches
    end

    let(:plugin) do
      # Get a list of processes listening on TCP
      before = `netstat -tlnp 2>&1`.split("\n")
      # Start the browser plugin
      driver.navigate.to "https://purr/#{CGI.escape('https://localhost:9292/lofasz')}"
      # Give some time for the plugin to start
      sleep(1)
      # Get an updated list of processes listening on TCP
      after = `netstat -tlnp 2>&1`.split("\n")
      # Close the WebDriver
      driver.close
      # Diff the two lists for the plugin's data
      result = (after - before).first.split(/\s+/)
      # Parse the result for host, port and PID
      host, port = result[3].split(':')
      pid = result[6].split('/')[0]
      # Return with a Struct of the three
      Plugin.new(host, port.to_i, pid.to_i)
    end

    after(:each) { Process.kill('TERM', plugin.pid) }

    pending 'Add some tests here!'
  end
end
