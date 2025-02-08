import { logger } from './logger.ts'

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

// Determines either standard AudioContext or webkit prefix for Safari
const AudioContextClass = window.AudioContext || window.webkitAudioContext

export interface LoadedTracks {
  trackA: AudioBuffer | null
  trackB: AudioBuffer | null
}

export class AudioController {
  /**
   * Controller class for audio player
   * @private
   */
  private audioContext: AudioContext

  /**
   * Declaring A/B for now but might want to generalize it
   * into an arbitrary number of sources
   */
  private sourceA: AudioBufferSourceNode | null = null
  private sourceB: AudioBufferSourceNode | null = null

  private gainA: GainNode
  private gainB: GainNode

  private audioBufferA: AudioBuffer | null = null
  private audioBufferB: AudioBuffer | null = null

  private isPlaying = false
  private startTime = 0
  private offset = 0

  constructor() {
    try {
      this.audioContext = new AudioContextClass()
    } catch (e) {
      throw new Error('Web Audio API is not supported by this browser')
    }
    this.gainA = this.audioContext.createGain()
    this.gainB = this.audioContext.createGain()

    this.gainA.connect(this.audioContext.destination)
    this.gainB.connect(this.audioContext.destination)
  }

  async loadTracks(trackAUrl: string, trackBUrl: string): Promise<void> {
    /**
     * Load A and B track audio buffers
     */
    logger.info('Loading tracks: ', { trackAUrl, trackBUrl })

    const [bufferA, bufferB] = await Promise.all([
      this.fetchAudioBuffer(trackAUrl),
      this.fetchAudioBuffer(trackBUrl),
    ])

    logger.debug('Buffers loaded: ', { bufferA, bufferB })

    this.audioBufferA = bufferA
    this.audioBufferB = bufferB
  }

  protected getLoadedTracks(): LoadedTracks {
    return {
      trackA: this.audioBufferA,
      trackB: this.audioBufferB,
    }
  }

  protected getSourceNodes() {
    return {
      sourceA: this.sourceA,
      sourceB: this.sourceB,
    }
  }

  private async fetchAudioBuffer(url: string): Promise<AudioBuffer> {
    /**
     * Fetches and decodes track
     */
    logger.debug('Fetching: ', url)
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return await this.audioContext.decodeAudioData(arrayBuffer)
  }

  play() {
    // If we're already playing or either buffer is empty, return
    logger.info('Play method called')

    if (this.isPlaying) return
    if (!this.audioBufferA || !this.audioBufferB) return

    this.sourceA = this.audioContext.createBufferSource()
    this.sourceB = this.audioContext.createBufferSource()

    this.sourceA.buffer = this.audioBufferA
    this.sourceB.buffer = this.audioBufferB

    this.sourceA.connect(this.gainA)
    this.sourceB.connect(this.gainB)

    this.startTime = this.audioContext.currentTime - this.offset
    this.sourceA.start(0, this.offset)
    this.sourceB.start(0, this.offset)

    this.isPlaying = true
  }

  pause() {
    logger.info('Pause method called')
    if (!this.isPlaying) return

    this.sourceA?.stop()
    this.sourceB?.stop()

    this.offset = this.audioContext.currentTime - this.startTime
    this.isPlaying = false
  }

  setBalance(value: number) {
    this.gainA.gain.value = 1 - value
    this.gainB.gain.value = value
    logger.debug(`Gain A: ${this.gainA.gain.value}, Gain B: ${this.gainB.gain.value}`)
  }
}
