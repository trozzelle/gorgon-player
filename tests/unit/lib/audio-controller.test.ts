import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AudioController } from '../../../src/lib/audio-controller'
import { AudioContextMock } from '../../setup/mocks/audioContextMock'

describe('AudioController', () => {
  let audioController: AudioController

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() => {
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
        text: () => Promise.resolve(''),
      } as Response)
    })

    audioController = new AudioController()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('loadTracks', () => {
    it('should load both tracks successfully', async () => {
      await audioController.loadTracks(
        '/tests/fixtures/beastie_A.mp3',
        '/tests/fixtures/beastie_B.mp3'
      )

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenCalledWith('/tests/fixtures/beastie_A.mp3')
      expect(fetch).toHaveBeenCalledWith('/tests/fixtures/beastie_B.mp3')
    })

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(
        audioController.loadTracks('/tests/fixtures/beastie_A.mp3', '/tests/fixtures/beastie_B.mp3')
      ).rejects.toThrow('Network error')
    })
  })

  describe('Play/Pause', () => {
    beforeEach(async () => {
      await audioController.loadTracks(
        '/tests/fixtures/beastie_A.mp3',
        '/tests/fixtures/beastie_B.mp3'
      )
    })

    it('should start playback when play is called', async () => {
      audioController.play()

      const audioContextMock = (audioController as any).audioContext as AudioContextMock
      const sourceNodes = audioContextMock.sourceNodes

      expect(sourceNodes.length).toBe(2)
      expect(sourceNodes[0].start).toHaveBeenCalled()
      expect(sourceNodes[1].start).toHaveBeenCalled()
    })

    it('should stop playback when pause is called after play', () => {
      audioController.play()
      audioController.pause()

      const audioContextMock = (audioController as any).audioContext as AudioContextMock
      const sourceNodes = audioContextMock.sourceNodes

      expect(sourceNodes[0].stop).toHaveBeenCalled()
      expect(sourceNodes[1].stop).toHaveBeenCalled()
    })
  })

  describe('Progress and Seeking', () => {
    beforeEach(async () => {
      const mockAudioBuffer = {
        duration: 180,
        length: 7938000,
        sampleRate: 44100,
        numberOfChannels: 2,
      }

      const audioContextMock = (audioController as any).audioContext
      audioContextMock.decodeAudioData = vi.fn().mockResolvedValue(mockAudioBuffer)

      vi.spyOn(audioContextMock, 'currentTime', 'get').mockReturnValue(1)

      await audioController.loadTracks(
        '/tests/fixtures/beastie_A.mp3',
        '/tests/fixtures/beastie_B.mp3'
      )

      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.clearAllMocks()
    })

    it('should emit timeupdate event when tracks are loaded', async () => {
      const listener = vi.fn()

      audioController.addEventListener('timeupdate', listener)
      await audioController.loadTracks(
        '/tests/fixtures/beastie_A.mp3',
        '/tests/fixtures/beastie_B.mp3'
      )

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 0,
        })
      )
    })

    it('should emit timeupdate events during playback', async () => {
      const listener = vi.fn()

      audioController.addEventListener('timeupdate', listener)
      audioController.play()

      vi.advanceTimersByTime(1000)

      const timeUpdateEvent = listener.mock.calls[0][0] as CustomEvent<number>
      const currentTime = timeUpdateEvent.detail

      expect(listener).toHaveBeenCalled()
      expect(listener.mock.calls.length).toBeGreaterThan(1)
      expect(currentTime).toBe(0)
    })

    it('should seek to a specified time', async () => {
      const listener = vi.fn()
      audioController.addEventListener('timeupdate', listener)

      const seekTime = 30
      audioController.seek(seekTime)

      const timeUpdateEvent = listener.mock.calls[0][0] as CustomEvent<number>
      const currentTime = timeUpdateEvent.detail

      expect(currentTime).toBe(seekTime)
    })

    it('should clamp seek time to a valid range', () => {
      const duration = audioController.getDuration()
      const listener = vi.fn()

      audioController.addEventListener('timeupdate', listener)

      audioController.seek(duration + 10)

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: duration,
        })
      )

      audioController.seek(-10)

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: 0,
        })
      )
    })

    it('should maintain playback state when seeking', () => {
      audioController.play()
      const wasPlaying = true

      audioController.seek(30)

      const playingState = audioController.getPlayingState()
      expect(playingState).toBe(wasPlaying)
    })

    it('should cleanup timeupdate listener', () => {
      const listener = vi.fn()

      audioController.addEventListener('timeupdate', listener)
      audioController.removeEventListener('timeupdate', listener)

      audioController.play()
      vi.advanceTimersByTime(1000)

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
