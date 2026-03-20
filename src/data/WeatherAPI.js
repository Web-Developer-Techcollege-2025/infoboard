const vejrURL = "https://api.openweathermap.org/data/2.5/weather?q=Aalborg&appid=4d58d6f0a435bf7c5a52e2030f17682d&units=metric"

export async function fetchWeather() {
    const result = await fetch(vejrURL);
    if (!result.ok) throw new Error(`Fetching failed: ${result.status} ${result.statusText}`);
    const data = await result.json()

    return data
}