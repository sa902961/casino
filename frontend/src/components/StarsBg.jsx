import { useEffect, useRef } from 'react'

export default function StarsBg() {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return
    const count = 120
    ref.current.innerHTML = ''
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div')
      s.className = 'star'
      s.style.cssText = `
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        --dur:${2+Math.random()*4}s;
        --delay:${Math.random()*4}s;
        width:${Math.random()<0.3?3:1.5}px;
        height:${Math.random()<0.3?3:1.5}px;
        opacity:${0.3+Math.random()*0.7};
      `
      ref.current.appendChild(s)
    }
  }, [])
  return <div className="stars-bg" ref={ref} />
}
