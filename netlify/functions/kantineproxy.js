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

    // API returns XML despite ?type=json param
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const week = xml.querySelector("Week")?.textContent ?? null;
    const dayNodes = xml.querySelectorAll("CanteenDay");
    const days = Array.from(dayNodes).map((day) => ({
      DayName: day.querySelector("DayName")?.textContent ?? "",
      Dish: day.querySelector("Dish")?.textContent ?? "",
    }));

    const data = { Week: week ? parseInt(week) : null, Days: days };

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
