import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GorgonPlayer } from '../../../src/index'

describe('GorgonPlayer', () => {
  let player: GorgonPlayer

  beforeEach(async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
      headers: new Headers(),
      status: 200,
      statusText: 'OK',
    } as Response)

    player = new GorgonPlayer()
    document.body.appendChild(player)

    await new Promise((resolve) => setTimeout(resolve, 0))
  })

  afterEach(() => {
    player.remove()
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render with default play button state', () => {
      const playButton = player.shadowRoot?.querySelector('.play-button')
      const playIcon = playButton?.querySelector('.play-icon')

      expect(playButton).toBeTruthy()
      expect(playIcon?.textContent?.trim()).toBe('▶')
    })

    it('should render with default track titles', () => {
      const title = player.shadowRoot?.querySelector('.track-title')
      const subtitle = player.shadowRoot?.querySelector('.track-subtitle')

      expect(title?.textContent).toBe('Demo Track')
      expect(subtitle?.textContent).toBe('Artist')
    })

    it('should render with compare controls', () => {
      const compareToggle = player.shadowRoot?.querySelector('.compare-toggle') as HTMLInputElement

      expect(compareToggle).toBeTruthy()
      expect(compareToggle.checked).toBe(false)
    })
  })

  describe('Playback Control', () => {
    it('should toggle play/pause state when clicking play button', async () => {
      const playButton = player.shadowRoot?.querySelector('.play-button')
      const audioController = (player as any).getAudioController()
      const clickEvent = new CustomEvent('click', {
        bubbles: true,
        composed: true,
      })

      const playSpy = vi.spyOn(audioController, 'play')
      const pauseSpy = vi.spyOn(audioController, 'pause')

      expect(playButton?.textContent?.trim()).toBe('▶')

      playButton?.dispatchEvent(clickEvent)
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(playButton?.textContent?.trim()).toBe('⏸')
      expect(playSpy).toHaveBeenCalledOnce()

      playButton?.dispatchEvent(clickEvent)
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(playButton?.textContent?.trim()).toBe('▶')
      expect(pauseSpy).toHaveBeenCalledOnce()
    })

    it('should maintain correct playing state in AudioController', async () => {
      const playButton = player.shadowRoot?.querySelector('.play-button')
      const audioController = (player as any).getAudioController()

      const clickEvent = new CustomEvent('click', {
        bubbles: true,
        composed: true,
      })

      playButton?.dispatchEvent(clickEvent)
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(audioController.isPlaying).toBe(true)

      playButton?.dispatchEvent(clickEvent)
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(audioController.isPlaying).toBe(false)
    })
  })
})
