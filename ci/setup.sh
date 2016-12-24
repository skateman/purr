#!/bin/sh

case $1 in
  "server")
    echo 'gem: --no-ri --no-rdoc --no-document' > ~/.gemrc
    gem install bundler -v 1.13.0
    ;;
esac
