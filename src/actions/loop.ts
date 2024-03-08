import axios from 'axios';
import { differenceInSeconds } from 'date-fns';
import axiosRetry from 'axios-retry';

import Queue from '../utils/helpers/queue.helper';
import { sleep } from '../utils/helpers/sleep.helper';
import { formatRel } from '../utils/helpers/time.helper';
import { importETHWallets, importNames, importProxies } from '../utils/helpers/file-import.helper';
import { withRetry } from '../utils/helpers/retry.helper';
import { Carv } from '../modules/carv.module';
import { logger } from '../utils/helpers/logger.helper';

axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  retryDelay: () => 2 * 60 * 1000,
  onRetry: (retryCount, error) => {
    logger.error(`Error => ${error.message}. Retrying ${retryCount}`);
  },
  retryCondition: () => true,
});

const loop = async () => {
  const privateKeys = await importETHWallets();
  const names = await importNames();
  const proxies = await importProxies();

  if (!(privateKeys.length === names.length && names.length === proxies.length)) {
    logger.error('Private keys count should be equal to name cound and proxies count');
    throw new Error('Private keys count should be equal to name cound and proxies count');
  }

  const queue = new Queue(privateKeys, names, 30, 120);

  const lastRunTime = queue.lastRunTime();
  const secondsToInit = differenceInSeconds(lastRunTime, new Date());

  logger.info(`All wallets (${privateKeys.length}) will be initialized approximately in ${formatRel(secondsToInit)}`);

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
      logger.error(`${name} | ${(error as Error)?.message}`);
      await sleep(10);
    }

    const nextRunSec = queue.push(queueItem);
    logger.info(`${name} | next run ${formatRel(nextRunSec)}`);
  }

  logger.info('Invocation success!');
};

loop().catch((error) => logger.error(error.message));
