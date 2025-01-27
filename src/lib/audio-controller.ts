declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
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
        this.audioContext = new AudioContext()

        this.gainA = this.audioContext.createGain()
        this.gainB = this.audioContext.createGain()

        this.gainA.connect(this.audioContext.destination)
        this.gainB.connect(this.audioContext.destination)
    }


}