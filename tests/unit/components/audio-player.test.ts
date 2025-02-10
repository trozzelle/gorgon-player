import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GorgonPlayer } from '../../../src/index'
import { DOMRect, MouseEvent } from 'happy-dom'

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
      const title = player.shadowRoot?.querySelector('.track-name')
      const subtitle = player.shadowRoot?.querySelector('.artist-name')

      expect(title?.textContent).toBe('Default Track')
      expect(subtitle?.textContent).toBe('No Artist')
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
  describe('Progress Bar', () => {
    beforeEach(async () => {
      const audioController = (player as any).getAudioController()
      vi.spyOn(audioController, 'getDuration').mockReturnValue(180)
    })

    it('should render progress bar with initial state', () => {
      const progressBar = player.shadowRoot?.querySelector('.progress-bar')
      const progressFill = player.shadowRoot?.querySelector('.progress-fill')
      const timeDisplay = player.shadowRoot?.querySelector('.time')

      expect(progressBar).toBeTruthy()
      expect(progressFill).toBeTruthy()
      expect(timeDisplay?.textContent?.trim()).toBe('00:00 / 03:00')
    })

    it('should update progress bar on timeupdate event', async () => {
      const audioController = (player as any).getAudioController()
      const timeUpdateEvent = new CustomEvent('timeupdate', {
        detail: 60,
      })

      audioController.eventTarget.dispatchEvent(timeUpdateEvent)
      await player.updateComplete

      const progressFill: HTMLElement | null | undefined =
        player.shadowRoot?.querySelector('.progress-fill')
      const timeDisplay = player.shadowRoot?.querySelector('.time')

      expect(progressFill?.style.width).toBe('33.33333333333333%')
      expect(timeDisplay?.textContent?.trim()).toBe('01:00 / 03:00')
    })

    it('should handle progress bar clicks', async () => {
      const audioController = (player as any).getAudioController()
      const seekSpy = vi.spyOn(audioController, 'seek')

      const progressBar = player.shadowRoot?.querySelector('.progress-bar')
      const rect = { left: 0, width: 100 } as DOMRect
      vi.spyOn(progressBar as Element, 'getBoundingClientRect').mockReturnValue(rect)

      const clickEvent = new MouseEvent('click', {
        clientX: 50,
        bubbles: true,
        composed: true,
      })

      //@ts-expect-error MouseEvent satisfies Event
      progressBar?.dispatchEvent(clickEvent)
      await player.updateComplete

      expect(seekSpy).toHaveBeenCalledWith(90) // 1/2 of mock audio duration
    })

    it('should format time display correctly', async () => {
      const audioController = (player as any).getAudioController()

      const times = [
        { seconds: 0, expected: '00:00' },
        { seconds: 61, expected: '01:01' },
        { seconds: 179, expected: '02:59' },
      ]

      for (const { seconds, expected } of times) {
        const timeUpdatedEvent = new CustomEvent('timeupdate', {
          detail: seconds,
        })

        audioController.eventTarget.dispatchEvent(timeUpdatedEvent)
        await player.updateComplete

        const timeDisplay = player.shadowRoot?.querySelector('.time')
        expect(timeDisplay?.textContent?.trim()).toContain(expected)
      }
    })

    it('should cleanup timeupdate listener on disconnect', () => {
      const audioController = (player as any).getAudioController()
      const removeEventListenerSpy = vi.spyOn(audioController, 'removeEventListener')

      player.remove()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function))
    })
  })
})
