export async function initMocks() {
  if (typeof window === "undefined") {
    // Server-side (Node.js/SSR)
    const { server } = await import("./server");
    server.listen({ onUnhandledRequest: 'warn' });
  } else {
    // Client-side (Browser)
    const { worker } = await import("./browser");
    await worker.start({ onUnhandledRequest: 'warn' });
  }
} 