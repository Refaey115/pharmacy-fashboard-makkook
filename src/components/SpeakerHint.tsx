import type { ReactNode } from 'react';

// SpeakerHint is intentionally a transparent passthrough — hints are disabled.
interface Props { text?: string; children: ReactNode; }

export default function SpeakerHint({ children }: Props) {
  return <>{children}</>;
}
