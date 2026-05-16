"""Static API payloads (avatars, studio, script fallbacks) until stored in Supabase."""

AVATARS = [
    {
        "id": "sarah",
        "name": "Dr. Sarah",
        "tag": "British Accent",
        "initials": "DS",
        "accent": "accent-cyan",
        "style": "Academic Expert",
        "specialty": "Physics & STEM",
        "lectures": 142,
        "rating": 4.9,
        "desc": "Precise explanations with calm pacing. Ideal for complex theory and exam prep.",
    },
    {
        "id": "mark",
        "name": "Mark",
        "tag": "Enthusiastic",
        "initials": "MK",
        "accent": "accent-emerald",
        "style": "Interactive Coach",
        "specialty": "CS & Programming",
        "lectures": 98,
        "rating": 4.8,
        "desc": "High-energy delivery with quick quizzes. Keeps learners engaged throughout.",
    },
    {
        "id": "elena",
        "name": "Elena",
        "tag": "Calm & Clear",
        "initials": "EL",
        "accent": "accent-sky",
        "style": "Patient Mentor",
        "specialty": "Math & Logic",
        "lectures": 116,
        "rating": 4.9,
        "desc": "Step-by-step breakdowns for difficult concepts. Perfect for beginners.",
    },
    {
        "id": "james",
        "name": "James",
        "tag": "Deep Voice",
        "initials": "JM",
        "accent": "accent-teal",
        "style": "Exam Strategist",
        "specialty": "Humanities & Law",
        "lectures": 87,
        "rating": 4.7,
        "desc": "Focuses on key points, summaries, and likely exam questions.",
    },
]

STUDIO_CONFIG = {
    "visual_styles": [
        {"id": "professional", "label": "Professional", "desc": "Formal attire, neutral studio lighting"},
        {"id": "casual", "label": "Casual", "desc": "Relaxed look, friendly classroom vibe"},
        {"id": "academic", "label": "Academic", "desc": "Scholarly presence with lecture hall feel"},
    ],
    "voice_tones": [
        "Female - Calm & Sophisticated",
        "Female - Warm & Encouraging",
        "Male - Deep & Authoritative",
        "Male - Energetic & Clear",
    ],
    "accents": ["British", "American", "Australian"],
    "backgrounds": [
        {"id": "classroom", "label": "Modern Classroom", "thumb": "bg-thumb-classroom"},
        {"id": "library", "label": "Digital Library", "thumb": "bg-thumb-library"},
        {"id": "studio", "label": "Minimal Studio", "thumb": "bg-thumb-studio"},
    ],
    "base_avatars": [
        {"id": "sophia", "name": "Sophia", "specialty": "Language Specialist", "initials": "SO", "portrait": "portrait-violet"},
        {"id": "marcus", "name": "Marcus", "specialty": "STEM Expert", "initials": "MA", "portrait": "portrait-blue"},
        {"id": "elena", "name": "Elena", "specialty": "General Knowledge", "initials": "EL", "portrait": "portrait-cyan"},
        {"id": "david", "name": "David", "specialty": "Coding Mentor", "initials": "DA", "portrait": "portrait-slate", "isPlaceholder": True},
        {"id": "aria", "name": "Aria", "specialty": "Arts & Humanities", "initials": "AR", "portrait": "portrait-rose", "isPlaceholder": True},
    ],
}

DEFAULT_SCRIPT_LINES = [
    {
        "time": "00:00",
        "text": "Welcome to Quantum Physics. Today we explore the fundamental principles of wave-particle duality and how ",
        "highlight": "The Schrödinger equation",
        "suffix": " governs quantum state evolution.",
    },
    {
        "time": "00:45",
        "text": "When we observe a quantum system, we encounter the phenomenon known as ",
        "term": "Wave Function Collapse",
        "suffix": " — where probability distributions resolve into definite outcomes.",
    },
    {
        "time": "01:32",
        "text": "The double-slit experiment demonstrates interference patterns that challenge our classical intuition about matter.",
    },
]

DEFAULT_SCRIPT_SUMMARY = [
    "Key topics: wave-particle duality, Schrödinger equation, measurement problem.",
    "Exam focus: double-slit experiment, uncertainty principle, wave function collapse.",
    "Recommended review: Chapter 3–5 of uploaded PDF, practice problems 12–18.",
]

DEFAULT_SETTINGS = {
    "account": {"name": "Alex Morgan", "email": "alex@edututor.ai"},
    "preferences": {
        "language": "English",
        "lectureSpeed": "normal",
        "autoSave": True,
        "subtitles": True,
        "quizMode": False,
        "darkMode": True,
    },
    "notifications": {
        "lectureReady": True,
        "weeklyDigest": True,
        "productUpdates": False,
        "emailReminders": True,
    },
    "privacy": {
        "privateLectures": True,
        "hideProfile": True,
        "hideActivity": True,
        "anonymousAnalytics": False,
    },
}

SUBJECT_THUMB = {
    "Physics": "thumb-physics",
    "CS": "thumb-cs",
    "Math": "thumb-math",
    "Biology": "thumb-bio",
}
