import { Router } from 'express';
import { saveShare, getShare } from '../db/shares.js';

const router = Router();

function sanitizeDesign(body) {
  const src = body?.design || body?.customization || body;
  if (!src || typeof src !== 'object') return null;
  const lines = Array.isArray(src.lines) ? src.lines.slice(0, 10) : [];
  if (!lines.length) return null;
  return {
    lines: lines.map((l) => ({
      text: String(l?.text || '').slice(0, 120),
      color: l?.color || '#ffffff',
      backgroundColor: l?.backgroundColor || 'transparent',
      font: l?.font || 'sans',
      weight: l?.weight || 'bold',
      letterSpacing: Number.isFinite(Number(l?.letterSpacing)) ? Number(l.letterSpacing) : -0.04,
      fontScale: Number(l?.fontScale) > 0 ? Number(l.fontScale) : 1,
      fitWidth: l?.fitWidth !== false,
    })),
    backgroundColor: src.backgroundColor || '#000000',
    border: {
      enabled: src.border?.enabled !== false,
      color: src.border?.color || '#ffffff',
      width: Number(src.border?.width) || 3,
    },
    templateId: src.templateId || 'custom',
  };
}

router.post('/', (req, res) => {
  try {
    const design = sanitizeDesign(req.body);
    if (!design) return res.status(400).json({ error: 'Design with at least one line is required' });
    const id = saveShare(design);
    const publicUrl = (process.env.PUBLIC_URL || process.env.CLIENT_URL || '').replace(/\/$/, '');
    const pathUrl = `/?s=${id}`;
    const url = publicUrl ? `${publicUrl}${pathUrl}` : pathUrl;
    res.json({ id, url, path: pathUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create share link' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const design = getShare(req.params.id);
    if (!design) return res.status(404).json({ error: 'Share not found or expired' });
    res.json({ id: req.params.id, design });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load share' });
  }
});

export default router;
