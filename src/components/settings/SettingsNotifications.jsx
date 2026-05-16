import { motion } from 'framer-motion'
import { notificationToggles } from '../../data/settingsConfig'
import { SettingsToggle } from './SettingsToggle'

export function SettingsNotifications({ toggles, onToggle }) {
  return (
    <motion.div
      className="settings-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="settings-panel-desc">Choose what you want to be notified about.</p>
      <div className="settings-toggle-list">
        {notificationToggles.map((item, index) => (
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
              checked={toggles[item.id] ?? true}
              onChange={(value) => onToggle(item.id, value)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
