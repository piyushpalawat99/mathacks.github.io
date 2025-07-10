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
  const submissionsPath = '_submissions';

  try {
    // Parse incoming JSON
    const formData = JSON.parse(event.body);
    console.log("✅ Parsed data:", formData);

    // Optional: Check if the submissions folder exists
    try {
      const folderCheck = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: repoOwner,
        repo: repoName,
        path: submissionsPath
      });
      console.log("📁 _submissions folder found. Contains:", folderCheck.data.length, "items");
    } catch (folderErr) {
      console.error("❌ _submissions folder NOT found!");
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "_submissions folder missing in repo root." })
      };
    }

    // Prepare file content
    const fileName = `attempt-${Date.now()}.json`;
    const fileContent = Buffer.from(JSON.stringify({
      title: formData.title,
      description: formData.description,
      field: formData.field,
      submitted_at: new Date().toISOString()
    }, null, 2)).toString('base64');

    // Write file to GitHub
    const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: repoOwner,
      repo: repoName,
      path: `${submissionsPath}/${fileName}`,
      message: `New submission: ${formData.title}`,
      content: fileContent,
      branch: 'main'
    });

    console.log("✅ Submission committed to GitHub:", response.status);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Submission saved to GitHub' })
    };
  } catch (err) {
    console.error('❌ GitHub API Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to save submission.' })
    };
  }
};
