import * as Crypto from 'expo-crypto';

// Base62 encoding characters
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// KSUID constants
const EPOCH = 1400000000000; // 2014-05-13T16:53:20Z
const TIMESTAMP_BYTES = 4;
const PAYLOAD_BYTES = 16;
const TOTAL_BYTES = TIMESTAMP_BYTES + PAYLOAD_BYTES;

/**
 * Custom KSUID implementation using Expo's crypto module
 */
export class CustomKSUID {
  private buffer: Uint8Array;
  private string: string;

  constructor(buffer: Uint8Array) {
    if (buffer.length !== TOTAL_BYTES) {
      throw new Error(`Invalid KSUID buffer length: ${buffer.length}`);
    }
    this.buffer = buffer;
    this.string = this.encode();
  }

  /**
   * Generate a random KSUID synchronously
   */
  static randomSync(): CustomKSUID {
    const timestamp = Date.now() - EPOCH;
    const timestampBuffer = new Uint8Array(TIMESTAMP_BYTES);

    // Write timestamp to buffer (big-endian)
    timestampBuffer[0] = (timestamp >> 24) & 0xff;
    timestampBuffer[1] = (timestamp >> 16) & 0xff;
    timestampBuffer[2] = (timestamp >> 8) & 0xff;
    timestampBuffer[3] = timestamp & 0xff;

    // Generate random payload
    const payload = Crypto.getRandomBytes(PAYLOAD_BYTES);

    // Combine timestamp and payload
    const buffer = new Uint8Array(TOTAL_BYTES);
    buffer.set(timestampBuffer, 0);
    buffer.set(payload, TIMESTAMP_BYTES);

    return new CustomKSUID(buffer);
  }

  /**
   * Generate a random KSUID asynchronously
   */
  static async random(): Promise<CustomKSUID> {
    const timestamp = Date.now() - EPOCH;
    const timestampBuffer = new Uint8Array(TIMESTAMP_BYTES);

    // Write timestamp to buffer (big-endian)
    timestampBuffer[0] = (timestamp >> 24) & 0xff;
    timestampBuffer[1] = (timestamp >> 16) & 0xff;
    timestampBuffer[2] = (timestamp >> 8) & 0xff;
    timestampBuffer[3] = timestamp & 0xff;

    // Generate random payload
    const payload = await Crypto.getRandomBytesAsync(PAYLOAD_BYTES);

    // Combine timestamp and payload
    const buffer = new Uint8Array(TOTAL_BYTES);
    buffer.set(timestampBuffer, 0);
    buffer.set(payload, TIMESTAMP_BYTES);

    return new CustomKSUID(buffer);
  }

  /**
   * Create a KSUID from a timestamp and payload
   */
  static fromParts(timestamp: number, payload: Uint8Array): CustomKSUID {
    if (payload.length !== PAYLOAD_BYTES) {
      throw new Error(`Invalid payload length: ${payload.length}`);
    }

    const adjustedTimestamp = timestamp - EPOCH;
    const timestampBuffer = new Uint8Array(TIMESTAMP_BYTES);

    // Write timestamp to buffer (big-endian)
    timestampBuffer[0] = (adjustedTimestamp >> 24) & 0xff;
    timestampBuffer[1] = (adjustedTimestamp >> 16) & 0xff;
    timestampBuffer[2] = (adjustedTimestamp >> 8) & 0xff;
    timestampBuffer[3] = adjustedTimestamp & 0xff;

    // Combine timestamp and payload
    const buffer = new Uint8Array(TOTAL_BYTES);
    buffer.set(timestampBuffer, 0);
    buffer.set(payload, TIMESTAMP_BYTES);

    return new CustomKSUID(buffer);
  }

  /**
   * Parse a KSUID from a string
   */
  static parse(str: string): CustomKSUID {
    const buffer = new Uint8Array(TOTAL_BYTES);
    let value = 0n;

    // Convert base62 string to buffer
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const digit = BASE62.indexOf(char);
      if (digit === -1) {
        throw new Error(`Invalid KSUID character: ${char}`);
      }
      value = value * 62n + BigInt(digit);
    }

    // Convert to bytes
    for (let i = TOTAL_BYTES - 1; i >= 0; i--) {
      buffer[i] = Number(value & 0xffn);
      value = value >> 8n;
    }

    return new CustomKSUID(buffer);
  }

  /**
   * Check if a buffer is a valid KSUID
   */
  static isValid(buffer: Uint8Array): boolean {
    return buffer.length === TOTAL_BYTES;
  }

  /**
   * Get the raw buffer
   */
  get raw(): Uint8Array {
    return this.buffer;
  }

  /**
   * Get the timestamp as a Date object
   */
  get date(): Date {
    const timestamp = this.timestamp;
    return new Date(timestamp + EPOCH);
  }

  /**
   * Get the raw timestamp
   */
  get timestamp(): number {
    return (this.buffer[0] << 24) | (this.buffer[1] << 16) | (this.buffer[2] << 8) | this.buffer[3];
  }

  /**
   * Get the payload
   */
  get payload(): Uint8Array {
    return this.buffer.slice(TIMESTAMP_BYTES);
  }

  /**
   * Compare this KSUID with another
   */
  compare(other: CustomKSUID): number {
    for (let i = 0; i < TOTAL_BYTES; i++) {
      if (this.buffer[i] < other.buffer[i]) return -1;
      if (this.buffer[i] > other.buffer[i]) return 1;
    }
    return 0;
  }

  /**
   * Check if this KSUID equals another
   */
  equals(other: CustomKSUID): boolean {
    return this.compare(other) === 0;
  }

  /**
   * Encode the KSUID as a base62 string
   */
  private encode(): string {
    let value = 0n;

    // Convert bytes to bigint
    for (let i = 0; i < TOTAL_BYTES; i++) {
      value = (value << 8n) | BigInt(this.buffer[i]);
    }

    // Convert to base62
    let str = '';
    while (value > 0n) {
      const remainder = Number(value % 62n);
      str = BASE62[remainder] + str;
      value = value / 62n;
    }

    // Pad with zeros if needed
    while (str.length < 27) {
      str = '0' + str;
    }

    return str;
  }
}
