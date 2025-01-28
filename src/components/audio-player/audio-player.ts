import { AudioController} from "../../lib/audio-controller.ts"
import styles from './audio-player.css?inline'

export class GorgonPlayer extends HTMLElement {
    private shadow: ShadowRoot
    private audioController: AudioController
    private isPlaying = false

    // Store references to our dom elements
    private playButton: HTMLButtonElement | null = null
    private slider: HTMLInputElement | null = null

    constructor() {
        super()
        // TODO: Create dev/prod value insertion here
        this.shadow = this.attachShadow({mode: 'open'})
        this.audioController = new AudioController()

        this.handlePlay = this.handlePlay.bind(this)
        this.handleSlider = this.handleSlider.bind(this)

        this.render()

        this.playButton = this.shadow.querySelector('.play-button')
        this.slider = this.shadow.querySelector('.compare-slider')

        this.setupEventListeners()
    }

    // Setup and teardown lifecycle methods handled
    // automatically by the browser
    async connectedCallback() {
        const trackA = this.getAttribute('track-a') || ''
        const trackB = this.getAttribute('track-b') || ''

        try {
            await this.audioController.loadTracks(trackA, trackB)
        }
        catch (error) {
            console.log(`Error loading tracks: ${error}`)
        }
    }

    disconnectedCallback() {
        this.playButton?.removeEventListener('click', this.handlePlay)
        this.slider?.removeEventListener('input', this.handleSlider)
    }

    private handlePlay() {
        if (this.isPlaying) {
            this.audioController.pause()
        } else {
            this.audioController.play()
        }
        this.isPlaying = !this.isPlaying
        this.updatePlayButton()
    }

    private handleSlider(e: Event) {
        const value = parseInt((e.target as HTMLInputElement).value) / 100
        console.log(value)
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

    private render() {
        // const stylesheet = new CSSStyleSheet()
        // stylesheet.replaceSync(styles)
        // this.shadow.adoptedStyleSheets = [stylesheet]

        if (this.shadow.adoptedStyleSheets !== undefined && 'replaceSync' in CSSStyleSheet.prototype) {
            const stylesheet = new CSSStyleSheet()
            stylesheet.replaceSync(styles)
            this.shadow.adoptedStyleSheets = [stylesheet]
        } else {
            const styleElement = document.createElement('style')
            styleElement.textContent = styles
            this.shadow.appendChild(styleElement)
        }

        this.shadow.innerHTML = `
              <div class="player-container">
                <div class="controls">
                  <button class="play-button" id="play-button">
                    <span id="play-icon">
                        ${this.isPlaying ? '⏸' : '▶'}
                    </span>
                  </button>
                  <input 
                    type="range" 
                    class="compare-slider" 
                    min="0" 
                    max="100" 
                    value="50"
                    id="compare-slider"
                  >
                </div>
                <div class="labels">
                  <span>Original</span>
                  <span>Mastered</span>
                </div>
              </div>
            `
    }

    // private setupEventListeners() {
    //     // const playButton = this.shadow.querySelector('#' +
    //     //     'play-button')
    //     // const slider = this.shadow.querySelector('.compare-slider')
    //     //
    //     // playButton?.addEventListener('click', () => {
    //     //     if (this.isPlaying) {
    //     //         this.audioController.pause()
    //     //     } else {
    //     //         this.audioController.play()
    //     //     }
    //     //     console.log("Pressed")
    //     //     this.isPlaying = !this.isPlaying
    //     //     this.render()
    //     // })
    //     //
    //     // slider?.addEventListener('input', (e) => {
    //     //     const value = parseInt((e.target as HTMLInputElement).value) / 100
    //     //     this.audioController.setBalance(value)
    //     // })
    //     const playButton = this.shadow.querySelector('.play-button')
    //     const slider = this.shadow.querySelector('.compare-slider')
    //
    //     if (playButton) {
    //         const handlePlay = () => {
    //             console.log('Clicked, current statE: ', this.isPlaying)
    //
    //             if (this.isPlaying) {
    //                 this.audioController.pause()
    //             } else {
    //                 this.audioController.play()
    //             }
    //             this.isPlaying = !this.isPlaying
    //             this.render()
    //             this.setupEventListeners()
    //         }
    //
    //         playButton.removeEventListener('click', handlePlay)
    //         playButton.addEventListener('click', handlePlay)
    //     }
    //
    //     if (slider) {
    //         const handleSlider = (e: Event) => {
    //             const value = parseInt((e.target as HTMLInputElement).value) / 100
    //             this.audioController.setBalance(value)
    //         }
    //
    //         slider.removeEventListener('input', handleSlider)
    //         slider.addEventListener('input', handleSlider)
    //     }
    // }
    protected getAudioController(): AudioController {
        return this.audioController
    }
}

customElements.define('gorgon-player', GorgonPlayer)