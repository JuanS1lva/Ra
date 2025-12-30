import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from './request-context.interface';

export const REQUEST_CONTEXT_STORAGE = 'REQUEST_CONTEXT_STORAGE';

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
