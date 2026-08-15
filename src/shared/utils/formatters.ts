export function calculateShannonEntropy(data: string): number {
  if (!data) return 0;
  const frequencies: Record<string, number> = {};
  for (const char of data) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = data.length;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

export function generateWatermarkSignature(token: string): string {
  const binary = Array.from(token)
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
  return binary.replace(/0/g, '\u200B').replace(/1/g, '\u200C');
}

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}
