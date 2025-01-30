import { AudioController } from '../../lib/audio-controller.ts'
import styles from './audio-player.css?inline'
import { html, render } from 'lit-html'

export class GorgonPlayer extends HTMLElement {
  private shadow: ShadowRoot
  private audioController: AudioController
  private isPlaying = false

  // Store references to our dom elements
  private playButton: HTMLButtonElement | null = null
  private slider: HTMLInputElement | null = null

  private trackATitle: string | null = null
  private trackBTitle: string | null = null

  constructor() {
    super()
    // TODO: Create dev/prod value insertion here
    this.shadow = this.attachShadow({ mode: 'open' })
    this.audioController = new AudioController()

    this.handlePlay = this.handlePlay.bind(this)
    this.handleSlider = this.handleSlider.bind(this)

    this.setupStyles()
    this.render()

    this.playButton = this.shadow.querySelector('.play-button')
    this.slider = this.shadow.querySelector('.compare-slider')

    this.setupEventListeners()
  }

  private setupStyles() {
    if (this.shadow.adoptedStyleSheets !== undefined && 'replaceSync' in CSSStyleSheet.prototype) {
      const stylesheet = new CSSStyleSheet()
      stylesheet.replaceSync(styles)
      this.shadow.adoptedStyleSheets = [stylesheet]
    } else {
      const styleElement = document.createElement('style')
      styleElement.textContent = styles
      this.shadow.appendChild(styleElement)
    }
  }

  // Setup and teardown lifecycle methods handled
  // automatically by the browser
  async connectedCallback() {
    const trackA = this.getAttribute('track-a') || ''
    const trackB = this.getAttribute('track-b') || ''

    this.trackATitle = this.getAttribute('track-a-title')
    this.trackBTitle = this.getAttribute('track-b-title')

    try {
      await this.audioController.loadTracks(trackA, trackB)
    } catch (error) {
      console.log(`Error loading tracks: ${error}`)
    }
  }

  disconnectedCallback() {
    this.playButton?.removeEventListener('click', this.handlePlay)
    this.slider?.removeEventListener('input', this.handleSlider)
  }

  private handlePlay() {
    console.log('Pressed')
    if (this.isPlaying) {
      this.audioController.pause()
    } else {
      this.audioController.play()
    }
    this.isPlaying = !this.isPlaying
    this.updatePlayButton()
  }

  // Refactoring to toggle
  private handleSlider(e: Event) {
    const checked = (e.target as HTMLInputElement).checked
    const value = checked ? 1 : 0
    this.audioController.setBalance(value)
  }

  private updatePlayButton() {
    if (this.playButton) {
      this.playButton.textContent = this.isPlaying ? '⏸' : '▶'
    }
  }

  private setupEventListeners() {
    this.playButton?.addEventListener('click', this.handlePlay)
    this.slider?.addEventListener('input', this.handleSlider)
  }

  private template() {
    return html`
      <div class="player-container">
        <div class="play-button-container">
          <button class="play-button" @click=${this.handlePlay}>
            <span class="play-icon">${this.isPlaying ? '⏸' : '▶'}</span>
          </button>
        </div>
        <div class="main-player">
          <div class="player-header">
            <h2 class="track-title">${this.trackATitle || 'Demo Track'}</h2>
            <p class="track-subtitle">${this.trackBTitle || 'Master'}</p>
          </div>

          <div class="controls">
            <div class="progress-bar"></div>
            <span class="time">00:00</span>
          </div>

          <div class="compare-controls">
            <span class="track-label">Demo</span>
            <label class="toggle-switch">
              <input type="checkbox" class="compare-toggle" @change=${this.handleSlider} />
              <span class="slider"></span>
            </label>
            <span class="track-label">Master</span>
          </div>
        </div>
      </div>
    `
  }

  private render() {
    render(this.template(), this.shadow)
  }

  protected getAudioController(): AudioController {
    return this.audioController
  }
}

customElements.define('gorgon-player', GorgonPlayer)
