import { motion } from 'framer-motion'
import { Mail, User } from 'lucide-react'

export function SettingsAccount({ name, email, onNameChange, onEmailChange }) {
  return (
    <motion.div
      className="settings-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="settings-profile-card">
        <div className="settings-profile-avatar">U</div>
        <div>
          <p className="settings-profile-name">{name || 'User'}</p>
          <p className="settings-profile-plan">Pro Plan · Active</p>
        </div>
        <motion.button type="button" className="settings-change-photo" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          Change Photo
        </motion.button>
      </div>

      <div className="settings-field">
        <label htmlFor="settings-name">
          <User className="icon-sm" /> Full Name
        </label>
        <input
          id="settings-name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="settings-input"
          placeholder="Your name"
        />
      </div>

      <div className="settings-field">
        <label htmlFor="settings-email">
          <Mail className="icon-sm" /> Email Address
        </label>
        <input
          id="settings-email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className="settings-input"
          placeholder="you@example.com"
        />
      </div>

      <div className="settings-storage">
        <div className="settings-storage-header">
          <span>Storage Used</span>
          <span>42.8 / 100 GB</span>
        </div>
        <div className="settings-storage-track">
          <motion.div
            className="settings-storage-fill"
            initial={{ width: 0 }}
            animate={{ width: '42.8%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
