import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Paper, Typography } from '@mui/material'

/* ══════════════════════════════════════════════════════
   TINY HUNGRY PERSON
   - Sits on the OUTSIDE edge of the card, facing inward
   - Full chibi body always visible (overflow:visible on card)
   - Arms animate rapidly when eating — super hungry motion
   - 3 bites → shrink away → reappear elsewhere
══════════════════════════════════════════════════════ */
const TinyPerson = ({
  isBiting,
  mouthOpen  = 0,
  legFrame   = 0,
  armFrame   = 0,        // fast arm wiggle when hungry eating
  skinColor  = '#FDBCB4',
  hairColor  = '#3e1f00',
  shirtColor = '#e53935',
}) => {
  const legSwing = legFrame % 2 === 0 ?  4 : -4
  const jawGap   = mouthOpen * 6

  // hungry arm animation — both arms pump back and forth rapidly
  // alternating: left arm up-right, right arm down-right, then swap
  const armPhase   = armFrame % 4          // 0,1,2,3 cycle
  const leftArmAng  = isBiting
    ? (armPhase < 2 ? -30 : -55)           // pump left arm up/down
    : -10
  const rightArmAng = isBiting
    ? (armPhase < 2 ? 55 : 30)            // pump right arm opposite phase
    : 10

  // convert angles to arm endpoint offsets
  const toXY = (baseX, baseY, angleDeg, len) => ({
    x: baseX + len * Math.sin((angleDeg * Math.PI) / 180),
    y: baseY + len * Math.cos((angleDeg * Math.PI) / 180),
  })

  const lArm = toXY(6,  22, leftArmAng,  10)
  const rArm = toXY(22, 22, rightArmAng, 10)

  return (
    <svg width="28" height="38" viewBox="0 0 28 38" overflow="visible">

      {/* ── Hair ── */}
      <ellipse cx="14" cy="6.5" rx="9"  ry="7.5" fill={hairColor} />
      <ellipse cx="9"  cy="3"   rx="4"  ry="3.5" fill={hairColor} transform="rotate(-20 9 3)" />
      <ellipse cx="14" cy="1"   rx="3.5" ry="3"  fill={hairColor} />
      <ellipse cx="19" cy="3"   rx="4"  ry="3.5" fill={hairColor} transform="rotate(20 19 3)" />

      {/* ── Head ── */}
      <ellipse cx="14" cy="9.5" rx="8.5" ry="9" fill={skinColor} />

      {/* ── Rosy cheeks ── */}
      <circle cx="6.5"  cy="11" r="3" fill="#ff8a80" opacity="0.55" />
      <circle cx="21.5" cy="11" r="3" fill="#ff8a80" opacity="0.55" />

      {/* ── Eyes — squint happily when eating ── */}
      {isBiting ? (
        <>
          {/* happy eating squint ^‿^ */}
          <path d="M8.5 8.5  Q11 6 13.5 8.5"  fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14.5 8.5 Q17 6 19.5 8.5" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          {/* little star sparkles by eyes when eating */}
          <text x="2"  y="7"  fontSize="4" fill="#ffeb3b">✦</text>
          <text x="22" y="7"  fontSize="4" fill="#ffeb3b">✦</text>
        </>
      ) : (
        <>
          <circle cx="11"  cy="9"  r="2.5" fill="white" />
          <circle cx="17"  cy="9"  r="2.5" fill="white" />
          <circle cx="11.6" cy="9.5" r="1.4" fill="#222" />
          <circle cx="17.6" cy="9.5" r="1.4" fill="#222" />
          <circle cx="12.1" cy="8.9" r="0.55" fill="white" />
          <circle cx="18.1" cy="8.9" r="0.55" fill="white" />
        </>
      )}

      {/* ── Mouth ── */}
      {isBiting ? (
        <>
          {/* upper lip lifts */}
          <path
            d={`M8.5 ${14.5 - jawGap * 0.45} Q14 ${13 - jawGap * 0.55} 19.5 ${14.5 - jawGap * 0.45}`}
            fill={skinColor} stroke="#b06050" strokeWidth="0.9" strokeLinecap="round"
          />
          {/* upper teeth row */}
          <rect x="9" y={13.5 - jawGap * 0.45} width="10" height="2" rx="1" fill="white" />

          {/* lower lip drops */}
          <path
            d={`M8.5 ${15.5 + jawGap * 0.55} Q14 ${17 + jawGap * 0.45} 19.5 ${15.5 + jawGap * 0.55}`}
            fill={skinColor} stroke="#b06050" strokeWidth="0.9" strokeLinecap="round"
          />
          {/* lower teeth row */}
          <rect x="9" y={14.8 + jawGap * 0.55} width="10" height="1.8" rx="1" fill="white" />

          {/* tongue only when mouth wide open */}
          {mouthOpen > 0.55 && (
            <ellipse cx="14" cy={15.5 + jawGap * 0.3} rx="3.8" ry="1.6" fill="#ef5350" opacity="0.9" />
          )}
        </>
      ) : (
        <path d="M9.5 15 Q14 18 18.5 15" fill="none" stroke="#b06050" strokeWidth="1.2" strokeLinecap="round" />
      )}

      {/* ── Neck ── */}
      <rect x="11.5" y="17.5" width="5" height="3.5" rx="2" fill={skinColor} />

      {/* ── Body / shirt ── */}
      <ellipse cx="14" cy="26" rx="7.5" ry="7" fill={shirtColor} />
      {/* shirt highlight */}
      <ellipse cx="11" cy="23" rx="3"   ry="2.5" fill="white" opacity="0.15" />
      {/* collar */}
      <path d="M10 20.5 Q14 23 18 20.5" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" strokeLinecap="round" />

      {/* ── Pants ── */}
      <ellipse cx="14" cy="31.5" rx="7.5" ry="3.5" fill="#1a237e" />

      {/* ── Legs ── */}
      <rect x="8"  y="31" width="5.5" height="6" rx="2.8" fill="#1a237e"
        transform={`rotate(${legSwing}  10.7 31)`} />
      <rect x="14.5" y="31" width="5.5" height="6" rx="2.8" fill="#1a237e"
        transform={`rotate(${-legSwing} 17.2 31)`} />

      {/* ── Shoes ── */}
      <ellipse cx="10.5" cy="37"  rx="4" ry="2.2" fill="#1a1a1a"
        transform={`rotate(${legSwing}  10.5 37)`} />
      <ellipse cx="17.5" cy="37"  rx="4" ry="2.2" fill="#1a1a1a"
        transform={`rotate(${-legSwing} 17.5 37)`} />

      {/* ══ HUNGRY ARMS — animate rapidly when eating ══ */}

      {/* Left arm */}
      <line
        x1="6.5" y1="22"
        x2={lArm.x} y2={lArm.y}
        stroke={skinColor} strokeWidth="4" strokeLinecap="round"
      />
      {/* Left hand (circle) */}
      <circle cx={lArm.x} cy={lArm.y} r="2.8" fill={skinColor} />
      {/* left hand finger detail */}
      <line x1={lArm.x - 1} y1={lArm.y - 2.5} x2={lArm.x - 2.5} y2={lArm.y - 4}
        stroke="#d4907a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1={lArm.x + 1} y1={lArm.y - 2.5} x2={lArm.x + 1.5} y2={lArm.y - 4.2}
        stroke="#d4907a" strokeWidth="0.8" strokeLinecap="round" />

      {/* Right arm */}
      <line
        x1="21.5" y1="22"
        x2={rArm.x} y2={rArm.y}
        stroke={skinColor} strokeWidth="4" strokeLinecap="round"
      />
      {/* Right hand */}
      <circle cx={rArm.x} cy={rArm.y} r="2.8" fill={skinColor} />
      <line x1={rArm.x - 1} y1={rArm.y - 2.5} x2={rArm.x - 2.5} y2={rArm.y - 4}
        stroke="#d4907a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1={rArm.x + 1} y1={rArm.y - 2.5} x2={rArm.x + 1.5} y2={rArm.y - 4.2}
        stroke="#d4907a" strokeWidth="0.8" strokeLinecap="round" />

    </svg>
  )
}

/* ══════════════════════════════════════════
   BITE MARK — semicircle tooth marks ON the card border
   Positioned flush with the inside of the border
══════════════════════════════════════════ */
const BiteMark = ({ x, y, edge }) => {
  const isH = edge === 0 || edge === 2
  const W = isH ? 40 : 12
  const H = isH ? 12 : 40

  return (
    <Box sx={{
      position: 'absolute',
      left: x - W / 2,
      top:  y - H / 2,
      width: W, height: H,
      pointerEvents: 'none',
      zIndex: 4,
    }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible">
        <rect width={W} height={H} fill="rgba(0,0,0,0.06)" rx="2" />
        {isH
          ? [4,12,20,28,36].map((cx, i) => (
              <ellipse key={i} cx={cx} cy={edge === 0 ? 1 : H - 1} rx="4" ry="5"
                fill="rgba(0,0,0,0.18)" />
            ))
          : [4,12,20,28,36].map((cy, i) => (
              <ellipse key={i} cy={cy} cx={edge === 1 ? W - 1 : 1} ry="4" rx="5"
                fill="rgba(0,0,0,0.18)" />
            ))
        }
      </svg>
    </Box>
  )
}

/* ══════════════════════════════════════════
   NOM BURST
══════════════════════════════════════════ */
const NomBurst = ({ x, y, color, label, onDone }) => {
  const [f, setF] = useState(0)
  const raf = useRef()
  useEffect(() => {
    let n = 0
    const run = () => {
      n++; setF(n)
      if (n < 26) raf.current = requestAnimationFrame(run)
      else onDone()
    }
    raf.current = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf.current)
  }, [onDone])

  const p  = f / 26
  const op = Math.max(0, 1 - p * p)
  const sc = 0.2 + p * 1.5

  return (
    <Box sx={{
      position: 'absolute',
      left: x - 24, top: y - 24,
      width: 48, height: 48,
      pointerEvents: 'none', zIndex: 25,
      opacity: op,
      transform: `scale(${sc})`,
      transformOrigin: 'center',
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const r = i % 2 === 0 ? 20 : 13
          const a = (deg * Math.PI) / 180
          return <line key={deg} x1="24" y1="24"
            x2={24 + Math.cos(a) * r} y2={24 + Math.sin(a) * r}
            stroke={color} strokeWidth={i % 2 === 0 ? '3' : '1.8'} strokeLinecap="round" />
        })}
        <text x="24" y="28" fontSize="9" fontWeight="900"
          fontFamily="'Oswald', sans-serif"
          fill="white" stroke={color} strokeWidth="2.5" paintOrder="stroke"
          textAnchor="middle">{label}</text>
        <text x="2"  y="12" fontSize="9"  fill="#ffeb3b">★</text>
        <text x="38" y="10" fontSize="7"  fill="#ffeb3b">★</text>
        <text x="2"  y="42" fontSize="6"  fill="#ffeb3b">✦</text>
        <text x="40" y="40" fontSize="8"  fill="#ffeb3b">★</text>
      </svg>
    </Box>
  )
}

/* ══════════════════════════════════════════
   EDGE POSITION
   Person walks just OUTSIDE the card border so full body shows,
   facing inward (toward the card edge they're eating)
══════════════════════════════════════════ */
const getEdgePos = (edge, progress, w, h) => {
  // sit right on the border: person center is AT the edge line
  // Since card has overflow:visible now, they'll show outside
  switch (edge) {
    case 0: return { x: 8 + progress * (w - 16), y: 0,  ang: 180 }   // top   → faces down (into card)
    case 1: return { x: w,  y: 8 + progress * (h - 16), ang: 270 }  // right  → faces left
    case 2: return { x: 8 + (1 - progress) * (w - 16), y: h, ang: 0 } // bottom → faces up
    case 3: return { x: 0,  y: 8 + (1 - progress) * (h - 16), ang: 90 } // left → faces right
    default: return { x: 0, y: 0, ang: 0 }
  }
}

/* ══════════════════════════════════════════
   STATE MACHINE HOOK
══════════════════════════════════════════ */
const BITE_LABELS = ['NOM!', 'NOM!', 'YUM!']

const useTinyPerson = (cardRef, speed = 0.65) => {
  const [pos, setPos]             = useState({ x: 40, y: 0 })
  const [angleDeg, setAngleDeg]   = useState(180)
  const [legFrame, setLegFrame]   = useState(0)
  const [armFrame, setArmFrame]   = useState(0)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [pScale, setPScale]       = useState(1)
  const [visible, setVisible]     = useState(true)
  const [bursts, setBursts]       = useState([])
  const [biteMarks, setBiteMarks] = useState([])

  const st = useRef({
    mode: 'WALKING',
    edge: 0, progress: 0.2,
    biteCount: 0,
    mouthDir: 1, mouthVal: 0,
    bitePos: { x: 0, y: 0 }, biteEdge: 0,
    scale: 1, hiddenTimer: 0,
  })
  const raf    = useRef()
  const legTck = useRef(0)
  const armTck = useRef(0)

  const removeBurst = useCallback(id => setBursts(p => p.filter(e => e.id !== id)), [])

  useEffect(() => {
    const MOUTH_SPEED = 0.065

    const tick = () => {
      const card = cardRef.current
      if (!card) { raf.current = requestAnimationFrame(tick); return }
      const w = card.offsetWidth
      const h = card.offsetHeight
      const s = st.current

      // leg tick (slower)
      legTck.current++
      if (legTck.current % 8 === 0) setLegFrame(f => f + 1)

      // arm tick — fast when biting (hungry eating)
      if (s.mode === 'BITING') {
        armTck.current++
        if (armTck.current % 3 === 0) setArmFrame(f => f + 1)  // rapid arm pump
      } else {
        armTck.current = 0
      }

      /* SHRINKING */
      if (s.mode === 'SHRINKING') {
        s.scale = Math.max(0, s.scale - 0.08)
        setPScale(s.scale)
        if (s.scale <= 0) {
          setVisible(false)
          s.mode = 'HIDDEN'; s.hiddenTimer = 50
          s.edge = Math.floor(Math.random() * 4)
          s.progress = 0.1 + Math.random() * 0.72
          s.biteCount = 0
        }
        raf.current = requestAnimationFrame(tick); return
      }

      /* HIDDEN */
      if (s.mode === 'HIDDEN') {
        s.hiddenTimer--
        if (s.hiddenTimer <= 0) {
          const { x, y, ang } = getEdgePos(s.edge, s.progress, w, h)
          setPos({ x, y }); setAngleDeg(ang)
          setVisible(true); s.scale = 0; setPScale(0)
          s.mode = 'GROWING'
        }
        raf.current = requestAnimationFrame(tick); return
      }

      /* GROWING */
      if (s.mode === 'GROWING') {
        s.scale = Math.min(1, s.scale + 0.09)
        setPScale(s.scale)
        if (s.scale >= 1) s.mode = 'WALKING'
        raf.current = requestAnimationFrame(tick); return
      }

      /* BITING */
      if (s.mode === 'BITING') {
        s.mouthVal += MOUTH_SPEED * s.mouthDir
        if (s.mouthVal >= 1) { s.mouthVal = 1; s.mouthDir = -1 }
        if (s.mouthVal <= 0 && s.mouthDir === -1) {
          s.mouthVal = 0; s.mouthDir = 1
          const id = Date.now() + Math.random()
          const { x, y } = s.bitePos
          setBiteMarks(prev => [...prev, { x, y, edge: s.biteEdge, id: id + 0.5 }].slice(-3))
          setBursts(prev => [...prev, { x, y, id, label: BITE_LABELS[s.biteCount] }])
          s.biteCount++
          if (s.biteCount >= 3) {
            s.mode = 'SHRINKING'; s.scale = 1
            setMouthOpen(0)
            raf.current = requestAnimationFrame(tick); return
          }
        }
        setMouthOpen(s.mouthVal)
        raf.current = requestAnimationFrame(tick); return
      }

      /* WALKING */
      setMouthOpen(0)
      s.progress += speed * 0.002
      if (s.progress >= 1) { s.progress = 0; s.edge = (s.edge + 1) % 4 }

      if (Math.random() < 0.005) {
        const { x, y } = getEdgePos(s.edge, s.progress, w, h)
        s.bitePos = { x, y }; s.biteEdge = s.edge
        s.mode = 'BITING'; s.mouthDir = 1; s.mouthVal = 0; s.biteCount = 0
      }

      const { x, y, ang } = getEdgePos(s.edge, s.progress, w, h)
      setPos({ x, y }); setAngleDeg(ang)
      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [cardRef, speed])

  return { pos, angleDeg, mouthOpen, pScale, visible, legFrame, armFrame, bursts, biteMarks, removeBurst }
}

/* ══════════════════════════════════════════
   EXPORTED COMPONENT
══════════════════════════════════════════ */
export const InsectStatCard = ({
  title, count, icon: Icon, color,
  isPercentage = false,
  insectSpeed  = 0.7,
  skinColor    = '#FDBCB4',
  hairColor    = '#3e1f00',
  shirtColor,
}) => {
  const cardRef = useRef(null)
  const sColor  = shirtColor || color

  const {
    pos, angleDeg, mouthOpen, pScale, visible,
    legFrame, armFrame, bursts, biteMarks, removeBurst
  } = useTinyPerson(cardRef, insectSpeed)

  const isBiting = mouthOpen > 0.05

  return (
    <Paper elevation={0} ref={cardRef} sx={{
      p: 1.5,
      borderRadius: '10px',
      border: `1.5px solid ${color}77`,
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      maxWidth: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'visible',          // ← full body always visible
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      },
    }}>

      {/* Bite marks on card border */}
      {biteMarks.map(bm => (
        <BiteMark key={bm.id} x={bm.x} y={bm.y} edge={bm.edge} />
      ))}

      {/* NOM! burst effects */}
      {bursts.map(b => (
        <NomBurst key={b.id} x={b.x} y={b.y} color={color} label={b.label}
          onDone={() => removeBurst(b.id)} />
      ))}

      {/* Tiny hungry person */}
      {visible && (
        <Box sx={{
          position: 'absolute',
          left: pos.x - 14,
          top:  pos.y - 10,
          zIndex: 15,
          pointerEvents: 'none',
          // rotate so person always faces the edge they're eating
          transform: `rotate(${angleDeg}deg) scale(${pScale})`,
          transformOrigin: '14px 10px',
          filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.25))',
        }}>
          <TinyPerson
            isBiting={isBiting}
            mouthOpen={mouthOpen}
            legFrame={legFrame}
            armFrame={armFrame}
            skinColor={skinColor}
            hairColor={hairColor}
            shirtColor={sColor}
          />
        </Box>
      )}

      {/* Card content */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 40, height: 40, minWidth: 40,
          borderRadius: '8px',
          bgcolor: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 0, fontSize: '1.25rem' }}>
            {count}{isPercentage && '%'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 500, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default InsectStatCard