import { useMemo, useState } from 'react'
import { BookOpen, Bot, FileText, PlayCircle, Sparkles, Upload, Video } from 'lucide-react'
import './App.css'

const starterMaterials = [
  { id: 1, name: 'Neural Networks Fundamentals.pdf', type: 'PDF', pages: 42, minutes: 28 },
  { id: 2, name: 'AI Ethics Lecture Notes.pdf', type: 'PDF', pages: 30, minutes: 22 },
  { id: 3, name: 'Machine Learning Revision.ppt', type: 'PPT', pages: 18, minutes: 14 },
]

const avatars = [
  {
    name: 'Astra',
    style: 'Futuristic Mentor',
    desc: 'Calm voice, deep concept breakdowns, 3D holo presentation style.',
    accent: 'from-cyan-300 to-blue-500',
  },
  {
    name: 'Nexa',
    style: 'Interactive Coach',
    desc: 'Asks short quizzes in-between and adapts speed for you.',
    accent: 'from-emerald-300 to-cyan-500',
  },
  {
    name: 'Orion',
    style: 'Exam Expert',
    desc: 'Focuses on key points, summaries, and likely exam questions.',
    accent: 'from-sky-300 to-teal-500',
  },
]

function App() {
  const [materials, setMaterials] = useState(starterMaterials)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [videoActive, setVideoActive] = useState(false)

  const totals = useMemo(() => {
    const totalPages = materials.reduce((accumulator, item) => accumulator + item.pages, 0)
    const totalMinutes = materials.reduce((accumulator, item) => accumulator + item.minutes, 0)
    return { totalPages, totalMinutes }
  }, [materials])

  const addMockFile = () => {
    const nextMaterial = {
      id: Date.now(),
      name: `Uploaded-Lecture-${materials.length + 1}.pdf`,
      type: 'PDF',
      pages: Math.floor(Math.random() * 26) + 14,
      minutes: Math.floor(Math.random() * 18) + 12,
    }

    setMaterials((prevMaterials) => [nextMaterial, ...prevMaterials])
  }

  return (
    <main className="app-shell">
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
              <button type="button" className="secondary-action" onClick={() => setVideoActive((previous) => !previous)}>
                <PlayCircle className="icon-sm" /> {videoActive ? 'Pause Lecture' : 'Generate Lecture Video'}
              </button>
            </div>
          </div>

          <div className="avatar-panel">
            <h2>Avatar Engine</h2>
            <div className="avatar-stack">
              {avatars.map((avatar, index) => (
                <button
                  key={avatar.name}
                  type="button"
                  onClick={() => setSelectedAvatar(index)}
                  className={`avatar-card ${selectedAvatar === index ? 'is-selected' : ''}`}
                >
                  <div className={`avatar-badge ${avatar.accent}`}>
                    <Bot className="icon-md" />
                  </div>
                  <div>
                    <p className="avatar-name">{avatar.name}</p>
                    <p className="avatar-style">{avatar.style}</p>
                    <p className="avatar-desc">{avatar.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <h3>Uploaded Learning Materials</h3>
          <div className="materials-list">
            {materials.map((item) => (
              <article key={item.id} className="material-card">
                <div>
                  <p className="material-name">{item.name}</p>
                  <p className="material-meta">
                    {item.type} • {item.pages} pages
                  </p>
                </div>
                <span className="material-pill">{item.minutes} min lecture</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Lecture Preview</h3>
          <div className="preview-card">
            <div className={`preview-stage ${videoActive ? 'is-active' : ''}`}>
              <div className="avatar-orbit">
                <div className={`avatar-core ${avatars[selectedAvatar].accent}`}>
                  <Bot className="icon-lg" />
                </div>
              </div>
            </div>

            <div className="preview-caption">
              <p>
                <strong>Now Teaching:</strong> {materials[0]?.name}
              </p>
              <p>
                Avatar {avatars[selectedAvatar].name} explains each topic with chapter-by-chapter visuals and key concept highlights.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  )
}

export default App
