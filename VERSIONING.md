# Versioning Guidelines for Comedy Genius Analytics

## Semantic Versioning Schema

This project follows **Semantic Versioning** with a specific interpretation:

```
X.Y.Z
│ │ └── Build Number (Patch)
│ └──── Minor Version (Features)
└────── Major Version (Breaking Changes)
```

### Version Components

1. **Major Version (X)**: Incremented for breaking changes
   - API changes that are not backward compatible
   - Database schema changes requiring migration
   - Removal of features
   - Changes to configuration format

2. **Minor Version (Y)**: Incremented for new features
   - New endpoints or functionality
   - New UI components or pages
   - New configuration options (backward compatible)
   - Performance improvements

3. **Build Number (Z)**: Total number of commits
   - **IMPORTANT**: This is NOT a patch version
   - Always equals the total commit count: `git rev-list --count HEAD`
   - Automatically increments with every commit
   - Never manually set or reset

## Version Update Process

### Automatic Build Number
The build number (Z) is **always** the total number of commits and should be updated using:

```bash
# Get the current commit count
BUILD_NUMBER=$(git rev-list --count HEAD)

# After making a commit, increment by 1
NEW_BUILD_NUMBER=$((BUILD_NUMBER + 1))

# Version format: X.Y.BUILD_NUMBER
```

### When to Update Versions

1. **Before Every Commit**:
   - Update all package.json files with the new build number
   - Keep versions synchronized across:
     - `/package.json`
     - `/backend/package.json`
     - `/frontend/package.json`

2. **Minor Version Bump**:
   - When adding new features
   - Reset consideration: Minor version increments don't reset the build number

3. **Major Version Bump**:
   - When making breaking changes
   - Reset consideration: Major version increments don't reset the build number

## Examples

```
Initial release:        1.0.0   (0 commits)
First commit:          1.0.1   (1 commit)
Add new feature:       1.1.2   (2 commits)
Another commit:        1.1.3   (3 commits)
Breaking change:       2.0.4   (4 commits)
Bug fix:              2.0.5   (5 commits)
```

## Updating Version Numbers

### Manual Update
```bash
# Get current build number
BUILD=$(git rev-list --count HEAD)
NEXT_BUILD=$((BUILD + 1))

# Update all package.json files
# Example for minor feature update:
# Current: 1.0.18 → New: 1.1.19
```

### Using npm version (NOT RECOMMENDED)
Do not use `npm version` as it doesn't follow our build number convention.

## Version Sync Script

Create a script to keep versions synchronized:

```bash
#!/bin/bash
# scripts/sync-version.sh

# Get the next build number
BUILD=$(($(git rev-list --count HEAD) + 1))

# Extract major.minor from root package.json
MAJOR_MINOR=$(node -p "require('./package.json').version.split('.').slice(0,2).join('.')")

# New version
VERSION="${MAJOR_MINOR}.${BUILD}"

# Update all package.json files
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" backend/package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" frontend/package.json

echo "Version updated to $VERSION"
```

## Pre-commit Hook

To ensure versions are always updated, add this git hook:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Get the next build number
BUILD=$(($(git rev-list --count HEAD) + 1))

# Check if version needs updating
CURRENT_VERSION=$(node -p "require('./package.json').version")
EXPECTED_BUILD=$(echo $CURRENT_VERSION | cut -d. -f3)

if [ "$EXPECTED_BUILD" -ne "$BUILD" ]; then
    echo "ERROR: Version build number mismatch!"
    echo "Expected build number: $BUILD"
    echo "Current version: $CURRENT_VERSION"
    echo "Please update version numbers before committing."
    exit 1
fi
```

## CHANGELOG.md Format

When updating CHANGELOG.md, use the full version including build number:

```markdown
## [1.1.18] - 2025-01-18
### Added
- New feature description
```

## Important Notes

1. **Never Reset Build Numbers**: The build number represents the total commit count and should never be reset
2. **Always Sync Versions**: All three package.json files must have identical version numbers
3. **Commit Version Updates**: Version updates should be included in the commit that increments the build number
4. **Document Version Changes**: Update CHANGELOG.md with every version change

## Quick Reference

```bash
# Check current commit count
git rev-list --count HEAD

# Check current version
node -p "require('./package.json').version"

# Update for new feature (example: 1.0.18 → 1.1.19)
# 1. Increment minor version
# 2. Set build to commit count + 1
# 3. Update all package.json files
# 4. Update CHANGELOG.md
# 5. Commit changes
```

## Troubleshooting

**Q: The build number seems wrong**
A: Always use `git rev-list --count HEAD` to get the correct build number.

**Q: Versions are out of sync**
A: Run the sync script or manually update all three package.json files.

**Q: When should I increment major/minor versions?**
A: Major for breaking changes, minor for new features. Build number always increments.

---

By following these guidelines, version numbers will accurately reflect the project's development history and maintain consistency across all components.