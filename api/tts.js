const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech/stream';
const DEFAULT_TTS_OPTIONS = {
  target_language_code: 'en-IN',
  model: 'bulbul:v3',
  speaker: 'manan',
  pace: 1.1,
  speech_sample_rate: 22050,
  output_audio_codec: 'mp3',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sarvam API key not configured' });
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (text.length > 2500) {
    return res.status(400).json({ error: 'Text exceeds Sarvam limit of 2500 characters' });
  }

  try {
    const response = await fetch(SARVAM_TTS_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        ...DEFAULT_TTS_OPTIONS,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Sarvam TTS error:', err);
      return res.status(response.status).json({
        error: err.error?.message || err.message || 'Sarvam TTS error',
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    if (!audioBuffer.length) {
      return res.status(500).json({ error: 'Empty audio response from Sarvam' });
    }

    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (err) {
    console.error('TTS handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
