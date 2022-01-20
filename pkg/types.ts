export type Header = {
  key: string
  value: string
}

export type Message = {
  topic: string
  partition: number
  offset: number
  timestamp: number
  key: string
  value: string
  headers: Header[]
}

// export type RetryOptions = {
//   /**
//    * How many retries should be attempted.
//    * For example `retries: 3` will result in a maximum of 4 requests being made.
//    * 1 by default and then 3 retries in case of failure.
//    */
//   retries?: number

//   /**
//    * Backoff algorithm to use.
//    * Return the time to wait in milliseconds before sending another request
//    *
//    * @default (attempt) => 2 ** attempt * 250
//    *
//    *
//    */
//   backoff?: (attempt: number) => number
// }
