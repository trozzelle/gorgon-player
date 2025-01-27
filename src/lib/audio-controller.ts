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

    async loadTracks(trackAUrl: string, trackBUrl: string): Promise<void> {
        const [bufferA, bufferB] = await Promise.all([
            this.fetchAudioBuffer(trackAUrl),
            this.fetchAudioBuffer(trackBUrl)
        ])

        this.audioBufferA = bufferA
        this.audioBufferB = bufferB
    }

    private async fetchAudioBuffer(url: string): Promise<AudioBuffer> {
        /**
         * Fetches and decodes track
         */
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        return await this.audioContext.decodeAudioData(arrayBuffer)
    }

    play() {
        // If we're already playing or either buffer is empty, return
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
        if (!this.isPlaying) return

        this.sourceA?.stop()
        this.sourceB?.stop()

        this.offset = this.audioContext.currentTime - this.startTime
        this.isPlaying = false
    }

    setBalance(value: number) {
        this.gainA.gain.value = 1 - value
        this.gainB.gain.value = value
    }



}