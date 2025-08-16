import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { logInfo, logDebug, logError, debugLogger } from "@/lib/debug-logger";

export async function GET(request: NextRequest) {
  logInfo("Debug:Status", "System status check initiated");

  const status = {
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
    },
    database: {
      connected: false,
      error: null as string | null,
      poolStats: null as any,
    },
    logs: {
      total: 0,
      byLevel: {} as Record<string, number>,
      recent: [] as any[],
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasStackAuth: !!process.env.STACK_SECRET_SERVER_KEY,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "not-set",
    },
  };

  // Check database connection
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT NOW() as current_time");
      status.database.connected = true;
      status.database.poolStats = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      };
      logDebug("Debug:Status", "Database connection successful", {
        currentTime: result.rows[0].current_time,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    status.database.connected = false;
    status.database.error =
      error instanceof Error ? error.message : "Unknown error";
    logError("Debug:Status", "Database connection failed", error);
  }

  // Get log statistics
  try {
    const allLogs = debugLogger.getLogs({ limit: 1000 });
    status.logs.total = allLogs.length;

    // Count by level
    status.logs.byLevel = allLogs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get recent errors and warnings
    status.logs.recent = allLogs
      .filter((log) => log.level === "error" || log.level === "warn")
      .slice(0, 10)
      .map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        level: log.level,
        category: log.category,
        message: log.message,
      }));

    logDebug("Debug:Status", "Log statistics compiled", status.logs);
  } catch (error) {
    logError("Debug:Status", "Failed to get log statistics", error);
  }

  logInfo("Debug:Status", "System status check completed", {
    dbConnected: status.database.connected,
    totalLogs: status.logs.total,
    errors: status.logs.byLevel.error || 0,
  });

  return NextResponse.json({
    success: true,
    status,
  });
}
