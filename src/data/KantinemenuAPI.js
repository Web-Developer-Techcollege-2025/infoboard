const kantineURL = "/kantineapi/umbraco/api/content/getcanteenmenu/?type=json";

export async function fetchMenu() {
    const result = await fetch(kantineURL)
    if (!result.ok) throw new Error(`Fetching failed: ${result.status} ${result.statusText}`);
    const data = await result.json();
    console.log(data);
    return data;
}