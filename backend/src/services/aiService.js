import Anthropic from '@anthropic-ai/sdk';
import { classifyComplaint as fallbackClassify } from './fallbackClassifier.js';

export async function classifyComplaint(title, description) {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: "You are a complaint classification system for a college campus. Analyze the complaint and return ONLY a JSON object with these exact fields: category (one of: Infrastructure, Electrical, Internet, Cleanliness, Water, Hostel, Security, Laboratory, Library, Other), priority (one of: Low, Medium, High, Urgent), department (one of: Maintenance, IT Department, Electrical, Hostel Administration, Security, Administration, Housekeeping, Library, Other), summary (a brief 1-2 sentence summary), suggestedAction (a specific actionable recommendation). Return ONLY valid JSON, no markdown, no explanation.",
      messages: [
        { role: "user", content: `Complaint Title: ${title}\nDescription: ${description}` }
      ],
    });

    const responseText = msg.content[0].text.trim();
    
    // Attempt to extract JSON if it was wrapped in markdown somehow
    let jsonStr = responseText;
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(jsonStr);
    
    // Basic validation
    if (!parsed.category || !parsed.priority || !parsed.department || !parsed.summary || !parsed.suggestedAction) {
      throw new Error("Missing required fields in AI response");
    }

    return parsed;
  } catch (error) {
    console.error("AI Classification Error, using fallback:", error.message);
    return fallbackClassify(title, description);
  }
}

export async function generateInsights(ticketData) {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: "You are an AI campus administrator assistant. Analyze the provided ticket data and return a JSON object containing: summary (brief overall situation), keyObservations (array of strings), recommendedActions (array of strings). Return ONLY valid JSON, no markdown.",
      messages: [
        { role: "user", content: `Campus Maintenance Data: ${JSON.stringify(ticketData)}` }
      ],
    });

    const responseText = msg.content[0].text.trim();
    let jsonStr = responseText;
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(jsonStr);
    parsed.generatedAt = new Date();
    return parsed;
  } catch (error) {
    console.error("AI Insights Error:", error.message);
    return {
      summary: `There are currently ${ticketData.totalOpen} open tickets across the campus.`,
      keyObservations: ["Could not generate AI insights at this time."],
      recommendedActions: ["Please review the ticket list manually."],
      generatedAt: new Date()
    };
  }
}

// In-memory cache for duplicate checks to avoid redundant AI queries
const duplicateCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function getCacheKey(complaint) {
  const norm = str => (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return `${norm(complaint.title)}|${norm(complaint.location)}|${norm(complaint.description).slice(0, 100)}`;
}

// Smart NLP heuristic fallback for duplicate detection
export function fallbackDetectDuplicates(newComplaint, candidates) {
  if (!candidates || candidates.length === 0) {
    return {
      isDuplicate: false,
      duplicateId: null,
      similarIds: [],
      confidence: 0,
      reason: 'No unresolved complaints exist to compare.'
    };
  }

  const stopwords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of',
    'with', 'from', 'by', 'as', 'our', 'my', 'your', 'please', 'this', 'that', 'it',
    'there', 'here', 'we', 'i', 'not', 'very', 'be', 'are', 'was', 'were', 'has', 'have'
  ]);

  const tokenize = (text) => {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s,/-]+/)
      .filter(w => w.length > 1 && !stopwords.has(w));
  };

  const getJaccard = (tokensA, tokensB) => {
    if (tokensA.length === 0 || tokensB.length === 0) return 0;
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    let intersection = 0;
    for (const t of setA) {
      if (setB.has(t)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union > 0 ? intersection / union : 0;
  };

  const newTitleTokens = tokenize(newComplaint.title);
  const newDescTokens = tokenize(newComplaint.description);
  const newLocTokens = tokenize(newComplaint.location);
  const newTextTokens = [...newTitleTokens, ...newDescTokens, ...newLocTokens];

  // Inferred category if none
  const inferredCategory = newComplaint.category || fallbackClassify(newComplaint.title, newComplaint.description).category;

  const scored = candidates.map(cand => {
    const candTitleTokens = tokenize(cand.title);
    const candDescTokens = tokenize(cand.description);
    const candLocTokens = tokenize(cand.location);
    const candTextTokens = [...candTitleTokens, ...candDescTokens, ...candLocTokens];

    const titleSim = getJaccard(newTitleTokens, candTitleTokens);
    const descSim = getJaccard(newDescTokens, candDescTokens);

    // Location scoring
    let locSim = 0;
    if (newLocTokens.length > 0 && candLocTokens.length > 0) {
      locSim = getJaccard(newLocTokens, candLocTokens);
      // Check for room/number matches (e.g., "b-204" vs "b204", "204")
      const newNumMatches = (newComplaint.location || '').toLowerCase().match(/[a-z]?[- ]?\d+[a-z]?/g) || [];
      const candNumMatches = (cand.location || '').toLowerCase().match(/[a-z]?[- ]?\d+[a-z]?/g) || [];
      for (const n of newNumMatches) {
        const clean = n.replace(/[^a-z0-9]/g, '');
        if (clean.length > 1 && candNumMatches.some(c => c.replace(/[^a-z0-9]/g, '') === clean)) {
          locSim = Math.max(locSim, 0.85);
          break;
        }
      }
    } else {
      const newLocStr = (newComplaint.location || '').toLowerCase().trim();
      if (newLocStr && (cand.title.toLowerCase().includes(newLocStr) || cand.description.toLowerCase().includes(newLocStr))) {
        locSim = 0.6;
      }
    }

    const catMatch = (cand.category && (cand.category.toLowerCase() === inferredCategory.toLowerCase())) ? 0.15 : 0;

    let score = (titleSim * 0.40) + (locSim * 0.35) + (descSim * 0.15) + catMatch;
    
    // Strong boost when location strongly matches and topic overlaps
    if (locSim >= 0.7 && (titleSim >= 0.15 || descSim >= 0.15 || catMatch > 0)) {
      score = Math.max(score, 0.65);
    }

    return {
      cand,
      score,
      titleSim,
      locSim
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if (best && best.score >= 0.38) {
    const similar = scored
      .filter(s => s.score >= 0.32)
      .slice(0, 3)
      .map(s => String(s.cand._id || s.cand.id));

    return {
      isDuplicate: true,
      duplicateId: String(best.cand._id || best.cand.id),
      similarIds: similar,
      confidence: Math.min(1.0, Math.round(best.score * 100) / 100),
      reason: `Found similar unresolved issue at ${best.cand.location || 'this location'}: "${best.cand.title}"`
    };
  }

  return {
    isDuplicate: false,
    duplicateId: null,
    similarIds: [],
    confidence: 0,
    reason: 'No similar open complaints found.'
  };
}

export async function checkDuplicateComplaint(newComplaint, candidates) {
  if (!candidates || candidates.length === 0) {
    return {
      isDuplicate: false,
      duplicateId: null,
      similarIds: [],
      confidence: 0,
      reason: 'No unresolved complaints exist to compare.'
    };
  }

  // Check cache to avoid duplicate AI requests
  const cacheKey = getCacheKey(newComplaint);
  const cached = duplicateCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.result;
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const candidateSummary = candidates.slice(0, 15).map(c => ({
      id: String(c._id || c.id),
      title: c.title,
      location: c.location || 'Not specified',
      category: c.category || 'Other',
      description: (c.description || '').slice(0, 200)
    }));

    const systemPrompt = `You are an AI duplicate detector for a college campus complaint management system.
A user is about to submit a new complaint. Compare it against existing unresolved campus complaints.
Determine if any existing complaint reports the same problem at the same location, even if worded differently.
Return ONLY valid JSON:
{
  "isDuplicate": boolean,
  "duplicateId": string | null,
  "similarIds": string[],
  "confidence": number between 0.0 and 1.0,
  "reason": "Brief 1-sentence reason"
}`;

    const userPrompt = `New Complaint:
Title: ${newComplaint.title}
Location: ${newComplaint.location || 'Not specified'}
Category: ${newComplaint.category || 'Unspecified'}
Description: ${newComplaint.description}

Existing Unresolved Complaints:
${JSON.stringify(candidateSummary, null, 2)}`;

    const msg = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    });

    const responseText = msg.content[0].text.trim();
    let jsonStr = responseText;
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(jsonStr);
    const result = {
      isDuplicate: !!parsed.isDuplicate,
      duplicateId: parsed.duplicateId || (parsed.similarIds && parsed.similarIds[0]) || null,
      similarIds: Array.isArray(parsed.similarIds) ? parsed.similarIds : [],
      confidence: parsed.confidence || (parsed.isDuplicate ? 0.85 : 0),
      reason: parsed.reason || (parsed.isDuplicate ? 'AI matched a similar existing complaint.' : 'No duplicate found.')
    };

    duplicateCache.set(cacheKey, { timestamp: Date.now(), result });
    return result;

  } catch (error) {
    console.warn("AI Duplicate Check Error, using fallback detector:", error.message);
    const fallbackResult = fallbackDetectDuplicates(newComplaint, candidates);
    duplicateCache.set(cacheKey, { timestamp: Date.now(), result: fallbackResult });
    return fallbackResult;
  }
}
