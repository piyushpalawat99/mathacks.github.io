exports.handler = async () => {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = 'appKrCFThGJ9SCt4X';
  const TABLE_NAME = 'Imported table';

  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?sort[0][field]=Date&sort[0][direction]=desc`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`
      }
    });

    const data = await res.json();

    const attempts = data.records.map(record => ({
      id: record.id,
      title: record.fields["Title"] || "",
      area: record.fields["Area of Research"] || "",
      summary: record.fields["Attempt Summary"] || "",
      failure: record.fields["Why It Failed"] || "",
      author: record.fields["Author Name"] || "",
      date: record.fields["Date"] || ""
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(attempts)
    };
  } catch (err) {
    console.error("Airtable fetch error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data from Airtable" })
    };
  }
};