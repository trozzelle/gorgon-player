export class AudioContextMock {
    destination = {}
    sourceNodes: any[] = []
    createGain() {
        return {
            connect: jest.fn(),
            gain: {
                value: 0
            }
        }
    }

    createBufferSource() {
        const sourceNode = {
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            buffer: null
        }
        this.sourceNodes.push(sourceNode)
        return sourceNode
    }

    decodeAudioData(_: ArrayBuffer) {
        console.log('Decoding audio data')
        return Promise.resolve({
            duration: 1,
            length: 1000,
            sampleRate: 44100,
            numberOfChannels: 2
        } as AudioBuffer)
    }
}

global.AudioContext = AudioContextMock as any