import { css } from 'lit'

export const audioPlayerStyles = css`
  :host {
    display: block;
    width: 100%;
    max-width: 600px;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  .gorgon-player {
    border-radius: 16px;
    border-color: #666666;
    border-width: 2px;
  }

  .player-container {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: row;
    gap: 32px;
  }

  .main-player {
    flex-grow: 1;
  }

  .play-button-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .player-header {
    margin-bottom: 24px;
  }

  .track-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  .track-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .play-button {
    background: #000;
    color: white;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .play-button:hover {
    background: #333;
  }

  //.progress-bar {
  //  flex-grow: 1;
  //  height: 4px;
  //  background: #cccccc;
  //  border-radius: 2px;
  //}
  //
  //.time {
  //  font-size: 14px;
  //  color: #666;
  //  min-width: 45px;
  //  text-align: right;
  //}

  .progress-bar {
    position: relative;
    flex-grow: 1;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    cursor: pointer;
    overflow: hidden;
  }

  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #000;
    width: 0%;
    transition: width 0.1s linear;
  }

  .progress-bar:hover .progress-fill {
    background: #333;
  }

  .time {
    font-size: 14px;
    color: #666;
    min-width: 100px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .compare-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
    gap: 48px;
    font-weight: 600;
    font-size: 1.5rem;
  }

  .track-label {
    font-size: 14px;
    color: #666;
  }

  .toggle-switch {
    position: relative;
    width: 44px;
    height: 24px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #000;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
`
