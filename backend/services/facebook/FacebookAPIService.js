// Placeholder FacebookAPIService
class FacebookAPIService {
  constructor() {
    this.initialized = false;
  }

  async initialize(siteId) {
    this.initialized = true;
    return this;
  }
}

module.exports = FacebookAPIService;