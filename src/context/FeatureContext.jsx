import { createContext, useContext, useState, useEffect } from 'react'
import features from '../config/features.json'

const FeatureContext = createContext()

export const FeatureProvider = ({ children }) => {
  const [featureFlags, setFeatureFlags] = useState(features)
  const [supabaseEnabled, setSupabaseEnabled] = useState(false)

  useEffect(() => {
    // Load from localStorage if override exists
    const saved = localStorage.getItem('featureFlags')
    if (saved) {
      try {
        setFeatureFlags(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to load saved feature flags', e)
      }
    }

    // Check environment variables for overrides
    if (import.meta.env.VITE_FEATURE_AI_PERSONALIZATION === 'true') {
      setFeatureFlags(prev => ({
        ...prev,
        v3_features: { ...prev.v3_features, ai_personalization: { ...prev.v3_features.ai_personalization, enabled: true } }
      }))
    }

    // Set Supabase mode
    const useMock = import.meta.env.VITE_SUPABASE_MOCK !== 'false'
    setSupabaseEnabled(!useMock)
  }, [])

  const isFeatureEnabled = (featureName) => {
    const allFeatures = { ...featureFlags.v2_features, ...featureFlags.v3_features }
    return allFeatures[featureName]?.enabled || false
  }

  const toggleFeature = (featureName, enabled) => {
    const allFeatures = { ...featureFlags.v2_features, ...featureFlags.v3_features }
    if (featureName in featureFlags.v2_features) {
      setFeatureFlags(prev => ({
        ...prev,
        v2_features: {
          ...prev.v2_features,
          [featureName]: { ...prev.v2_features[featureName], enabled }
        }
      }))
    } else if (featureName in featureFlags.v3_features) {
      setFeatureFlags(prev => ({
        ...prev,
        v3_features: {
          ...prev.v3_features,
          [featureName]: { ...prev.v3_features[featureName], enabled }
        }
      }))
    }
    // Save to localStorage
    localStorage.setItem('featureFlags', JSON.stringify(featureFlags))
  }

  const value = {
    featureFlags,
    isFeatureEnabled,
    toggleFeature,
    supabaseEnabled,
    setSupabaseEnabled
  }

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  )
}

export const useFeatures = () => {
  const context = useContext(FeatureContext)
  if (!context) {
    throw new Error('useFeatures must be used within FeatureProvider')
  }
  return context
}
