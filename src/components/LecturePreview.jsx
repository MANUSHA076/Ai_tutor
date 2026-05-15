import { Bot } from 'lucide-react'

export function LecturePreview({ materials, avatars, selectedAvatar, videoActive }) {
  const activeAvatar = avatars[selectedAvatar]

  return (
    <div className="panel">
      <h3>Lecture Preview</h3>
      <div className="preview-card">
        <div className={`preview-stage ${videoActive ? 'is-active' : ''}`}>
          <div className="avatar-orbit">
            <div className={`avatar-core ${activeAvatar.accent}`}>
              <Bot className="icon-lg" />
            </div>
          </div>
        </div>

        <div className="preview-caption">
          <p>
            <strong>Now Teaching:</strong> {materials[0]?.name}
          </p>
          <p>
            Avatar {activeAvatar.name} explains each topic with chapter-by-chapter visuals and key concept highlights.
          </p>
        </div>
      </div>
    </div>
  )
}
