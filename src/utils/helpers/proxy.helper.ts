import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

interface ProxyConfig {
  type: 'https' | 'http' | 'socks';
  host: string;
  port: number;
  username: string;
  password: string;
}

export function parseProxy(proxy: string): ProxyConfig {
  // Split by :// to separate the type from the rest of the proxy string
  const [rawType, rest] = proxy.split('://');
  if (!rest) {
    throw new Error('Invalid proxy format: Protocol indicator missing.');
  }

  // Normalize the proxy type based on the protocol indicator
  let type: 'https' | 'http' | 'socks';
  switch (rawType.toLowerCase()) {
    case 'http':
    case 'https':
      type = 'https';
      break;
    case 'socks':
      type = 'socks';
      break;
    default:
      throw new Error(`Unsupported proxy type: ${rawType}`);
  }

  // Now split the rest by ':' expecting four parts: host, port, username, password
  const parts = rest.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid proxy format: Expected format is TYPE://HOST:PORT:USERNAME:PASSWORD');
  }

  const [host, port, username, password] = parts;

  return {
    type,
    host,
    port: parseInt(port, 10),
    username,
    password,
  };
}

export function getProxyAgent(proxy?: string) {
  if (!proxy) return undefined;

  const { type, host, port, username, password } = parseProxy(proxy);

  switch (type) {
    case 'https':
      return new HttpsProxyAgent(`http://${username}:${password}@${host}:${port}`);
    case 'socks':
      return new SocksProxyAgent(`socks://${username}:${password}@${host}:${port}`);
    default:
      throw new Error(`Proxy type is not allowed: ${type}`);
  }
}
