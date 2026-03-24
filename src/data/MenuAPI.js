const kantineURL = "/kantineproxy";

export async function fetchMenu() {
  const result = await fetch(kantineURL);
  if (!result.ok)
    throw new Error(`Fetching failed: ${result.status} ${result.statusText}`);
  const data = await result.json();
  return data;
}
