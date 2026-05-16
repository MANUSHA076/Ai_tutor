import { motion } from 'framer-motion'
import { Check, CheckCircle2, ChevronDown } from 'lucide-react'
export function StudioConfigPanel({
  visualStyles = [],
  voiceTones = [],
  accents = [],
  backgrounds = [],
  visualStyle,
  onVisualStyleChange,
  voiceTone,
  onVoiceToneChange,
  accent,
  onAccentChange,
  backgroundId,
  onBackgroundChange,
  onSave,
}) {
  return (
    <motion.div
      className="studio-config-stack"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
    >
      <section className="studio-config-card">
        <h3 className="config-card-title">Visual Style</h3>
        <ul className="visual-style-list">
          {visualStyles.map((style, index) => {
            const isActive = visualStyle === style.id
            return (
              <motion.li key={style.id}>
                <motion.button
                  type="button"
                  className={`visual-style-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => onVisualStyleChange(style.id)}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="visual-style-text">
                    <span className="visual-style-name">{style.label}</span>
                    <span className="visual-style-desc">{style.desc}</span>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="icon-sm visual-check" />
                  ) : (
                    <span className="visual-check-empty" />
                  )}
                </motion.button>
              </motion.li>
            )
          })}
        </ul>
      </section>

      <section className="studio-config-card">
        <h3 className="config-card-title">Voice Profile</h3>

        <div className="config-field">
          <label htmlFor="voice-tone">Gender &amp; Tone</label>
          <div className="select-wrap">
            <select
              id="voice-tone"
              value={voiceTone}
              onChange={(event) => onVoiceToneChange(event.target.value)}
              className="studio-select"
            >
              {voiceTones.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
            <ChevronDown className="icon-sm select-chevron" />
          </div>
        </div>

        <div className="config-field">
          <p className="config-sublabel">Accent</p>
          <div className="accent-pills">
            {accents.map((item) => {
              const isActive = accent === item
              return (
                <motion.button
                  key={item}
                  type="button"
                  className={`accent-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => onAccentChange(item)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isActive && (
                    <motion.span
                      className="accent-pill-bg"
                      layoutId="accent-highlight"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span>{item}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="studio-config-card">
        <h3 className="config-card-title">Background</h3>
        <div className="background-thumbs">
          {backgrounds.map((bg) => {
            const isActive = backgroundId === bg.id
            return (
              <motion.button
                key={bg.id}
                type="button"
                className={`background-thumb ${bg.thumb} ${isActive ? 'is-active' : ''}`}
                onClick={() => onBackgroundChange(bg.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label={bg.label}
              >
                {isActive && (
                  <motion.span
                    className="bg-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  >
                    <Check className="icon-xs" />
                  </motion.span>
                )}
                <span className="bg-thumb-label">{bg.label}</span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <motion.button
        type="button"
        className="save-profile-btn"
        onClick={onSave}
        whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(34, 211, 238, 0.28)' }}
        whileTap={{ scale: 0.98 }}
      >
        Save AI Tutor Profile
      </motion.button>
    </motion.div>
  )
}
