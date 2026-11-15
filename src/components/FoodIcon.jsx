/** Ikon makanan (SVG) dengan bentuk yang sama seperti di arena. */
function FoodIcon({ id, color = '#E24B4A', size = 28 }) {
  const r = 0.36
  let shape

  switch (id) {
    case 'apple':
      shape = (
        <>
          <circle cx="0.5" cy="0.53" r={r} fill={color} />
          <rect x="0.465" y="0.04" width="0.07" height="0.16" rx="0.03" fill="#6B3A1E" />
          <circle cx="0.36" cy="0.42" r="0.08" fill="rgba(255,255,255,0.55)" />
        </>
      )
      break
    case 'orange':
      shape = (
        <>
          <circle cx="0.5" cy="0.52" r={r} fill={color} />
          {[[-0.3, -0.2], [0.25, -0.05], [-0.05, 0.3], [0.2, 0.35], [-0.35, 0.2]].map(([dx, dy], i) => (
            <circle key={i} cx={0.5 + dx * r} cy={0.52 + dy * r} r="0.03" fill="rgba(255,255,255,0.3)" />
          ))}
          <circle cx="0.5" cy="0.19" r="0.07" fill="#3B6D11" />
        </>
      )
      break
    case 'grape': {
      const g = r * 0.36
      const spots = [[-1, -0.9], [0, -0.9], [1, -0.9], [-0.5, 0], [0.5, 0], [0, 0.9]]
      shape = (
        <>
          <rect x="0.47" y="0.08" width="0.06" height="0.14" rx="0.03" fill="#3B6D11" />
          {spots.map(([dx, dy], i) => (
            <circle key={i} cx={0.5 + dx * g * 1.05} cy={0.55 + dy * g * 1.05 + g * 0.2} r={g} fill={color} />
          ))}
          {spots.map(([dx, dy], i) => (
            <circle key={`h${i}`} cx={0.5 + dx * g * 1.05 - g * 0.3} cy={0.55 + dy * g * 1.05 - g * 0.1} r={g * 0.3} fill="rgba(255,255,255,0.4)" />
          ))}
        </>
      )
      break
    }
    case 'dragonfruit':
      shape = (
        <>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + Math.PI / 6
            const bx = 0.5 + Math.cos(a) * r * 0.75
            const by = 0.5 + Math.sin(a) * r * 0.85
            const p = (ang, len) => `${bx + Math.cos(ang) * r * len},${by + Math.sin(ang) * r * len}`
            return <polygon key={i} points={`${p(a, 0.45)} ${p(a + 1.6, 0.2)} ${p(a - 1.6, 0.2)}`} fill="#7FB13A" />
          })}
          <ellipse cx="0.5" cy="0.5" rx={r * 0.85} ry={r} fill={color} />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + Math.PI / 6
            const bx = 0.5 + Math.cos(a) * r * 0.75
            const by = 0.5 + Math.sin(a) * r * 0.85
            const p = (ang, len) => `${bx + Math.cos(ang) * r * len},${by + Math.sin(ang) * r * len}`
            return <polygon key={`s${i}`} points={`${p(a, 0.45)} ${p(a + 1.6, 0.2)} ${p(a - 1.6, 0.2)}`} fill="#7FB13A" />
          })}
          <circle cx={0.5 - r * 0.3} cy={0.5 - r * 0.35} r={r * 0.16} fill="rgba(255,255,255,0.45)" />
        </>
      )
      break
    default:
      shape = <circle cx="0.5" cy="0.5" r={r} fill={color} />
  }

  return (
    <svg className="food-icon" viewBox="0 0 1 1" width={size} height={size} aria-hidden="true">
      {shape}
    </svg>
  )
}

export default FoodIcon
