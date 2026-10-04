import Anthropic from '@anthropic-ai/sdk';
import { classifyComplaint as fallbackClassify } from './fallbackClassifier.js';

// Use a valid Anthropic model
const AI_MODEL = 'claude-sonnet-4-5';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


// ============================================================
// JSON PARSER
// ============================================================

function parseJsonResponse(msg) {
  const text = (msg?.content || [])
    .filter(
      block =>
        block?.type === 'text' &&
        typeof block.text === 'string'
    )
    .map(block => block.text)
    .join('')
    .trim();

  if (!text) {
    throw new Error('Empty AI response');
  }

  // Remove possible markdown code fences
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end <= start) {
    throw new Error('No JSON object found in AI response');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}


// ============================================================
// AI COMPLAINT CLASSIFICATION
// ============================================================

export async function classifyComplaint(title, description) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,

      system: `
You are a complaint classification system for a college campus.

Analyze the complaint and return ONLY a valid JSON object.

Required fields:

{
  "category": "Infrastructure | Electrical | Internet | Cleanliness | Water | Hostel | Security | Laboratory | Library | Other",
  "priority": "Low | Medium | High | Urgent",
  "department": "Maintenance | IT Department | Electrical | Hostel Administration | Security | Administration | Housekeeping | Library | Other",
  "summary": "Brief 1-2 sentence summary",
  "suggestedAction": "Specific actionable recommendation"
}

Do not return markdown.
Do not return explanations.
Return ONLY JSON.
`,

      messages: [
        {
          role: 'user',
          content: `Complaint Title: ${title}
Description: ${description}`,
        },
      ],
    });

    const parsed = parseJsonResponse(msg);

    // Validate required fields
    if (
      !parsed.category ||
      !parsed.priority ||
      !parsed.department ||
      !parsed.summary ||
      !parsed.suggestedAction
    ) {
      throw new Error('Missing required fields in AI response');
    }

    return parsed;

  } catch (error) {
    console.error(
      'AI Classification Error, using fallback:',
      error.message
    );

    return fallbackClassify(title, description);
  }
}


// ============================================================
// AI CAMPUS INSIGHTS
// ============================================================

export async function generateInsights(ticketData) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,

      system: `
You are an AI campus administrator assistant.

Analyze the provided campus complaint data.

Return ONLY valid JSON:

{
  "summary": "Brief overall situation",
  "keyObservations": [
    "observation 1",
    "observation 2"
  ],
  "recommendedActions": [
    "action 1",
    "action 2"
  ]
}

Do not return markdown.
Do not return explanations.
`,

      messages: [
        {
          role: 'user',
          content: `Campus Maintenance Data:
${JSON.stringify(ticketData)}`,
        },
      ],
    });

    const parsed = parseJsonResponse(msg);

    return {
      ...parsed,
      generatedAt: new Date(),
    };

  } catch (error) {
    console.error(
      'AI Insights Error:',
      error.message
    );

    return {
      summary: `There are currently ${ticketData.totalOpen || 0} open tickets across the campus.`,

      keyObservations: [
        'Could not generate AI insights at this time.',
      ],

      recommendedActions: [
        'Please review the ticket list manually.',
      ],

      generatedAt: new Date(),
    };
  }
}


// ============================================================
// DUPLICATE DETECTION CACHE
// ============================================================

const duplicateCache = new Map();

const CACHE_TTL_MS = 2 * 60 * 1000;

function getCacheKey(complaint) {
  const norm = str =>
    (str || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  return `${norm(complaint.title)}|${norm(
    complaint.location
  )}|${norm(complaint.description).slice(0, 100)}`;
}


// ============================================================
// FALLBACK DUPLICATE DETECTOR
// ============================================================

export function fallbackDetectDuplicates(
  newComplaint,
  candidates
) {
  if (!candidates || candidates.length === 0) {
    return {
      isDuplicate: false,
      duplicateId: null,
      similarIds: [],
      confidence: 0,
      reason:
        'No unresolved complaints exist to compare.',
    };
  }

  const stopwords = new Set([
    'the',
    'is',
    'at',
    'which',
    'on',
    'a',
    'an',
    'and',
    'or',
    'in',
    'to',
    'for',
    'of',
    'with',
    'from',
    'by',
    'as',
    'our',
    'my',
    'your',
    'please',
    'this',
    'that',
    'it',
    'there',
    'here',
    'we',
    'i',
    'not',
    'very',
    'be',
    'are',
    'was',
    'were',
    'has',
    'have',
  ]);

  const tokenize = text => {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s,/-]+/)
      .filter(
        word =>
          word.length > 1 &&
          !stopwords.has(word)
      );
  };

  const getJaccard = (tokensA, tokensB) => {
    if (
      tokensA.length === 0 ||
      tokensB.length === 0
    ) {
      return 0;
    }

    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    let intersection = 0;

    for (const token of setA) {
      if (setB.has(token)) {
        intersection++;
      }
    }

    const union =
      setA.size +
      setB.size -
      intersection;

    return union > 0
      ? intersection / union
      : 0;
  };

  const newTitleTokens = tokenize(
    newComplaint.title
  );

  const newDescTokens = tokenize(
    newComplaint.description
  );

  const newLocTokens = tokenize(
    newComplaint.location
  );

  const inferredCategory =
    newComplaint.category ||
    fallbackClassify(
      newComplaint.title,
      newComplaint.description
    ).category;

  const scored = candidates.map(candidate => {
    const candidateTitleTokens =
      tokenize(candidate.title);

    const candidateDescTokens =
      tokenize(candidate.description);

    const candidateLocTokens =
      tokenize(candidate.location);

    const titleSim = getJaccard(
      newTitleTokens,
      candidateTitleTokens
    );

    const descSim = getJaccard(
      newDescTokens,
      candidateDescTokens
    );

    let locSim = 0;

    if (
      newLocTokens.length > 0 &&
      candidateLocTokens.length > 0
    ) {
      locSim = getJaccard(
        newLocTokens,
        candidateLocTokens
      );

      const newNumbers =
        (newComplaint.location || '')
          .toLowerCase()
          .match(
            /[a-z]?[- ]?\d+[a-z]?/g
          ) || [];

      const candidateNumbers =
        (candidate.location || '')
          .toLowerCase()
          .match(
            /[a-z]?[- ]?\d+[a-z]?/g
          ) || [];

      for (const number of newNumbers) {
        const clean = number.replace(
          /[^a-z0-9]/g,
          ''
        );

        if (
          clean.length > 1 &&
          candidateNumbers.some(
            candidateNumber =>
              candidateNumber.replace(
                /[^a-z0-9]/g,
                ''
              ) === clean
          )
        ) {
          locSim = Math.max(
            locSim,
            0.85
          );
          break;
        }
      }

    } else {
      const newLocation =
        (newComplaint.location || '')
          .toLowerCase()
          .trim();

      if (
        newLocation &&
        (
          (candidate.title || '')
            .toLowerCase()
            .includes(newLocation) ||
          (candidate.description || '')
            .toLowerCase()
            .includes(newLocation)
        )
      ) {
        locSim = 0.6;
      }
    }

    const categoryMatch =
      candidate.category &&
        candidate.category.toLowerCase() ===
        inferredCategory.toLowerCase()
        ? 0.15
        : 0;

    let score =
      titleSim * 0.40 +
      locSim * 0.35 +
      descSim * 0.15 +
      categoryMatch;

    if (
      locSim >= 0.7 &&
      (
        titleSim >= 0.15 ||
        descSim >= 0.15 ||
        categoryMatch > 0
      )
    ) {
      score = Math.max(score, 0.65);
    }

    return {
      candidate,
      score,
    };
  });

  scored.sort(
    (a, b) => b.score - a.score
  );

  const best = scored[0];

  if (best && best.score >= 0.38) {
    const similarIds = scored
      .filter(item => item.score >= 0.32)
      .slice(0, 3)
      .map(item =>
        String(
          item.candidate._id ||
          item.candidate.id
        )
      );

    return {
      isDuplicate: true,

      duplicateId: String(
        best.candidate._id ||
        best.candidate.id
      ),

      similarIds,

      confidence: Math.min(
        1,
        Math.round(best.score * 100) / 100
      ),

      reason: `Found similar unresolved issue at ${best.candidate.location ||
        'this location'
        }: "${best.candidate.title}"`,
    };
  }

  return {
    isDuplicate: false,
    duplicateId: null,
    similarIds: [],
    confidence: 0,
    reason:
      'No similar open complaints found.',
  };
}


// ============================================================
// AI DUPLICATE DETECTION
// ============================================================

export async function checkDuplicateComplaint(
  newComplaint,
  candidates
) {
  if (
    !candidates ||
    candidates.length === 0
  ) {
    return {
      isDuplicate: false,
      duplicateId: null,
      similarIds: [],
      confidence: 0,
      reason:
        'No unresolved complaints exist to compare.',
    };
  }

  const cacheKey =
    getCacheKey(newComplaint);

  const cached =
    duplicateCache.get(cacheKey);

  if (
    cached &&
    Date.now() - cached.timestamp <
    CACHE_TTL_MS
  ) {
    return cached.result;
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY is not configured'
      );
    }

    const candidateSummary =
      candidates.slice(0, 15).map(candidate => ({
        id: String(
          candidate._id ||
          candidate.id
        ),

        title: candidate.title,

        location:
          candidate.location ||
          'Not specified',

        category:
          candidate.category ||
          'Other',

        description:
          (
            candidate.description || ''
          ).slice(0, 200),
      }));

    const systemPrompt = `
You are an AI duplicate detector for a college campus complaint management system.

A student is about to submit a new complaint.

Compare the new complaint against existing unresolved complaints.

A complaint should be considered a duplicate when it reports the SAME problem at the SAME or clearly related location, even when the wording is different.

Return ONLY valid JSON:

{
  "isDuplicate": true,
  "duplicateId": "existing-id",
  "similarIds": ["existing-id"],
  "confidence": 0.95,
  "reason": "Brief one-sentence explanation"
}

If there is no duplicate:

{
  "isDuplicate": false,
  "duplicateId": null,
  "similarIds": [],
  "confidence": 0,
  "reason": "No similar unresolved complaint found."
}

Do not return markdown.
Do not return explanations outside JSON.
`;

    const userPrompt = `
New Complaint:

Title:
${newComplaint.title}

Location:
${newComplaint.location || 'Not specified'}

Category:
${newComplaint.category || 'Unspecified'}

Description:
${newComplaint.description}

Existing Unresolved Complaints:

${JSON.stringify(
      candidateSummary,
      null,
      2
    )}
`;

    const msg =
      await client.messages.create({
        model: AI_MODEL,
        max_tokens: 1024,

        system: systemPrompt,

        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

    const parsed =
      parseJsonResponse(msg);

    // Only allow IDs from actual candidates
    const validIds = new Set(
      candidateSummary.map(
        candidate => candidate.id
      )
    );

    const similarIds =
      Array.isArray(parsed.similarIds)
        ? parsed.similarIds
          .map(String)
          .filter(id =>
            validIds.has(id)
          )
        : [];

    const rawDuplicateId =
      parsed.duplicateId
        ? String(parsed.duplicateId)
        : null;

    const duplicateId =
      rawDuplicateId &&
        validIds.has(rawDuplicateId)
        ? rawDuplicateId
        : similarIds[0] || null;

    const isDuplicate =
      Boolean(parsed.isDuplicate) &&
      Boolean(duplicateId);

    const rawConfidence =
      Number(parsed.confidence);

    const confidence =
      Number.isFinite(rawConfidence)
        ? Math.min(
          1,
          Math.max(
            0,
            rawConfidence
          )
        )
        : isDuplicate
          ? 0.85
          : 0;

    const result = {
      isDuplicate,

      duplicateId:
        isDuplicate
          ? duplicateId
          : null,

      similarIds,

      confidence,

      reason:
        parsed.reason ||
        (
          isDuplicate
            ? 'AI matched a similar existing complaint.'
            : 'No duplicate found.'
        ),
    };

    duplicateCache.set(
      cacheKey,
      {
        timestamp: Date.now(),
        result,
      }
    );

    return result;

  } catch (error) {
    console.warn(
      'AI Duplicate Check Error, using fallback detector:',
      error.message
    );

    const fallbackResult =
      fallbackDetectDuplicates(
        newComplaint,
        candidates
      );

    duplicateCache.set(
      cacheKey,
      {
        timestamp: Date.now(),
        result: fallbackResult,
      }
    );

    return fallbackResult;
  }
}