import { NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Server restart is only available in development mode.' },
      { status: 403 }
    );
  }

  const cwd = process.cwd();

  try {
    // 1. Spawn a completely new dev server in detached mode.
    //    This new process will take over once the old one dies.
    const child = spawn('npm', ['run', 'dev'], {
      cwd,
      detached: true,
      stdio: 'ignore',   // don't inherit stdio from the dying server
      env: process.env,
    });

    // Allow the child to keep running after this process exits
    child.unref();

    // 2. After a short delay, aggressively clear anything listening on port 3000.
    //    This kills the current server instance (including this request handler).
    //    The freshly spawned dev server above will bind the port.
    setTimeout(() => {
      exec(`lsof -ti:3000 | xargs kill -9 2>/dev/null || true`, (error) => {
        if (error) {
          // Non-fatal — the port may already be free or the new server may have won the race
          console.log('[restart] Port cleanup completed (or no listeners)');
        }
      });
    }, 650);

    // Respond immediately so the browser gets the signal before we die
    return NextResponse.json({
      success: true,
      message: 'Restart initiated. A new dev server is starting.',
      note: 'Hard refresh the page in 4–8 seconds.',
    });
  } catch (err: any) {
    console.error('[restart] Failed to spawn new server:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start new dev server process.',
        details: err?.message 
      },
      { status: 500 }
    );
  }
}
