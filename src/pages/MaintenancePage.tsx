import { useState } from 'react';
import { Plus, Search, AlertCircle, Clock, CheckCircle, Wrench } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { useMaintenanceRequests } from '@/hooks/useMaintenance';
import ReportMaintenanceDialog from '@/components/forms/ReportMaintenanceDialog';

export default function MaintenancePage() {
  const { data: requests = [], isLoading: loading } = useMaintenanceRequests();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const openCount = requests.filter(r => r.status === 'open').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved' || r.status === 'closed').length;
  const highPriorityCount = requests.filter(r => r.priority === 'high' || r.priority === 'urgent').length;

  const filtered = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search && !r.issue.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': case 'urgent': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'resolved': case 'closed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-semibold text-2xl mb-2">Maintenance Requests</h1>
          <p className="text-muted-foreground">Track and manage maintenance issues</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-700 text-sm font-medium">Open</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-heading font-semibold text-orange-700">{openCount}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-700 text-sm font-medium">In Progress</p>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-heading font-semibold text-blue-700">{inProgressCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-700 text-sm font-medium">Resolved</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-heading font-semibold text-green-700">{resolvedCount}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-700 text-sm font-medium">High Priority</p>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-heading font-semibold text-red-700">{highPriorityCount}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold mb-2">No Requests Found</h3>
          <p className="text-muted-foreground">All clear! No maintenance requests to show.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((request) => (
            <div key={request.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold mb-1">{request.issue}</h3>
                    {request.description && (
                      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={request.status} />
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
                {request.resolved_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Resolved</span>
                    <span>{new Date(request.resolved_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
