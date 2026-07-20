import {
  certifications,
  experience,
  profile,
  projects,
  skills,
  socials,
} from "../src/data/portfolio.js";

type HistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  message?: string;
  history?: HistoryItem[];
  activeContext?: string;
};

type OpenAIResponsePayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

type VercelRequestLike = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type VercelResponseLike = {
  status: (code: number) => VercelResponseLike;
  setHeader: (name: string, value: string) => void;
  json: (data: unknown) => void;
};

const requests = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

function sendJson(
  response: VercelResponseLike,
  data: unknown,
  status = 200,
): void {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.status(status).json(data);
}

function getHeader(
  request: VercelRequestLike,
  name: string,
): string | undefined {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getClientId(request: VercelRequestLike): string {
  const forwarded = getHeader(request, "x-forwarded-for");

  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const current = requests.get(clientId);

  if (!current || current.resetAt <= now) {
    requests.set(clientId, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return false;
  }

  current.count += 1;

  return current.count > MAX_REQUESTS;
}

function parseBody(body: unknown): RequestBody {
  if (typeof body === "string") {
    return JSON.parse(body) as RequestBody;
  }

  if (body && typeof body === "object") {
    return body as RequestBody;
  }

  return {};
}

function extractText(payload: OpenAIResponsePayload): string {
  if (typeof payload.output_text === "string") {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : [];

    for (const part of content) {
      if (
        part.type === "output_text" &&
        typeof part.text === "string"
      ) {
        return part.text.trim();
      }
    }
  }

  return "";
}

const portfolioContext = JSON.stringify(
  {
    profile,
    projects,
    skills,
    certifications,
    experience,
    socials,
  },
  null,
  2,
);

const instructions = `
You are BLACKTERM AI, the onboard intelligence core for Tyler Deppa's interactive cybersecurity portfolio.

PERSONALITY
- Sound like a calm, capable cyber-operations intelligence system.
- Be welcoming to recruiters, developers, students, and casual visitors.
- Answer naturally rather than overusing theatrical hacker language.
- Keep most answers between two and six short paragraphs.
- Use concise bullets only when they improve clarity.

GROUNDING
- The portfolio dataset below is the source of truth for claims about Tyler.
- Never invent employers, certifications, dates, projects, metrics, education, or personal facts.
- When a requested Tyler-specific fact is missing, say it is not available in the public portfolio.
- Do not reveal private or sensitive information.
- You may answer ordinary general-knowledge questions.
- Clearly distinguish general knowledge from Tyler-specific portfolio information.
- Do not claim to perform scans, hacking, account access, live web research, or actions the interface did not perform.
- For hiring questions, connect recommendations to concrete evidence from Tyler's portfolio.
- When useful, suggest which BLACKTERM application the visitor should open.
- Do not claim you opened an application unless the interface actually handled that command.

PUBLIC PORTFOLIO DATA
${portfolioContext}
`.trim();

export default async function handler(
  request: VercelRequestLike,
  response: VercelResponseLike,
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (request.method === "GET") {
    sendJson(response, {
      online: Boolean(apiKey),
      service: "BLACKTERM AI",
    });

    return;
  }

  if (request.method !== "POST") {
    sendJson(response, { error: "Method not allowed." }, 405);
    return;
  }

  if (!apiKey) {
    sendJson(
      response,
      { error: "OPENAI_API_KEY is not configured." },
      503,
    );
    return;
  }

  const clientId = getClientId(request);

  if (isRateLimited(clientId)) {
    sendJson(
      response,
      {
        error:
          "Intelligence rate limit reached. Try again in one minute.",
      },
      429,
    );
    return;
  }

  let body: RequestBody;

  try {
    body = parseBody(request.body);
  } catch {
    sendJson(response, { error: "Invalid JSON request." }, 400);
    return;
  }

  const message = body.message?.trim();

  if (!message) {
    sendJson(response, { error: "A message is required." }, 400);
    return;
  }

  if (message.length > 1_500) {
    sendJson(response, { error: "Message is too long." }, 400);
    return;
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter(
          (item): item is HistoryItem =>
            (item?.role === "user" ||
              item?.role === "assistant") &&
            typeof item?.content === "string",
        )
        .slice(-8)
        .map((item) => ({
          role: item.role,
          content: item.content.slice(0, 2_000),
        }))
    : [];

  const activeContext =
    typeof body.activeContext === "string"
      ? body.activeContext.slice(0, 120)
      : "BLACKTERM desktop";

  try {
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5-mini",
          instructions,
          input: [
            ...history,
            {
              role: "user",
              content:
                `Active BLACKTERM context: ${activeContext}\n\n` +
                `Visitor query: ${message}`,
            },
          ],
          max_output_tokens: 600,
        }),
      },
    );

    const payload =
      (await openaiResponse
        .json()
        .catch(() => ({}))) as OpenAIResponsePayload;

    if (!openaiResponse.ok) {
      console.error("OpenAI request failed:", payload);

      const upstreamMessage =
        typeof payload.error?.message === "string"
          ? payload.error.message
          : "The OpenAI service rejected the request.";

      sendJson(
        response,
        { error: upstreamMessage },
        openaiResponse.status,
      );
      return;
    }

    const text = extractText(payload);

    if (!text) {
      sendJson(
        response,
        { error: "The intelligence core returned no text." },
        502,
      );
      return;
    }

    sendJson(response, { text });
  } catch (error) {
    console.error("BLACKTERM AI request crashed:", error);

    sendJson(
      response,
      {
        error:
          error instanceof Error
            ? error.message
            : "The intelligence service encountered an unknown error.",
      },
      500,
    );
  }
}
