export const camelToSnakeCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
};

export const snakeToCamelCase = (str) => {
  return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
};

// ---------- Spelling / Search suggestion helpers ----------

export const editDistance = (a, b) => {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
};

export const maxEdits = (len) => (len <= 4 ? 1 : 2);

export const closestWords = (token, words, limit = 3) => {
  const limitEdits = maxEdits(token.length);
  const scored = [];
  for (const w of words) {
    if (Math.abs(w.length - token.length) > limitEdits) continue;
    const dist = editDistance(token, w);
    if (dist > 0 && dist <= limitEdits) scored.push({ w, dist });
  }
  scored.sort((x, y) => x.dist - y.dist || x.w.localeCompare(y.w));
  return scored.slice(0, limit).map((s) => s.w);
};

export const buildSpellSuggestions = (query, dictWords, limit = 6) => {
  const q = (query || "").trim().toLowerCase();
  if (q.length < 2 || !dictWords || dictWords.length === 0) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const last = tokens[tokens.length - 1];
  const prefixTokens = tokens.slice(0, -1);

  let words = dictWords
    .filter((w) => w.startsWith(last) && w !== last)
    .sort((a, b) => a.length - b.length || a.localeCompare(b));

  if (words.length === 0) {
    words = dictWords
      .filter((w) => w.includes(last) && w !== last)
      .sort((a, b) => a.length - b.length || a.localeCompare(b));
  }

  // Fill remaining slots with spelling corrections
  if (words.length < 3 && last.length >= 3) {
    closestWords(last, dictWords, 3).forEach((w) => {
      if (!words.includes(w)) words.push(w);
    });
  }

  return words
    .slice(0, limit)
    .map((w) => [...prefixTokens, w].join(" "))
    .filter((phrase) => phrase !== q);
};

export const extractDictWords = (
  items,
  fields = ["name", "nameEnglish", "title", "category", "subCategory", "nameHindi", "nameGujarati"]
) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const set = new Set();
  items.forEach((it) => {
    if (!it) return;
    fields.forEach((f) => {
      const val = typeof it === "string" ? it : it[f];
      if (typeof val === "string") {
        val
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 3)
          .forEach((w) => set.add(w));
      }
    });
  });
  return [...set];
};

