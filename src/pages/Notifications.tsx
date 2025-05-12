import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { db } from '../lib/localStorage';
import type { Notification } from '../lib/localStorage';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const userData = JSON.parse(storedUser);
      const userNotifications = db.notifications.getByUserId(userData.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    const { data: updatedNotification } = db.notifications.markAsRead(notificationId);
    if (updatedNotification) {
      setNotifications(notifications.map(notification => 
        notification.id === notificationId ? updatedNotification : notification
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-gray-50 p-4 rounded-lg ${
                  !notification.read ? 'border-l-4 border-pink-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Bell className="w-5 h-5 text-pink-600" />
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(notification.date).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-sm text-pink-600 hover:text-pink-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No notifications available
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}