import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach CSRF cookie if present
client.interceptors.request.use((config) => {
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  const csrftoken = getCookie('csrftoken');
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  return config;
});

export const api = {
  // Authentication & Users
  login: (credentials) => client.post('/accounts/auth/login/', credentials),
  register: (userData) => client.post('/accounts/auth/register/', userData),
  logout: () => client.post('/accounts/auth/logout/'),
  getProfile: () => client.get('/accounts/auth/profile/'),
  updateProfile: (data) => client.patch('/accounts/auth/profile/', data),
  getAllUsers: (params) => client.get('/accounts/auth/users/', { params }),

  // Accounts & Cash Flow
  getAccounts: (params) => client.get('/accounts/accounts/', { params }),
  depositFunds: (accountId, data) => client.post(`/accounts/accounts/${accountId}/deposit/`, data),
  withdrawFunds: (accountId, data) => client.post(`/accounts/accounts/${accountId}/withdraw/`, data),
  getTransactions: (params) => client.get('/accounts/transactions/', { params }),

  // Market Data (Stocks & Watchlists)
  getStocks: (params) => client.get('/stocks/stocks/', { params }),
  getStockDetail: (symbol) => client.get(`/stocks/stocks/${symbol}/`),
  getStockHistory: (symbol, days = 30) => client.get(`/stocks/stocks/${symbol}/history/`, { params: { days } }),
  getWatchlists: () => client.get('/stocks/watchlists/'),
  createWatchlist: (data) => client.post('/stocks/watchlists/', data),
  addToWatchlist: (watchlistId, symbol) => client.post(`/stocks/watchlists/${watchlistId}/add_stock/`, { symbol }),
  removeFromWatchlist: (watchlistId, symbol) => client.post(`/stocks/watchlists/${watchlistId}/remove_stock/`, { symbol }),

  // Trading Engine
  getOrders: (params) => client.get('/trading/orders/', { params }),
  placeOrder: (orderData) => client.post('/trading/orders/', orderData),
  cancelOrder: (orderId) => client.post(`/trading/orders/${orderId}/cancel/`),
  getExecutions: (params) => client.get('/trading/executions/', { params }),

  // Portfolio Management
  getHoldings: (params) => client.get('/portfolio/holdings/', { params }),
  getPortfolioSummary: (params) => client.get('/portfolio/summary/', { params }),
  getPortfolioSnapshots: () => client.get('/portfolio/snapshots/'),

  // Risk Management
  getRiskMetrics: (params) => client.get('/risk/metrics/', { params }),
  getRiskAudit: (params) => client.get('/risk/audit/', { params }),
  getRiskLimits: () => client.get('/risk/limits/'),
  createRiskLimit: (data) => client.post('/risk/limits/', data),

  // Technical & Fundamental Analysis
  getTechnicalAnalysis: (symbol) => client.get(`/analysis/technical/${symbol}/`),
  getFundamentals: (params) => client.get('/analysis/fundamentals/', { params }),
  getFundamentalDetail: (symbol) => client.get(`/analysis/fundamentals/${symbol}/detail/`),

  // Notifications & Alerts
  getNotifications: (params) => client.get('/notifications/notifications/', { params }),
  markNotificationRead: (id) => client.post(`/notifications/notifications/${id}/mark_as_read/`),
  markAllNotificationsRead: () => client.post('/notifications/notifications/mark_all_as_read/'),
  getPriceAlerts: () => client.get('/notifications/alerts/'),
  createPriceAlert: (data) => client.post('/notifications/alerts/', data),
  deletePriceAlert: (id) => client.delete(`/notifications/alerts/${id}/`),

  // Customer Support
  getTickets: (params) => client.get('/support/tickets/', { params }),
  createTicket: (data) => client.post('/support/tickets/', data),
  getTicketDetail: (ticketNumber) => client.get(`/support/tickets/${ticketNumber}/`),
  addTicketMessage: (ticketNumber, data) => client.post(`/support/tickets/${ticketNumber}/add_message/`, data),
  updateTicketStatus: (ticketNumber, data) => client.post(`/support/tickets/${ticketNumber}/update_status/`, data),
};

export default api;
