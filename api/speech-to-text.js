export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST allowed' });
    }

    const { audioBase64, languageCode } = req.body;
    const apiKey = process.env.GOOGLE_SPEECH_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Speech API Key missing" });
    }

    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

    const payload = {
        config: {
            encoding: "WEBM_OPUS",
            languageCode: languageCode || "en-US",
            enableAutomaticPunctuation: true,
        },
        audio: {
            content: audioBase64
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const transcription = data.results?.[0]?.alternatives?.[0]?.transcript || "";

        return res.status(200).json({ text: transcription, raw: data });
    } catch (error) {
        console.error("Speech to Text Error:", error);
        return res.status(500).json({ error: 'Failed to transcribe audio' });
    }
}
