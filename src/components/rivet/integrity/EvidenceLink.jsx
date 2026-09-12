import React from 'react';
import { Link } from 'react-router-dom';
export default function EvidenceLink({ resultId, legacy = false }) {
  return <Link onClick={e => e.stopPropagation()} to={`/evidence?result=${encodeURIComponent(resultId)}`} className="text-xs text-primary-foreground underline underline-offset-4 hover:text-accent-foreground">{legacy ? 'Legacy evidence' : 'Inspect evidence'}</Link>;
}