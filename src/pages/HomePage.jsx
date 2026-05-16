import { motion } from 'framer-motion'
import { SourceDocument } from '../components/dashboard/SourceDocument'
import { VideoPlayer } from '../components/dashboard/VideoPlayer'
import { AvatarGrid } from '../components/dashboard/AvatarGrid'
import { ScriptPanel } from '../components/dashboard/ScriptPanel'

// BACKEND [Python]: homeApi + documentsApi — see src/api/homeApi.js, App.jsx

export function HomePage({
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
    <motion.div
      className="dashboard-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.05 }}
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
  )
}
