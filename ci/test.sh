#!/bin/sh

case $1 in
  "server")
    cd server
    bundle exec rake
    ;;
esac
