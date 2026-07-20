import {
  certifications,
  experience,
  profile,
  projects,
  skills,
  socials,
} from "../src/data/portfolio";

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

const requests = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

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

function extractText(payload: OpenAIResponsePayload): string {
  if (typeof payload.output_text === "string") {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : [];

    for (const part of content) {
      if (part.type === "output_text" && typeof part.text === "string") {
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
- Sound like a calm and capable cyber-operations intelligence system.
- Be welcoming to recruiters, developers, students, and casual visitors.
- Answer naturally rather than overusing theatrical hacker language.
- Keep most answers between two and six short paragraphs.
- Use concise bullet points when they improve clarity.

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

export default {
  async fetch(request: Request): Promise<Response> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const isDevelopment =
      process.env.VERCEL_ENV === "development" ||
      process.env.NODE_ENV === "development";

    if (request.method === "GET") {
      return json({
        online: Boolean(apiKey),
        service: "BLACKTERM AI",
        ...(isDevelopment
          ? {
              debug: {
                hasKey: Boolean(apiKey),
                keyLength: apiKey?.length ?? 0,
                keyPrefix: apiKey ? apiKey.slice(0, 3) : "NONE",
                vercelEnvironment: process.env.VERCEL_ENV ?? "unknown",
                nodeEnvironment: process.env.NODE_ENV ?? "unknown",
              },
            }
          : {}),
      });
    }

    if (request.method !== "POST") {
      return json(
        {
          error: "Method not allowed.",
        },
        405,
      );
    }

    if (!apiKey) {
      return json(
        {
          error: "OPENAI_API_KEY is not configured.",
        },
        503,
      );
    }

    const clientId = getClientId(request);

    if (isRateLimited(clientId)) {
      return json(
        {
          error:
            "Intelligence rate limit reached. Try again in one minute.",
        },
        429,
      );
    }

    let body: RequestBody;

    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return json(
        {
          error: "Invalid JSON request.",
        },
        400,
      );
    }

    const message = body.message?.trim();

    if (!message) {
      return json(
        {
          error: "A message is required.",
        },
        400,
      );
    }

    if (message.length > 1_500) {
      return json(
        {
          error: "Message is too long.",
        },
        400,
      );
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

        return json(
          {
            error: upstreamMessage,
          },
          openaiResponse.status,
        );
      }

      const text = extractText(payload);

      if (!text) {
        return json(
          {
            error: "The intelligence core returned no text.",
          },
          502,
        );
      }

      return json({
        text,
      });
    } catch (error) {
      console.error("BLACKTERM AI request crashed:", error);

      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : "The intelligence service encountered an unknown error.",
        },
        500,
      );
    }
  },
};