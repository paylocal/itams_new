# MCP apply_diff server for Continue / VS Code
# Install: pip install mcp
# Add to Continue config (~/.continue/config.json):
# {
#   "mcpServers": {
#     "apply-diff": {
#       "command": "python",
#       "args": ["D:/Project/itams-new-clean/tools/mcp_apply_diff.py"]
#     }
#   }
# }
import sys
from pathlib import Path
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

app = Server("apply_diff")

def split_lines(text):
    if not text: return []
    lines = text.split(chr(10))
    out = [ln + chr(10) for ln in lines[:-1]]
    if lines[-1]: out.append(lines[-1])
    return out

def apply_unified_diff(path, diff):
    fp = Path(path).resolve()
    if not fp.exists():
        raise FileNotFoundError("File not found: " + str(fp))
    original = fp.read_text(encoding="utf-8").splitlines(keepends=True)
    patched = parse_hunks(original, diff)
    if patched is None:
        patched = fallback_hunks(original, diff)
    if patched is None:
        raise RuntimeError("Could not apply diff")
    fp.write_text("".join(patched), encoding="utf-8")
    return "Applied diff to " + str(fp)

def parse_hunks(lines, diff):
    try:
        patched = lines[:]
        dlines = split_lines(diff)
        i = 0
        while i < len(dlines):
            ln = dlines[i]
            if ln.startswith("@@"):
                parts = ln.strip().split()
                if len(parts) < 4: return None
                old_start = int(parts[1][1:].split(",")[0])
                delete_index = old_start - 1
                old_hunk, new_hunk = [], []
                i += 1
                while i < len(dlines) and not dlines[i].startswith("@@"):
                    dl = dlines[i]
                    if dl.startswith("+"): new_hunk.append(dl[1:])
                    elif dl.startswith("-"): old_hunk.append(dl[1:])
                    elif dl.startswith(" "):
                        old_hunk.append(dl[1:])
                        new_hunk.append(dl[1:])
                    elif dl.startswith("\\"): pass
                    else:
                        old_hunk.append(dl)
                        new_hunk.append(dl)
                    i += 1
                if delete_index < 0 or delete_index + len(old_hunk) > len(patched): return None
                if patched[delete_index:delete_index+len(old_hunk)] != old_hunk: return None
                patched = patched[:delete_index] + new_hunk + patched[delete_index+len(old_hunk):]
            else:
                i += 1
        return patched
    except Exception:
        return None

def extract_hunks(diff):
    hunks = []
    lines = split_lines(diff)
    i = 0
    while i < len(lines):
        if lines[i].startswith("@@"):
            old_block, new_block = [], []
            i += 1
            while i < len(lines) and not lines[i].startswith("@@"):
                l = lines[i]
                if l.startswith("+"): new_block.append(l[1:])
                elif l.startswith("-"): old_block.append(l[1:])
                elif l.startswith(" "):
                    old_block.append(l[1:])
                    new_block.append(l[1:])
                i += 1
            hunks.append({"old": old_block, "new": new_block})
        else:
            i += 1
    return hunks

def find_position(lines, old_block):
    if not old_block: return 0
    for i in range(len(lines) - len(old_block) + 1):
        if lines[i:i+len(old_block)] == old_block: return i
    return None

def fallback_hunks(lines, diff):
    try:
        hunks = extract_hunks(diff)
        patched = lines[:]
        for hunk in hunks:
            found = find_position(patched, hunk["old"])
            if found is None: return None
            patched = patched[:found] + hunk["new"] + patched[found+len(hunk["old"]):]
        return patched
    except Exception:
        return None

@app.list_tools()
async def list_tools():
    return [Tool(name="apply_diff", description="Apply a unified diff to a file on disk.", inputSchema={"type": "object", "properties": {"path": {"type": "string"}, "diff": {"type": "string"}}, "required": ["path", "diff"]})]

@app.call_tool()
async def call_tool(name, arguments):
    if name != "apply_diff":
        raise ValueError("Unknown tool: " + name)
    path = arguments.get("path")
    diff = arguments.get("diff")
    if not path or not diff:
        raise ValueError("Both path and diff are required")
    try:
        msg = apply_unified_diff(path, diff)
        return [TextContent(type="text", text=msg)]
    except Exception as e:
        return [TextContent(type="text", text="Error applying diff: " + str(e))]

async def main():
    async with stdio_server() as streams:
        await app.run(streams[0], streams[1], app.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
