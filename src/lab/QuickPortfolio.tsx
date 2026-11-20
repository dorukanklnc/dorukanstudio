import { useEffect, useRef } from 'react'
import { profile, projects } from '../content/portfolio'
import { linkHandler, pathFor } from '../lib/router'
import { AboutBlock, ExperienceBlock } from './RoomPanel'

/**
 * Plain HTML version of everything in the HQ: fast to scan, readable by search engines
 * and screen readers, and the automatic fallback when WebGL isn't available.
 */
export function QuickPortfolio({ onClose, note }: { onClose?: () => void; note?: string }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="lab-quick" role="region" aria-label="Quick portfolio">
      <div className="lab-quick-inner">
        <header className="lab-quick-head">
          <div>
            <p className="lab-eyebrow">Quick portfolio</p>
            <h1 ref={heading} tabIndex={-1} className="lab-quick-title">
              {profile.name}
            </h1>
            <p className="lab-quick-tag">{profile.tagline}</p>
          </div>
          {onClose && (
            <button type="button" className="lab-btn lab-btn-dark" onClick={onClose}>
              Enter the HQ <span aria-hidden="true">→</span>
            </button>
          )}
        </header>
        {note && <p className="lab-quick-note">{note}</p>}

        <section aria-labelledby="qp-projects">
          <h2 id="qp-projects" className="lab-quick-h2">
            Projects
          </h2>
          <ul className="lab-quick-grid">
            {projects.map((p) => (
              <li key={p.slug} className="lab-quick-card" style={{ borderTopColor: p.labelColor }}>
                <p className="lab-eyebrow">{p.type}</p>
                <h3 className="lab-quick-card-title">{p.title}</h3>
                <p className="lab-summary">{p.summary}</p>
                <ul className="lab-chips" aria-label="Technologies">
                  {p.technologies.slice(0, 6).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <a className="lab-link" href={pathFor({ name: 'project', slug: p.slug })} onClick={linkHandler({ name: 'project', slug: p.slug })}>
                  Case study<span className="visually-hidden">: {p.title}</span> <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {profile.experience && (
          <section aria-labelledby="qp-exp">
            <h2 id="qp-exp" className="lab-quick-h2">
              Experience
            </h2>
            <div className="lab-quick-exp">
              {profile.experience.map((e) => (
                <ExperienceBlock key={e.company} item={e} headingLevel={3} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="qp-about">
          <h2 id="qp-about" className="lab-quick-h2">
            About &amp; contact
          </h2>
          <div className="lab-quick-about">
            <AboutBlock showExperience={false} />
          </div>
        </section>

      </div>
    </div>
  )
}
