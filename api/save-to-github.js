export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { imageBase64, filename } = req.body;
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  if (!token || !owner || !repo) {
    return res.status(500).json({ error: 'Config missing' });
  }

  const content = imageBase64.split(',')[1];
  const path = `uploads/${Date.now()}_${filename}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload result: ${filename}`,
        content: content
      })
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const errData = await response.json();
      res.status(500).json({ error: errData.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
