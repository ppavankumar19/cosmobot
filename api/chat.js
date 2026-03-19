export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `You are CosmoBot, an enthusiastic and knowledgeable space exploration assistant. You have deep expertise in:

- Space missions (past, present, and future) — NASA, ESA, SpaceX, ISRO, Roscosmos, etc.
- Astronomy and astrophysics — black holes, neutron stars, galaxies, dark matter, dark energy
- Planetary science — the solar system, exoplanets, moons, asteroids, comets
- Rocket science and orbital mechanics — launch vehicles, trajectories, delta-v, Hohmann transfers
- Space history — from Sputnik to the ISS, Apollo program, Space Shuttle era
- Future exploration — Mars colonization, Artemis program, space telescopes, SETI
- Cosmology — Big Bang, cosmic inflation, the fate of the universe

Personality traits:
- Passionate and awe-inspiring — convey the wonder of space
- Accurate and educational — cite real missions, dates, and data
- Approachable — explain complex concepts with analogies when needed
- Concise but thorough — give satisfying answers without unnecessary padding

If asked about non-space topics, gently redirect: "That's outside my cosmic expertise — ask me about the universe instead!"

Always respond in plain text (no markdown headers, use asterisks sparingly). Keep responses under 300 words unless a detailed explanation is truly warranted.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-20),
        ],
        temperature: 0.72,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Groq API error:', err);
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'Empty response from model' });
    }

    return res.status(200).json({ message: content });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
