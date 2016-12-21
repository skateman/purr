$LOAD_PATH.unshift File.expand_path('../../lib', __FILE__)

# Create a coverage report when the whole suite is started
if (RSpec.configuration.instance_variable_get :@files_or_directories_to_run) == ['spec']
  require 'simplecov'
  SimpleCov.start

  if ENV.key? 'CI'
    require 'codecov'
    SimpleCov.formatter = SimpleCov::Formatter::Codecov
  end
end

require 'purr'
