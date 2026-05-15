import { BookOpen, FileText, PlayCircle, Sparkles, Upload, Video } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { AvatarPanel } from './AvatarPanel'

export function HeroPanel({
  materials,
  totals,
  addMockFile,
  videoActive,
  onToggleVideo,
  avatars,
  selectedAvatar,
  onSelectAvatar,
}) {
  return (
    <section className="hero-panel">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      <div className="hero-layout">
        <div>
          <div className="eyebrow">
            <Sparkles className="icon-sm" /> AI Tutor Studio
          </div>
          <h1>3D Avatar AI Tutor for your PDFs and lecture materials</h1>
          <p className="lede">
            Upload PDFs, docs, and slides. The system auto-generates a personalized lecture video with a 3D-style tutor avatar,
            voice narration, and smart chapter flow.
          </p>

          <div className="metrics-grid">
            <MetricCard icon={<FileText className="icon-sm" />} label="Materials" value={materials.length.toString()} />
            <MetricCard icon={<BookOpen className="icon-sm" />} label="Total Pages" value={totals.totalPages.toString()} />
            <MetricCard icon={<Video className="icon-sm" />} label="Lecture Duration" value={`${totals.totalMinutes} min`} />
          </div>

          <div className="action-row">
            <button type="button" className="primary-action" onClick={addMockFile}>
              <Upload className="icon-sm" /> Add Study File
            </button>
            <button type="button" className="secondary-action" onClick={onToggleVideo}>
              <PlayCircle className="icon-sm" /> {videoActive ? 'Pause Lecture' : 'Generate Lecture Video'}
            </button>
          </div>
        </div>

        <AvatarPanel avatars={avatars} selectedAvatar={selectedAvatar} onSelectAvatar={onSelectAvatar} />
      </div>
    </section>
  )
}
