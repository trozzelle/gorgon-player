import { LitElement } from 'lit'
import { AudioController } from '../lib/audio-controller'

declare global {
  interface HTMLElementTagNameMap {
    'gorgon-player': GorgonPlayer
  }
}

export class GorgonPlayer extends LitElement {
  shadow: ShadowRoot
  updateComplete: Promise<boolean>

  getAudioController(): AudioController

  remove(): void
}
