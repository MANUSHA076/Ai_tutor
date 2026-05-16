import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { backgrounds, baseAvatars, voiceTones } from '../data/studioConfig'
import { AvatarPreviewPanel } from '../components/studio/AvatarPreviewPanel'
import { StudioConfigPanel } from '../components/studio/StudioConfigPanel'
import { BaseAvatarsGrid } from '../components/studio/BaseAvatarsGrid'
import '../styles/studio.css'

export function StudioPage({ onApplyToLecture }) {
  const [selectedAvatar, setSelectedAvatar] = useState(2)
  const [visualStyle, setVisualStyle] = useState('professional')
  const [voiceTone, setVoiceTone] = useState(voiceTones[0])
  const [accent, setAccent] = useState('British')
  const [backgroundId, setBackgroundId] = useState('classroom')
  const [isPreviewing, setIsPreviewing] = useState(false)

  const activeAvatar = baseAvatars[selectedAvatar]
  const activeBackground = useMemo(
    () => backgrounds.find((bg) => bg.id === backgroundId) ?? backgrounds[0],
    [backgroundId],
  )

  const handleSave = () => {
    onApplyToLecture?.()
  }

  return (
    <div className="studio-page">
      <motion.header
        className="studio-page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1>AI Avatar Studio</h1>
        <p>Personalize your virtual tutor&apos;s appearance, voice, and environment.</p>
      </motion.header>

      <motion.div
        className="studio-top-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <AvatarPreviewPanel
          avatar={activeAvatar}
          background={activeBackground}
          isPreviewing={isPreviewing}
          onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        />

        <StudioConfigPanel
          visualStyle={visualStyle}
          onVisualStyleChange={setVisualStyle}
          voiceTone={voiceTone}
          onVoiceToneChange={setVoiceTone}
          accent={accent}
          onAccentChange={setAccent}
          backgroundId={backgroundId}
          onBackgroundChange={setBackgroundId}
          onSave={handleSave}
        />
      </motion.div>

      <BaseAvatarsGrid
        avatars={baseAvatars}
        selectedIndex={selectedAvatar}
        onSelect={setSelectedAvatar}
      />
    </div>
  )
}
