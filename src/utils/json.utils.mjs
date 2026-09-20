const VALID_ESCAPES = '"\\/bfnrtu';
const THINK_BLOCK = /<think>[\s\S]*?<\/think>/gi;

function stripNoise(text) {
  return String(text)
    .replace(THINK_BLOCK, '')
    .replace(/```(?:json|JSON)?/g, '')
    .replace(/^\uFEFF/, '')
    .trim();
}

function closersFor(stack) {
  return stack
    .slice()
    .reverse()
    .map((c) => (c === '{' ? '}' : ']'))
    .join('');
}

function readBareNumber(input, start) {
  const rest = input.slice(start);
  const match = rest.match(/^-?\d+(?:\.\d+)?(?:\s+\d+\s*\/\s*\d+|\s*\/\s*\d+)?/);
  if (!match) return null;

  const raw = match[0];
  let value;
  const mixed = raw.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  const fraction = raw.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const frac = Number(mixed[2]) / Number(mixed[3]);
    value = whole < 0 ? whole - frac : whole + frac;
  } else if (fraction) {
    value = Number(fraction[1]) / Number(fraction[2]);
  } else {
    value = Number(raw);
  }

  if (!Number.isFinite(value)) return null;
  return { text: String(Number(value.toFixed(4))), length: raw.length };
}

function sanitize(input) {
  const startMatch = input.match(/[{[]/);
  if (!startMatch) return null;

  const n = input.length;
  const stack = [];
  let out = '';
  let inString = false;
  let quote = '"';
  let lastSafe = null; 
  let completed = false;

  for (let i = startMatch.index; i < n; i++) {
    const ch = input[i];

    if (inString) {
      if (ch === '\\') {
        const next = input[i + 1];
        if (next === undefined) break; 
        if (VALID_ESCAPES.includes(next)) {
          out += ch + next;
          i++;
        } else if (next === "'") {
          out += "'";
          i++;
        } else {
          out += '\\\\'; 
        }
        continue;
      }

      if (ch === quote) {
        let j = i + 1;
        while (j < n && /\s/.test(input[j])) j++;
        const following = input[j];
        if (following === undefined || following === ',' || following === '}' || following === ']' || following === ':') {
          inString = false;
          out += '"';
        } else {
          out += quote === '"' ? '\\"' : "'"; 
        }
        continue;
      }

      if (ch === '"') {
        out += '\\"'; 
        continue;
      }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { continue; }
      if (ch === '\t') { out += '\\t'; continue; }
      if (ch < ' ') { continue; }

      out += ch;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      out += '"';
      continue;
    }

    if (ch === '/' && input[i + 1] === '/') {
      while (i < n && input[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 1;
      continue;
    }

    if (ch === '{' || ch === '[') {
      stack.push(ch);
      out += ch;
      continue;
    }

    if (ch === '}' || ch === ']') {
      const expected = ch === '}' ? '{' : '[';
      if (stack[stack.length - 1] !== expected) continue; 
      out = out.replace(/,\s*$/, '');
      stack.pop();
      out += ch;
      lastSafe = { length: out.length, stack: stack.slice() };
      if (stack.length === 0) {
        completed = true;
        break;
      }
      continue;
    }

    if (/[\d-]/.test(ch)) {
      const prev = out.trimEnd().slice(-1);
      if (prev === ':' || prev === '[' || prev === ',') {
        const num = readBareNumber(input, i);
        if (num) {
          out += num.text;
          i += num.length - 1;
          while (i + 1 < n && /[A-Za-z]/.test(input[i + 1])) i++;
          continue;
        }
      }
    }

    out += ch;
  }

  return { out, stack, inString, lastSafe, completed };
}

export function parseLooseJsonDetailed(input) {
  if (input && typeof input === 'object') {
    return { value: input, truncated: false };
  }
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('Empty AI response');
  }

  const text = stripNoise(input);

  try {
    const value = JSON.parse(text);
    if (typeof value === 'string') return parseLooseJsonDetailed(value); // ter-encode ganda
    return { value, truncated: false };
  } catch {
  }

  const result = sanitize(text);
  if (!result) throw new Error('No JSON object found in AI response');

  const { out, stack, inString, lastSafe, completed } = result;

  if (completed) {
    return { value: JSON.parse(out), truncated: false };
  }

  let closed = out;
  if (inString) closed += '"';
  closed = closed.replace(/[,:\s]+$/, '') + closersFor(stack);
  try {
    return { value: JSON.parse(closed), truncated: true };
  } catch {
  }

  if (lastSafe) {
    const safe = out.slice(0, lastSafe.length).replace(/,\s*$/, '') + closersFor(lastSafe.stack);
    return { value: JSON.parse(safe), truncated: true };
  }

  throw new Error('Unable to repair AI JSON output');
}

export function parseLooseJson(input) {
  return parseLooseJsonDetailed(input).value;
}