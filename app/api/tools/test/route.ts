import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const { type, config } = await req.json();

        if (!config) {
            return NextResponse.json({ success: false, error: "Configuration is required" }, { status: 400 });
        }

        if (type === "WEBHOOK") {
            const { url, headers } = config;
            if (!url) {
                return NextResponse.json({ success: false, error: "URL is required for Webhook" }, { status: 400 });
            }

            try {
                // Attempt a HEAD request first, fallback to GET if method not allowed
                try {
                    await axios.head(url, { headers, timeout: 5000 });
                } catch (headError: any) {
                    if (headError.response?.status === 405) {
                        // Method Not Allowed, try GET
                        await axios.get(url, { headers, timeout: 5000 });
                    } else {
                        throw headError;
                    }
                }

                return NextResponse.json({ success: true, message: "Webhook is reachable" });
            } catch (error: any) {
                const status = error.response?.status;
                const message = error.message;
                return NextResponse.json({
                    success: false,
                    error: `Failed to reach webhook: ${status ? `Status ${status}` : message}`
                }, { status: 400 });
            }
        } else if (type === "MCP") {
            const { serverUrl } = config;
            if (!serverUrl) {
                return NextResponse.json({ success: false, error: "Server URL is required for MCP" }, { status: 400 });
            }

            try {
                // For MCP (SSE), we can just check if the endpoint is reachable
                // A full MCP handshake is more complex, but a basic reachability check is a good start.
                await axios.get(serverUrl, { timeout: 5000 });
                return NextResponse.json({ success: true, message: "MCP Server is reachable" });
            } catch (error: any) {
                return NextResponse.json({
                    success: false,
                    error: `Failed to reach MCP server: ${error.message}`
                }, { status: 400 });
            }
        }

        return NextResponse.json({ success: false, error: "Invalid tool type" }, { status: 400 });
    } catch (error: any) {
        console.error("Tool test error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
