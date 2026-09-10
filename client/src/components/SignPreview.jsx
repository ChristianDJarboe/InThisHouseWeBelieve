export default function SignPreview({ lines, backgroundColor, backgroundImageUrl }) {
  const count = Math.max(lines?.length || 1, 1);
  const baseSize = Math.min(26, Math.max(11, Math.floor(200 / count)));

  const faceStyle = {
    backgroundColor: backgroundColor || '#ffffff',
    backgroundImage: backgroundImageUrl
      ? `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url(${backgroundImageUrl})`
      : undefined,
    backgroundSize: backgroundImageUrl ? 'cover' : undefined,
    backgroundPosition: backgroundImageUrl ? 'center' : undefined,
  };

  return (
    <div className="mockup-stage">
      <div className="yard-sign" aria-label="Plastic yard sign preview">
        <div className="sign-face plastic" style={faceStyle}>
          <div className="plastic-flute" aria-hidden="true" />
          {(lines || []).map((line, i) => (
            <div
              key={i}
              className={`sign-line${i === 0 ? ' title-line' : ''}`}
              style={{
                color: line.color || '#1a1a1a',
                backgroundColor:
                  line.backgroundColor && line.backgroundColor !== 'transparent'
                    ? line.backgroundColor
                    : undefined,
                fontSize: `${i === 0 ? baseSize * 1.05 : baseSize}px`,
              }}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>
        <div className="yard-stakes" aria-hidden="true">
          <span className="stake" />
          <span className="stake" />
        </div>
      </div>
      <p className="mockup-caption">Corrugated plastic yard sign · double-sided print</p>
    </div>
  );
}
