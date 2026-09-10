export default function SignPreview({ lines, backgroundColor, backgroundImageUrl }) {
  const count = Math.max(lines?.length || 1, 1);
  const baseSize = Math.min(28, Math.max(12, Math.floor(220 / count)));

  const faceStyle = {
    backgroundColor: backgroundColor || '#f5f0e6',
    backgroundImage: backgroundImageUrl
      ? `linear-gradient(rgba(245,240,230,0.55), rgba(245,240,230,0.55)), url(${backgroundImageUrl})`
      : undefined,
  };

  return (
    <div className="mockup-stage">
      <div className="sign-frame" aria-label="Sign preview mockup">
        <div className="sign-face" style={faceStyle}>
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
                fontSize: `${i === 0 ? baseSize * 1.1 : baseSize}px`,
              }}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
