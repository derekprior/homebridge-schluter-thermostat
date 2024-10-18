# Changelog

The noteworthy changes for each Scenic version are included here. For a complete
changelog, see the [commits] for each version via the version links.

[commits]: https://github.com/derekprior/homebridge-schluter-thermostat/commits/main

## [0.2.1] October 17, 2024

### Fixed

- Fixed regulation modes introdudced in 0.2.0.
- Fixed unhandled `TempUnitIsCelcisus not defined` error.
- Fixed logging and handling of Schluter API errors.

[0.2.0]: https://github.com/derekprior/homebridge-schluter-thermostat/compare/v0.2.0...v0.2.1

## [0.2.0] October 15, 2024

### Added

- Support for a `regulationMode` setting which controls whether temperature
  changes will be overridden by schedule, if they are temporary (will be
  maintained for a few hours before reverting to schedule), or if they are
  "permanent" (will not be override by schedule). See #16

[0.2.0]: https://github.com/derekprior/homebridge-schluter-thermostat/compare/v0.1.0...v0.2.0

## [0.1.0] October 26, 2022

This is the first release of the plugin. While we are pre-1.0, all versions
should be considered experimental as the plugin may change wildly between
pre-1.0 versions.

### Added

- Ability to see current temperature and target temperature
- Ability to set the target temperature
- Ability to get and set the temperature unit

[0.1.0]: https://github.com/derekprior/homebridge-schluter-thermostat/compare/1b8ec49429a311463d3ce14fdee2f21f3dc7c91e...v0.1.0
