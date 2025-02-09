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

  private duration: number = 0
  private progressCallback: ((time: number) => void) | null = null
  private rafId: number | null = null

  private eventTarget = new EventTarget()

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

    this.duration = bufferA.duration

    this.eventTarget.dispatchEvent(new CustomEvent('timeupdate', { detail: 0 }))
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
    this.startProgressTracking()
  }

  pause() {
    logger.info('Pause method called')
    if (!this.isPlaying) return

    this.sourceA?.stop()
    this.sourceB?.stop()

    this.offset = this.audioContext.currentTime - this.startTime
    this.isPlaying = false
    // this.stopProgressTracking()
  }

  // setProgressCallback(callback: (time: number) => void) {
  //   this.progressCallback = callback
  // }
  //
  // private startProgressTracking() {
  //   const updateProgress = () => {
  //     // if (!this.isPlaying) return
  //
  //     const currentTime = this.getCurrentTime()
  //     this.progressCallback?.(currentTime)
  //     this.rafId = requestAnimationFrame(updateProgress)
  //   }
  //
  //   this.rafId = requestAnimationFrame(updateProgress)
  // }
  //
  // private stopProgressTracking() {
  //   if (this.rafId !== null) {
  //     cancelAnimationFrame(this.rafId)
  //     this.rafId = null
  //   }
  // }

  addEventListener(type: 'timeupdate', listener: (event: CustomEvent<number>) => void): void {
    this.eventTarget.addEventListener(type, listener as EventListener)
  }

  removeEventListener(type: 'timeupdate', listener: (event: CustomEvent<number>) => void): void {
    this.eventTarget.removeEventListener(type, listener as EventListener)
  }

  private startProgressTracking() {
    const updateProgress = () => {
      if (!this.isPlaying) return

      const currentTime = this.getCurrentTime()
      // Dispatch event instead of calling callback
      this.eventTarget.dispatchEvent(new CustomEvent('timeupdate', { detail: currentTime }))

      requestAnimationFrame(updateProgress)
    }

    requestAnimationFrame(updateProgress)
  }

  getCurrentTime(): number {
    return this.isPlaying ? this.audioContext.currentTime - this.startTime : this.offset
  }

  getDuration(): number {
    return this.duration
  }

  getPlayingState() {
    return this.isPlaying
  }

  seek(time: number) {
    const wasPlaying = this.isPlaying
    if (wasPlaying) {
      this.pause()
    }

    this.offset = Math.max(0, Math.min(time, this.duration))

    if (wasPlaying) {
      this.play()
    } else {
      this.eventTarget.dispatchEvent(new CustomEvent('timeupdate', { detail: this.offset }))
    }
  }

  setBalance(value: number) {
    this.gainA.gain.value = 1 - value
    this.gainB.gain.value = value
    logger.debug(`Gain A: ${this.gainA.gain.value}, Gain B: ${this.gainB.gain.value}`)
  }
}
