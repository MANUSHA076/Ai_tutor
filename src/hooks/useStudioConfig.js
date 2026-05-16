import { useEffect, useState } from 'react'
import { fetchStudioConfig } from '../api/avatarsApi'

export function useStudioConfig() {
  const [backgrounds, setBackgrounds] = useState([])
  const [baseAvatars, setBaseAvatars] = useState([])
  const [voiceTones, setVoiceTones] = useState([])
  const [visualStyles, setVisualStyles] = useState([])
  const [accents, setAccents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudioConfig()
      .then((data) => {
        setBackgrounds(data?.backgrounds ?? [])
        setBaseAvatars(data?.base_avatars ?? [])
        setVoiceTones(data?.voice_tones ?? [])
        setVisualStyles(data?.visual_styles ?? [])
        setAccents(data?.accents ?? [])
      })
      .catch(() => {
        setBackgrounds([])
        setBaseAvatars([])
        setVoiceTones([])
        setVisualStyles([])
        setAccents([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { backgrounds, baseAvatars, voiceTones, visualStyles, accents, loading }
}
