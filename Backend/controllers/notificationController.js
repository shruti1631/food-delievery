let clients = [];

export const subscribe = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
};

// 🔔 send notification with orderId
export const sendNotification = (req, res) => {
  const { message, orderId } = req.body;

  clients.forEach(client => {
    client.write(`data: ${JSON.stringify({ message, orderId })}\n\n`);
  });

  res.json({ success: true });
};