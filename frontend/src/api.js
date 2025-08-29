export async function getProtectedData(userToken) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/protected`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`, // THIS IS IMPORTANT
        },
      });
      if (!res.ok) throw new Error("Failed to fetch protected data");
      return await res.json();
    } catch (err) {
      console.error("API error:", err);
      return null;
    }
  }
  