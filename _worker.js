export default {
  async fetch(request, env, ctx) {

    // Refueler Analytics Engine — Session C
    ctx.waitUntil(
      env.ANALYTICS.writeDataPoint({
        blobs: [
          request.headers.get("cf-ipcountry") ?? "unknown",
          new URL(request.url).pathname,
          request.headers.get("referer") ?? "direct",
        ],
        doubles: [1],
        indexes: [new URL(request.url).pathname],
      })
    );

    return fetch(request);
  }
};