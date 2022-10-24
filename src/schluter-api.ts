import axios from 'axios';
import { Logging } from 'homebridge';

type ThermostatState = {
  temperature: number;
  targetTemperature: number;
};

export class SchluterAPI {
  private readonly email: string;
  private readonly password: string;
  private readonly serialNumber: string;
  private readonly log: Logging;

  constructor(email: string, password: string, serialNumber: string, log: Logging) {
    this.email = email;
    this.password = password;
    this.serialNumber = serialNumber;
    this.log = log;
  }

  async getTemperature(): Promise<number> {
    return (await this.thermostatState()).temperature;
  }

  async getTargetTemperature(): Promise<number> {
    return (await this.thermostatState()).targetTemperature;
  }

  async setTargetTemperature(targetTemperature: number) {
    const sessionId = await this.login();
    const params = { serialnumber: this.serialNumber, sessionid: sessionId };
    const data = {
      ComfortTemperature: Math.round(targetTemperature * 100),
      RegulationMode: 2,
    };

    await axios.post(this.thermostatUrl(), data, { params: params });
  }

  private async thermostatState(): Promise<ThermostatState> {
    const sessionId = await this.login();
    const params = { serialnumber: this.serialNumber, sessionid: sessionId };
    const result = await axios.get(this.thermostatUrl(), { params: params });
    return {
      temperature: result.data.Temperature/100,
      targetTemperature: result.data.SetPointTemp/100,
    };
  }

  private async login() {
    const data = { email: this.email, password: this.password };
    const result = await axios.post(this.signInUrl(), data);
    return result.data.SessionId;
  }

  private thermostatUrl() {
    return 'https://ditra-heat-e-wifi.schluter.com/api/thermostat';
  }

  private signInUrl() {
    return 'https://ditra-heat-e-wifi.schluter.com/api/authenticate/user';
  }
}