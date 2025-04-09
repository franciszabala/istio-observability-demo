#!/bin/bash

# Default kubectl command (can be overridden by env var or CLI arg)
KUBECTL_CMD="${1:-${KUBECTL_CMD:-kubectl}}"

# Get the external IP of istio-ingressgateway
ISTIO_IP=$($KUBECTL_CMD get svc istio-ingressgateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$ISTIO_IP" ]; then
    echo "❌ Could not retrieve Istio ingress IP. Is the LoadBalancer ready?"
    exit 1
fi

# Hosts file
HOSTS_FILE="/etc/hosts"
BACKUP_FILE="/etc/hosts.bak"

# Host entries
read -r -d '' HOST_ENTRIES <<EOF
# Subdomains START
$ISTIO_IP    palaven.citadelnet.local
$ISTIO_IP    tuchanka.citadelnet.local
$ISTIO_IP    surkesh.citadelnet.local
$ISTIO_IP    rannoch.citadelnet.local
# Subdomains END
EOF

# Backup hosts file
sudo cp "$HOSTS_FILE" "$BACKUP_FILE"
echo "🛡️  Backed up /etc/hosts to $BACKUP_FILE"

# Remove any existing block
sudo sed -i '/# Subdomains START/,/# Subdomains END/d' "$HOSTS_FILE"

# Add new entries
echo "$HOST_ENTRIES" | sudo tee -a "$HOSTS_FILE" > /dev/null

echo "✅ Updated /etc/hosts with Istio IP $ISTIO_IP using command: $KUBECTL_CMD"
