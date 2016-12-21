# Purr Client

This is the client part of Purr, a Chrome App extension responsible for smuggling TCP traffic through HTTP connections.

## Installation

Currently, the client is available as a Chrome App only and it requires manual installation. It is available under the `client` folder and it needs to be installed manually.

## Usage
The client can be invoked by pointing your browser to an URL in the form: `http://purr/<URL>`

Where the `<URL>` is an URL encoded using [`encodeURIComponent`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) pointing to the server described above.

Because the client catches the URL, it will never appear in the browser's address bar. Therefore, it is not recommended to use `window.open` or `window.location.href` for invoking the client as it will create an empty window. A better solution is to use `window.location.assign` from and existing window with "useful data":

```js
window.location.assign(`http://purr/${encodeURIComponent('http://example.com/vnc?id=1234')}`)
```

## Development
Support for Chrome Apps will be [retired](https://blog.chromium.org/2016/08/from-chrome-apps-to-web.html) on other platforms than ChromeOS and this client might get completely unsupported in future versions of Chrome. It is planned to implement the client using a different approach in the future.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/skateman/purr.

## License

The application is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
