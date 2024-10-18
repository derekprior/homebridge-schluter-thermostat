import axios from "axios";
import { RegulationMode } from "./types";
import { Logging } from "homebridge";

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
    "https://ditra-heat-e-wifi.schluter.com/api/authenticate/user";

  private static thermostatUrl =
    "https://ditra-heat-e-wifi.schluter.com/api/thermostat";

  private static accountUrl =
    "https://ditra-heat-e-wifi.schluter.com/api/useraccount";

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
    try {
      if (request.url !== SchluterAPI.signInUrl) {
        this.sessionId = this.sessionId || (await this.signIn());
        this.log.debug("Appending session ID %s to request", this.sessionId);
        request.params = request.params || {};
        request.params.sessionid = this.sessionId;
      }
      return request;
    } catch (error) {
      this.log.error("Error appending session ID:", error);
      throw error;
    }
  }

  private async clearSessionId(error) {
    if (error.response?.status === 401) {
      this.log.debug("401 Unauthorized, clearing session ID");
      this.sessionId = null;
      return error;
    }

    return Promise.reject(error);
  }

  private async signIn(): Promise<string> {
    try {
      const data = { email: this.email, password: this.password };
      const result = await axios.post(SchluterAPI.signInUrl, data);

      switch (result.data.ErrorCode) {
        case 0:
          return result.data.SessionId;
        case 1:
          throw new Error("Sign in: invalid email");
        case 2:
          throw new Error("Sign in: invalid password");
        default:
          throw new Error("Sign in: unknown error");
      }
    } catch (error) {
      this.log.error("Error signing in to Schluter API:", error);
      throw error;
    }
  }

  async getTemperature(): Promise<number> {
    try {
      return (await this.thermostatState()).temperature;
    } catch (error) {
      this.log.error("Error fetching temperature:", error);
      throw error;
    }
  }

  async getTargetTemperature(): Promise<number> {
    try {
      return (await this.thermostatState()).targetTemperature;
    } catch (error) {
      this.log.error("Error fetching target temperature:", error);
      throw error;
    }
  }

  async getTemperatureUnit(): Promise<TemperatureUnit> {
    try {
      const result = await axios.get(SchluterAPI.accountUrl);
      if (result.data.TempUnitIsCelsius !== undefined) {
        return result.data.TempUnitIsCelsius
          ? TemperatureUnit.Celsius
          : TemperatureUnit.Fahrenheit;
      } else {
        this.log.warn(
          "TempUnitIsCelsius is missing from API response, defaulting to Fahrenheit.",
        );
        return TemperatureUnit.Fahrenheit;
      }
    } catch (error) {
      this.log.error("Error fetching temperature unit:", error);
      throw error;
    }
  }

  async setTemperatureUnit(value: TemperatureUnit) {
    try {
      const data = { TempUnitIsCelsius: value === TemperatureUnit.Celsius };
      await axios.put(SchluterAPI.accountUrl, data);
    } catch (error) {
      this.log.error("Error setting temperature unit:", error);
      throw error;
    }
  }

  async setScheduleMode() {
    try {
      const params = { serialnumber: this.serialNumber };
      const data = {
        RegulationMode: RegulationMode.Schedule,
        VacationEnabled: false,
      };
      await axios.post(SchluterAPI.thermostatUrl, data, { params: params });
    } catch (error) {
      this.log.error("Error setting schedule mode:", error);
      throw error;
    }
  }

  async setComfortTemperature(targetTemperature: number, endTime: string) {
    try {
      const params = { serialnumber: this.serialNumber };
      const data = {
        ComfortTemperature: Math.round(targetTemperature * 100),
        ComfortEndTime: endTime,
        RegulationMode: RegulationMode.Temporary,
        VacationEnabled: false,
      };
      await axios.post(SchluterAPI.thermostatUrl, data, { params: params });
    } catch (error) {
      this.log.error("Error setting comfort temperature:", error);
      throw error;
    }
  }

  async setManualTemperature(targetTemperature: number) {
    try {
      const params = { serialnumber: this.serialNumber };
      const data = {
        ManualTemperature: Math.round(targetTemperature * 100),
        RegulationMode: RegulationMode.Permanent,
        VacationEnabled: false,
      };
      await axios.post(SchluterAPI.thermostatUrl, data, { params: params });
    } catch (error) {
      this.log.error("Error setting manual temperature:", error);
      throw error;
    }
  }

  private async thermostatState(): Promise<ThermostatState> {
    try {
      const sessionId = await this.signIn();
      const params = { serialnumber: this.serialNumber, sessionid: sessionId };
      const result = await axios.get(SchluterAPI.thermostatUrl, {
        params: params,
      });
      return {
        temperature: result.data.Temperature / 100,
        targetTemperature: result.data.SetPointTemp / 100,
      };
    } catch (error) {
      this.log.error("Error fetching thermostat state:", error);
      throw error;
    }
  }
}
