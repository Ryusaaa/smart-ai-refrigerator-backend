import { AppError } from '../../middlewares/error.middleware.mjs';
import { parseLooseJsonDetailed } from '../../utils/json.utils.mjs';

export const RECIPE_TAG_START = '<<<RECIPE_SUGGESTION>>>';
export const RECIPE_TAG_END = '<<<END_RECIPE_SUGGESTION>>>';

export class RecipeParseError extends AppError {
  constructor(message = 'AI gagal menyusun resep dalam format yang benar. Silakan coba lagi.') {
    super(message, 502);
  }
}


function toNumber(value, fallback = null) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value !== 'string') return fallback;

  const s = value.trim().replace(',', '.');
  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);

  const n = parseFloat(s); // "2-3" -> 2, "200 g" -> 200
  return Number.isFinite(n) ? n : fallback;
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return /^(true|yes|ya|1)$/i.test(value.trim());
  return Boolean(value);
}

function normalizeDifficulty(value) {
  const s = String(value ?? '').toLowerCase();
  if (/(easy|mudah|gampang|simple|beginner|pemula)/.test(s)) return 'easy';
  if (/(hard|difficult|sulit|susah|advanced|ahli)/.test(s)) return 'hard';
  return 'medium';
}

function normalizeIngredients(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (typeof item === 'string') {
        const name = item.trim();
        return name ? { ingredientName: name, quantity: 0, unit: '', isOptional: false } : null;
      }
      if (!item || typeof item !== 'object') return null;

      const name = String(item.ingredientName ?? item.name ?? item.ingredient ?? item.item ?? '').trim();
      if (!name) return null;

      return {
        ingredientName: name,
        quantity: Math.max(0, toNumber(item.quantity ?? item.amount ?? item.qty, 0)),
        unit: String(item.unit ?? item.satuan ?? '').trim(),
        isOptional: toBool(item.isOptional ?? item.optional ?? false),
      };
    })
    .filter(Boolean);
}

function normalizeInstructions(value) {
  let list = value;
  if (typeof list === 'string') list = list.split(/\r?\n+/);
  if (!Array.isArray(list)) return [];

  return list
    .map((step) => {
      if (typeof step === 'string') return step;
      if (step && typeof step === 'object') {
        return step.instruction ?? step.text ?? step.description ?? step.step ?? '';
      }
      return '';
    })
    .map((step) => String(step).trim())
    .filter(Boolean);
}

function normalizeSources(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s) => s && typeof s === 'object' && s.title && s.url)
    .filter((s) => {
      try {
        const url = new URL(s.url);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    })
    .map((s) => ({ title: String(s.title), url: String(s.url), note: s.note ? String(s.note) : null }));
}

export function normalizeRecipe(raw, { strict = true } = {}) {
  if (!raw || typeof raw !== 'object') return null;

  const title = String(raw.title ?? raw.name ?? raw.recipeName ?? '').trim();
  if (!title) return null;

  const ingredients = normalizeIngredients(raw.ingredients);
  const instructions = normalizeInstructions(raw.instructions ?? raw.steps);
  if (strict && (ingredients.length === 0 || instructions.length === 0)) return null;

  const cookingTime = Math.round(toNumber(raw.cookingTime ?? raw.cooking_time ?? raw.time, 30));

  return {
    title,
    description: String(raw.description ?? '').trim(),
    cookingTime: cookingTime > 0 ? Math.min(cookingTime, 600) : 30,
    difficulty: normalizeDifficulty(raw.difficulty),
    ingredients,
    instructions,
    sources: normalizeSources(raw.sources),
  };
}

function coerceRecipeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];

  if (Array.isArray(data.recipes)) return data.recipes;
  if (Array.isArray(data.data?.recipes)) return data.data.recipes;
  if (data.recipe && typeof data.recipe === 'object') return [data.recipe];
  if (data.title && (data.ingredients || data.instructions)) return [data];

  const firstList = Object.values(data).find(
    (v) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'object'
  );
  return firstList || [];
}

function preview(rawContent) {
  const text = (typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent)) || '';
  return `${text.length} chars, awal: ${text.slice(0, 300).replace(/\s+/g, ' ')}`;
}


export function parseRecipeResponse(rawContent) {
  let parsed;
  try {
    parsed = parseLooseJsonDetailed(rawContent);
  } catch (error) {
    console.warn(`[recipe-parser] JSON tidak bisa dibaca (${error.message}) -> ${preview(rawContent)}`);
    throw new RecipeParseError();
  }

  let list = coerceRecipeList(parsed.value);

  if (parsed.truncated && list.length > 1) {
    list = list.slice(0, -1);
  }

  const recipes = list
    .map((r) => normalizeRecipe(r, { strict: true }))
    .filter(Boolean);

  if (recipes.length === 0) {
    console.warn(`[recipe-parser] Tidak ada resep valid -> ${preview(rawContent)}`);
    throw new RecipeParseError();
  }

  return recipes;
}


export function extractRecipeSuggestion(rawText) {
  if (!rawText) return { cleanText: '', recipeSuggestion: null, hasRecipeBlock: false };

  const startIdx = rawText.indexOf(RECIPE_TAG_START);
  if (startIdx === -1) {
    return { cleanText: rawText.trim(), recipeSuggestion: null, hasRecipeBlock: false };
  }

  const afterStart = rawText.slice(startIdx + RECIPE_TAG_START.length);
  const endIdx = afterStart.indexOf(RECIPE_TAG_END);
  const blockText = endIdx === -1 ? afterStart : afterStart.slice(0, endIdx);
  const trailing = endIdx === -1 ? '' : afterStart.slice(endIdx + RECIPE_TAG_END.length);
  const cleanText = `${rawText.slice(0, startIdx)}${trailing}`.trim();

  let recipeSuggestion = null;
  try {
    const parsed = parseLooseJsonDetailed(blockText);
    const first = coerceRecipeList(parsed.value)[0];
    recipeSuggestion = normalizeRecipe(first, { strict: endIdx === -1 });
  } catch (err) {
    console.warn(`[recipe-parser] Gagal membaca blok resep dari chat: ${err.message} -> ${preview(blockText)}`);
  }

  return { cleanText, recipeSuggestion, hasRecipeBlock: true };
}

export function createRecipeStreamFilter({ onText, onRecipeStart }) {
  let pending = '';
  let inRecipeBlock = false;

  const partialTagLength = (text) => {
    const max = Math.min(text.length, RECIPE_TAG_START.length - 1);
    for (let len = max; len > 0; len--) {
      if (text.endsWith(RECIPE_TAG_START.slice(0, len))) return len;
    }
    return 0;
  };

  return {
    push(chunk) {
      if (inRecipeBlock || !chunk) return;
      pending += chunk;

      const tagIdx = pending.indexOf(RECIPE_TAG_START);
      if (tagIdx !== -1) {
        const visible = pending.slice(0, tagIdx);
        if (visible && onText) onText(visible);
        pending = '';
        inRecipeBlock = true;
        if (onRecipeStart) onRecipeStart();
        return;
      }

      const hold = partialTagLength(pending);
      const safe = pending.slice(0, pending.length - hold);
      if (safe && onText) onText(safe);
      pending = pending.slice(pending.length - hold);
    },

    flush() {
      if (!inRecipeBlock && pending && onText) onText(pending);
      pending = '';
    },

    get inRecipeBlock() {
      return inRecipeBlock;
    },
  };
}

export function parseChatResponse(rawContent) {
  return (rawContent || '').trim();
}