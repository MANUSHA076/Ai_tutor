import { motion } from 'framer-motion'
import { Download, KeyRound, Shield, Trash2 } from 'lucide-react'

const privacyActions = [
  { id: 'password', label: 'Change Password', desc: 'Update your account password', icon: KeyRound },
  { id: 'export', label: 'Export My Data', desc: 'Download all your lectures and settings', icon: Download },
  { id: 'privacy', label: 'Privacy Policy', desc: 'Read how we handle your data', icon: Shield },
]

export function SettingsPrivacy() {
  return (
    <motion.div
      className="settings-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="settings-panel-desc">Manage your security and data preferences.</p>

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
              transition={{ delay: index * 0.06 }}
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

      <motion.div
        className="settings-danger-zone"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h4>Danger Zone</h4>
        <p>Permanently delete your account and all associated data.</p>
        <motion.button
          type="button"
          className="settings-danger-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 className="icon-sm" /> Delete Account
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
