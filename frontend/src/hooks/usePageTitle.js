import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    const baseTitle = 'Comedy Genius Analytics'
    document.title = title ? `${title} | ${baseTitle}` : baseTitle
    
    // Reset title when component unmounts
    return () => {
      document.title = baseTitle
    }
  }, [title])
}