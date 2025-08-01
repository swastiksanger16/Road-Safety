export const getPlaceName = async (lat: number, lng: number): Promise<string> => {
  try {
    const accessToken = "YOUR_MAPBOX_ACCESS_TOKEN"; // Store in .env for security
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`
    );

    if (!response.ok) throw new Error("Failed to fetch location");

    const data = await response.json();
    return data.features?.[0]?.place_name || "Unknown location";
  } catch (error) {
    console.error("Mapbox geocoding error:", error);
    return "Location not found";
  }
};
