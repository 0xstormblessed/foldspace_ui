import { Result } from 'neverthrow';

export type MyResult<T> = Result<T, Error>;
export type MyAsyncResult<T> = Promise<MyResult<T>>;
