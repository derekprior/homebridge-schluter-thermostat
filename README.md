# Homebridge Schluter Thermostat

This is a homebridge plugin to control Schluter WiFi thermostats, used for
electric in floor heating systems.

**Note**: This plugin is in the early stages of development and should only be used
by those who are comfortable with debugging and troubleshooting.

## Compatibility

This plugin has been tested with my own Schluter DITRA-HEAT-E-WiFi thermostat.
Schluter thermostats are manufactured by OJ Electronics, who supplies several
other companies with similar thermostats. If your thermostat looks like the
one below, this plugin could likely be made to work with it, although the
plugin currently hardcodes the Schluter API endpoints.

![Schluter Thermostat](https://user-images.githubusercontent.com/152152/197906548-747967b2-e13d-405e-8d06-1ead7d5f934a.png)

If you're interested in helping to make this plugin compatible with other brands
supplied by OJ Electronics, please open an issue.

## Installation and Configuration

Install using Homebridge's UI and searching for the `homebridge-schluter-thermostat`
plugin.

To use this plugin, you will need to have already connected your thermostat to
Wifi and registered an account with Schluter. You will also need to have your
thermostat serial number which is available in Schluter's web interface or
directly on your thermostat by going to `Menu`, `User Settings`, `Information`,
`View as Text` and looking for the `Unit Id` or `Serial` field.

Once you have your serial number, you can complete the configuration with the
following fields:

* **Name**: The name of the device as it will appear in HomeKit
* **Email**: The email address you used to register your thermostat with Schluter
* **Password**: The password you used to register your thermostat with Schluter
* **Serial Number**: The serial number of your thermostat

If you have multiple thermostats, you can add multiple instances of this plugin.

## Development

Development is aided by a local installation of HomeBridge, with instructions
for that found elsewhere.

1. Clone this repository
1. With the homebridge service stopped, run `npm link` in the repository directory
1. Run `npm run watch` in the repository directory to reload any changes
1. Visit `http://localhost:8581/` to see the homebridge UI and configure the plugin
1. Ensure this HomeBridge bridge is added to your Home app
