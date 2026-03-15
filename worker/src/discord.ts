export async function sendDiscord(webhookUrl: string, message: string) {
  try{
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message })
  });
}catch(error){
  console.log("error in sending discord message",error);
}
}
