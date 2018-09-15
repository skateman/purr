# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'purr/version'

Gem::Specification.new do |spec|
  spec.name          = 'purr'
  spec.version       = Purr::VERSION
  spec.authors       = ['Dávid Halász']
  spec.email         = ['skateman@skateman.eu']

  spec.summary       = 'Smuggle TCP connections through HTTP'
  spec.description   = 'Smuggle TCP connections through HTTP'
  spec.homepage      = 'https://github.com/skateman/purr'
  spec.license       = 'MIT'

  spec.files = `git ls-files -z`.split("\x0").reject do |f|
    f.match(%r{^(test|spec|features)/})
  end
  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_dependency 'rack', '~> 2.0.0'
  spec.add_dependency 'surro-gate', '~> 1.0.4'

  spec.add_development_dependency 'bundler', '~> 1.13'
  spec.add_development_dependency 'codecov', '~> 0.1.0'
  spec.add_development_dependency 'rake', '~> 10.0'
  spec.add_development_dependency 'rspec', '~> 3.0'
  spec.add_development_dependency 'simplecov', '~> 0.12'
end
