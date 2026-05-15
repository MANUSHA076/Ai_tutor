import { Bot } from 'lucide-react'

export function AvatarPanel({ avatars, selectedAvatar, onSelectAvatar }) {
  return (
    <div className="avatar-panel">
      <h2>Avatar Engine</h2>
      <div className="avatar-stack">
        {avatars.map((avatar, index) => (
          <button
            key={avatar.name}
            type="button"
            onClick={() => onSelectAvatar(index)}
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
  )
}
