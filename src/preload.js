const { contextBridge, ipcRenderer, webUtils } = require('electron');

const on = (channel) => (cb) => {
  const listener = (_e, ...args) => cb(...args);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
};

contextBridge.exposeInMainWorld('api', {
  // config
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (patch) => ipcRenderer.invoke('config:set', patch),
  saveProfile: (profile, apiKey) => ipcRenderer.invoke('profile:save', profile, apiKey),
  deleteProfile: (id) => ipcRenderer.invoke('profile:delete', id),
  listModels: (profile, apiKey) => ipcRenderer.invoke('profile:models', profile, apiKey),
  setTtsKey: (key) => ipcRenderer.invoke('tts:key', key),
  pickModelDir: () => ipcRenderer.invoke('model:pick'),
  modelStatus: () => ipcRenderer.invoke('model:status'),
  setShortcuts: (s) => ipcRenderer.invoke('shortcuts:set', s),
  onConfigChanged: on('config:changed'),

  // chat
  send: (text, options) => ipcRenderer.invoke('chat:send', text, options),
  retry: () => ipcRenderer.invoke('chat:retry'),
  copyReply: () => ipcRenderer.invoke('chat:copy'),
  searchAvailable: () => ipcRenderer.invoke('search:available'),
  pickFiles: () => ipcRenderer.invoke('attach:pick'),
  attachClipboard: () => ipcRenderer.invoke('attach:clipboard'),
  attachDropped: (files) => ipcRenderer.invoke('attach:paths', files.map((file) => webUtils.getPathForFile(file)).filter(Boolean)),
  removeAttachment: (id) => ipcRenderer.invoke('attach:remove', id),
  toggleHold: (id) => ipcRenderer.invoke('attach:hold', id),
  clearAttachments: () => ipcRenderer.invoke('attach:clear'),
  onAttachments: on('attach:list'),
  captureScreen: () => ipcRenderer.invoke('screen:capture'),
  confirmScreen: (accepted) => ipcRenderer.invoke('screen:confirm', accepted),
  appAction: (name, arg) => ipcRenderer.invoke('app:action', name, arg),
  cancel: () => ipcRenderer.invoke('chat:cancel'),
  clearHistory: () => ipcRenderer.invoke('chat:clear'),
  onDelta: on('chat:delta'),
  onDone: on('chat:done'),
  onError: on('chat:error'),
  onStatus: on('chat:status'),

  // speech
  speak: (text) => ipcRenderer.invoke('tts:speak', text),
  ttsStatus: () => ipcRenderer.invoke('tts:status'),
  pickRefAudio: () => ipcRenderer.invoke('tts:pickRef'),

  // conversation log
  transcript: (session) => ipcRenderer.invoke('transcript:all', session),
  sessions: () => ipcRenderer.invoke('transcript:sessions'),
  newSession: () => ipcRenderer.invoke('session:new'),
  resumeSession: (id) => ipcRenderer.invoke('session:resume', id),
  deleteSession: (id) => ipcRenderer.invoke('session:delete', id),
  clearTranscript: () => ipcRenderer.invoke('transcript:clear'),
  onTranscriptChanged: on('transcript:changed'),
  copyText: (text) => ipcRenderer.invoke('clipboard:write', text),

  // usage
  usage: () => ipcRenderer.invoke('usage:all'),
  clearUsage: () => ipcRenderer.invoke('usage:clear'),
  onUsageChanged: on('usage:changed'),

  // floating window
  moveBy: (dx, dy) => ipcRenderer.send('win:moveBy', dx, dy),
  setClickThrough: (ignore) => ipcRenderer.send('win:clickThrough', ignore),
  contextMenu: () => ipcRenderer.send('win:menu'),
  focusInput: () => ipcRenderer.send('win:focus'),
  onMode: on('char:mode'),
  onOpenInput: on('char:input'),
  onExpression: on('char:expression'),
  onCursor: on('char:cursor'),
  onQuick: on('char:quick'),
  onVoice: on('char:voice'),
  onBriefing: on('char:briefing'),
  transcribe: (audio) => ipcRenderer.invoke('voice:transcribe', audio),
  prepareVoice: () => ipcRenderer.invoke('voice:prepare'),
  remember: (text) => ipcRenderer.invoke('memory:add', text),
  memories: () => ipcRenderer.invoke('memory:list'),
  forget: (index) => ipcRenderer.invoke('memory:forget', index),
  forgetId: (id) => ipcRenderer.invoke('memory:forgetId', id),
  onMemoryChanged: on('memory:changed'),
  pickDocsFolder: () => ipcRenderer.invoke('docs:pick'),
  rebuildDocs: () => ipcRenderer.invoke('docs:rebuild'),
  feed: () => ipcRenderer.invoke('pet:feed'),
  pat: () => ipcRenderer.invoke('pet:pat'),
  petStatus: () => ipcRenderer.invoke('pet:status'),
  briefingData: () => ipcRenderer.invoke('briefing:data'),
  onSay: on('char:say'),
  addReminder: (at, text) => ipcRenderer.invoke('reminder:add', at, text),
  listReminders: () => ipcRenderer.invoke('reminder:list'),
  clearReminders: () => ipcRenderer.invoke('reminder:clear'),
  onMuted: on('char:muted'),

  // control window
  onTab: on('control:tab'),
});
