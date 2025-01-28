import { GorgonPlayer} from "../../../src";
// import {queries} from "@testing-library/dom";

describe('GorgonPlayer', () => {
    let player: GorgonPlayer

    beforeEach(() => {
        player = new GorgonPlayer()
        document.body.appendChild(player)
    })

    afterEach(() => {
        player.remove()
        document.head.querySelectorAll('style').forEach(style => style.remove())
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

})