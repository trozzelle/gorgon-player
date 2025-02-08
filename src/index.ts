import { GorgonPlayer } from './components/audio-player/audio-player.ts'
import { logger, LogLevel } from './lib/logger.ts'

if (import.meta.env.DEV) {
  logger.setLevel(LogLevel.DEBUG)
} else {
  logger.setLevel(LogLevel.NONE)
}

export { GorgonPlayer }
