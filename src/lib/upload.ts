/**
 * Helper to upload a base64 or blob image to Cloudinary via the backend proxy.
 * Falls back gracefully to the original base64 if Cloudinary is not configured or fails.
 */
export async function uploadToCloudinary(base64OrUrl: string): Promise<string> {
  if (!base64OrUrl) return "";

  // Only upload if it is a base64 Data URI or local blob
  if (!base64OrUrl.startsWith("data:") && !base64OrUrl.startsWith("blob:")) {
    return base64OrUrl;
  }

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: base64OrUrl }),
    });

    if (!response.ok) {
      throw new Error(`Proxy returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.url) {
      return data.url;
    }
    return base64OrUrl;
  } catch (err) {
    console.warn("Cloudinary upload failed, falling back to local base64/placeholder:", err);
    return base64OrUrl;
  }
}
