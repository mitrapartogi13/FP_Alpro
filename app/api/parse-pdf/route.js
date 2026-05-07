import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

async function parsePdf(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo().catch(() => null);

    return {
      text: textResult.text?.trim() || "",
      pages: infoResult?.total ?? textResult.pages?.length ?? null,
      info: {
        title: infoResult?.infoData?.Title || null,
        author: infoResult?.infoData?.Author || null,
      },
    };
  } finally {
    await parser.destroy();
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        { error: "Request harus berupa multipart/form-data." },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("pdf");

    if (!file || typeof file === "string") {
      return Response.json(
        { error: "Field 'pdf' (file) wajib ada." },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "File harus berformat PDF." },
        { status: 415 },
      );
    }

    if (file.size > MAX_PDF_SIZE) {
      return Response.json(
        { error: "Ukuran PDF maksimal 10 MB." },
        { status: 413 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await parsePdf(buffer);

    if (!parsed.text) {
      return Response.json(
        {
          error:
            "PDF tidak mengandung teks yang bisa diekstrak. Kemungkinan PDF berbasis gambar/scan.",
        },
        { status: 422 },
      );
    }

    return Response.json(
      {
        text: parsed.text,
        pages: parsed.pages,
        info: parsed.info,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[parse-pdf] Error:", error);

    return Response.json(
      { error: "Gagal memproses PDF. Pastikan file tidak rusak." },
      { status: 500 },
    );
  }
}
