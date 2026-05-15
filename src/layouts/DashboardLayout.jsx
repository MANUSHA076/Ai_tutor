import { motion } from 'framer-motion'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'
import { SourceDocument } from '../components/dashboard/SourceDocument'
import { VideoPlayer } from '../components/dashboard/VideoPlayer'
import { AvatarGrid } from '../components/dashboard/AvatarGrid'
import { ScriptPanel } from '../components/dashboard/ScriptPanel'

export function DashboardLayout({
  activeNav,
  onNavChange,
  onNewLecture,
  sourceFile,
  onUpload,
  onRemoveFile,
  isPlaying,
  onTogglePlay,
  avatars,
  selectedAvatar,
  onSelectAvatar,
  voice,
  onVoiceChange,
  activeTab,
  onTabChange,
}) {
  return (
    <div className="dashboard">
      <Sidebar activeNav={activeNav} onNavChange={onNavChange} />

      <div className="dashboard-main">
        <TopBar onNewLecture={onNewLecture} />

        <motion.div
          className="dashboard-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <div className="grid-left">
            <SourceDocument file={sourceFile} onUpload={onUpload} onRemove={onRemoveFile} />
            <AvatarGrid
              avatars={avatars}
              selectedIndex={selectedAvatar}
              onSelect={onSelectAvatar}
              voice={voice}
              onVoiceChange={onVoiceChange}
            />
          </div>

          <div className="grid-right">
            <VideoPlayer isPlaying={isPlaying} onTogglePlay={onTogglePlay} />
            <ScriptPanel activeTab={activeTab} onTabChange={onTabChange} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
