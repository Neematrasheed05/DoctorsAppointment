
"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  Trash2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });

      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        ));
      }
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      markAsRead(message.id);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !reply.trim()) return;

    setSending(true);
    try {
      // In a real implementation, this would send an email or SMS
      // For now, we'll just simulate the action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Reply Sent',
        description: `Your reply has been sent to ${selectedMessage.fullName}`,
      });
      
      setReply('');
      setSelectedMessage(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        toast({
          title: 'Message Deleted',
          description: 'The message has been deleted successfully',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              {messages.length} total messages
              {unreadCount > 0 && <span className="ml-2">• {unreadCount} unread</span>}
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-[calc(100vh-220px)] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-pink-600" />
                    Inbox
                  </span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto h-[calc(100%-80px)] p-0">
                {messages.length > 0 ? (
                  <div className="space-y-1">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleSelectMessage(message)}
                        className={`p-4 cursor-pointer hover:bg-pink-50 transition-colors border-b ${
                          selectedMessage?.id === message.id ? 'bg-pink-50 border-l-4 border-l-pink-600' : ''
                        } ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className={`font-semibold text-sm ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.fullName}
                          </p>
                          {message.status === 'unread' && (
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">{message.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{message.message}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Message Detail & Reply */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-[calc(100vh-220px)]">
              {selectedMessage ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{selectedMessage.subject}</CardTitle>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <strong className="mr-2">From:</strong>
                            {selectedMessage.fullName}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-2" />
                            {selectedMessage.phone}
                          </div>
                          {selectedMessage.email && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-2" />
                              {selectedMessage.email}
                            </div>
                          )}
                          <div className="flex items-center text-gray-400">
                            <Clock className="w-3 h-3 mr-2" />
                            {formatDate(selectedMessage.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col h-[calc(100%-200px)]">
                    <div className="flex-1 overflow-y-auto py-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Send className="w-4 h-4 mr-2 text-pink-600" />
                        Reply
                      </h4>
                      <Textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply here..."
                        className="mb-3 min-h-[100px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedMessage(null)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={handleSendReply}
                          disabled={!reply.trim() || sending}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          {sending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a message to view and reply</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
