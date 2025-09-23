import * as dotenv from 'dotenv';
import { TelemetryConfig } from './telemetry.config';

dotenv.config({ path: 'config/.env' });
export function readTelemetryConfig(): TelemetryConfig {
  return {
    run: true,
    serviceName: process.env.SERVICE_NAME || 'billing_navigator',
    traceCollectorUrl: process.env.TRACE_COLLECTOR_URL || 'http://localhost:4318/v1/traces'
  };
}
