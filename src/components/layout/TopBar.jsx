import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Loader2, Plus, Search } from 'lucide-react'

export function TopBar({
  searchPlaceholder = 'Search lectures...',
  showNewLecture = true,
  onNewLecture,
  ragSource = '',
  onSearch,
}) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])
  const [searchError, setSearchError] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!onSearch || !ragSource) {
      setResults([])
      setSearchError('')
      return undefined
    }

    if (!query.trim()) {
      setResults([])
      setSearchError('')
      return undefined
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      setSearchError('')
      try {
        const data = await onSearch(query)
        setResults(Array.isArray(data?.results) ? data.results : [])
      } catch (err) {
        setResults([])
        setSearchError(err?.message || 'Search failed')
      } finally {
        setSearching(false)
      }
    }, 450)

    return () => clearTimeout(debounceRef.current)
  }, [query, onSearch, ragSource])

  const ragMode = Boolean(ragSource && onSearch)

  return (
    <motion.header
      className="topbar"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <motion.div className="search-wrap">
        <Search className="icon-sm search-icon" />
        <input
          type="search"
          placeholder={ragMode ? `Search in ${ragSource}…` : searchPlaceholder}
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && <Loader2 className="icon-sm search-spinner spin-icon" />}

        {ragMode && query.trim() && (results.length > 0 || searchError) && (
          <div className="search-results-dropdown">
            {searchError ? (
              <p className="search-result-error">{searchError}</p>
            ) : (
              results.map((item) => (
                <motion.div
                  key={item.id}
                  className="search-result-item"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="search-result-text">{item.text?.slice(0, 200)}</p>
                  {item.rerank_score != null && (
                    <span className="search-result-score">
                      score {item.rerank_score.toFixed(2)}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        className="topbar-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          type="button"
          className="icon-btn"
          aria-label="Notifications"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="icon-sm" />
          <span className="notif-dot" />
        </motion.button>

        {showNewLecture && (
          <motion.button
            type="button"
            className="new-lecture-btn"
            onClick={onNewLecture}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(34, 211, 238, 0.25)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="icon-sm" /> New Lecture
          </motion.button>
        )}

        <motion.div
          className="user-avatar"
          whileHover={{ scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          U
        </motion.div>
      </motion.div>
    </motion.header>
  )
}
