// BACKEND [Python]: Mock data — replace with GET /api/avatars/studio-config

export const visualStyles = [
  { id: 'professional', label: 'Professional', desc: 'Formal attire, neutral studio lighting' },
  { id: 'casual', label: 'Casual', desc: 'Relaxed look, friendly classroom vibe' },
  { id: 'academic', label: 'Academic', desc: 'Scholarly presence with lecture hall feel' },
]

export const voiceTones = [
  'Female - Calm & Sophisticated',
  'Female - Warm & Encouraging',
  'Male - Deep & Authoritative',
  'Male - Energetic & Clear',
]

export const accents = ['British', 'American', 'Australian']

export const backgrounds = [
  { id: 'classroom', label: 'Modern Classroom', thumb: 'bg-thumb-classroom' },
  { id: 'library', label: 'Digital Library', thumb: 'bg-thumb-library' },
  { id: 'studio', label: 'Minimal Studio', thumb: 'bg-thumb-studio' },
]

export const baseAvatars = [
  {
    id: 'sophia',
    name: 'Sophia',
    specialty: 'Language Specialist',
    initials: 'SO',
    portrait: 'portrait-violet',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    specialty: 'STEM Expert',
    initials: 'MA',
    portrait: 'portrait-blue',
  },
  {
    id: 'elena',
    name: 'Elena',
    specialty: 'General Knowledge',
    initials: 'EL',
    portrait: 'portrait-cyan',
  },
  {
    id: 'david',
    name: 'David',
    specialty: 'Coding Mentor',
    initials: 'DA',
    portrait: 'portrait-slate',
    isPlaceholder: true,
  },
  {
    id: 'aria',
    name: 'Aria',
    specialty: 'Arts & Humanities',
    initials: 'AR',
    portrait: 'portrait-rose',
    isPlaceholder: true,
  },
]
