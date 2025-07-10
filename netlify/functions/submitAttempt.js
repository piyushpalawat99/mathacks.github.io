exports.handler = async (event) => {
  console.log("👉 Event body:", event.body);
  let data;
  try {
    data = JSON.parse(event.body);
    console.log("✅ Parsed JSON:", data);
  } catch (err) {
    console.error("❌ JSON parse error:", err);
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON" }) };
  }

  try {
    // Your save logic
    console.log("🔄 Attempting to save submission for:", data.title);
    // (e.g., write to file, DB, etc.)
    console.log("✅ Submission saved successfully");
    return { statusCode: 200, body: JSON.stringify({ message: "OK" }) };
  } catch (err) {
    console.error("❌ Save error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to save submission" }) };
  }
};

const { Octokit } = require('@octokit/core');
const { v4: uuidv4 } = require('uuid');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });

  const repoOwner = 'piyushpalawat99';
  const repoName = 'piyushpalawat99.github.io';
  const submissionsPath = '_submissions'; // Make sure this folder exists in your repo

  try {
    const formData = JSON.parse(event.body);

    const fileName = `attempt-${Date.now()}.json`;
    const fileContent = Buffer.from(JSON.stringify({
      title: formData.title,
      description: formData.description,
      field: formData.field,
      submitted_at: new Date().toISOString()
    }, null, 2)).toString('base64');

    const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: repoOwner,
      repo: repoName,
      path: `${submissionsPath}/${fileName}`,
      message: `New submission: ${formData.title}`,
      content: fileContent
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Submission saved to GitHub' })
    };
  } catch (err) {
    console.error('GitHub API Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to save submission.' })
    };
  }
};
