# CG-Analytics Project Documentation

## Repository Information
- **Repository URL**: git@github.com:snwbrdr78/CG-Analytics2.git
- **Repository Type**: SSH-based GitHub repository
- **Initial Setup Date**: 2025-07-17

## Project Overview
*[To be documented as the project develops]*

## Architecture
*[To be documented as the project develops]*

## Key Components
*[To be documented as the project develops]*

## Development Guidelines
### Code Version Requirements
- **Always use the latest version** of programming languages and frameworks
- **Update development tools** to their latest stable versions
- **Check compatibility** before updating to ensure all tools work together
- **Document version requirements** in project configuration files

### Technology Stack Versions
- Use the latest stable versions of all chosen technologies
- Document the minimum required versions
- Test compatibility when updating any component
- Keep development and production environments in sync

## Testing Strategy
*[To be documented as the project develops]*

## Build and Deployment
*[To be documented as the project develops]*

## API Documentation
*[To be documented as the project develops]*

## Environment Variables
*[To be documented as the project develops]*

## Dependencies
*[To be documented as the project develops]*

### Dependency Management Guidelines
- **Always use the latest stable versions** of all dependencies
- **Check for updates regularly** before adding new features
- **Security updates** must be applied immediately
- **Version pinning** should be exact to ensure consistency
- **Automated dependency updates** should be configured where possible

### Version Selection Criteria
1. **Latest Stable Release**: Always choose the latest stable version unless there's a specific compatibility issue
2. **LTS Versions**: For critical dependencies, prefer Long Term Support versions
3. **Security Patches**: Apply security patches immediately, even if it means updating to a newer version
4. **Breaking Changes**: Document any breaking changes when updating major versions

## Versioning Strategy
### Semantic Versioning
This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): Backwards-compatible functionality additions
- **PATCH** version (0.0.X): Backwards-compatible bug fixes

### Version Tags
- Development versions: `v0.0.X-dev`
- Alpha releases: `v0.X.0-alpha`
- Beta releases: `v0.X.0-beta`
- Release candidates: `v0.X.0-rc.1`
- Production releases: `vX.X.X`

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Emergency fixes
- `release/*`: Release preparation

## Common Commands
```bash
# Git operations
git add .
git commit -m "Your commit message"
git push origin main

# Version tagging
git tag -a v0.0.1 -m "Version 0.0.1: Initial setup"
git push origin v0.0.1

# Branch management
git checkout -b feature/new-feature
git checkout -b bugfix/fix-issue
git checkout -b release/v1.0.0
```

## Version History
### v0.0.1 (2025-07-17)
- Initial repository setup
- Created CLAUDE.md documentation
- Established versioning strategy

### Upcoming Versions
*[To be documented as releases are planned]*

## Changelog Format
Each version entry should include:
- Version number and date
- Added features
- Changed functionality
- Deprecated features
- Removed features
- Fixed bugs
- Security updates

## Commit Message Convention
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## Troubleshooting
*[To be documented as issues arise]*

## Contributing Guidelines
*[To be documented as the project develops]*

## Notes for AI Assistants
- This is a new project starting from scratch
- All code should be well-documented and follow best practices
- Regular commits should be made as features are developed
- The project structure should be kept clean and organized
- Follow semantic versioning for all releases
- Document all changes in the version history
- Use conventional commit messages
- Tag releases appropriately in git
- **ALWAYS use the latest stable versions** of all languages, frameworks, and dependencies
- **Check for the most recent version** before implementing any feature
- **Update existing code** to use newer syntax and features when appropriate
- **Document version choices** and any compatibility considerations