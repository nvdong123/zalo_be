import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '../../api';

export interface DashboardStats {
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
  active_customers: number;
  pending_bookings: number;
  low_stock_alerts: number;
  recent_bookings: Array<{
    id: number;
    customer_name: string;
    room_name: string;
    check_in_date: string;
    total_amount: number;
  }>;
}

// Dashboard stats using the new reports API
export function useDashboardStats(period?: string) {
  return useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: () => reportsAPI.getDashboardStats({ period }),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Additional dashboard hooks for detailed reports
export function useBookingReport(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: ['booking-report', params],
    queryFn: () => reportsAPI.getBookingReport(params),
    enabled: !!params.start_date && !!params.end_date,
    staleTime: 300000, // 5 minutes
  });
}

export function useRevenueReport(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: ['revenue-report', params],
    queryFn: () => reportsAPI.getRevenueReport(params),
    enabled: !!params.start_date && !!params.end_date,
    staleTime: 300000, // 5 minutes
  });
}

export function useOccupancyReport(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: ['occupancy-report', params],
    queryFn: () => reportsAPI.getOccupancyReport(params),
    enabled: !!params.start_date && !!params.end_date,
    staleTime: 300000, // 5 minutes
  });
}
