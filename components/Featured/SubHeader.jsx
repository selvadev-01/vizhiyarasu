import React from 'react'
import { PROFILE, SKILLS } from '../../data/profile'

// On desktop this column occupies the right half of the #about band.
// FeaturedVideo is absolutely positioned in the left half (md:left-20,
// ~40vw wide) at a higher z-index, so anchoring here — rather than spanning
// the full width from the centre — is what keeps the portrait from covering
// the bio and skills.
const SubHeader = () => {
  return (
    <div className='relative md:absolute md:top-1/5 left-0 md:left-1/2 w-full md:w-1/2 md:mt-40 z-10 flex flex-col md:items-start items-center px-5 md:px-0 md:pr-[5vw]'>
      <div className='w-full text-base md:text-xl flex flex-col gap-3 md:gap-4 leading-relaxed md:leading-snug text-center md:text-left'>
        {PROFILE.summary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {/* Height is `auto` rather than a fixed 36vh: there are six skill groups
          where the old services grid had four, so a clamped height clipped the
          last rows. */}
      <div className='about-inline-services w-full mt-8 md:mt-12 h-auto'>
        <div className='about-inline-services__head'>
          <span className='about-inline-services__label'>SKILLS</span>
        </div>
        <div className='about-inline-services__grid'>
          {SKILLS.map((skill) => (
            <article key={skill.group} className='about-inline-services__item'>
              <h4>{skill.group}</h4>
              <p>{skill.items.join(', ')}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubHeader
