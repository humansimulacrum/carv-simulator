import { addHours, differenceInSeconds, subHours } from 'date-fns';
import { startOfNextUTCDay, endOfNextUTCDay } from './time.helper';
import { randomIntInRange } from './random.helper';

type RawItem = {
  key: string;
  index: number;
  name: string;
};

type Item = {
  nextRunTime: number;
} & RawItem;

class Queue {
  public readonly items: Item[];

  public constructor(keys: string[], names: string[], minSleepSec: number, maxSleepSec: number) {
    const rawItems: RawItem[] = keys.map((key: string, index: number) => ({ key, index, name: names[index] }));

    let prevTime = new Date().getTime() + 10 * 1000;

    this.items = [];

    for (const rawItem of rawItems) {
      const sleepSec = randomIntInRange(minSleepSec, maxSleepSec);
      const nextRunTime = prevTime + sleepSec * 1000;
      this.items.push({ ...rawItem, nextRunTime });

      prevTime = nextRunTime;
    }

    this.sort();
  }

  public sort() {
    this.items.sort((a, b) => a.nextRunTime - b.nextRunTime);
  }

  public next() {
    if (this.isEmpty()) return null;

    return this.items.shift() as Item;
  }

  public isEmpty() {
    return this.items.length === 0;
  }

  public push(rawItem: RawItem) {
    const safeHours = 2;
    const startTime = addHours(startOfNextUTCDay(), safeHours).getTime();
    const endTime = subHours(endOfNextUTCDay(), safeHours).getTime();
    const nextRunTime = randomIntInRange(startTime, endTime);

    this.items.push({ ...rawItem, nextRunTime });

    this.sort();

    const nextRunSec = differenceInSeconds(nextRunTime, new Date());

    return nextRunSec;
  }

  public lastRunTime() {
    return this.items[this.items.length - 1].nextRunTime;
  }
}

export default Queue;
