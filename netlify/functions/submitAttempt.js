exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = 'appKrCFThGJ9SCt4X';
  //const TABLE_NAME = 'Imported table';

  const submission = JSON.parse(event.body);

  try {
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/tblHHnqSa3rJqsbTD`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "Title": submission.title,
          "Area of Research": submission.area,
          "Summary": submission.summary,
          "Failure": submission.failure,
          "Author": submission.author,
          "Date": submission.date || new Date().toISOString(),
        },
      }),
    });

    const data = await airtableResponse.json();

    if (!airtableResponse.ok) {
      console.error('Airtable error:', data);
      return {
        statusCode: airtableResponse.status,
        body: JSON.stringify({ error: 'Failed to save to Airtable' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
