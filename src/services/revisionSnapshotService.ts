/**
 * @file revisionSnapshotService.ts
 * @description Non-destructive scenario manuscript revision snapshots & pure LCS line diffing.
 */

export interface RevisionSnapshot {
  id: string;
  label: string;
  content: string;
  wordCount: number;
  createdAt: string;
}

export interface DiffLineEntry {
  type: 'equal' | 'add' | 'remove';
  text: string;
}

export function stripHtmlForDiff(html: unknown): string {
  const raw = String(html ?? '');
  if (!raw) return '';
  return raw
    .replace(/<\/(p|div|blockquote|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r\n/g, '\n')
    .trim();
}

export function createRevisionSnapshot(
  content: string,
  label?: string
): RevisionSnapshot {
  const safeContent = String(content ?? '');
  const plain = stripHtmlForDiff(safeContent);
  const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: (label || '').trim() || `Checkpoint (${wordCount}w)`,
    content: safeContent,
    wordCount,
    createdAt: new Date().toISOString()
  };
}

export function appendRevisionSnapshot(
  existing: RevisionSnapshot[] | undefined | null,
  snapshot: RevisionSnapshot,
  maxSnapshots = 30
): RevisionSnapshot[] {
  const safeExisting = Array.isArray(existing) ? existing.slice() : [];
  const cap = Math.max(1, Math.floor(maxSnapshots));
  const combined = [snapshot, ...safeExisting];
  return combined.slice(0, cap);
}

/**
 * Pure dynamic-programming LCS line diff between two texts.
 */
export function computeLineDiff(oldText: string, newText: string): DiffLineEntry[] {
  const a = String(oldText ?? '').split('\n');
  const b = String(newText ?? '').split('\n');
  const m = a.length;
  const n = b.length;

  // Bounded DP table (caps extreme inputs gracefully)
  if (m * n > 250000) {
    return [
      ...a.map((text): DiffLineEntry => ({ type: 'remove', text })),
      ...b.map((text): DiffLineEntry => ({ type: 'add', text }))
    ];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    const row = dp[i]!;
    const nextRow = dp[i + 1]!;
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        row[j] = 1 + (nextRow[j + 1] ?? 0);
      } else {
        row[j] = Math.max(nextRow[j] ?? 0, row[j + 1] ?? 0);
      }
    }
  }

  const out: DiffLineEntry[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ type: 'equal', text: a[i] ?? '' });
      i++;
      j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      out.push({ type: 'remove', text: a[i] ?? '' });
      i++;
    } else {
      out.push({ type: 'add', text: b[j] ?? '' });
      j++;
    }
  }
  while (i < m) {
    out.push({ type: 'remove', text: a[i++] ?? '' });
  }
  while (j < n) {
    out.push({ type: 'add', text: b[j++] ?? '' });
  }

  return out;
}
