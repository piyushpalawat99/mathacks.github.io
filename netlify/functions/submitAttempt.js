const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const submission = JSON.parse(event.body);

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.BASE_ID;
    const TABLE_ID = process.env.TABLE_ID;

    const airtableURL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

    const airtableResponse = await fetch(airtableURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          "Title": submission.title,
          "Area of Research": submission.area,
          "Attempt Summary": submission.summary,
          "Why It Failed": submission.failure,
          "Author Name": submission.author,
          "Date": submission.date || new Date().toISOString(),
        },
      }),
    });

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      return {
        statusCode: airtableResponse.status,
        body: `Airtable error: ${errorText}`,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Server error: ${err.message}`,
    };
  }
};
