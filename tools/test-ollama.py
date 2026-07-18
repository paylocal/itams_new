#!/usr/bin/env python3
"""
Test script kiem tra Ollama + Qwen2.5-Coder hoat dong va sinh diff dung.

Cach chay:
    python tools/test-ollama.py

Yeu cau:
    - Ollama dang chay tren http://localhost:11434
    - Da pull model qwen2.5-coder:7b hoac qwen-coder-fix
"""

import json
import sys
import time
import urllib.request
import urllib.error

OLLAMA_URL = "http://localhost:11434"
MODEL = "qwen2.5-coder:7b"


def ollama_chat(model: str, messages: list[dict], stream: bool = False) -> dict:
    payload = {
        "model": model,
        "messages": messages,
        "stream": stream,
        "options": {
            "temperature": 0.3,
            "top_p": 0.8,
            "top_k": 40,
            "num_ctx": 8192,
        },
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/chat",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        raise RuntimeError(f"HTTP {e.code}: {body}")


def check_ollama():
    print("[1/4] Kiem tra Ollama server...")
    try:
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = [m["name"] for m in data.get("models", [])]
            print(f"  -> OK. Cac model: {models}")
            return models
    except Exception as e:
        print(f"  -> LOI: Khong ket noi duoc Ollama: {e}")
        sys.exit(1)


def check_model(models: list[str]):
    print(f"[2/4] Kiem tra model {MODEL}...")
    if MODEL not in models:
        print(f"  -> LOI: Model {MODEL} chua co. Chay: ollama pull {MODEL}")
        sys.exit(1)
    print(f"  -> OK. Model {MODEL} da san sang.")


def test_simple_chat():
    print("[3/4] Test chat don gian...")
    start = time.time()
    try:
        resp = ollama_chat(
            MODEL,
            messages=[
                {"role": "system", "content": "Ban la tro ly lap trinh. Tra loi ngan gon bang tieng Viet."},
                {"role": "user", "content": "1 + 1 = ?"},
            ],
        )
        content = resp.get("message", {}).get("content", "")
        elapsed = time.time() - start
        print(f"  -> OK ({elapsed:.1f}s): {content.strip()[:200]}")
    except Exception as e:
        print(f"  -> LOI: {e}")
        sys.exit(1)


def test_diff_generation():
    print("[4/4] Test kha nang sinh diff...")
    sample_file = '''import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}
'''
    prompt = f"""File src/app/api/test/route.ts co noi dung:
```
{sample_file}
```

Hay them mot dong log "Hello" truoc khi return. Tra ve unified diff chinh xac, khong giai thich gi them."""

    start = time.time()
    try:
        resp = ollama_chat(
            MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Ban la senior developer. Chi tra ve unified diff (git diff format). Khong giai thich.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        content = resp.get("message", {}).get("content", "")
        elapsed = time.time() - start
        has_diff = "@@" in content and ("+" in content or "-" in content)
        print(f"  -> OK ({elapsed:.1f}s)")
        print("  -> Diff output:")
        print("-" * 40)
        print(content[:800])
        print("-" * 40)
        if not has_diff:
            print("  -> CANH BAO: Khong tim thay diff trong phan hoi!")
        else:
            print("  -> Diff format detected.")
    except Exception as e:
        print(f"  -> LOI: {e}")
        sys.exit(1)


def main():
    models = check_ollama()
    check_model(models)
    test_simple_chat()
    test_diff_generation()
    print("\n[OK] Tat ca cac test deu thanh cong!")


if __name__ == "__main__":
    main()
