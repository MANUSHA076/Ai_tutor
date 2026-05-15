import { useMemo, useState } from 'react'
import { starterMaterials } from '../data/starterMaterials'

export function useMaterials() {
  const [materials, setMaterials] = useState(starterMaterials)

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

  return { materials, totals, addMockFile }
}
