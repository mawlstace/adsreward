// services/AdService.js
// Dynamic advertisement service for AdRewards app
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fixed placeholder URL pattern that works with Expo
const getPlaceholderImage = (text) => {
  return `https://placehold.co/300x200/e0e0e0/333333?text=${encodeURIComponent(text)}`;
};

// More comprehensive ad data structure with fixed placeholder images
const SAMPLE_ADS = [
  { 
    id: '1', 
    title: 'Nike Running Shoes', 
    company: 'Nike', 
    category: 'Sports', 
    tags: ['Shoes', 'Running', 'Athletic'], 
    duration: 30, // in seconds
    reward: '15% OFF',
    promoCode: 'NIKE15RUN',
    description: 'Discover our latest running shoes designed for maximum comfort and performance.',
    thumbnail: getPlaceholderImage('Nike Shoes'),
    popularity: 0.8, // 0-1 scale to prioritize ads
    viewLimit: 3, // how many times this ad can be viewed by the same user
  },
  { 
    id: '2', 
    title: 'New Coffee Blend', 
    company: 'Starbucks', 
    category: 'Food', 
    tags: ['Coffee', 'Beverages', 'Hot Drinks'], 
    duration: 15,
    reward: 'Buy 1 Get 1 Free',
    promoCode: 'SBUX2FOR1',
    description: 'Try our new seasonal coffee blend with notes of chocolate and caramel.',
    thumbnail: getPlaceholderImage('Starbucks'),
    popularity: 0.7,
    viewLimit: 2,
  },
  { 
    id: '3', 
    title: 'Wireless Headphones', 
    company: 'Sony', 
    category: 'Electronics', 
    tags: ['Audio', 'Wireless', 'Tech'], 
    duration: 45,
    reward: '$10 OFF',
    promoCode: 'SONY10OFF',
    description: 'Experience premium sound quality with our latest wireless headphones.',
    thumbnail: getPlaceholderImage('Sony Headphones'),
    popularity: 0.9,
    viewLimit: 1,
  },
  { 
    id: '4', 
    title: 'Premium Subscription', 
    company: 'Spotify', 
    category: 'Entertainment', 
    tags: ['Music', 'Streaming', 'Premium'], 
    duration: 20,
    reward: '1 Month Free',
    promoCode: 'SPOT1MONTH',
    description: 'Enjoy ad-free music streaming, offline listening, and unlimited skips.',
    thumbnail: getPlaceholderImage('Spotify'),
    popularity: 0.85,
    viewLimit: 2,
  },
  { 
    id: '5', 
    title: 'Online Course', 
    company: 'Udemy', 
    category: 'Education', 
    tags: ['Learning', 'Online', 'Skills'], 
    duration: 60,
    reward: '30% OFF',
    promoCode: 'UDEMY30OFF',
    description: 'Expand your skills with our most popular courses at a special discount.',
    thumbnail: getPlaceholderImage('Udemy Course'),
    popularity: 0.6,
    viewLimit: 1,
  },
  { 
    id: '6', 
    title: 'Smart Watch', 
    company: 'Apple', 
    category: 'Electronics', 
    tags: ['Wearables', 'Tech', 'Fitness'], 
    duration: 45,
    reward: '10% OFF',
    promoCode: 'APPLEWATCH10',
    description: 'Track your fitness, answer calls, and check notifications - all from your wrist.',
    thumbnail: getPlaceholderImage('Apple Watch'),
    popularity: 0.95,
    viewLimit: 1,
  },
  { 
    id: '7', 
    title: 'Meal Delivery', 
    company: 'HelloFresh', 
    category: 'Food', 
    tags: ['Meals', 'Cooking', 'Subscription'], 
    duration: 30,
    reward: '$15 OFF First Box',
    promoCode: 'HELLOFRESH15',
    description: 'Delicious recipes and fresh ingredients delivered to your door weekly.',
    thumbnail: getPlaceholderImage('HelloFresh'),
    popularity: 0.75,
    viewLimit: 2,
  },
  { 
    id: '8', 
    title: 'Gaming Console', 
    company: 'Microsoft', 
    category: 'Entertainment', 
    tags: ['Gaming', 'Tech', 'Console'], 
    duration: 60,
    reward: 'Free Game Pass (1 month)',
    promoCode: 'XBOXGAMEPASS',
    description: 'Experience next-gen gaming with the most powerful console ever made.',
    thumbnail: getPlaceholderImage('Xbox'),
    popularity: 0.85,
    viewLimit: 1,
  },
  { 
    id: '9', 
    title: 'Gym Membership', 
    company: 'Fitness First', 
    category: 'Sports', 
    tags: ['Fitness', 'Gym', 'Health'], 
    duration: 30,
    reward: '50% OFF First Month',
    promoCode: 'FIT50OFF',
    description: 'State-of-the-art equipment, expert trainers, and classes for all fitness levels.',
    thumbnail: getPlaceholderImage('Fitness First'),
    popularity: 0.65,
    viewLimit: 1,
  },
  { 
    id: '10', 
    title: 'Language Learning App', 
    company: 'Duolingo', 
    category: 'Education', 
    tags: ['Language', 'Learning', 'App'], 
    duration: 20,
    reward: '3 Months Premium',
    promoCode: 'DUOLINGO3MO',
    description: 'Learn over 30 languages with fun, bite-sized lessons that feel like a game.',
    thumbnail: getPlaceholderImage('Duolingo'),
    popularity: 0.8,
    viewLimit: 2,
  },
];

// Storage keys
const VIEWED_ADS_KEY = 'viewedAds';
const RECENTLY_VIEWED_KEY = 'recentlyViewed';

class AdService {
  // Get all available ad categories
  getAllCategories() {
    const categories = new Set();
    // Add All category with id 0
    categories.add('All');
    // Add other categories from ads
    SAMPLE_ADS.forEach(ad => categories.add(ad.category));
    return Array.from(categories).map((name, index) => ({ id: index.toString(), name }));
  }
  
  // Get all available tags
  getAllTags() {
    const tags = new Set();
    SAMPLE_ADS.forEach(ad => {
      if (ad.tags && Array.isArray(ad.tags)) {
        ad.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }
  
  // Get ad by ID
  async getAdById(adId) {
    // In a real app, this would be a network request
    return SAMPLE_ADS.find(ad => ad.id === adId) || null;
  }
  
  // Get filtered ads based on category, tags, and user interests
  async getFilteredAds(category = 'All', selectedTags = [], userInterests = []) {
    try {
      // First, get the view count for each ad
      const viewedAdsMap = await this.getViewedAdsCount();
      
      // Get recently viewed ads (to temporarily exclude them)
      const recentlyViewed = await this.getRecentlyViewedAds();
      const recentlyViewedIds = new Set(recentlyViewed);
      
      // Start with all ads if category is "All"
      let filteredAds = [...SAMPLE_ADS];
      
      // If not "All" category, filter by selected category
      if (category !== 'All') {
        filteredAds = filteredAds.filter(ad => ad.category === category);
      }
      
      // Apply tag filtering if tags are selected
      if (selectedTags.length > 0) {
        filteredAds = filteredAds.filter(ad => 
          selectedTags.some(tag => ad.tags?.includes(tag))
        );
      }
      
      // Apply interest filtering only if: 
      // 1. We're not in "All" category AND 
      // 2. We have user interests AND
      // 3. We want to filter by interests
      if (category === 'All' && userInterests.length > 0) {
        // In "All" category, prioritize ads that match interests but don't exclude others
        // First show the ads that match interests, then show the rest
        const matchingInterestsAds = filteredAds.filter(ad => 
          userInterests.includes(ad.category) || 
          ad.tags?.some(tag => userInterests.includes(tag))
        );
        
        const otherAds = filteredAds.filter(ad => 
          !userInterests.includes(ad.category) && 
          !ad.tags?.some(tag => userInterests.includes(tag))
        );
        
        // Combine with matching ads first, then other ads
        filteredAds = [...matchingInterestsAds, ...otherAds];
      }
      
      // Filter out ads that have reached their view limit
      filteredAds = filteredAds.filter(ad => {
        const timesViewed = viewedAdsMap[ad.id] || 0;
        return timesViewed < (ad.viewLimit || 3); // Default to 3 if not specified
      });
      
      // Move recently viewed ads to the end
      filteredAds.sort((a, b) => {
        const aRecentlyViewed = recentlyViewedIds.has(a.id);
        const bRecentlyViewed = recentlyViewedIds.has(b.id);
        
        if (aRecentlyViewed && !bRecentlyViewed) return 1;
        if (!aRecentlyViewed && bRecentlyViewed) return -1;
        
        // If both are recently viewed or neither is, sort by popularity
        return (b.popularity || 0) - (a.popularity || 0);
      });
      
      // Add formatted duration string
      filteredAds = filteredAds.map(ad => ({
        ...ad,
        durationStr: `${ad.duration}s`
      }));
      
      return filteredAds;
    } catch (error) {
      console.error('Error fetching filtered ads:', error);
      return [];
    }
  }
  
  // Track ad views
  async trackAdView(adId) {
    try {
      // 1. Update view count
      const viewedAdsMap = await this.getViewedAdsCount();
      viewedAdsMap[adId] = (viewedAdsMap[adId] || 0) + 1;
      await AsyncStorage.setItem(VIEWED_ADS_KEY, JSON.stringify(viewedAdsMap));
      
      // 2. Update recently viewed list (keep last 5)
      let recentlyViewed = await this.getRecentlyViewedAds();
      // Remove the ad if it's already in the list
      recentlyViewed = recentlyViewed.filter(id => id !== adId);
      // Add to the beginning
      recentlyViewed.unshift(adId);
      // Keep only the last 5
      recentlyViewed = recentlyViewed.slice(0, 5);
      await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
      
      console.log(`Tracked view for ad ${adId}`);
    } catch (error) {
      console.error('Error tracking ad view:', error);
    }
  }
  
  // Get the view count for each ad
  async getViewedAdsCount() {
    try {
      const viewedAdsStr = await AsyncStorage.getItem(VIEWED_ADS_KEY);
      return viewedAdsStr ? JSON.parse(viewedAdsStr) : {};
    } catch (error) {
      console.error('Error getting viewed ads count:', error);
      return {};
    }
  }
  
  // Get recently viewed ads
  async getRecentlyViewedAds() {
    try {
      const recentlyViewedStr = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
      return recentlyViewedStr ? JSON.parse(recentlyViewedStr) : [];
    } catch (error) {
      console.error('Error getting recently viewed ads:', error);
      return [];
    }
  }
  
  // Reset viewed ads (for testing)
  async resetViewedAds() {
    try {
      await AsyncStorage.removeItem(VIEWED_ADS_KEY);
      await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
      console.log('Reset viewed ads');
    } catch (error) {
      console.error('Error resetting viewed ads:', error);
    }
  }
}

export default new AdService();