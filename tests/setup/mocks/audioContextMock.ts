import { vi } from 'vitest'

export class AudioContextMock {
  currentTime: number = 0
  destination = {}
  sourceNodes: any[] = []

  constructor() {
    this.destination = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as AudioDestinationNode
  }

  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        value: 0,
      },
    }
  }

  createBufferSource() {
    const sourceNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
    }
    this.sourceNodes.push(sourceNode as unknown as AudioBufferSourceNode)
    return sourceNode
  }

  decodeAudioData(_: ArrayBuffer) {
    return Promise.resolve({
      duration: 180,
      length: 7938000,
      sampleRate: 44100,
      numberOfChannels: 2,
    } as unknown as AudioBuffer)
  }
}
