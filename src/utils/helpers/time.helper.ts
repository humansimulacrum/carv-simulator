import { addHours, minutesToMilliseconds } from 'date-fns';

import { addSeconds, formatRelative, formatDistanceToNowStrict, differenceInMinutes } from 'date-fns';

interface Replacement {
  search: string;
  replace: string;
}

const distanceReplacers: Replacement[] = [
  { search: ' seconds', replace: 's' },
  { search: ' minutes', replace: 'm' },
  { search: ' hours', replace: 'h' },
  { search: ' days', replace: 'd' },
  { search: ' months', replace: 'mth' },
  { search: ' years', replace: 'y' },
  { search: ' second', replace: 's' },
  { search: ' minute', replace: 'm' },
  { search: ' hour', replace: 'h' },
  { search: ' day', replace: 'd' },
  { search: ' month', replace: 'mth' },
  { search: ' year', replace: 'y' },
];

const relativeReplaces: Replacement[] = [
  { search: 'today at ', replace: '' },
  { search: 'tomorrow at ', replace: '' },
];

const applyReplacements = (input: string, replacements: Replacement[]): string => {
  let result = input;
  replacements.forEach(({ search, replace }) => {
    result = result.replace(new RegExp(search, 'g'), replace);
  });
  return result;
};

export const formatRel = (sec: number): string => {
  const now = new Date();
  const time = addSeconds(now, sec);
  let relative = formatRelative(time, now);
  relative = differenceInMinutes(time, now) > 24 * 60 ? relative : applyReplacements(relative, relativeReplaces);
  const distance = applyReplacements(formatDistanceToNowStrict(time), distanceReplacers);
  return `${relative} (${distance})`;
};

export const startOfNextUTCDay = () => {
  const currentLocalTime = new Date();

  const timezoneOffsetMs = minutesToMilliseconds(currentLocalTime.getTimezoneOffset());

  const startOfNextDayLocal = new Date(currentLocalTime);

  startOfNextDayLocal.setHours(0, 0, 0, 0);
  startOfNextDayLocal.setDate(startOfNextDayLocal.getDate() + 1);

  const startOfNextDayUTC = new Date(startOfNextDayLocal.getTime() - timezoneOffsetMs);

  const timestampNextDayUTC = startOfNextDayUTC.getTime();

  return timestampNextDayUTC;
};

export const endOfNextUTCDay = () => {
  const start = startOfNextUTCDay();
  return addHours(start, 24).getTime();
};
