import { useEffect, useId, useRef, useState } from 'react'
import { findProject, profile } from '../content/portfolio'
import type { Experience, Project } from '../content/types'
import { assetUrl } from '../lib/assets'
import { linkHandler, pathFor } from '../lib/router'
import type { Station } from './stations'

/* ── Content blocks (also used by the Quick portfolio) ───────────────────── */

export function ProjectBlock({ project, headingLevel = 2 }: { project: Project; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  const hero = project.screenshots[0]
  return (
    <article className="lab-project">
      <p className="lab-eyebrow">{project.type}</p>
      <H className="lab-title">{project.title}</H>
      <p className="lab-summary">{project.summary}</p>
      {hero && (
        <figure className="lab-shot">
          <img src={assetUrl(hero.src)} alt={hero.alt} decoding="async" width={1600} height={1000} />
          {hero.demo && <figcaption>Demo preview — real screenshots coming soon.</figcaption>}
        </figure>
      )}
      {project.features && project.features.length > 0 && (
        <ul className="lab-features">
          {project.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
      {project.technologies.length > 0 && (
        <div className="lab-meta">
          <span className="lab-meta-label">Stack</span>
          <ul className="lab-chips" aria-label="Technologies">
            {project.technologies.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {project.role && (
        <div className="lab-meta">
          <span className="lab-meta-label">Role</span>
          <span>{project.role}</span>
        </div>
      )}
      <div className="lab-actions">
        <a className="lab-btn" href={pathFor({ name: 'project', slug: project.slug })} onClick={linkHandler({ name: 'project', slug: project.slug })}>
          Full case study
        </a>
        {project.liveUrl && (
          <a className="lab-btn" href={project.liveUrl} target="_blank" rel="noreferrer">
            View live project<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        )}
        {project.sourceUrl && (
          <a className="lab-btn" href={project.sourceUrl} target="_blank" rel="noreferrer">
            {project.sourceLabel ?? 'Source code'}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  )
}

export function ExperienceBlock({ item, headingLevel = 2 }: { item: Experience; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article className="lab-project">
      <p className="lab-eyebrow">
        {item.company} · {item.period}
      </p>
      <H className="lab-title">{item.title}</H>
      <ul className="lab-features">
        {item.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {item.technologies && (
        <div className="lab-meta">
          <span className="lab-meta-label">Stack</span>
          <ul className="lab-chips" aria-label="Technologies">
            {item.technologies.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export function ContactList() {
  return (
    <ul className="lab-contact">
      {profile.contact.map((c) => {
        const external = /^https?:/.test(c.href)
        return (
          <li key={c.label}>
            <span className="lab-meta-label">{c.label}</span>
            <a href={c.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
              {c.text}
              {external && <span className="visually-hidden"> (opens in a new tab)</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function AboutBlock({ showExperience = true }: { showExperience?: boolean }) {
  return (
    <article className="lab-project">
      <p className="lab-eyebrow">About · CV</p>
      <h2 className="lab-title">{profile.name}</h2>
      {profile.about.map((p) => (
        <p key={p} className="lab-summary">
          {p}
        </p>
      ))}
      {profile.notes && (
        <dl className="lab-notes">
          {profile.notes.map((n) => (
            <div key={n.label}>
              <dt>{n.label}</dt>
              <dd>
                {n.href ? (
                  <a href={n.href} target="_blank" rel="noreferrer">
                    {n.value}
                  </a>
                ) : (
                  n.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {showExperience && profile.experience && (
        <section className="lab-section" aria-label="Experience">
          <h3>Experience</h3>
          {profile.experience.map((e) => (
            <div key={e.company} className="lab-exp">
              <p className="lab-exp-title">
                {e.title} · <span>{e.company}</span>
              </p>
              <p className="lab-exp-period">{e.period}</p>
            </div>
          ))}
        </section>
      )}
      {profile.honors && (
        <section className="lab-section" aria-label="Honors">
          <h3>Honors</h3>
          <ul className="lab-features">
            {profile.honors.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      )}
      {profile.skillGroups && (
        <section className="lab-section" aria-label="Skills">
          <h3>Skills</h3>
          {profile.skillGroups.map((g) => (
            <div key={g.label} className="lab-meta lab-meta-stack">
              <span className="lab-meta-label">{g.label}</span>
              <ul className="lab-chips">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      <section className="lab-section" aria-label="Contact">
        <h3>Contact</h3>
        <p className="lab-summary">{profile.contactIntro}</p>
        <ContactList />
      </section>
    </article>
  )
}

export function StudioBlock() {
  return (
    <article className="lab-project">
      <p className="lab-eyebrow">Web Design Studio</p>
      <h2 className="lab-title">Summyra client work</h2>
      <p className="lab-summary">
        Under Summyra, my software studio, I design and build websites and web apps for clients. Case studies from current client
        projects will be added here soon.
      </p>
      <div className="lab-actions">
        <a className="lab-btn" href="https://summyra.com/" target="_blank" rel="noreferrer">
          Visit summyra.com<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  )
}

/* ── The room panel ──────────────────────────────────────────────────────── */

interface RoomPanelProps {
  station: Station
  index: number
  total: number
  onBack: () => void
  onPrev: () => void
  onNext: () => void
}

export function RoomPanel({ station, index, total, onBack, onPrev, onNext }: RoomPanelProps) {
  const heading = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const tabsId = useId()
  // Tab choice belongs to one room; switching rooms starts at the first project again.
  const [tabState, setTabState] = useState({ room: station.id, tab: 0 })
  const tab = tabState.room === station.id ? tabState.tab : 0
  const setTab = (t: number) => setTabState({ room: station.id, tab: t })
  const projects = (station.projects ?? []).map((s) => findProject(s)).filter((p): p is Project => !!p)
  const experience = station.experience ? profile.experience?.find((e) => e.company === station.experience) : undefined

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
  }, [station.id])

  const shown = projects[Math.min(tab, projects.length - 1)]

  return (
    <aside className="lab-panel" aria-label={station.label}>
      <div className="lab-panel-head" ref={heading} tabIndex={-1}>
        <span className="lab-room-num" style={{ background: station.color }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="lab-room-name">{station.label}</span>
        <span className="lab-room-count">
          {index + 1} / {total}
        </span>
      </div>
      <div className="lab-panel-scroll" ref={scroller}>
        {projects.length > 1 && (
          <div className="lab-tabs" role="tablist" aria-label="Projects in this room">
            {projects.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                id={`${tabsId}-${i}`}
                aria-selected={i === tab}
                className="lab-tab"
                onClick={() => setTab(i)}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
        <div role={projects.length > 1 ? 'tabpanel' : undefined} aria-labelledby={projects.length > 1 ? `${tabsId}-${tab}` : undefined}>
          {station.kind === 'projects' && shown && <ProjectBlock key={shown.slug} project={shown} />}
          {station.kind === 'experience' && experience && <ExperienceBlock item={experience} />}
          {station.kind === 'studio' && <StudioBlock />}
          {station.kind === 'about' && <AboutBlock />}
        </div>
      </div>
      <div className="lab-panel-nav">
        <button type="button" className="lab-btn" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to HQ
        </button>
        <span className="lab-panel-step">
          <button type="button" className="lab-btn lab-btn-icon" onClick={onPrev} aria-label="Previous room">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="lab-btn lab-btn-dark" onClick={onNext}>
            Next room <span aria-hidden="true">→</span>
          </button>
        </span>
      </div>
    </aside>
  )
}
