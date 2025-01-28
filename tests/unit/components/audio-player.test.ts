import { GorgonPlayer} from "../../../src"
// import {queries} from "@testing-library/dom";
import { fireEvent } from '@testing-library/dom'

describe('GorgonPlayer', () => {
    let player: GorgonPlayer

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

        player = new GorgonPlayer()
        document.body.appendChild(player)
    })

    afterEach(() => {
        player.remove()
        document.head.querySelectorAll('style').forEach(style => style.remove())
        jest.restoreAllMocks()
    })

    it('should render initial state correctly', () => {
        const shadow = player.shadowRoot
        expect(shadow).toBeTruthy()

        const playButton = shadow?.querySelector('#play-icon')
        expect(playButton).toBeTruthy()
        expect(playButton?.textContent?.trim()).toBe('▶')

        const slider = shadow?.querySelector('.compare-slider')
        expect(slider).toBeTruthy()
        expect((slider as HTMLInputElement)?.value).toBe('50')
    })

    it('should update play button state when clicked', () => {
        const shadow = player.shadowRoot
        const playButton = shadow?.querySelector('.play-button')

        if (!playButton) fail("Could not select play button")

        fireEvent.click(playButton)
        expect(playButton?.textContent?.trim()).toBe('⏸')

        fireEvent.click(playButton)
        expect(playButton?.textContent?.trim()).toBe('▶')

    })

    it('should load tracks from attributes', async() => {
        // For this test we need to set the attributes, so we're
        // removing the player from the DOM, setting the attrs,
        // then adding it back
        player.remove()

        const testPlayer = new GorgonPlayer()

        testPlayer.setAttribute('track-a', '/tests/fixtures/beastie_A.mp3')
        testPlayer.setAttribute('track-b', '/tests/fixtures/beastie_B.mp3')

        document.body.appendChild(testPlayer)
        // Waits for connectedCallback to complete
        await new Promise(resolve => setTimeout(resolve, 0))

        const audioController = (testPlayer as any).getAudioController()
        const { trackA, trackB } = audioController.getLoadedTracks()

        // Debug
        console.log('Attributes: ', {
            trackA: testPlayer.getAttribute('track-a'),
            trackB: testPlayer.getAttribute('track-b')
        })
        console.log('Loaded tracks: ', {trackA, trackB})

        expect(trackA).toBeTruthy()
        expect(trackB).toBeTruthy()

        expect(fetch).toHaveBeenCalledWith('/tests/fixtures/beastie_A.mp3')
        expect(fetch).toHaveBeenCalledWith('/tests/fixtures/beastie_B.mp3')

        testPlayer.remove()
    })

})