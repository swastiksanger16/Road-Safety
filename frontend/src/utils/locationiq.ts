export const getPlaceName = async (lat: number, lng: number): Promise<string> => {
  try {
    const apiKey = "pk.89b81b5408d964a1cf77fbd23f8f6265"; 
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lng}&format=json`
    );

    if (!response.ok) throw new Error("Failed to fetch location");

    const data = await response.json();
    return data.display_name || "Unknown location";
  } catch (error) {
    console.error("LocationIQ geocoding error:", error);
    return "Location not found";
  }
};
