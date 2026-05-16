import { motion } from 'framer-motion'
import { ChevronDown, Gauge, Mic2, Volume2 } from 'lucide-react'
import { expressionModes, teachingStyles } from '../../data/avatars'
import { voiceOptions } from '../../data/voiceOptions'

const sliders = [
  { id: 'speed', label: 'Speech Speed', icon: Gauge, min: 0, max: 100 },
  { id: 'energy', label: 'Energy Level', icon: Volume2, min: 0, max: 100 },
  { id: 'formality', label: 'Formality', icon: Mic2, min: 0, max: 100 },
]

export function AvatarCustomizer({
  voice,
  onVoiceChange,
  teachingStyle,
  onTeachingStyleChange,
  expression,
  onExpressionChange,
  sliderValues,
  onSliderChange,
}) {
  return (
    <motion.section
      className="studio-customizer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
    >
      <h3>Customize Avatar</h3>

      <div className="customizer-block">
        <label htmlFor="studio-voice">Voice Profile</label>
        <div className="select-wrap">
          <select
            id="studio-voice"
            value={voice}
            onChange={(event) => onVoiceChange(event.target.value)}
            className="studio-select"
          >
            {voiceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="icon-sm select-chevron" />
        </div>
      </div>

      <div className="customizer-block">
        <p className="customizer-label">Teaching Style</p>
        <motion.div className="style-pills" role="group" aria-label="Teaching style">
          {teachingStyles.map((style) => {
            const isActive = teachingStyle === style.id
            return (
              <motion.button
                key={style.id}
                type="button"
                className={`style-pill ${isActive ? 'is-active' : ''}`}
                onClick={() => onTeachingStyleChange(style.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                {isActive && (
                  <motion.span
                    className="style-pill-bg"
                    layoutId="teaching-style-bg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span>{style.label}</span>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      <div className="customizer-block">
        <p className="customizer-label">Expression Mode</p>
        <div className="expression-row">
          {expressionModes.map((mode) => (
            <motion.button
              key={mode.id}
              type="button"
              className={`expression-btn ${expression === mode.id ? 'is-active' : ''}`}
              onClick={() => onExpressionChange(mode.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {mode.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="customizer-sliders">
        {sliders.map((slider, index) => {
          const Icon = slider.icon
          const value = sliderValues[slider.id]

          return (
            <motion.div
              key={slider.id}
              className="slider-row"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.06 }}
            >
              <div className="slider-header">
                <Icon className="icon-sm" />
                <span>{slider.label}</span>
                <span className="slider-value">{value}%</span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                value={value}
                onChange={(event) => onSliderChange(slider.id, Number(event.target.value))}
                className="studio-range"
                style={{ '--range-progress': `${value}%` }}
              />
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
