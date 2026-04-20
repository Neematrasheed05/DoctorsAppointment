
"use client";

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  LogOut,
  Settings,
  Bell,
  User,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalPatients: number;
  unreadMessages: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

interface RecentAppointment {
  id: string;
  fullName: string;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit: string;
  status: string;
  phone: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
        setRecentAppointments(data.recentAppointments);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Dr Sitna Mwanzi Oncology Clinic</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{session.user?.name || session.user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-6">
            <Button variant="ghost" className="bg-pink-50 text-pink-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Link href="/admin/appointments">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Calendar className="w-4 h-4 mr-2" />
                Appointments
              </Button>
            </Link>
            <Link href="/admin/patients">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Users className="w-4 h-4 mr-2" />
                Patients
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </Link>
            <Link href="/admin/availability">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats && [
            {
              title: 'Total Appointments',
              value: stats.totalAppointments,
              icon: Calendar,
              color: 'text-blue-600',
              bg: 'bg-blue-50'
            },
            {
              title: 'Pending Approvals',
              value: stats.pendingAppointments,
              icon: Clock,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50'
            },
            {
              title: 'Today\'s Appointments',
              value: stats.todayAppointments,
              icon: CheckCircle,
              color: 'text-green-600',
              bg: 'bg-green-50'
            },
            {
              title: 'Unread Messages',
              value: stats.unreadMessages,
              icon: MessageCircle,
              color: 'text-red-600',
              bg: 'bg-red-50'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-pink-600" />
                  Recent Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{appointment.fullName}</p>
                        <p className="text-sm text-gray-600 mb-1">
                          {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{appointment.reasonForVisit}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentAppointments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent appointments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-pink-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/admin/appointments" className="block">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Appointments
                    </Button>
                  </Link>
                  <Link href="/admin/patients" className="block">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                      <Users className="w-4 h-4 mr-2" />
                      Patient Database
                    </Button>
                  </Link>
                  <Link href="/admin/messages" className="block">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Respond to Messages
                    </Button>
                  </Link>
                  <Link href="/admin/availability" className="block">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                      <Clock className="w-4 h-4 mr-2" />
                      Manage Availability
                    </Button>
                  </Link>
                  <Link href="/admin/reminders" className="block">
                    <Button variant="outline" className="w-full justify-start hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300">
                      <Bell className="w-4 h-4 mr-2" />
                      Send Reminders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Clinic Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.cancelledAppointments}</p>
                    <p className="text-sm text-gray-600">Cancelled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
                    <p className="text-sm text-gray-600">Total Patients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{stats.upcomingAppointments}</p>
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Dr Sitna Mwanzi Oncology Clinic - Admin Dashboard</p>
          <p>Contact: 0717333452 | PMC Building, 6th Floor, 3rd Parklands, Nairobi</p>
        </div>
      </div>
    </div>
  );
}
