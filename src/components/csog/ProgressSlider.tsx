'use client';

/**
 * Self-contained range slider with colored fill and no overflow issues.
 * Uses a native <input type="range"> with inline styles for the track fill.
 */
export function ProgressSlider({
  value,
  onChange,
  thumbColor,
  fillColor,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  thumbColor: string;
  fillColor: string;
  label: string;
}) {
  // Build a linear-gradient background for the track fill
  const trackBg = `linear-gradient(to right, ${fillColor} ${value}%, #f3f4f6 ${value}%)`;

  return (
    <input
      type="range"
      min={0}
      max={100}
      step={5}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      title={label}
      className="progress-slider"
      style={{
        '--slider-thumb': thumbColor,
        '--slider-track': trackBg,
      } as React.CSSProperties}
    />
  );
}
