import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { voiceOptions } from '../../data/voiceOptions'

export function VoiceSettings({ voice, onVoiceChange }) {
  return (
    <motion.div
      className="voice-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <label htmlFor="voice-select">Voice Settings</label>
      <div className="select-wrap">
        <select
          id="voice-select"
          value={voice}
          onChange={(event) => onVoiceChange(event.target.value)}
          className="voice-select"
        >
          {voiceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="icon-sm select-chevron" />
      </div>
    </motion.div>
  )
}
