import { SchluterAPI } from './schluter-api';
import {
  AccessoryConfig,
  API,
  HAP,
  Logging,
  Service,
} from 'homebridge';

export = (api: API) => {
  api.registerAccessory('HomebridgeSchluterThermostat', Thermostat);
};

class Thermostat {
  private readonly log: Logging;
  private readonly hap: HAP;
  private readonly config: AccessoryConfig;
  private readonly thermostatService: Service;
  private readonly schluterAPI: SchluterAPI;

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

    this.thermostatService = new this.hap.Service.Thermostat(this.config.name);

    this.thermostatService.getCharacteristic(this.hap.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

    this.thermostatService.getCharacteristic(this.hap.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
      .onSet(this.handleTargetHeatingCoolingStateSet.bind(this))
      .setProps({
        minValue: this.hap.Characteristic.TargetHeatingCoolingState.HEAT,
        maxValue: this.hap.Characteristic.TargetHeatingCoolingState.HEAT,
      });

    this.thermostatService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    this.thermostatService.getCharacteristic(this.hap.Characteristic.TargetTemperature)
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.thermostatService.getCharacteristic(this.hap.Characteristic.TemperatureDisplayUnits)
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
    this.log.debug(`SET TargetTemperature ${value}`);
    this.schluterAPI.setTargetTemperature(value);
  }

  handleTemperatureDisplayUnitsGet() {
    this.log.debug('GET TemperatureDisplayUnits');
    return this.hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
  }

  handleTemperatureDisplayUnitsSet() {
    this.log.debug('SET TemperatureDisplayUnits');
    return this.hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
  }

  getServices(){
    this.log.debug('GET Services');
    return [this.thermostatService];
  }
}
