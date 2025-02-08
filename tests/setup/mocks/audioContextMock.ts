import { vi } from 'vitest'

export class AudioContextMock {
    destination = {}
    sourceNodes: any[] = []
  
    createGain() {
      return {
        connect: vi.fn(),
        gain: {
          value: 0
        }
      }
    }
  
    createBufferSource() {
      const sourceNode = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null
      }
      this.sourceNodes.push(sourceNode)
      return sourceNode
    }
  
    decodeAudioData(_: ArrayBuffer) {
      return Promise.resolve({
        duration: 1,
        length: 1000,
        sampleRate: 44100,
        numberOfChannels: 2
      } as AudioBuffer)
    }
  }