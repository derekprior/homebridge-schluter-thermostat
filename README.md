# Homebridge Schluter Thermostat

This is a homebridge plugin to control Schluter WiFi thermostats, used for
electric in floor heating systems.

**This plugin is experimental and not yet fit for use except by folks looking to
contribute to its development**.

## Development

Development is aided by a local installation of HomeBridge, with instructions
for that found elsewhere.

1. Clone this repository
1. With the homebridge service stopped, run `npm link` in the repository directory
1. Run `npm run watch` in the repository directory to reload any changes
1. Visit `http://localhost:8581/` to see the homebridge UI and configure the plugin
1. Ensure this HomeBridge bridge is added to your Home app