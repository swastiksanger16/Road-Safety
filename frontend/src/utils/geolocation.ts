export const getPlaceName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();

    return data.display_name || "Unknown location";
  } catch (error) {
    console.error("Error fetching place name:", error);
    return "Location not found";
  }
};
