"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Plane,
  Ban,
  CalendarX
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AvailabilitySlot {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface UnavailabilityEntry {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
}

const defaultAvailability: AvailabilitySlot[] = [
  { day: 'Monday', enabled: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Tuesday', enabled: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Wednesday', enabled: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Thursday', enabled: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Friday', enabled: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Saturday', enabled: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Sunday', enabled: false, startTime: '08:00', endTime: '17:00' },
];

export default function AvailabilityPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(defaultAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Unavailability state
  const [unavailabilityList, setUnavailabilityList] = useState<UnavailabilityEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingEntry, setAddingEntry] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchAvailability();
      fetchUnavailability();
    }
  }, [status, router]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/availability');
      const data = await response.json();
      if (response.ok && data.availability) {
        setAvailability(data.availability);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnavailability = async () => {
    try {
      const response = await fetch('/api/unavailability?all=true');
      const data = await response.json();
      if (response.ok && data.unavailability) {
        setUnavailabilityList(data.unavailability);
      }
    } catch (err) {
      console.error('Failed to fetch unavailability:', err);
    }
  };

  const handleToggleDay = (index: number) => {
    const updated = [...availability];
    updated[index].enabled = !updated[index].enabled;
    setAvailability(updated);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Availability settings saved successfully' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save availability settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddUnavailability = async () => {
    if (!newStartDate || !newEndDate) {
      toast({ title: 'Error', description: 'Please select both start and end dates', variant: 'destructive' });
      return;
    }
    if (new Date(newEndDate) < new Date(newStartDate)) {
      toast({ title: 'Error', description: 'End date must be after start date', variant: 'destructive' });
      return;
    }

    setAddingEntry(true);
    try {
      const response = await fetch('/api/unavailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: newStartDate,
          endDate: newEndDate,
          reason: newReason.trim() || null,
        }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Unavailability dates added successfully' });
        setShowAddForm(false);
        setNewStartDate('');
        setNewEndDate('');
        setNewReason('');
        fetchUnavailability();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add unavailability dates';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setAddingEntry(false);
    }
  };

  const handleDeleteUnavailability = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/unavailability/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Success', description: 'Unavailability entry removed' });
        fetchUnavailability();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to remove entry', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const isDatePast = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
  };

  const getDayCount = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading availability...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const upcomingBlocked = unavailabilityList.filter(e => !isDatePast(e.endDate));
  const pastBlocked = unavailabilityList.filter(e => isDatePast(e.endDate));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
            <p className="text-gray-600 mt-2">
              Set weekly availability and block specific dates when Dr. Sitna is unavailable
            </p>
          </motion.div>
        </div>

        {/* Doctor Unavailability Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-red-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-red-700">
                  <CalendarX className="w-5 h-5 mr-2" />
                  Doctor Unavailability (Blocked Dates)
                </CardTitle>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Block Dates
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
                <Ban className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <p className="font-medium mb-1">Block Dates for Unavailability</p>
                  <p className="text-red-700">
                    When Dr. Sitna is travelling, attending conferences, or has any other engagement,
                    block those dates here. Patients will not be able to book appointments on blocked dates
                    and will see a notice that the doctor is unavailable.
                  </p>
                </div>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-50 border rounded-lg p-4 mb-4 space-y-4"
                >
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Plane className="w-4 h-4 mr-2 text-red-600" />
                    Add Unavailable Dates
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        min={newStartDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (optional — visible to patients)</Label>
                    <Textarea
                      id="reason"
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      placeholder="e.g. Attending medical conference, Personal travel, Holiday..."
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => { setShowAddForm(false); setNewStartDate(''); setNewEndDate(''); setNewReason(''); }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddUnavailability}
                      disabled={addingEntry}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {addingEntry ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Adding...</>
                      ) : (
                        <><Ban className="w-4 h-4 mr-2" />Block These Dates</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Upcoming blocked dates */}
              {upcomingBlocked.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming Blocked Dates</h4>
                  {upcomingBlocked.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border border-red-100 bg-red-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CalendarX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDisplayDate(entry.startDate)}
                            {entry.startDate !== entry.endDate && (
                              <> — {formatDisplayDate(entry.endDate)}</>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getDayCount(entry.startDate, entry.endDate)} day{getDayCount(entry.startDate, entry.endDate) > 1 ? 's' : ''}
                            {entry.reason && <> · <span className="text-red-600">{entry.reason}</span></>}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnavailability(entry.id)}
                        disabled={deletingId === entry.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        {deletingId === entry.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No upcoming blocked dates</p>
                  <p className="text-sm">All dates are currently available for appointments</p>
                </div>
              )}

              {/* Past blocked (collapsed) */}
              {pastBlocked.length > 0 && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Past blocked dates ({pastBlocked.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {pastBlocked.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 opacity-60">
                        <div className="flex items-start space-x-3">
                          <CalendarX className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">
                              {formatDisplayDate(entry.startDate)}
                              {entry.startDate !== entry.endDate && <> — {formatDisplayDate(entry.endDate)}</>}
                            </p>
                            {entry.reason && <p className="text-xs text-gray-400">{entry.reason}</p>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnavailability(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Schedule Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-pink-600" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start mb-4">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Weekly Availability Settings</p>
                  <p className="text-blue-700">
                    Toggle days on/off and set your working hours. Patients will only be able to book
                    appointments during your available times.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {availability.map((slot, index) => (
                  <div key={slot.day} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={slot.enabled}
                          onCheckedChange={() => handleToggleDay(index)}
                        />
                        <Label className="text-base font-medium w-24">
                          {slot.day}
                        </Label>
                      </div>

                      {slot.enabled && (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <span className="text-gray-400">to</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}

                      {!slot.enabled && (
                        <span className="text-gray-400 italic">Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setAvailability(defaultAvailability)}
                  >
                    Reset to Default
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    {saving ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Save Changes</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Available Days</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availability.filter(s => s.enabled).length} / 7
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Hours Per Week</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {availability
                      .filter(s => s.enabled)
                      .reduce((total, slot) => {
                        const start = parseInt(slot.startTime.split(':')[0]);
                        const end = parseInt(slot.endTime.split(':')[0]);
                        return total + (end - start);
                      }, 0)} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Upcoming Blocked Dates</p>
                  <p className="text-2xl font-bold text-red-600">
                    {upcomingBlocked.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
