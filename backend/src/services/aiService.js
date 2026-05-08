const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

function promptTemplate(text) {
  return `You are a rigorous document analyst. Preserve structure and do not hallucinate.
Extract only what exists in content.
Return exact format:\n\nSUMMARY:\n(5-10 paragraphs)\n\nKNOWLEDGE_BASE:\n(expanded structured article for QnA)\n\nMETADATA:\n- author:\n- title:\n- abstract:\n- methodology:\n- results:\n- conclusions:\n- numbers/statistics:\n- keywords:\n\nDocument:\n${text}`;
}

export async function analyzeTextWithGemini(text) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  if (!key) {
    return {
      fallback: true,
      output: `SUMMARY:\nGemini API key missing.\n\nKNOWLEDGE_BASE:\nProvide GEMINI_API_KEY to enable deep analysis.\n\nMETADATA:\n- author: unknown\n- title: unknown\n- abstract: unavailable\n- methodology: unavailable\n- results: unavailable\n- conclusions: unavailable\n- numbers/statistics: unavailable\n- keywords: unavailable`
    };
  }

  const res = await fetch(`${baseUrl}/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptTemplate(text) }] }],
      generationConfig: { temperature: 0.2 }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${err}`);
  }

  const json = await res.json();
  const output = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'No output';
  return { fallback: false, output };
}

export async function chatWithGemini(question, context) {
  return analyzeTextWithGemini(`Context:\n${context}\n\nQuestion:\n${question}`);
}
