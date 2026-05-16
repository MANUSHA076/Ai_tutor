import { motion } from 'framer-motion'

export function SettingsToggle({ id, label, desc, checked, onChange }) {
  return (
    <motion.label
      className="settings-toggle-row"
      htmlFor={id}
      whileHover={{ x: 2 }}
    >
      <div className="settings-toggle-text">
        <span className="settings-toggle-label">{label}</span>
        {desc && <span className="settings-toggle-desc">{desc}</span>}
      </div>
      <input
        type="checkbox"
        id={id}
        className="settings-toggle-input"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={`settings-switch ${checked ? 'is-on' : ''}`}>
        <motion.span
          className="settings-switch-thumb"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
    </motion.label>
  )
}
