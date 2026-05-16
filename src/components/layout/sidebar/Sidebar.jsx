import { SidebarBrand } from './SidebarBrand'
import { SidebarNav } from './SidebarNav'
import { SidebarNewSession } from './SidebarNewSession'
import { SidebarGlow } from './SidebarGlow'

export function Sidebar({ activeNav, onNavChange, onNewSession }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <SidebarBrand />
        <SidebarNav activeNav={activeNav} onNavChange={onNavChange} />
        <SidebarNewSession onNewSession={onNewSession} />
      </div>
      <SidebarGlow />
    </aside>
  )
}
