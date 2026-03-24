export const handler = async (event, context) => {
  try {
    const response = await fetch(
      "https://infoskaerm.techcollege.dk/umbraco/api/content/getcanteenmenu/?type=json",
      {
        headers: {
          Referer: "https://infoskaerm.techcollege.dk/",
          Origin: "https://infoskaerm.techcollege.dk",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Upstream returned ${response.status}` }),
      };
    }

    const text = await response.text();

    // API returns XML despite ?type=json param — parse with regex
    const weekMatch = text.match(/<Week>(\d+)<\/Week>/);
    const week = weekMatch ? parseInt(weekMatch[1]) : null;

    const days = [];
    const dayRegex =
      /<CanteenDay>[\s\S]*?<DayName>(.*?)<\/DayName>[\s\S]*?<Dish>(.*?)<\/Dish>[\s\S]*?<\/CanteenDay>/g;
    let match;
    while ((match = dayRegex.exec(text)) !== null) {
      days.push({ DayName: match[1], Dish: match[2] });
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Week: week, Days: days }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to fetch canteen menu",
        details: err.message,
      }),
    };
  }
};
