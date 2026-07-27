import { useState, useEffect, useRef } from 'react';

export default function CountUp({ end, duration = 1500, decimals = 0, prefix = '', suffix = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const numEnd = Number(end);
    if (end === null || end === undefined || end === '' || end === '-' || isNaN(numEnd)) {
      return;
    }

    if (numEnd === 0) {
      setValue(0);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * numEnd);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setValue(numEnd);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  const numVal = Number(value);
  const display = isNaN(numVal) ? '0' : numVal.toFixed(decimals);

  return (
    <span ref={ref}>{prefix}{display}{suffix}</span>
  );
}
