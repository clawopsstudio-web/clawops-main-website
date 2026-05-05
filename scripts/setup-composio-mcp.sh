#!/bin/bash
# setup-composio-mcp.sh
# Install Composio MCP on VPS for Hermes integration
# Run this on new VPS instances to enable 850+ tools

set -e

echo "=== Installing Composio MCP ==="

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install Composio Core globally
echo "Installing @composio/core..."
npm install -g @composio/core

# Verify installation
echo "Verifying installation..."
npx @composio/core --version

# Create composio config directory
mkdir -p ~/.composio

# Create composio config
cat > ~/.composio/config.json << 'EOF'
{
  "api_key_env": "COMPOSIO_API_KEY",
  "workspace_id": null,
  "tools": {
    "涂": false,
    "structured": true,
    "max_iterations": 10
  },
  "execution": {
    "mode": "local"
  }
}
EOF

# Add COMPOSIO_API_KEY to environment
if ! grep -q "COMPOSIO_API_KEY" ~/.bashrc; then
    echo 'export COMPOSIO_API_KEY="YOUR_API_KEY"' >> ~/.bashrc
fi

echo ""
echo "=== Composio MCP Installation Complete ==="
echo ""
echo "To use Composio tools:"
echo "1. Set your API key: export COMPOSIO_API_KEY=your_key"
echo "2. Run: npx @composio/core execute"
echo ""
echo "For Hermes integration, add to Hermes config:"
echo "  toolsets:"
echo "    - composio"
