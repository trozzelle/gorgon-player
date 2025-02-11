# Gorgon Player

[![Build and Test](https://github.com/trozzelle/gorgon-player/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/trozzelle/gorgon-player/actions/workflows/build-and-test.yml)

A lightweight, customizable A/B audio player web component for comparing audio tracks. It's built with the Web Audio API, which is supported by all modern browsers.

I'm building this to help my partner embed before/after audio examples in their portfolio, though since it's an idea we've had for a while, I've decided to build it into a proper component for general use.

## Development

### Prerequisites

- Node.js >= 18

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/gorgon-player.git
cd gorgon-player

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test


```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `track-a` | String | `''` | URL for the first audio track |
| `track-b` | String | `''` | URL for the second audio track |
| `track-name` | String | `'Default Track'` | Name of the track |
| `artist-name` | String | `'No Artist'` | Name of the artist |
| `track-a-title` | String | `'Demo'` | Label for track A |
| `track-b-title` | String | `'Master'` | Label for track B |


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Support

For support, please open an issue in the GitHub issue tracker.