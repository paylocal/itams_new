# Apply Diff MCP Server

## Install

`ash
pip install mcp
`

## Configure Continue

Merge the contents of continue-config-example.json into your Continue config file.

On Windows the config is usually at:

`
%USERPROFILE%\.continue\config.json
`

## Test

`ash
python tools/mcp_apply_diff.py
`
