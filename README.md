# OverReact Format on Save VS Code Extension
This is a VS Code extension that enables format on save for Dart projects. Ultimately, `dartfmt` will be run on save to format the modified file. In addition to providing a convenient formatting option for Dart projects, a primary focus of the extension is to utilize `OverReact Format`. For those using [OverReact](https://github.com/Workiva/over_react), there are [formatting challenges](https://github.com/Workiva/over_react#component-formatting) that come with running `dartfmt`. Therefore, the extension will check for `over_react_format: ^3.1.0` as a dev_dependency and use that if it is available. If not, the default is to run `dartfmt`.

## Setting up the extension
1. __Install the extension:__ The extension is installed via the `.vsix` file. In this package, there is a `over-react-format-on-save-x.x.x.vsix` file. Download that file locally, and follow [these instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions) to install it.

    Or just install it:

    ```
    #!/usr/bin/env bash
    wget https://github.com/Workiva/vs-code-format-on-save/archive/refs/tags/1.0.3.zip
    unar 1.0.3.zip
    code --install-extension vs-code-format-on-save-1.0.3/over-react-format-on-save-1.0.2.vsix
    ```

1. __Enable the formatter:__ Open the Command Palette (__&#8984; + &#8679; + P__ by default) and search for `OverReact Format on Save: Enable`. This will allow the formatter to be run, and can be disabled by using the `OverReact Format on Save: Disable` command.
1. You're good to go!

## Extension Configuration Options
Configuration options can be set by:
1. Go to VS Code's settings (__&#8984; + ,__ by default).
1. Navigate to the Extension settings, using the menu on the left of the settings window.
1. In the dropdown for "Extensions", find "OverReact Format..." and click on it.
1. Interacting with the specific configuration option..

## Enabling Line-Length Detection
__Default: enabled__

If OverReact Format is being used, this extension has the capability to pull a line-length from the standard `dart_dev/config.dart` file used to configure Workiva's DartDev tool. This is enabled by default, but will only have an effect if the project is using OverReact Format.

## Setting a Custom Line-Length
__Default: 0 (disabled)__

In the case you need to run the format command with a custom line-length, but the `Detect Custom Line Length` is not viable, it is possible to set a line-length through the extension using the "Custom Line Length" setting.

__NOTE:__ Both this and `Detect Custom Line Length` cannot be set at the same time. If `Custom Line Length` is greater than `0`, it is considered set. If both are set, `Custom Line Length` will take precendence and auto detection will be skipped. 

## Scan for Nested Packages
__Default: disabled__

Allows the extension to scan for pubspec.yaml files that are nested somewhere in the project (defaulting to the project root) when the formatter runs.

The scanning occurs along the targeted file path and therefore will not detect a pubspec file that is not within a parent directory of the file getting formatted. Because the extension will run in the context of what is determined the Dart package, it will only use the pubspec from that package. This impacts the OverReact Format executable version. By default, this extension always assumes that the content root (usually the project root) is the root of the Dart package.

Enabling this is desirable when the project root (or the content root) has no pubspec (and there's one nested in the project) or there is a nested dart_dev config file (with its own pubspec). Enabling this is likely undesirable if your dart_dev config is in the project root or you do not have nested packages. When this is enabled, it assumes that a nested package has it's own `dart_dev` configuration file and will scan for the `tool` directory relative to the detected nested pubspec.

**Enjoy!**
