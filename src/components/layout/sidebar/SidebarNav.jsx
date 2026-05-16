import { navItems } from '../../../data/navigation'
import { SidebarNavItem } from './SidebarNavItem'

export function SidebarNav({ activeNav, onNavChange }) {
  return (
    <nav className="sidebar-nav">
      {navItems.map((item, index) => (
        <SidebarNavItem
          key={item.id}
          item={item}
          index={index}
          isActive={activeNav === item.id}
          onSelect={onNavChange}
        />
      ))}
    </nav>
  )
}
