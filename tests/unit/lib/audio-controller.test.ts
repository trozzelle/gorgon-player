import { AudioController } from "../../../src/lib/audio-controller";
import {AudioContextMock} from "../../setup/mocks/audioContextMock";

describe('AudioController', () => {
    let audioController: AudioController

    beforeEach(() => {

        global.fetch = jest.fn().mockImplementation(() => {
            return Promise.resolve({
                ok: true,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
                headers: new Headers(),
                status: 200,
                statusText: 'OK',
                type: 'basic',
                url: '',
                clone: () => {},
                body: null,
                bodyUsed: false,
                json: () => Promise.resolve(),
                text: () => Promise.resolve('')
            } as Response)
        }) as jest.Mock


        audioController = new AudioController()
    })

    afterEach(() => {
        jest.clearAllMocks()
    });

    describe('loadTracks', () => {
        it('should load both tracks successfully', async () => {
            await audioController.loadTracks('/tests/fixtures/beastie_A.mp3', '/tests/fixtures/beastie_B.mp3')

            expect(fetch).toHaveBeenCalledTimes(2)
            expect(fetch).toHaveBeenCalledWith('/tests/fixtures/beastie_A.mp3')
            expect(fetch).toHaveBeenCalledWith('/tests/fixtures/beastie_B.mp3')
        })

        it('should handle fetch errors', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

            await expect(
                audioController.loadTracks('/tests/fixtures/beastie_A.mp3', '/tests/fixtures/beastie_B.mp3')
            ).rejects.toThrow('Network error')
        });

    });

    describe('Play/Pause', () => {

        beforeEach(async () => {
            await audioController.loadTracks('/tests/fixtures/beastie_A.mp3', '/tests/fixtures/beastie_B.mp3')

        });

        it('should start playback when pause is called', async () => {
            // Get mock source nodes via protected method
            // const sources = (audioController as any).getSourceNodes()

            audioController.play()

            const audioContextMock = (audioController as any).audioContext as AudioContextMock
            const sourceNodes = audioContextMock.sourceNodes

            expect(sourceNodes.length).toBe(2)

            expect(sourceNodes[0].start).toHaveBeenCalled()
            expect(sourceNodes[1].start).toHaveBeenCalled()

        });

        it('should stop playback when pause is called after play', () => {
            audioController.play()

            audioController.pause()

            const audioContextMock = (audioController as any).audioContext as AudioContextMock
            const sourceNodes = audioContextMock.sourceNodes

            expect(sourceNodes[0].stop).toHaveBeenCalled()
            expect(sourceNodes[1].stop).toHaveBeenCalled()
        });
    });
})