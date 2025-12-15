import api from "../lib/axios";

const adminService = {
  getStats: () => api.get("/admin/stats"),
  getListings: (params = {}) => api.get("/admin/listings", { params }),
  updateListingStatus: (id, status) => api.put(`/admin/listings/${id}/status`, { status }),
  getUsers: () => api.get("/admin/users"),
  toggleBanUser: (id, ban) => api.put(`/admin/users/${id}/ban`, { ban }),
  broadcast: (title, message, type = 'info', audience = 'all') => api.post('/admin/broadcast', { title, message, type, audience }),
  getNotifications: () => api.get('/admin/notifications'),
  getUserSignupsLast7Days: () => api.get('/admin/stats/users-7days'),
  getPropertyStatusDistribution: () => api.get('/admin/stats/properties-status'),
  getListingsLast7Days: () => api.get('/admin/stats/listings-7days'),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`),
  getReports: (page = 1, limit = 50) => api.get(`/admin/reports?page=${page}&limit=${limit}`),
  resolveReport: (id, status) => api.put(`/admin/reports/${id}/resolve`, { status }),
  actionOnReport: (id, action) => api.post(`/admin/reports/${id}/action`, { action }),
  getAdminActions: (page = 1, limit = 50) => api.get(`/admin/actions?page=${page}&limit=${limit}`),
};

export default adminService;
