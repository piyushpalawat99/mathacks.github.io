exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = 'appWoiqoYkvPyIPx0';
  //const TABLE_NAME = 'first';

  const submission = JSON.parse(event.body);

  try {
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/tblh5SEyzY7iXf0GK`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          title: submission.title,
          area: submission.area,
          summary: submission.summary,
          failure: submission.failure,
          author: submission.author,
          date: submission.date || new Date().toISOString(),
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
