import { SchluterAPI } from './schluter-api';
import { RegulationMode } from './types';
import { AccessoryConfig, API, HAP, Logging, Service } from 'homebridge';

export = (api: API) => {
  api.registerAccessory('HomebridgeSchluterThermostat', Thermostat);
};

class Thermostat {
  private readonly log: Logging;
  private readonly hap: HAP;
  private readonly config: AccessoryConfig;
  private readonly thermostatService: Service;
  private readonly schluterAPI: SchluterAPI;
  private regulationMode: RegulationMode;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.hap = api.hap;
    this.config = config;
    this.schluterAPI = new SchluterAPI(
      this.config.email,
      this.config.password,
      this.config.serial,
      this.log,
    );

    this.regulationMode = this.config.regulationMode || RegulationMode.Schedule;

    this.thermostatService = new this.hap.Service.Thermostat(this.config.name);

    this.thermostatService
      .getCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

    this.thermostatService
      .getCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
      .onSet(this.handleTargetHeatingCoolingStateSet.bind(this))
      .setProps({
        minValue: this.hap.Characteristic.TargetHeatingCoolingState.HEAT,
        maxValue: this.hap.Characteristic.TargetHeatingCoolingState.HEAT,
      });

    this.thermostatService
      .getCharacteristic(this.hap.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    this.thermostatService
      .getCharacteristic(this.hap.Characteristic.TargetTemperature)
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.thermostatService
      .getCharacteristic(this.hap.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
      .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
  }

  handleCurrentHeatingCoolingStateGet() {
    this.log.debug('GET CurrentHeatingCoolingState');
    return this.hap.Characteristic.CurrentHeatingCoolingState.HEAT;
  }

  handleTargetHeatingCoolingStateGet() {
    this.log.debug('GET TargetHeatingCoolingState');

    return this.hap.Characteristic.CurrentHeatingCoolingState.HEAT;
  }

  handleTargetHeatingCoolingStateSet() {
    this.log.debug('SET TargetHeatingCoolingState');
    return this.hap.Characteristic.CurrentHeatingCoolingState.HEAT;
  }

  handleCurrentTemperatureGet() {
    this.log.debug('GET CurrentTemperature');
    return this.schluterAPI.getTemperature();
  }

  handleTargetTemperatureGet() {
    this.log.debug('GET TargetTemperature');
    return this.schluterAPI.getTargetTemperature();
  }

  handleTargetTemperatureSet(value) {
    this.log.debug(
      `SET TargetTemperature ${value} with Regulation Mode ${this.regulationMode}`,
    );

    switch (this.regulationMode) {
      case RegulationMode.Permanent:
        this.setPermanentTemperature(value);
        break;

      case RegulationMode.Temporary:
        this.setComfortTemperature(
          value,
          this.getComfortEndTime(this.config.comfortDuration),
        );
        break;

      case RegulationMode.Schedule:
      default:
        this.setScheduleMode();
        break;
    }
  }

  handleTemperatureDisplayUnitsGet() {
    this.log.debug('GET TemperatureDisplayUnits');
    return this.schluterAPI.getTemperatureUnit();
  }

  handleTemperatureDisplayUnitsSet(value) {
    this.log.debug('SET TemperatureDisplayUnits');
    this.schluterAPI.setTemperatureUnit(value);
  }

  getServices() {
    this.log.debug('GET Services');
    return [this.thermostatService];
  }

  getComfortEndTime(hours = 2): string {
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + hours);
    return currentTime.toISOString();
  }

  setComfortTemperature(value: number, endTime: string) {
    this.log.debug(`Setting comfort temperature: ${value} until ${endTime}`);
    this.schluterAPI.setComfortTemperature(value, endTime);
  }

  setPermanentTemperature(value) {
    this.log.debug(`Setting permanent temperature: ${value}`);
    this.schluterAPI.setManualTemperature(value);
  }

  setScheduleMode() {
    this.log.debug('Setting to schedule mode');
    this.schluterAPI.setScheduleMode();
  }
}
