import axios from 'axios';
import { differenceInSeconds } from 'date-fns';
import axiosRetry from 'axios-retry';

import Queue from '../utils/helpers/queue.helper';
import { sleep } from '../utils/helpers/sleep.helper';
import { formatRel } from '../utils/helpers/time.helper';
import { importETHWallets, importNames, importProxies } from '../utils/helpers/file-import.helper';
import { withRetry } from '../utils/helpers/retry.helper';
import { Carv } from '../modules/carv.module';

axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  retryDelay: () => 2 * 60 * 1000,
  onRetry: (retryCount, error) => {
    console.error(`error ${error.message}. Retrying ${retryCount}`);
  },
  retryCondition: () => true,
});

const loop = async () => {
  const privateKeys = await importETHWallets();
  const names = await importNames();
  const proxies = await importProxies();

  const queue = new Queue(privateKeys, names, 30, 60);

  const lastRunTime = queue.lastRunTime();
  const secondsToInit = differenceInSeconds(lastRunTime, new Date());

  console.info(`approx all wallets (${privateKeys.length}) will be initialized ${formatRel(secondsToInit)}`);

  let isFirstIteration = true;

  while (!queue.isEmpty()) {
    const queueItem = queue.next();

    if (!queueItem) break;

    if (!isFirstIteration) {
      const pauseSec = Math.max(differenceInSeconds(queueItem.nextRunTime, new Date()), 0);

      await sleep(pauseSec);
    }

    isFirstIteration = false;

    const { name, key, index } = queueItem;

    const proxy = proxies[index];

    try {
      await withRetry(async () => await new Carv(key, name, proxy).execute());
    } catch (error) {
      console.error(`${name} | ${(error as Error)?.message}`);
      await sleep(10);
    }
  }

  console.info('done');
};

loop().catch((error) => console.error(error.message));
