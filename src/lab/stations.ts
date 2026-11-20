/**
 * What each room of the HQ shows. Edit labels or project lists here; the 3D room
 * models live in src/lab/engine/. Order = the "Next room" order (starts at Security).
 */
import type { RoomId } from './engine/types'

export type StationKind = 'projects' | 'experience' | 'studio' | 'about'

export interface Station {
  id: RoomId
  /** Full room name, e.g. in the panel eyebrow. */
  label: string
  /** Short name for chips and pins. */
  short: string
  kind: StationKind
  /** Project slugs from src/content/portfolio.ts, for kind 'projects'. */
  projects?: string[]
  /** Company name of a profile.experience entry, for kind 'experience'. */
  experience?: string
  /** Accent colour for chips and pins. */
  color: string
}

export const STATIONS: Station[] = [
  { id: 'security', label: 'Security Control', short: 'Security', kind: 'projects', projects: ['smart-office-security'], color: '#E8845A' },
  { id: 'ai', label: 'AI Lab', short: 'AI Lab', kind: 'experience', experience: 'Kuika Software', color: '#8E6CCF' },
  { id: 'saas', label: 'SaaS · Summyra', short: 'SaaS', kind: 'projects', projects: ['summyra-campus', 'summyra-panel'], color: '#E0B33F' },
  { id: 'game', label: 'Game Zone', short: 'Games', kind: 'projects', projects: ['tiny-siege-wars'], color: '#E26D7A' },
  { id: 'mobile', label: 'Mobile Apps', short: 'Mobile', kind: 'projects', projects: ['rolebluff', 'akil-adasi'], color: '#B9D35A' },
  { id: 'iot', label: 'IoT Workshop', short: 'IoT', kind: 'projects', projects: ['rfid-attendance'], color: '#6CA6D9' },
  { id: 'studio', label: 'Web Design Studio', short: 'Studio', kind: 'studio', color: '#86D4C4' },
  { id: 'about', label: 'About · CV', short: 'About', kind: 'about', color: '#F6EED9' },
]

export const stationById = (id: string | undefined) => STATIONS.find((s) => s.id === id)
