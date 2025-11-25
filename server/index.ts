import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler (FIXED: no more "throw err")
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Start server on PORT (default 5000)
    const port = parseInt(process.env.PORT || '5000', 10);
    
    const serverInstance = server.listen({
      port,
      host: "0.0.0.0",
    }, async () => {
      log(`serving on port ${port}`);
      
      // Setup Vite (dev) or static files (prod) AFTER server starts
      try {
        if (app.get("env") === "development") {
          console.log("[DEBUG] Starting Vite setup...");
          await setupVite(app, server);
          log("Vite setup complete - dev server ready");
          console.log("[DEBUG] Vite setup completed successfully");
        } else {
          serveStatic(app);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        log(`Error setting up Vite: ${errorMsg}`);
        console.error("[ERROR] Full error:", err);
        process.exit(1);
      }
    });

    serverInstance.on('error', (err: any) => {
      console.error('[Server Error]', err);
      process.exit(1);
    });

    // Keep the event loop alive for dev mode
    if (app.get("env") === "development") {
      console.log("[DEBUG] Setting up keep-alive interval");
      setInterval(() => {}, 1000);
    }

    // Handle any uncaught errors
    process.on('unhandledRejection', (reason) => {
      log(`Unhandled Rejection: ${reason}`);
      console.error(reason);
    });
  } catch (err) {
    log(`Fatal startup error: ${err instanceof Error ? err.message : String(err)}`);
    console.error(err);
    process.exit(1);
  }
})();
