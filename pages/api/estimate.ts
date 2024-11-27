import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { task } = req.body as { task: string };

    if (!task) {
      return res.status(400).json({ error: 'Missing "task" in request body' });
    }

    const prompt = `Generate a humorous and exaggerated effort estimate for the task: "${task}".  The response should be a single sentence in the format: "Task: Equivalent to [exaggerated effort description]".`;

    const response = await fetch('https://api.gemini.google.com/v1/completions', { // Replace with your actual Gemini API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your Gemini API key here
        'Authorization': 'Bearer YOUR_GEMINI_API_KEY'
      },
      body: JSON.stringify({
        model: 'gemini-pro', // Or the appropriate Gemini model
        prompt: prompt,
        temperature: 0.7, // Adjust temperature for creativity
        max_output_tokens: 256, // Adjust as needed
      }),
    });


    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return res.status(500).json({ error: 'Error communicating with Gemini API' });
    }

    const data = await response.json();
    const effortEstimate = data.candidates[0].output;

    // Extract the effort description using a regular expression
    const match = effortEstimate.match(/: Equivalent to (.*)/);

    let effort = "Unknown effort";
    if (match && match[1]) {
      effort = match[1].trim();
    }


    res.status(200).json({ effort });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}