import * as winston from 'winston';
import { TransformableInfo } from 'logform';

const customFormat = winston.format.printf((info: TransformableInfo): string => {
  const { level, message, timestamp } = info;
  return `${timestamp} | ${level} | ${message}`;
});

const initDefaultLogger = (consoleLevel: string = 'info'): winston.Logger => {
  const formatTimestamp = winston.format.timestamp({ format: 'HH:mm:ss' });
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: consoleLevel,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.splat(),
          formatTimestamp,
          customFormat
        ),
      }),
    ],
  });
  return logger;
};

export const logger = initDefaultLogger();
