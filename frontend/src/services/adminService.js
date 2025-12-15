import api from "../lib/axios";

const adminService = {
  getStats: () => api.get("/admin/stats"),
  getListings: () => api.get("/admin/listings"),
  updateListingStatus: (id, status) => api.put(`/admin/listings/${id}/status`, { status }),
  getUsers: () => api.get("/admin/users"),
  toggleBanUser: (id, ban) => api.put(`/admin/users/${id}/ban`, { ban }),
  broadcast: (title, message, type = 'info', audience = 'all') => api.post('/admin/broadcast', { title, message, type, audience }),
  getNotifications: () => api.get('/admin/notifications'),
  getUserSignupsLast7Days: () => api.get('/admin/stats/users-7days'),
  getPropertyStatusDistribution: () => api.get('/admin/stats/properties-status'),
};

export default adminService;
