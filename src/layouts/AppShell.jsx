import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export function AppShell({
  activeNav,
  onNavChange,
  onNewSession,
  searchPlaceholder,
  showNewLecture,
  onNewLecture,
  children,
}) {
  return (
    <motion.div className="dashboard">
      <Sidebar activeNav={activeNav} onNavChange={onNavChange} onNewSession={onNewSession} />

      <div className="dashboard-main">
        <TopBar
          searchPlaceholder={searchPlaceholder}
          showNewLecture={showNewLecture}
          onNewLecture={onNewLecture}
        />

        <AnimatePresence mode="wait">
          <motion.div key={activeNav} className="page-content" {...pageTransition}>
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
