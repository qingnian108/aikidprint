/**
 * 支付服务 - Google Play 内购
 * 
 * 注意：实际使用前需要配置 Google Play Console 产品
 */

// TODO: 安装 react-native-iap 后取消注释
// import * as RNIap from 'react-native-iap';

const PRODUCT_IDS = {
  PRO_MONTHLY: 'com.aikidprint.pro.monthly',
  PRO_YEARLY: 'com.aikidprint.pro.yearly',
};

export const paymentService = {
  /**
   * 初始化支付连接
   */
  initConnection: async (): Promise<boolean> => {
    try {
      // await RNIap.initConnection();
      console.log('Payment connection initialized');
      return true;
    } catch (error) {
      console.error('Failed to init payment connection:', error);
      return false;
    }
  },

  /**
   * 获取产品信息
   */
  getProducts: async () => {
    try {
      // const products = await RNIap.getProducts({ skus: Object.values(PRODUCT_IDS) });
      // return products;
      return [];
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  },

  /**
   * 购买订阅
   */
  purchaseSubscription: async (productId: string): Promise<boolean> => {
    try {
      // await RNIap.requestSubscription({ sku: productId });
      console.log('Purchase requested:', productId);
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  },

  /**
   * 恢复购买
   */
  restorePurchases: async (): Promise<boolean> => {
    try {
      // const purchases = await RNIap.getAvailablePurchases();
      // return purchases.length > 0;
      return false;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  },

  /**
   * 结束连接
   */
  endConnection: async (): Promise<void> => {
    try {
      // await RNIap.endConnection();
      console.log('Payment connection ended');
    } catch (error) {
      console.error('Failed to end connection:', error);
    }
  },
};

export default paymentService;
