import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { AvatarPreviewPanel } from '../components/studio/AvatarPreviewPanel'
import { StudioConfigPanel } from '../components/studio/StudioConfigPanel'
import { BaseAvatarsGrid } from '../components/studio/BaseAvatarsGrid'
import { useStudioConfig } from '../hooks/useStudioConfig'
import { previewAvatar, saveAvatarProfile } from '../api/avatarsApi'
import '../styles/studio.css'

export function StudioPage({ onApplyToLecture }) {
  const { backgrounds, baseAvatars, voiceTones, visualStyles, accents, loading } = useStudioConfig()
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [visualStyle, setVisualStyle] = useState('professional')
  const [voiceTone, setVoiceTone] = useState('')
  const [accent, setAccent] = useState('British')
  const [backgroundId, setBackgroundId] = useState('classroom')
  const [isPreviewing, setIsPreviewing] = useState(false)

  useEffect(() => {
    if (voiceTones.length && !voiceTone) setVoiceTone(voiceTones[0])
    if (accents.length && !accents.includes(accent)) setAccent(accents[0])
    if (backgrounds.length && !backgrounds.find((b) => b.id === backgroundId)) {
      setBackgroundId(backgrounds[0].id)
    }
  }, [voiceTones, accents, backgrounds, voiceTone, accent, backgroundId])

  const activeAvatar = baseAvatars[selectedAvatar] ?? baseAvatars[0]
  const activeBackground = useMemo(
    () => backgrounds.find((bg) => bg.id === backgroundId) ?? backgrounds[0],
    [backgrounds, backgroundId],
  )

  const handleSave = async () => {
    if (!activeAvatar) return
    try {
      await saveAvatarProfile({
        avatarId: activeAvatar.id,
        visualStyle,
        voiceTone,
        accent,
        backgroundId,
      })
    } catch {
      /* keep local state */
    }
    onApplyToLecture?.()
  }

  const handleTogglePreview = async () => {
    if (!activeAvatar) return
    const next = !isPreviewing
    setIsPreviewing(next)
    if (next) {
      try {
        await previewAvatar({ avatarId: activeAvatar.id, voiceTone, accent })
      } catch {
        /* preview offline */
      }
    }
  }

  if (loading) {
    return (
      <p className="data-empty-msg studio-loading">
        <Loader2 className="icon-sm spin-icon" /> Loading studio…
      </p>
    )
  }

  if (!baseAvatars.length) {
    return (
      <p className="data-empty-msg">
        Studio config could not be loaded. Check that the backend is running.
      </p>
    )
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
          onTogglePreview={handleTogglePreview}
        />

        <StudioConfigPanel
          visualStyles={visualStyles}
          voiceTones={voiceTones}
          accents={accents}
          backgrounds={backgrounds}
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
    </motion.div>
  )
}
