import { useEffect, useState } from 'react'
// BACKEND [Python]: Connect Settings page
import { fetchSettings, updateSettings } from '../api/settingsApi'

export function useSettings(initialState) {
  const [settings, setSettings] = useState(initialState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // BACKEND [Python]: GET /api/settings — load user settings on mount
  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }))
      })
      .catch(() => {
        /* use local initial state */
      })
      .finally(() => setLoading(false))
  }, [])

  // BACKEND [Python]: PUT /api/settings — Save Changes button
  const saveSettings = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      return true
    } finally {
      setSaving(false)
    }
  }

  return { settings, setSettings, loading, saving, saveSettings }
}
