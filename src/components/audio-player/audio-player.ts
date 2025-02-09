import { AudioController } from '../../lib/audio-controller.ts'
// import styles from './audio-player.css?inline'
// import { render } from 'lit-html'
import { logger } from '../../lib/logger.ts'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { HTMLDivElement, MouseEvent } from 'happy-dom'
import { audioPlayerStyles } from './audio-player-styles.ts'
import CustomElementReactionStack from 'happy-dom/lib/custom-element/CustomElementReactionStack.d.ts.js'

//     this.handleToggle = this.handleToggle.bind(this)
//
//     this.setupStyles()
//     this.render()
//
//     this.playButton = this.shadow.querySelector('.play-button')
//     this.slider = this.shadow.querySelector('.compare-slider')
//
//     this.setupEventListeners()
//     this.audioController.setProgressCallback(this.updateProgress())
//
//     this.progressBar = this.shadow.querySelector('.progress-bar')
//     this.progressFill = this.shadow.querySelector('.progress-fill')
//     this.timeDisplay = this.shadow.querySelector('.time')
//
//     this.progressBar?.addEventListener('click', this.handleProgressClick)
//   }
//
//   private setupStyles() {
//     if (this.shadow.adoptedStyleSheets !== undefined && 'replaceSync' in CSSStyleSheet.prototype) {
//       const stylesheet = new CSSStyleSheet()
//       stylesheet.replaceSync(styles)
//       this.shadow.adoptedStyleSheets = [stylesheet]
//     } else {
//       const styleElement = document.createElement('style')
//       styleElement.textContent = styles
//       this.shadow.appendChild(styleElement)
//     }
//   }
//
//   // Setup and teardown lifecycle methods handled
//   // automatically by the browser
//   async connectedCallback() {
//     const trackA = this.getAttribute('track-a') || ''
//     const trackB = this.getAttribute('track-b') || ''
//
//     this.trackATitle = this.getAttribute('track-a-title')
//     this.trackBTitle = this.getAttribute('track-b-title')
//
//     try {
//       await this.audioController.loadTracks(trackA, trackB)
//     } catch (error) {
//       logger.debug(`Error loading tracks: ${error}`)
//     }
//   }
//
//   disconnectedCallback() {
//     this.playButton?.removeEventListener('click', this.handlePlay)
//     this.slider?.removeEventListener('input', this.handleToggle)
//   }
//
//   private handlePlay() {
//     if (this.isPlaying) {
//       this.audioController.pause()
//     } else {
//       this.audioController.play()
//     }
//     this.isPlaying = !this.isPlaying
//     this.updatePlayButton()
//   }
//
//   // Refactoring to toggle
//   private handleToggle(e: Event) {
//     const checked = (e.target as HTMLInputElement).checked
//     const value = checked ? 1 : 0
//     this.audioController.setBalance(value)
//   }
//
//   private updatePlayButton() {
//     if (this.playButton) {
//       this.playButton.textContent = this.isPlaying ? '⏸' : '▶'
//     }
//   }
//
//   private setupEventListeners() {
//     // this.playButton?.addEventListener('click', this.handlePlay)
//     // this.slider?.addEventListener('input', this.handleToggle)
//   }
//
//   private template() {
//     return html`
//       <div class="player-container">
//         <div class="play-button-container">
//           <button class="play-button" @click=${this.handlePlay}>
//             <span class="play-icon">${this.isPlaying ? '⏸' : '▶'}</span>
//           </button>
//         </div>
//         <div class="main-player">
//           <div class="player-header">
//             <h2 class="track-title">${this.trackATitle || 'Demo Track'}</h2>
//             <p class="track-subtitle">${this.trackBTitle || 'Artist'}</p>
//           </div>
//
//           <div class="controls">
//             <div class="progress-bar"></div>
//             <span class="time">00:00</span>
//           </div>
//
//           <div class="compare-controls">
//             <span class="track-label">Demo</span>
//             <label class="toggle-switch">
//               <input type="checkbox" class="compare-toggle" @change=${this.handleToggle} />
//               <span class="slider"></span>
//             </label>
//             <span class="track-label">Master</span>
//           </div>
//         </div>
//       </div>
//     `
//   }
//
//   private render() {
//     render(this.template(), this.shadow)
//   }
//
//   protected getAudioController(): AudioController {
//     return this.audioController
//   }
// }

@customElement('gorgon-player')
export class GorgonPlayer extends LitElement {
  static styles = audioPlayerStyles

  private audioController: AudioController

  @property({ type: Boolean }) isPlaying = false
  @property({ type: String, attribute: 'track-a-title' }) trackATitle = 'Demo Track'
  @property({ type: String, attribute: 'track-b-title' }) trackBTitle = 'Master Track'
  @property({ type: String, attribute: 'track-a' }) trackA = ''
  @property({ type: String, attribute: 'track-b' }) trackB = ''

  @state() private currentTime = 0
  @state() private duration = 0

  constructor() {
    super()
    this.audioController = new AudioController()
    // this.audioController.setProgressCallback(this.updateProgress.bind(this))
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

  private updateProgress(time: number) {
    this.currentTime = time
    this.duration = this.audioController.getDuration()
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
            <h2 class="track-title">${this.trackATitle}</h2>
            <p class="track-subtitle">${this.trackBTitle}</p>
          </div>

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
    `
  }

  protected getAudioController(): AudioController {
    return this.audioController
  }
}

// customElements.define('gorgon-player', GorgonPlayer)
