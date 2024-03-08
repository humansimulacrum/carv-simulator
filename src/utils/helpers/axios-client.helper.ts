import axiosRetry from 'axios-retry';
import axios from 'axios';
import { choose } from './random.helper';
import { UserAgents } from '../assets/user-agents.asset';
import { getProxyAgent } from './proxy.helper';

export const getClient = (
  params: { proxy: string; errorWaitSec?: number; errorRetryTimes?: number },
  headers?: any
) => {
  const { proxy, errorWaitSec = 10, errorRetryTimes = 3 } = params;

  const agent = getProxyAgent(proxy);

  const client = axios.create({
    timeout: 60000,
    headers,
    httpAgent: agent,
    httpsAgent: agent,
    responseType: 'json',
  });

  client.interceptors.request.use(
    (config) => {
      try {
        const str = JSON.stringify({ data: config.data, params: config.params, url: config.url }, null, 2);
        console.debug(`Request: ${str}`);
      } catch (error: any) {
        console.debug(`Request config debug error (${config.url}) ${error?.message}`);
      }

      return config;
    },
    (error) => {
      try {
        const str = JSON.stringify(error, null, 2);
        console.debug(`Request error: ${str}`);
      } catch (error: any) {
        console.debug(`Request error debug error ${error?.message}`);
      }

      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      try {
        const str = JSON.stringify({ data: response.data, url: response?.config?.url }, null, 2);
        console.debug(`Response: ${str}`);
      } catch (error: any) {
        console.debug(`Response config debug error (${response?.config?.url}) ${error?.message}`);
      }

      return response;
    },
    (error) => {
      try {
        const str = JSON.stringify(error, null, 2);
        console.debug(`Response error: ${str}`);
      } catch (error: any) {
        console.debug(`Response error debug error ${error?.message}`);
      }

      return Promise.reject(error);
    }
  );

  axiosRetry(client, {
    retries: errorRetryTimes,
    shouldResetTimeout: true,
    retryDelay: () => errorWaitSec * 1000,
    onRetry: (retryCount, error) => {
      console.error(`error ${error.message}. Retrying ${retryCount}`);
    },
    retryCondition: () => true,
  });

  return client;
};
