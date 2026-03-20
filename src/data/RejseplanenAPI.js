const rejseplanenURL =
  "https://www.rejseplanen.dk/api/nearbyDepartureBoard?accessId=5b71ed68-7338-4589-8293-f81f0dc92cf2&originCoordLat=57.048731&originCoordLong=9.968186&format=json";

export async function fetchRejseplanen() {
  try {
    const rejseplanenResponse = await fetch(rejseplanenURL);
    if (!rejseplanenResponse.ok)
      throw new Error(
        `Fetching failed: ${rejseplanenResponse.status} ${rejseplanenResponse.statusText}`,
      );

    const contentType = rejseplanenResponse.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(
        `Rejseplanen API returned non-JSON content (${contentType || "unknown"})`,
      );
    }

    const RejseplanenData = await rejseplanenResponse.json();
    return RejseplanenData;
  } catch (error) {
    console.error("Error fetching Rejseplanen:", error);
    throw error;
  }
}
