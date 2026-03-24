export default async (req, context) => {
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

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/kantineproxy" };
