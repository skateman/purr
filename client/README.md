# Purr Client

This is the client part of Purr, a TCP-to-HTTP/TCP proxy implemented in Go. It was implemented to be able to interact with [Web Extensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/What_are_WebExtensions) using [Native Messaging](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging).

## Installation
To build the client, a Go compiler v1.6+ is required. To create the binary file with the name `purr`, simply run:
```sh
go build -o purr
```

After the binary is created, the browser needs to be configured to allow its execution. This can be done creating a manifest file in a folder that varies by browser and/or platform. You can read about where to put manifest files for [Chrome/Chromium](https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host-location) and for [Firefox](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Native_messaging#App_manifest_location). There are sample manifests for each browser under the `manifests` folder. Simply choose one of them based on your browser preference and copy it to the adjacent location with the name `purr.json`. You will have to manually edit this newly created file and replace `PURR_PATH` with the absolute path to the client binary.

## Usage
The client is not designed for standalone usage, rather to be called from the browser using the extension and the frontend library.

## Development
Unfortunately, there is no development setup nor tests for this part of the application.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/skateman/purr.

## License

The application is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
