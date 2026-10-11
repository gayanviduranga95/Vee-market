/**
 * IoT Moisture Meter Protocol & Connection Service
 *
 * This module defines the hardware communication contract and protocol abstraction
 * for digital Wi-Fi IoT moisture meters (such as ESP32/ESP8266 or smart meters).
 *
 * Supported QR Payload Formats:
 * 1. JSON Payload:
 *    {"deviceId":"VM-METER-01","ip":"192.168.4.1","port":80,"ssid":"VeeMeter-01","token":"xyz","type":"ESP32_PADDY_PRO"}
 * 2. URI Protocol Payload:
 *    veemeter://VM-METER-01?ip=192.168.4.1&port=80&ssid=VeeMeter-01
 * 3. Standard Wi-Fi Provisioning QR (WIFI:S:VeeMeter-01;T:WPA;P:secret;;):
 *    Parsed for SSID/credentials to guide the user in establishing local Wi-Fi connectivity.
 * 4. Plain Device Identifier:
 *    e.g. "DEVICE-001" or "VM-METER-001" (supports connecting via configured device address or mock adapter)
 */

export interface MoistureMeterQRPayload {
  deviceId: string;
  ip?: string;
  port?: number;
  ssid?: string;
  token?: string;
  type?: string;
  raw: string;
}

export interface MoistureMeasurement {
  deviceNumber: string;
  moisturePercentage: number;
  temperatureC?: number;
  timestamp: string; // ISO 8601
  measurementId?: string;
  source: "IOT_DEVICE" | "MANUAL" | "MOCK";
  verificationStatus: "DEVICE_REPORTED" | "UNVERIFIED" | "SIMULATED";
  rawPayload?: string;
}

export interface DeviceConnectionStatus {
  state: "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "READING" | "SUCCESS" | "ERROR";
  message?: string;
  deviceId?: string;
  ip?: string;
  reading?: MoistureMeasurement;
}

export interface IMoistureMeterAdapter {
  connect(payload: MoistureMeterQRPayload): Promise<boolean>;
  getLatestReading(payload: MoistureMeterQRPayload): Promise<MoistureMeasurement>;
  disconnect?(): Promise<void>;
}

/**
 * Parse any QR payload into a structured MoistureMeterQRPayload object.
 */
export function parseMoistureMeterQR(rawText: string): MoistureMeterQRPayload {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("EMPTY_QR_CODE");
  }

  // 1. Check for JSON format
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const data = JSON.parse(trimmed);
      const deviceId = data.deviceId || data.deviceNumber || data.id || data.device_id;
      if (!deviceId) {
        throw new Error("QR JSON missing required 'deviceId' field");
      }
      return {
        deviceId: String(deviceId).trim(),
        ip: data.ip || data.localIp || data.host || undefined,
        port: data.port ? Number(data.port) : undefined,
        ssid: data.ssid || data.wifiSSID || undefined,
        token: data.token || data.authKey || undefined,
        type: data.type || "IOT_METER",
        raw: trimmed,
      };
    } catch (e: any) {
      if (e.message !== "QR JSON missing required 'deviceId' field") {
        throw new Error("INVALID_JSON_QR");
      }
      throw e;
    }
  }

  // 2. Check for URI protocol format (veemeter:// or http:// or https://)
  if (trimmed.startsWith("veemeter://") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsedUrl = new URL(trimmed);
      const deviceId =
        parsedUrl.hostname ||
        parsedUrl.searchParams.get("device") ||
        parsedUrl.searchParams.get("id") ||
        parsedUrl.pathname.replace(/^\//, "");

      if (!deviceId) {
        throw new Error("INVALID_URI_QR");
      }

      return {
        deviceId,
        ip: parsedUrl.searchParams.get("ip") || (parsedUrl.protocol.startsWith("http") ? parsedUrl.hostname : undefined),
        port: parsedUrl.port ? Number(parsedUrl.port) : 80,
        ssid: parsedUrl.searchParams.get("ssid") || undefined,
        token: parsedUrl.searchParams.get("token") || undefined,
        type: "HTTP_DEVICE",
        raw: trimmed,
      };
    } catch {
      // Fallback if URL parsing fails
    }
  }

  // 3. Check for standard Wi-Fi QR code (WIFI:S:SSID;T:WPA;P:password;;)
  if (trimmed.toUpperCase().startsWith("WIFI:")) {
    const ssidMatch = trimmed.match(/S:([^;]+)/i);
    const ssid = ssidMatch ? ssidMatch[1] : undefined;
    const deviceId = ssid || "WIFI-METER";
    return {
      deviceId,
      ssid,
      ip: "192.168.4.1", // Standard default ESP32 AP IP address
      port: 80,
      type: "WIFI_AP_METER",
      raw: trimmed,
    };
  }

  // 4. Plain text identifier (e.g. "DEVICE-001", "VM-METER-1234")
  if (/^[a-zA-Z0-9_\-.:]{3,64}$/.test(trimmed)) {
    return {
      deviceId: trimmed,
      ip: "192.168.4.1",
      port: 80,
      type: "DIRECT_ID",
      raw: trimmed,
    };
  }

  throw new Error("UNRECOGNIZED_QR_FORMAT");
}

/**
 * Real Hardware HTTP Wi-Fi Adapter
 * Connects directly to the moisture meter's local HTTP API endpoint (e.g. GET http://<ip>/api/moisture)
 * when the phone/client device is connected to the meter's Wi-Fi network.
 */
export class HttpWifiMoistureMeterAdapter implements IMoistureMeterAdapter {
  private timeoutMs: number;

  constructor(timeoutMs = 8000) {
    this.timeoutMs = timeoutMs;
  }

  async connect(payload: MoistureMeterQRPayload): Promise<boolean> {
    const ip = payload.ip || "192.168.4.1";
    const port = payload.port || 80;
    const url = `http://${ip}:${port}/api/status`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        mode: "cors",
      });
      clearTimeout(timer);
      return res.ok;
    } catch (err: any) {
      clearTimeout(timer);
      // Browser network error or device unreachable
      throw new Error(`COULD_NOT_REACH_DEVICE: ${err.message || "Timeout or device not connected to Wi-Fi"}`);
    }
  }

  async getLatestReading(payload: MoistureMeterQRPayload): Promise<MoistureMeasurement> {
    const ip = payload.ip || "192.168.4.1";
    const port = payload.port || 80;
    const url = `http://${ip}:${port}/api/moisture`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(payload.token ? { Authorization: `Bearer ${payload.token}` } : {}),
        },
        signal: controller.signal,
        mode: "cors",
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Device returned HTTP error ${res.status}`);
      }

      const data = await res.json();
      const rawMoisture = Number(data.moisturePercentage ?? data.moisture ?? data.reading);

      if (!Number.isFinite(rawMoisture) || rawMoisture < 0.1 || rawMoisture > 60.0) {
        throw new Error("MALFORMED_MEASUREMENT: Moisture percentage out of valid range (0.10 - 60.00%)");
      }

      return {
        deviceNumber: payload.deviceId,
        moisturePercentage: parseFloat(rawMoisture.toFixed(2)),
        temperatureC: data.temperature ? Number(data.temperature) : undefined,
        timestamp: data.timestamp || new Date().toISOString(),
        measurementId: data.measurementId ? String(data.measurementId) : `DEV-${Date.now()}`,
        source: "IOT_DEVICE",
        verificationStatus: "DEVICE_REPORTED",
        rawPayload: JSON.stringify(data),
      };
    } catch (err: any) {
      clearTimeout(timer);
      throw new Error(err.message || "FAILED_TO_FETCH_READING");
    }
  }
}

/**
 * Mock / Testing Device Adapter
 * Generates calibrated, realistic readings for testing and simulation in development environments.
 * Clearly marks measurements as SIMULATED so as never to falsely claim physical hardware connection.
 */
export class MockMoistureMeterAdapter implements IMoistureMeterAdapter {
  private simulatedMoisture: number;

  constructor(simulatedMoisture = 13.5) {
    this.simulatedMoisture = simulatedMoisture;
  }

  async connect(payload: MoistureMeterQRPayload): Promise<boolean> {
    // Simulate brief network handshake latency
    await new Promise((r) => setTimeout(r, 600));
    return true;
  }

  async getLatestReading(payload: MoistureMeterQRPayload): Promise<MoistureMeasurement> {
    // Simulate reading acquisition delay
    await new Promise((r) => setTimeout(r, 800));

    // Generate realistic paddy moisture reading (typically 12.0 - 15.0% for good dry paddy)
    const randomVariation = (Math.random() * 1.4 - 0.7);
    const calculatedMoisture = parseFloat((this.simulatedMoisture + randomVariation).toFixed(2));

    return {
      deviceNumber: payload.deviceId,
      moisturePercentage: calculatedMoisture,
      temperatureC: 28.5,
      timestamp: new Date().toISOString(),
      measurementId: `MOCK-${payload.deviceId}-${Date.now().toString(36).toUpperCase()}`,
      source: "MOCK",
      verificationStatus: "SIMULATED",
      rawPayload: JSON.stringify({
        mock: true,
        calibrated: true,
        sensorType: "Capacitive_Moisture_Pin",
        simulatedAt: new Date().toISOString(),
      }),
    };
  }
}

/**
 * Unified Device Manager
 * Coordinates QR parsing, Wi-Fi connectivity flow, and reading retrieval with automatic fallback.
 */
export class MoistureMeterService {
  private httpAdapter: IMoistureMeterAdapter;
  private mockAdapter: IMoistureMeterAdapter;

  constructor() {
    this.httpAdapter = new HttpWifiMoistureMeterAdapter(7000);
    this.mockAdapter = new MockMoistureMeterAdapter(13.8);
  }

  /**
   * Connect to device and retrieve latest reading.
   * If physical connection fails due to browser CORS or local Wi-Fi isolation (and allowSimulation is true),
   * provides a clearly marked simulated result.
   */
  async acquireReading(
    payload: MoistureMeterQRPayload,
    allowSimulation = true
  ): Promise<{ reading: MoistureMeasurement; isSimulated: boolean }> {
    try {
      // Try real physical device connection
      await this.httpAdapter.connect(payload);
      const reading = await this.httpAdapter.getLatestReading(payload);
      return { reading, isSimulated: false };
    } catch (realDeviceError: any) {
      if (!allowSimulation) {
        throw realDeviceError;
      }
      // Use mock adapter for development/preview, clearly labeled as SIMULATED
      console.warn(
        `[IoT Moisture Meter] Physical meter connection at ${payload.ip || "192.168.4.1"} unavailable (${realDeviceError.message}). Using calibrated development simulator.`
      );
      const simulatedReading = await this.mockAdapter.getLatestReading(payload);
      return { reading: simulatedReading, isSimulated: true };
    }
  }
}
