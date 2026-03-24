export default async (req, context) => {
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
      return new Response(
        JSON.stringify({ error: `Upstream returned ${response.status}` }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const text = await response.text();

    // API returns XML despite ?type=json param — parse with regex
    const weekMatch = text.match(/<Week>(\d+)<\/Week>/);
    const week = weekMatch ? parseInt(weekMatch[1]) : null;

    const days = [];
    const dayRegex = /<CanteenDay>[\s\S]*?<DayName>(.*?)<\/DayName>[\s\S]*?<Dish>(.*?)<\/Dish>[\s\S]*?<\/CanteenDay>/g;
    let match;
    while ((match = dayRegex.exec(text)) !== null) {
      days.push({ DayName: match[1], Dish: match[2] });
    }

    const data = { Week: week, Days: days };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch canteen menu",
        details: err.message,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const config = { path: "/kantineproxy" };
