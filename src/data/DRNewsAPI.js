// Fetches DR News from rss2json API, which converts the DR RSS feed to JSON

const drNewsURL =
  "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.dr.dk%2Fnyheder%2Fservice%2Ffeeds%2Fallenyheder%23";

export async function fetchDRNews() {
  try {
    const response = await fetch(drNewsURL);
    // Throw an error if the response is not ok
    if (!response.ok)
      throw new Error(
        `Fetching failed: ${response.status} ${response.statusText}`,
      );

    return await response.json();
  } catch (error) {
    console.error("Error fetching DR News:", error);
    throw error;
  }
}
