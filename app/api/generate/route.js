import { GoogleGenAI } from "@google/genai";

const MAX_TEXT_LENGTH = 20000;

function buildPrompt({ rawText, toggles, customPrompt }) {
  const options = [];
  if (toggles?.summary)
    options.push("Tambahkan ringkasan TL;DR di bagian atas.");
  if (toggles?.flashcard)
    options.push("Tambahkan tepat 5 flashcard Q&A di bagian akhir.");
  if (toggles?.todo)
    options.push("Ekstrak action items menjadi checklist To-Do.");

  return [
    "Kamu adalah asisten pencatat ahli.",
    "Ubah teks mentah menjadi Markdown rapi, terstruktur, dan mudah dibaca.",
    "Gunakan heading, bullet points, blockquote, dan checklist bila relevan.",
    options.length ? `Aturan tambahan: ${options.join(" ")}` : "",
    customPrompt ? `Instruksi khusus pengguna: ${customPrompt}` : "",
    "",
    "Teks mentah pengguna:",
    rawText,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const rawText = String(body?.rawText || "").trim();
    const customPrompt = String(body?.customPrompt || "").trim();
    const toggles = body?.toggles || {};

    if (!rawText) {
      return Response.json(
        { error: "`rawText` wajib diisi." },
        { status: 400 },
      );
    }

    if (rawText.length > MAX_TEXT_LENGTH) {
      return Response.json(
        {
          error: `Input terlalu panjang. Maksimal ${MAX_TEXT_LENGTH} karakter.`,
        },
        { status: 413 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error: "GEMINI_API_KEY belum diset di server.",
        },
        { status: 500 },
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const prompt = buildPrompt({ rawText, toggles, customPrompt });
    const systemPrompt =
      "Kembalikan output dalam format Markdown saja. Jangan tambahkan penjelasan lain.";

    const client = new GoogleGenAI({
      apiKey,
    });

    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [systemPrompt, prompt].join("\n\n"),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    });

    const markdown = response?.text?.trim() || "";

    if (!markdown) {
      return Response.json(
        { error: "AI tidak mengembalikan konten markdown." },
        { status: 502 },
      );
    }

    return Response.json({ markdown }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error?.message || "Terjadi error server saat memproses permintaan.";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
