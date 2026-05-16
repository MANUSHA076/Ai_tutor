export const settingsSections = [
  { id: 'account', label: 'Account' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
]

export const privacyToggles = [
  {
    id: 'privateLectures',
    label: 'Private lectures only',
    desc: 'Only you can view your uploaded lectures and AI sessions',
    defaultOn: true,
  },
  {
    id: 'hideProfile',
    label: 'Hide profile from others',
    desc: 'Your name and avatar stay visible only to you',
    defaultOn: true,
  },
  {
    id: 'hideActivity',
    label: 'Hide learning activity',
    desc: 'Progress and study history visible only to you',
    defaultOn: true,
  },
  {
    id: 'anonymousAnalytics',
    label: 'Anonymous usage analytics',
    desc: 'Help improve EduAI without sharing personal data',
    defaultOn: false,
  },
]

export const languageOptions = ['English', 'Sinhala', 'Tamil', 'Spanish']

export const lectureSpeedOptions = [
  { id: 'slow', label: 'Slow (0.75x)' },
  { id: 'normal', label: 'Normal (1x)' },
  { id: 'fast', label: 'Fast (1.25x)' },
]

export const notificationToggles = [
  { id: 'lectureReady', label: 'Lecture ready alerts', desc: 'When AI finishes generating a lecture' },
  { id: 'weeklyDigest', label: 'Weekly progress digest', desc: 'Summary of your learning activity' },
  { id: 'productUpdates', label: 'Product updates', desc: 'New features and improvements' },
  { id: 'emailReminders', label: 'Study reminders', desc: 'Gentle nudges to continue learning' },
]

export const preferenceToggles = [
  { id: 'autoSave', label: 'Auto-save sessions', desc: 'Save lecture progress automatically' },
  { id: 'subtitles', label: 'Auto-generate subtitles', desc: 'Create captions for every lecture' },
  { id: 'quizMode', label: 'Interactive quiz mode', desc: 'Insert short quizzes during lectures' },
  { id: 'darkMode', label: 'Dark interface', desc: 'Use the dark aurora theme', defaultOn: true },
]
