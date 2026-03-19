// URL API, откуда мы получаем данные о ближайших отправлениях
const rejseplanenURL =
  "https://www.rejseplanen.dk/api/nearbyDepartureBoard?accessId=5b71ed68-7338-4589-8293-f81f0dc92cf2&originCoordLat=57.048731&originCoordLong=9.968186&format=json"

// Функция получает данные с API
export async function getDepartures() {
  try {
    const response = await fetch(rejseplanenURL)

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()

    console.log(data)

    return data
  } catch (error) {
    console.log("Fetch error:", error)
    return null
  }
}
