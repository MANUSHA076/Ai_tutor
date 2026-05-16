import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchLectures } from '../api/lecturesApi'

const PER_PAGE = 5

export function useLectures() {
  const [lectures, setLectures] = useState([])
  const [subject, setSubject] = useState('All')
  const [dateSort, setDateSort] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchLectures({
        subject,
        sort: dateSort,
        page: currentPage,
      })
      setLectures(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setLectures([])
      setError(err?.message || 'Could not load lectures')
    } finally {
      setLoading(false)
    }
  }, [subject, dateSort, currentPage])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    let list = [...lectures]
    if (subject !== 'All') {
      list = list.filter((item) => item.subject === subject)
    }
    list.sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date)
      return dateSort === 'newest' ? diff : -diff
    })
    return list
  }, [lectures, subject, dateSort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, currentPage])

  return {
    lectures,
    paginated,
    filteredCount: filtered.length,
    totalPages,
    subject,
    dateSort,
    currentPage,
    loading,
    error,
    reload: load,
    setSubject: (value) => {
      setSubject(value)
      setCurrentPage(1)
    },
    setDateSort: (value) => {
      setDateSort(value)
      setCurrentPage(1)
    },
    setCurrentPage,
  }
}
