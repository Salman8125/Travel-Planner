import { createServer } from "./http/server";

const PORT = Number(process.env.PORT ?? 4001);

// Bind 0.0.0.0 so the service is reachable from outside the container.
createServer().listen(PORT, "0.0.0.0", () => {
  console.log(`SkyScout backend listening on http://0.0.0.0:${PORT}`);
});
