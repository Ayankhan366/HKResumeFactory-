export const sendToN8n = async (payload, webhookUrl) => {
  if (!webhookUrl) {
    throw new Error("Webhook URL is not provided. Check your .env file.");
  }

  try {
    console.log("📤 Sending to n8n:", webhookUrl);
    console.log("📦 Payload:", payload);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    console.log("📥 RAW RESPONSE FROM N8N:", rawText);

    if (!rawText) {
      throw new Error("Empty response from n8n");
    }

    let data;
    try {
      data = JSON.parse(rawText);
      console.log("✅ Parsed Response:", data);
    } catch (err) {
      console.error("❌ N8N did not return valid JSON:", rawText);
      throw new Error("Invalid JSON returned from n8n");
    }

    // ✅ Check for success flag
    if (data?.success === false) {
      throw new Error(data.message || "n8n workflow error");
    }

    return data;
  } catch (error) {
    console.error("❌ sendToN8n error:", error);
    throw error;
  }
};