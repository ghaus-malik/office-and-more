/** Builds and downloads an .ics file for a room booking. */
export function downloadIcs(opts: { date: string; start: string; end: string; title: string; ref: string; location: string }) {
  const d = opts.date.replace(/-/g, '')
  const s = opts.start.replace(':', '') + '00'
  const e = opts.end.replace(':', '') + '00'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Office & More//Demo//FR',
    'BEGIN:VEVENT',
    `UID:${opts.ref}@officeandmore.ch`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;TZID=Europe/Zurich:${d}T${s}`,
    `DTEND;TZID=Europe/Zurich:${d}T${e}`,
    `SUMMARY:${opts.title}`,
    `LOCATION:${opts.location}`,
    `DESCRIPTION:Ref. ${opts.ref}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `office-and-more-${opts.ref}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
