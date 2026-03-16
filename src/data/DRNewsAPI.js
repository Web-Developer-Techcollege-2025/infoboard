const drNewsURL =
  "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.dr.dk%2Fnyheder%2Fservice%2Ffeeds%2Fallenyheder%23";

export async function fetchDRNews() {
  const response = await fetch(drNewsURL);
  if (!response.ok)
    throw new Error(
      `Fetching failed: ${response.status} ${response.statusText}`,
    );

  const DRNewsData = await response.json();
  //   console.log(DRNewsData);
  return DRNewsData;
}
