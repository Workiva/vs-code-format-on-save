# OverReact Format on Save VS Code Extension
This is a VS Code extension that enables format on save for Dart projects. Ultimately, `dartfmt` will be run on save to format the modified file. In addition to providing a convenient formatting option for Dart projects, a primary focus of the extension is to utilize `OverReact Format`. For those using [OverReact](https://github.com/Workiva/over_react), there are [formatting challenges](https://github.com/Workiva/over_react#component-formatting) that come with running `dartfmt`. Therefore, the extension will check for `over_react_format: ^3.1.0` as a dev_dependency and use that if it is available. If not, the default is to run `dartfmt`.

## Setting up the extension
1. __Install the extension:__ The extension is installed via the `.vsix` file. In this package, there is a `over-react-format-on-save-x.x.x.vsix` file. Download that file locally, and follow [these instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions) to install it.

2. __Enable the formatter:__ Open settings (__&#8984; + ,__) and add the following:
  
  ```js
  // disable the formatter that comes from dart-code
  "dart.enableSdkFormatter": false, 

  "[dart]": {
    // specify the default formatter as this extension
    "editor.defaultFormatter": "workiva.overReactFormatOnSave", 

    // optionally enable "formatOnSave" functionality
    "editor.formatOnSave": true 
  },
  ```

3. You're good to go!
