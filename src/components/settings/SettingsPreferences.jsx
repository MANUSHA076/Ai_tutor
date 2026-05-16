import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { languageOptions, lectureSpeedOptions, preferenceToggles } from '../../data/settingsConfig'
import { SettingsToggle } from './SettingsToggle'

export function SettingsPreferences({ language, onLanguageChange, lectureSpeed, onLectureSpeedChange, toggles, onToggle }) {
  return (
    <motion.div
      className="settings-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="settings-field">
        <label htmlFor="settings-language">Language</label>
        <div className="select-wrap">
          <select
            id="settings-language"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="settings-select"
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="icon-sm select-chevron" />
        </div>
      </div>

      <div className="settings-field">
        <label htmlFor="settings-speed">Default Lecture Speed</label>
        <div className="select-wrap">
          <select
            id="settings-speed"
            value={lectureSpeed}
            onChange={(event) => onLectureSpeedChange(event.target.value)}
            className="settings-select"
          >
            {lectureSpeedOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="icon-sm select-chevron" />
        </div>
      </div>

      <div className="settings-toggle-list">
        {preferenceToggles.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SettingsToggle
              id={item.id}
              label={item.label}
              desc={item.desc}
              checked={toggles[item.id] ?? item.defaultOn ?? false}
              onChange={(value) => onToggle(item.id, value)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
