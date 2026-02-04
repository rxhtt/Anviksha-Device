export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST allowed' });

    const { audioBase64, languageCode } = req.body;
    const apiKey = req.headers['x-manual-speech-key'];

    if (!apiKey || apiKey.trim() === "") {
        return res.status(401).json({ error: "Speech API Key Missing. Please set it in Settings." });
    }

    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

    const payload = {
        config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: languageCode || "en-US",
            enableAutomaticPunctuation: true,
        },
        audio: { content: audioBase64 }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            console.error("Speech API Error:", data.error);
            return res.status(403).json({
                error: "Speech API Error",
                details: data.error.message
            });
        }

        const transcription = data.results?.[0]?.alternatives?.[0]?.transcript || "";
        return res.status(200).json({ text: transcription });
    } catch (error) {
        console.error("STT Server Error:", error);
        return res.status(500).json({ error: 'Failed to transcribe audio' });
    }
}
