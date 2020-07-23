# OverReact Format on Save VS Code Extension
This is a VS Code extension that enables format on save for Dart projects. Ultimately, `dartfmt` will be run on save to format the modified file. In addition to providing a convenient formatting option for Dart projects, a primary focus of the extension is to utilize `OverReact Format`. For those using [OverReact](https://github.com/Workiva/over_react), there are [formatting challenges](https://github.com/Workiva/over_react#component-formatting) that come with running `dartfmt`. Therefore, the extension will check for `over_react_format: ^3.1.0` as a dev_dependency and use that if it is available. If not, the default is to run `dartfmt`.

## Setting up the extension
1. __Install the extension:__ The extension is installed via the `.vsix` file. In this package, there is a `over-react-format-on-save-x.x.x.vsix` file. Download that file locally, and follow [these instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions) to install it.
1. __Enable the formatter:__ Open the Command Palette (__&#8984; + &#8679; + P__ by default) and search for `OverReact Format on Save: Enable`. This will allow the formatter to be run, and can be disabled by using the `OverReact Format on Save: Disable` command.
1. You're good to go!

## Enabling Line-Length Detection
If OverReact Format is being used, this extension has the capability to pull a line-length from the standard `dart_dev/config.dart` file used to configure Workiva's DartDev tool. This is enabled by default, but will only have an effect if the project is using OverReact Format. In the event that you do not have a configuration for line-length or just need to turn the flag off, this is how to toggle the feature:

1. Go to VS Code's settings (__&#8984; + ,__ by default).
1. Navigate to the Extension settings, using the menu on the left of the settings window.
1. In the dropdown for "Extensions", find "OverReact Format..." and click on it.
1. Check the box for "Format on Save: Detect Custom Line Length".

## Setting a Custom Line-Length
In the case you need to run the format command with a custom line-length, but the `Detect Custom Line Length` is not viable, it is possible to set a line-length through the extension using the "Custom Line Length" setting. This is how to enable that:

1. Go to VS Code's settings (__&#8984; + ,__ by default).
1. Navigate to the Extension settings, using the menu on the left of the settings window.
1. In the dropdown for "Extensions", find "OverReact Format..." and click on it.
1. Enter a value for "Format on Save: Custom Line Length".

__NOTE:__ Both this and `Detect Custom Line Length` cannot be set at the same time. If `Custom Line Length` is greater than `0`, it is considered set. If both are set, `Custom Line Length` will take precendence and auto detection will be skipped. 

**Enjoy!**
