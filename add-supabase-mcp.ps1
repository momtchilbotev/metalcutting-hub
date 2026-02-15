# Script to add Supabase MCP server to project scope
# Run this while Claude Code is CLOSED

$configPath = "C:\Users\botev_m\.claude.json"
$projectPath = "C:/GitHUB/metalcutting-hub"

# Read the config file
$config = Get-Content $configPath -Raw | ConvertFrom-Json

# Add Supabase MCP server to the project
$config.projects.$projectPath.mcpServers = @{
    supabase = @{
        type = "http"
        url = "https://mcp.supabase.com/mcp?project_ref=tpjlvwuvxuhyrzsfjmof"
    }
}

# Write back to file with proper formatting
$config | ConvertTo-Json -Depth 32 | Set-Content $configPath

Write-Host "Success! Supabase MCP server added to project scope." -ForegroundColor Green
Write-Host "You can now reopen Claude Code." -ForegroundColor Yellow
