class CommerceModule {
  constructor(config) {
    this.apiService = config.apiService;
    this.siteId = config.siteId;
    this.accessToken = config.accessToken;
    this.instagramUserId = config.instagramUserId;
  }

  async getProducts(options = {}) {
    try {
      const { limit = 25 } = options;
      
      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/catalog_product_search`, {
        catalog_id: options.catalogId || 'default',
        limit
      });

      return {
        products: response.data || [],
        hasNextPage: !!response.paging?.next
      };
    } catch (error) {
      console.error('Error getting Instagram products:', error);
      throw error;
    }
  }

  async tagProductsInMedia(mediaId, productTags) {
    try {
      const response = await this.apiService.makeRequest(`/${mediaId}/product_tags`, {
        product_tags: productTags
      }, 'POST');

      return { success: true, tagged: productTags.length };
    } catch (error) {
      console.error('Error tagging products in Instagram media:', error);
      throw error;
    }
  }

  async getShoppingInsights(options = {}) {
    try {
      const { period = 'day' } = options;
      
      const response = await this.apiService.makeRequest(`/${this.instagramUserId}/insights`, {
        metric: 'shopping_product_clicks,shopping_outbound_clicks',
        period
      });

      return response.data || [];
    } catch (error) {
      console.error('Error getting Instagram shopping insights:', error);
      throw error;
    }
  }
}

module.exports = CommerceModule;