import * as React from 'react'
import { useRouter } from 'next/router'
import { useKeyPress } from 'hooks/useKeyPress'
import { useLockBodyScroll } from 'hooks/useLockBodyScroll'
import SearchModal from './SearchModal'
import Icon from 'components/Icon'
import { matchSorter } from 'match-sorter'
import { useDocs } from 'hooks/useDocs'
import { escape } from 'utils/text'
import { useCSB } from 'hooks/useCSB'
import type { SearchResult } from './SearchItem'

function Search() {
  const router = useRouter()
  const boxes = useCSB()
  const docs = useDocs()
  const [showSearchModal, setShowSearchModal] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [lib] = router.query.slug as string[]
  const [results, setResults] = React.useState<SearchResult[]>([])
  const escPressed = useKeyPress('Escape')
  const slashPressed = useKeyPress('Slash')
  useLockBodyScroll(showSearchModal)

  React.useEffect(() => {
    React.startTransition(() => {
      if (!query) return setResults([])

      // Get length of matched text in result
      const relevanceOf = (result: SearchResult) =>
        (result.title.toLowerCase().match(query.toLowerCase())?.length ?? 0) / result.title.length

      // Search
      const entries = (docs.flatMap(({ tableOfContents }) => tableOfContents) as SearchResult[])
        .filter((entry) => entry.description.length > 0)
        .concat(
          Object.entries(boxes).flatMap(([id, data]) => ({
            ...data,
            label: 'codesandbox.io',
            description: data.description ?? '',
            url: `https://codesandbox.io/s/${id}`,
            image: data.screenshot_url,
          }))
        )

      const results = matchSorter(entries, query, {
        keys: ['title', 'description'],
        threshold: matchSorter.rankings.CONTAINS,
      })
        // Sort by relevance
        .sort((a, b) => relevanceOf(b) - relevanceOf(a))
        // Truncate to top four results
        .slice(0, 4)

      setResults(results)
    })
  }, [boxes, docs, lib, query])

  React.useEffect(() => void setQuery(''), [showSearchModal])

  React.useEffect(() => {
    if (escPressed && showSearchModal) {
      setShowSearchModal(false)
    }
  }, [escPressed, slashPressed, showSearchModal])

  React.useEffect(() => {
    if (slashPressed && !showSearchModal) {
      setShowSearchModal(true)
    }
  }, [slashPressed, showSearchModal])

  React.useEffect(() => setShowSearchModal(false), [router.asPath])

  return (
    <>
      {showSearchModal && (
        <SearchModal
          search={query}
          results={results}
          onClose={() => setShowSearchModal(false)}
          onChange={(e) => setQuery(escape(e.target.value))}
        />
      )}
      <div className="relative w-full">
        <div className="flex items-center justify-between flex-auto h-16 px-4">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="group leading-6 font-medium flex items-center space-x-3 sm:space-x-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 w-full py-2"
            onFocus={() => setShowSearchModal(true)}
          >
            <Icon
              icon="search"
              className="h-6 w-6 text-gray-400 group-hover:text-gray-500 transition-colors duration-200"
            />
            <span>
              Quick search
              <span className="hidden sm:inline"> for anything</span>
            </span>
            <span
              style={{ opacity: 1 }}
              className="hidden sm:block text-gray-400 text-sm leading-5 py-0.5 px-1.5 border border-gray-300 rounded-md"
            >
              <span className="sr-only">Press </span>
              <kbd className="font-sans">
                <abbr title="Forward slash" className="no-underline">
                  /
                </abbr>
              </kbd>
              <span className="sr-only"> to search</span>
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Search