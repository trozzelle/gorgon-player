import { AudioContextMock } from './mocks/audioContextMock'
import '@testing-library/dom'
import { vi } from 'vitest'

window.AudioContext = AudioContextMock as any

global.fetch = vi.fn(async () => ({
  ok: true,
  arrayBuffer: async () => new ArrayBuffer(8),
  headers: new Headers(),
  status: 200,
  statusText: 'OK',
})) as any
