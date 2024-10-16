import axios from 'axios';
import { RegulationMode } from './types';
import { Logging } from 'homebridge';

type ThermostatState = {
  temperature: number;
  targetTemperature: number;
};

enum TemperatureUnit {
  Celsius = 0,
  Fahrenheit = 1,
}

export class SchluterAPI {
  private static signInUrl =
    'https://ditra-heat-e-wifi.schluter.com/api/authenticate/user';

  private static thermostatUrl =
    'https://ditra-heat-e-wifi.schluter.com/api/thermostat';

  private static accountUrl =
    'https://ditra-heat-e-wifi.schluter.com/api/useraccount';

  private readonly email: string;
  private readonly password: string;
  private readonly serialNumber: string;
  private readonly log: Logging;
  private sessionId: string | null;

  constructor(
    email: string,
    password: string,
    serialNumber: string,
    log: Logging,
  ) {
    this.email = email;
    this.password = password;
    this.serialNumber = serialNumber;
    this.log = log;
    this.sessionId = null;

    axios.interceptors.request.use(this.appendSessionId.bind(this));
    axios.interceptors.response.use(undefined, this.clearSessionId.bind(this));
  }

  private async appendSessionId(request) {
    if (request.url !== SchluterAPI.signInUrl) {
      this.sessionId = this.sessionId || (await this.signIn());
      this.log.debug('Appending session ID %s to request', this.sessionId);
      request.params = request.params || {};
      request.params.sessionid = this.sessionId;
    }

    return request;
  }

  private async clearSessionId(error) {
    if (error.response?.status === 401) {
      this.log.debug('401 Unauthorized, clearing session ID');
      this.sessionId = null;
      return error;
    }

    return Promise.reject(error);
  }

  private async signIn(): Promise<string> {
    const data = { email: this.email, password: this.password };

    const result = await axios.post(SchluterAPI.signInUrl, data);

    switch (result.data.ErrorCode) {
      case 0: {
        return result.data.SessionId;
      }
      case 1: {
        throw new Error('Sign in: invalid email');
      }
      case 2: {
        throw new Error('Sign in: invalid password');
      }
      default: {
        throw new Error('Sign in: unknown error');
      }
    }
  }

  async getTemperature(): Promise<number> {
    return (await this.thermostatState()).temperature;
  }

  async getTargetTemperature(): Promise<number> {
    return (await this.thermostatState()).targetTemperature;
  }

  async getTemperatureUnit(): Promise<TemperatureUnit> {
    const result = await axios.get(SchluterAPI.accountUrl);

    if (result.data.TempUnitIsCelsius) {
      return TemperatureUnit.Celsius;
    } else {
      return TemperatureUnit.Fahrenheit;
    }
  }

  async setTemperatureUnit(value: TemperatureUnit) {
    const data = { TempUnitIsCelsius: value === TemperatureUnit.Celsius };
    await axios.put(SchluterAPI.accountUrl, data);
  }

  async setScheduleMode() {
    const params = { serialnumber: this.serialNumber };
    const data = {
      RegulationMode: RegulationMode.Schedule,
      VacationEnabled: false,
    };

    await axios.post(SchluterAPI.thermostatUrl, data, { params: params });
  }

  async setComfortTemperature(targetTemperature: number, endTime: string) {
    const params = { serialnumber: this.serialNumber };
    const data = {
      ComfortTemperature: Math.round(targetTemperature * 100),
      ComfortEndTime: endTime,
      RegulationMode: RegulationMode.Temporary,
      VacationEnabled: false,
    };

    await axios.post(SchluterAPI.thermostatUrl, data, { params: params });
  }

  async setManualTemperature(targetTemperature: number) {
    const params = { serialnumber: this.serialNumber };
    const data = {
      ManualTemperature: Math.round(targetTemperature * 100),
      RegulationMode: RegulationMode.Permanent,
      VacationEnabled: false,
    };

    await axios.post(SchluterAPI.thermostatUrl, data, { params: params });
  }

  private async thermostatState(): Promise<ThermostatState> {
    const sessionId = await this.signIn();
    const params = { serialnumber: this.serialNumber, sessionid: sessionId };
    const result = await axios.get(SchluterAPI.thermostatUrl, {
      params: params,
    });
    return {
      temperature: result.data.Temperature / 100,
      targetTemperature: result.data.SetPointTemp / 100,
    };
  }
}