#!/bin/bash

echo "=== CG Analytics Network Access Check ==="
echo
echo "1. Server Network Configuration:"
echo "   Private IP: $(hostname -I | awk '{print $1}')"
echo "   Public IP: $(curl -s http://checkip.amazonaws.com || echo 'Unable to determine')"
echo

echo "2. Service Status:"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   Backend: $(pm2 status | grep cg-analytics-backend | awk '{print $10}')"
echo

echo "3. Listening Ports:"
ss -tlnp 2>/dev/null | grep -E ':(80|443|5000)' | grep -v 127.0.0.1 | awk '{print "   "$1" "$4}'
echo

echo "4. Local Access Test:"
if curl -k -s https://localhost/health >/dev/null 2>&1; then
    echo "   ✓ HTTPS access working locally"
else
    echo "   ✗ HTTPS access NOT working locally"
fi
echo

echo "5. External Access:"
echo "   To enable access from other computers, configure your AWS Security Group:"
echo "   - Add inbound rule for HTTP (port 80)"
echo "   - Add inbound rule for HTTPS (port 443)"
echo "   - Set source to your IP range or 0.0.0.0/0 for all (not recommended for production)"
echo

echo "6. Access URLs once configured:"
echo "   Internal (VPC): https://$(hostname -I | awk '{print $1}')/"
echo "   External: https://$(curl -s http://checkip.amazonaws.com || echo 'PUBLIC-IP')/"
echo

echo "7. Login Credentials:"
echo "   Email: admin@cg.com"
echo "   Password: password123"
echo

echo "=== Configuration file created: /home/ec2-user/CG-Analytics2/NETWORK_ACCESS.md ==="