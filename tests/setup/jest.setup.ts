import 'whatwg-fetch'

import { AudioContextMock } from "./mocks/audioContextMock"

class CSSStyleSheetMock {
    replaceSync() {}
    replace() { return Promise.resolve() }
}

global.AudioContext = AudioContextMock as any
global.CSSStyleSheet = CSSStyleSheetMock as any