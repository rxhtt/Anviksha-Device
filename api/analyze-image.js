
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST allowed' });
    }

    const { imageBase64 } = req.body;
    const apiKey = req.headers['x-manual-vision-key'];

    if (!apiKey || apiKey.trim() === "") {
        return res.status(401).json({ error: "Vision API Key Missing. Please set it in Settings." });
    }

    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const payload = {
        requests: [
            {
                image: { content: imageBase64 },
                features: [
                    { type: "LABEL_DETECTION", maxResults: 10 },
                    { type: "TEXT_DETECTION" },
                    { type: "WEB_DETECTION", maxResults: 5 }
                ]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to analyze image' });
    }
}
