// Simple wrapper around fetch to handle errors globally
export async function apiFetch(url, options = {}) {
    try {
      const res = await fetch(url, options);
  
      // If response is not OK, throw error
      if (!res.ok) {
        const text = await res.text();
        const errorMsg = text || `Request failed with status ${res.status}`;
        console.error("[API ERROR]", url, options, errorMsg);
        alert(errorMsg); // optional: show error to user
        throw new Error(errorMsg);
      }
  
      // Parse JSON
      return await res.json();
    } catch (err) {
      console.error("[API FETCH ERROR]", err);
      alert(err.message); // optional: show user-friendly message
      throw err;
    }
  }
  