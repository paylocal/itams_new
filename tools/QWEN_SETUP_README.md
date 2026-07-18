# Huong dan cau hinh Continue + Qwen2.5-Coder local

## 1. Cai dat Ollama va model

```bash
# Kiem tra Ollama
ollama --version

# Pull model goc
ollama pull qwen2.5-coder:7b

# Tao model custom tu Modelfile (da co san trong tools/ollama/)
cd tools/ollama
ollama create qwen-coder-fix -f qwen-coder-fix.modelfile
```

## 2. Kiem tra model hoat dong

```bash
cd D:/Project/itams-new-clean
python tools/test-ollama.py
```

Ket qua mong doi:
- `[OK] Kiem tra Ollama server...`
- `[OK] Kiem tra model qwen2.5-coder:7b...`
- `[OK] Test chat don gian...`
- `[OK] Test kha nang sinh diff...`
- `[OK] Tat ca cac test deu thanh cong!`

## 3. Cau hinh Continue

Mo file:
```
%USERPROFILE%\.continue\config.json
```

Merge noi dung tu `tools/continue-config-qwen.json` vao. Hoac copy de len hoan toan.

Luu y:
- Model default la `qwen-coder-fix:latest` (co system prompt toi uu)
- Neu muon dung model goc, chon `Qwen2.5 Coder 7B (Local)` trong dropdown chat

## 4. Kiem tra MCP server

Mo Continue trong VS Code, chay lenh:
```
/applicable
```

Hoac mo tab MCP Servers de kiem tra `apply-diff` da ket noi.

## 5. Cach dung

### 5.1 Chat thong thuong
Chon model Qwen Coder Fix roi chat nhu binh thuong.

### 5.2 Sua code bang custom command
G trong chat:
```
/code them auth check cho GET /api/device-models/route.ts
```

### 5.3 Inline Edit (khong can tool)
Chon doan code trong editor -> nhan `Ctrl+I` -> nhap yeu cau.

## 6. Khac phuc loi "dung im"

### 6.1 Model khong tra loi
Kiem tra Ollama dang chay:
```bash
ollama list
ollama ps
```

### 6.2 Continue khong ket noi Ollama
Kiem tra URL trong config:
```json
"apiBase": "http://localhost:11434"
```

### 6.3 Tool apply_diff khong hoat dong
Kiem tra:
1. Da cai `pip install mcp`
2. Path trong config dung: `D:/Project/itams-new-clean/tools/mcp_apply_diff.py`
3. File mcp_apply_diff.py khong loi syntax

### 6.4 Model sinh diff sai
Thay doi prompt trong custom command hoac tao lai model custom voi system prompt manh hon.

## 7. Toi uu hieu nang

Neu Qwen 7B qua cham hoac khong du manh:
- Thu `qwen2.5-coder:14b` (can VRAM lon hon)
- Hoac dung `deepseek-coder-v2:16b` da co san

Neu may yeu:
- Dung `qwen2.5-coder:3b` nhung chat luong se kem hon
