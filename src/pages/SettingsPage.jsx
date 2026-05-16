import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Save, Shield, Sliders, User } from 'lucide-react'
import { settingsSections, preferenceToggles, notificationToggles } from '../data/settingsConfig'
import { SettingsAccount } from '../components/settings/SettingsAccount'
import { SettingsPreferences } from '../components/settings/SettingsPreferences'
import { SettingsNotifications } from '../components/settings/SettingsNotifications'
import { SettingsPrivacy } from '../components/settings/SettingsPrivacy'
import '../styles/settings.css'

const sectionIcons = {
  account: User,
  preferences: Sliders,
  notifications: Bell,
  privacy: Shield,
}

const buildToggleState = (items, defaultValue = false) =>
  Object.fromEntries(items.map((item) => [item.id, item.defaultOn ?? defaultValue]))

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account')
  const [name, setName] = useState('Alex Morgan')
  const [email, setEmail] = useState('alex@edututor.ai')
  const [language, setLanguage] = useState('English')
  const [lectureSpeed, setLectureSpeed] = useState('normal')
  const [preferenceTogglesState, setPreferenceTogglesState] = useState(() =>
    buildToggleState(preferenceToggles, false),
  )
  const [notificationTogglesState, setNotificationTogglesState] = useState(() =>
    buildToggleState(notificationToggles, true),
  )
  const [saved, setSaved] = useState(false)

  const handlePreferenceToggle = (id, value) => {
    setPreferenceTogglesState((prev) => ({ ...prev, [id]: value }))
  }

  const handleNotificationToggle = (id, value) => {
    setNotificationTogglesState((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <SettingsAccount
            name={name}
            email={email}
            onNameChange={setName}
            onEmailChange={setEmail}
          />
        )
      case 'preferences':
        return (
          <SettingsPreferences
            language={language}
            onLanguageChange={setLanguage}
            lectureSpeed={lectureSpeed}
            onLectureSpeedChange={setLectureSpeed}
            toggles={preferenceTogglesState}
            onToggle={handlePreferenceToggle}
          />
        )
      case 'notifications':
        return (
          <SettingsNotifications
            toggles={notificationTogglesState}
            onToggle={handleNotificationToggle}
          />
        )
      case 'privacy':
        return <SettingsPrivacy />
      default:
        return null
    }
  }

  const activeLabel = settingsSections.find((s) => s.id === activeSection)?.label

  return (
    <div className="settings-page">
      <motion.header
        className="settings-page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences, and privacy.</p>
        </div>
        <motion.button
          type="button"
          className="settings-save-btn"
          onClick={handleSave}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Save className="icon-sm" />
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </motion.header>

      <div className="settings-layout">
        <motion.nav
          className="settings-nav"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
        >
          {settingsSections.map((section) => {
            const Icon = sectionIcons[section.id]
            const isActive = activeSection === section.id

            return (
              <motion.button
                key={section.id}
                type="button"
                className={`settings-nav-item ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.span
                    className="settings-nav-indicator"
                    layoutId="settings-nav-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="icon-sm" />
                <span>{section.label}</span>
              </motion.button>
            )
          })}
        </motion.nav>

        <div className="settings-content">
          <motion.h2
            key={activeSection}
            className="settings-content-title"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeLabel}
          </motion.h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
