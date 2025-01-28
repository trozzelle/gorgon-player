export class AudioContextMock {
    createGain() {
        return {
            connect: jest.fn(),
            gain: {
                value: 0
            }
        }
    }

    createBufferSource() {
        return {
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            buffer: null
        }
    }

    decodeAudioData() {
        return Promise.resolve({} as AudioBuffer)
    }
}

global.AudioContext = AudioContextMock as any