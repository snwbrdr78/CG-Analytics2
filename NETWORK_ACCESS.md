# Network Access Configuration for CG Analytics

## Current Status
- Application is running and listening on all interfaces (0.0.0.0)
- Nginx is serving on ports 80 (HTTP) and 443 (HTTPS)
- No local firewall is blocking access
- Server IP: 172.31.20.69 (private IP within VPC)

## To Enable Access from Other Computers

### For AWS EC2 Instances:
You need to configure the Security Group in AWS Console:

1. **Go to EC2 Console**:
   - Navigate to EC2 Dashboard
   - Click on your instance
   - Find the "Security" tab
   - Click on the Security Group link

2. **Edit Inbound Rules** - Add these rules:
   ```
   Type: HTTP
   Protocol: TCP
   Port: 80
   Source: Your network CIDR (e.g., 192.168.1.0/24) or 0.0.0.0/0 for all
   
   Type: HTTPS  
   Protocol: TCP
   Port: 443
   Source: Your network CIDR (e.g., 192.168.1.0/24) or 0.0.0.0/0 for all
   ```

3. **For Home/Office Network Access**:
   - If accessing from home: Use your public IP/32 (you can find it at whatismyip.com)
   - If accessing from office: Use your office network CIDR range
   - For temporary testing: Use 0.0.0.0/0 (allows all - NOT recommended for production)

### Access URLs:
Once security group is configured, access the app using:
- **From within VPC**: https://172.31.20.69/
- **From internet**: https://[EC2-PUBLIC-IP]/
  
### Login Credentials:
- Email: admin@cg.com
- Password: password123

### SSL Certificate Warning:
The site uses a self-signed certificate. You'll need to:
1. Accept the security warning in your browser
2. Click "Advanced" and "Proceed to site"

## Security Recommendations:
1. Use specific IP ranges instead of 0.0.0.0/0
2. Consider using a proper SSL certificate (Let's Encrypt)
3. Set up a domain name instead of using IP addresses
4. Enable AWS CloudWatch monitoring
5. Consider using an Application Load Balancer for better security

## Troubleshooting:
If you can't access the site after configuring security group:
1. Verify instance has a public IP (if accessing from internet)
2. Check that the instance is in a public subnet
3. Verify Internet Gateway is attached to the VPC
4. Check Route Table has route to Internet Gateway