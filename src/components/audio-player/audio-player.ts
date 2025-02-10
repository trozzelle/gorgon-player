import { AudioController } from '../../lib/audio-controller.ts'
import { logger } from '../../lib/logger.ts'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { HTMLDivElement, MouseEvent } from 'happy-dom'
import { audioPlayerStyles } from './audio-player-styles.ts'

@customElement('gorgon-player')
export class GorgonPlayer extends LitElement {
  static styles = audioPlayerStyles

  private audioController: AudioController

  @property({ type: Boolean }) isPlaying = false
  @property({ type: String, attribute: 'artist-name' }) artistName = 'No Artist'
  @property({ type: String, attribute: 'track-name' }) trackName = 'Default Track'
  @property({ type: String, attribute: 'track-a-title' }) trackATitle = 'Demo Track'
  @property({ type: String, attribute: 'track-b-title' }) trackBTitle = 'Master Track'
  @property({ type: String, attribute: 'track-a' }) trackA = ''
  @property({ type: String, attribute: 'track-b' }) trackB = ''

  @state() private currentTime = 0
  @state() private duration = 0

  constructor() {
    super()
    this.audioController = new AudioController()
  }

  async connectedCallback() {
    super.connectedCallback()

    this.audioController.addEventListener('timeupdate', (e: CustomEvent<number>) => {
      this.currentTime = e.detail
      this.duration = this.audioController.getDuration()
    })

    try {
      await this.audioController.loadTracks(this.trackA, this.trackB)
      this.duration = this.audioController.getDuration()
    } catch (error) {
      logger.debug(`Error loading tracks: ${error}`)
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()

    this.audioController.removeEventListener('timeupdate', (e: CustomEvent<number>) => {
      this.currentTime = e.detail
      this.duration = this.audioController.getDuration()
    })
  }

  private handlePlay() {
    if (this.isPlaying) {
      this.audioController.pause()
    } else {
      this.audioController.play()
    }
    this.isPlaying = !this.isPlaying
  }

  private handleToggle(e: Event) {
    const checked = (e.target as HTMLInputElement).checked
    const value = checked ? 1 : 0
    this.audioController.setBalance(value)
  }

  private handleProgressClick(e: MouseEvent) {
    logger.debug('Timeline clicked')
    const progressBar = e.currentTarget as HTMLDivElement
    const rect = progressBar.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const newTime = clickPosition * this.duration
    logger.debug(`clickPosition: ${clickPosition} \n newTime: ${newTime}`)

    this.audioController.seek(newTime)
  }

  // private updateProgress(time: number) {
  //   this.currentTime = time
  //   this.duration = this.audioController.getDuration()
  // }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  protected render() {
    const progress = (this.currentTime / this.duration) * 100 || 0

    return html`
      <div class="player-container">
        <div class="play-button-container">
          <button class="play-button" @click=${this.handlePlay}>
            <span class="play-icon">${this.isPlaying ? '⏸' : '▶'}</span>
          </button>
        </div>
        <div class="main-player">
          <div class="player-header">
            <h2 class="track-name">${this.trackName}</h2>
            <p class="artist-name">${this.artistName}</div>
          </p>

          <div class="controls">
            <div class="progress-bar" @click=${this.handleProgressClick}>
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="time">
                ${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}
              </span>
          </div>

          <div class="compare-controls">
            <span class="track-label">Demo</span>
            <label class="toggle-switch">
              <input type="checkbox" class="compare-toggle" @change=${this.handleToggle} />
              <span class="slider"></span>
            </label>
            <span class="track-label">Master</span>
          </div>
        </div>
      </div>
      </div>
    `
  }

  protected getAudioController(): AudioController {
    return this.audioController
  }
}

// customElements.define('gorgon-player', GorgonPlayer)
