#!/bin/bash

# Setup git post-commit hook for automatic version bumping

HOOK_FILE=".git/hooks/post-commit"

cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Automatically bump build version after each commit

# Run the version bump script
npm run version:bump

# Add the updated files
git add version.json package.json package-lock.json

# Amend the commit to include version bump (without triggering hook again)
git commit --amend --no-edit --no-verify
EOF

chmod +x "$HOOK_FILE"

echo "Git post-commit hook installed successfully!"
echo "Build version will automatically increment after each commit."