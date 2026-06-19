import { useEffect, useRef } from 'react'

export function MatrixBg() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0, W = 0, H = 0, cols = 0
    let drops: number[] = []
    const chars = '01ｱｲｳｴｵｶｷｸ10ﾊﾋﾌﾍﾎ01ﾏﾐﾑ'.split('')
    const FONT = 14

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      cols = Math.floor(W / FONT)
      drops = Array(cols).fill(0).map(() => Math.random() * -H / FONT)
    }
    resize()

    let last = 0
    function draw(now: number) {
      raf = requestAnimationFrame(draw)
      if (now - last < 60) return // ~16fps, light
      last = now
      ctx.fillStyle = 'rgba(13,13,13,0.08)'
      ctx.fillRect(0, 0, W, H)
      ctx.font = `${FONT}px JetBrains Mono, monospace`
      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)]
        const x = i * FONT, y = drops[i] * FONT
        ctx.fillStyle = Math.random() > 0.975 ? 'rgba(0,255,65,0.9)' : 'rgba(0,255,65,0.18)'
        ctx.fillText(ch, x, y)
        if (y > H && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.5
      }
    }
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" style={{ opacity: 0.5 }} />
}
