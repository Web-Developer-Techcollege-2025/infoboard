const kantineURL = "https://infoskaerm.techcollege.dk/umbraco/api/content/getcanteenmenu/?type=json";

async function fetchMenu() {
    const result = await fetch(kantineURL)
    if (!result.ok) throw new Error(`Fetching failed: {$res.status} {$res.statusText}`);
    
}