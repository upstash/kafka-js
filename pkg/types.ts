export type Header = { key: string; value: string }

export type Message = {
  topic: string
  partition: number
  offset: number
  timestamp: number
  key: string
  value: string
  headers: Header[]
}
