import { motion } from 'framer-motion'
import { Download, Eye, Lock, Shield } from 'lucide-react'
import { privacyToggles } from '../../data/settingsConfig'
import { SettingsToggle } from './SettingsToggle'

const privacyActions = [
  { id: 'export', label: 'Export My Data', desc: 'Download your lectures and settings', icon: Download },
  { id: 'privacy', label: 'Privacy Policy', desc: 'Read how we handle your data', icon: Shield },
]

export function SettingsPrivacy({ toggles, onToggle }) {
  return (
    <motion.div
      className="settings-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="settings-privacy-notice"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Lock className="icon-sm" />
        <p>Only you can view and change these privacy settings.</p>
      </motion.div>

      <p className="settings-panel-desc">Control who can see your learning data and profile.</p>

      <motion.div className="settings-toggle-list settings-privacy-toggles">
        {privacyToggles.map((item, index) => (
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
      </motion.div>

      <div className="settings-privacy-divider" />

      <p className="settings-panel-sublabel">
        <Eye className="icon-xs" /> Data &amp; documents
      </p>

      <div className="settings-action-list">
        {privacyActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.id}
              type="button"
              className="settings-action-row"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.06 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <span className="settings-action-icon">
                <Icon className="icon-sm" />
              </span>
              <span className="settings-action-text">
                <span className="settings-action-label">{action.label}</span>
                <span className="settings-action-desc">{action.desc}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
