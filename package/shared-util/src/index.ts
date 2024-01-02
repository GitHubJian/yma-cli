import chalk$ from 'chalk';
import deepmerge$ from 'deepmerge';

export * from './env';
export * from './exit';
export * from './is-ts-repo';
export * from './logger';
export * from './module';
export * from './options';
export * from './rc';
export * from './resolve-pkg';
export * from './spinner';

export const chalk = chalk$;
export const deepmerge = deepmerge$;
