import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { spawn } from "child_process";

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
            if (config.connectionType === 'STDIO') {
                const { command, args, env } = config;
                if (!command) {
                    return NextResponse.json({ success: false, error: "Command is required for Stdio MCP" }, { status: 400 });
                }

                // Test spawn
                return new Promise<NextResponse>((resolve) => {
                    try {
                        // Merge current env with provided env
                        const procEnv = { ...process.env, ...env };
                        const proc = spawn(command, args || [], { env: procEnv, shell: true });

                        const timeout = setTimeout(() => {
                            proc.kill();
                            resolve(NextResponse.json({ success: true, message: "MCP Process spawned successfully (timeout check passed)" }));
                        }, 2000);

                        proc.on('error', (err) => {
                            clearTimeout(timeout);
                            resolve(NextResponse.json({ success: false, error: `Failed to spawn process: ${err.message}` }, { status: 400 }));
                        });

                        proc.on('close', (code) => {
                            clearTimeout(timeout);
                            if (code !== 0 && code !== null) {
                                // Some tools exit immediately if no input is provided, which is tricky.
                                // But a rapid non-zero exit usually means command not found or error.
                                // For now, valid spawn is success.
                                // A better check would be to send an initialize JSON-RPC frame.
                                resolve(NextResponse.json({ success: false, error: `Process exited with code ${code}` }, { status: 400 }));
                            } else {
                                resolve(NextResponse.json({ success: true, message: "MCP Process spawned successfully" }));
                            }
                        });


                    } catch (e: any) {
                        resolve(NextResponse.json({ success: false, error: `Spawn exception: ${e.message}` }, { status: 400 }));
                    }
                });

            } else {
                // HTTP (SSE)
                const { serverUrl } = config;
                if (!serverUrl) {
                    return NextResponse.json({ success: false, error: "Server URL is required for MCP" }, { status: 400 });
                }

                try {
                    await axios.get(serverUrl, { headers: config.headers, timeout: 5000 });
                    return NextResponse.json({ success: true, message: "MCP Server is reachable" });
                } catch (error: any) {
                    return NextResponse.json({
                        success: false,
                        error: `Failed to reach MCP server: ${error.message}`
                    }, { status: 400 });
                }
            }
        }

        return NextResponse.json({ success: false, error: "Invalid tool type" }, { status: 400 });
    } catch (error: any) {
        console.error("Tool test error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
