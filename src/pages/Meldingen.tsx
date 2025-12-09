import React, { useState, useEffect } from 'react';
import { Bell, Mail, MailOpen, Archive, Package, Calendar, Check, X, AlertCircle, ArrowRight, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabase';
import { Notification } from '../types';
import { supabase } from '../lib/supabase';

interface LowStockItem {
  product_id: string;
  product_name: string;
  sku: string;
  location_id: string;
  location_name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

interface VacationRequest {
  id: string;
  user_id: string;
  user_naam: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
}

interface MeldingenProps {
  onNavigate?: (section: string) => void;
}

const Meldingen: React.FC<MeldingenProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'stock' | 'vacation'>('stock');
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingVacation, setLoadingVacation] = useState(true);
  const [selectedVacation, setSelectedVacation] = useState<VacationRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = hasPermission('manage_settings');

  // Fetch notifications
  const { data: notifications = [], loading: loadingNotifications, refetch } = useSupabaseQuery<Notification>(
    'notifications',
    '*',
    isAdmin ? {} : { recipient_id: user?.id },
    { order: { column: 'created_at', ascending: false } }
  );

  const { update: updateNotificationStatus, loading: mutationLoading } = useSupabaseMutation('notifications');

  // Fetch low stock alerts
  useEffect(() => {
    const fetchLowStock = async () => {
      if (!isAdmin) {
        setLoadingStock(false);
        return;
      }

      try {
        const { data: stockData, error } = await supabase
          .from('inventory_stock')
          .select(`
            quantity,
            product_id,
            location_id,
            product:inventory_products!inventory_stock_product_id_fkey(id, name, sku, minimum_stock, unit),
            location:inventory_locations!inventory_stock_location_id_fkey(id, name)
          `);

        if (error) throw error;

        const lowStock: LowStockItem[] = [];
        for (const item of stockData || []) {
          const product = item.product as any;
          const location = item.location as any;
          if (product && item.quantity < product.minimum_stock) {
            lowStock.push({
              product_id: product.id,
              product_name: product.name,
              sku: product.sku,
              location_id: location?.id || '',
              location_name: location?.name || 'Onbekend',
              current_stock: item.quantity,
              minimum_stock: product.minimum_stock,
              unit: product.unit || 'stuk'
            });
          }
        }
        setLowStockItems(lowStock);
      } catch (error) {
        console.error('Error fetching low stock:', error);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchLowStock();
  }, [isAdmin]);

  // Fetch vacation requests
  useEffect(() => {
    const fetchVacationRequests = async () => {
      if (!isAdmin) {
        setLoadingVacation(false);
        return;
      }

      try {
        const { data: vacationData, error } = await supabase
          .from('vacation_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!vacationData || vacationData.length === 0) {
          setVacationRequests([]);
          setLoadingVacation(false);
          return;
        }

        // Get user names
        const userIds = [...new Set(vacationData.map(v => v.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, naam')
          .in('id', userIds);

        const userNameMap: Record<string, string> = {};
        profilesData?.forEach(p => {
          userNameMap[p.id] = p.naam || 'Onbekend';
        });

        const enrichedData = vacationData.map(v => ({
          ...v,
          user_naam: userNameMap[v.user_id] || 'Onbekend'
        }));

        setVacationRequests(enrichedData);
      } catch (error) {
        console.error('Error fetching vacation requests:', error);
      } finally {
        setLoadingVacation(false);
      }
    };

    fetchVacationRequests();
  }, [isAdmin]);

  const handleMarkAsRead = async (id: string) => {
    await updateNotificationStatus(id, { status: 'read' });
    refetch();
  };

  const handleArchive = async (id: string) => {
    await updateNotificationStatus(id, { status: 'archived' });
    refetch();
  };

  const handleVacationReview = async (id: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    setProcessingId(id);

    try {
      const { error } = await supabase
        .from('vacation_requests')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_note: reviewNote || null
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setVacationRequests(prev =>
        prev.map(v => v.id === id ? { ...v, status } : v)
      );
      setSelectedVacation(null);
      setReviewNote('');
    } catch (error) {
      console.error('Error reviewing vacation request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleNavigateToStock = (productId: string) => {
    // Navigate to voorraadbeheer
    if (onNavigate) {
      onNavigate('voorraadbeheer');
    } else {
      // Fallback: dispatch custom event for App.tsx to handle
      window.dispatchEvent(new CustomEvent('navigate-section', { detail: 'voorraadbeheer' }));
    }
  };

  const getVacationTypeLabel = (type: string) => {
    switch (type) {
      case 'vakantie': return 'Vakantie';
      case 'ziekte': return 'Ziekte';
      case 'verlof': return 'Verlof';
      case 'anders': return 'Anders';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'In afwachting', className: isDark ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { label: 'Goedgekeurd', className: isDark ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-green-100 text-green-800' };
      case 'rejected':
        return { label: 'Afgewezen', className: isDark ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800' };
      default:
        return { label: status, className: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800' };
    }
  };

  const pendingVacations = vacationRequests.filter(v => v.status === 'pending');
  const unreadNotifications = notifications.filter(n => n.status === 'unread');

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold flex items-center space-x-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        <Bell className="text-red-600" />
        <span>{t('notifications')}</span>
      </h1>

      {/* Tab Navigation */}
      {isAdmin && (
        <div className={`rounded-lg shadow p-2 flex flex-wrap gap-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'stock'
                ? 'bg-red-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package size={16} />
            Lage Voorraad
            {lowStockItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full font-bold">
                {lowStockItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('vacation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'vacation'
                ? 'bg-red-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={16} />
            Verlofaanvragen
            {pendingVacations.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full font-bold">
                {pendingVacations.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Low Stock Tab */}
      {activeTab === 'stock' && isAdmin && (
        <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {loadingStock ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Package className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">Alle voorraad op peil!</p>
              <p className="text-sm mt-1">Er zijn geen producten onder het minimum niveau.</p>
            </div>
          ) : (
            <ul className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {lowStockItems.map((item, index) => (
                <li key={index} className={`p-4 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                        <AlertCircle className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.product_name}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          SKU: {item.sku} | Locatie: {item.location_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-sm font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            Voorraad: {item.current_stock} {item.unit}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            (min: {item.minimum_stock})
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNavigateToStock(item.product_id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <ShoppingCart size={16} />
                      <span>Bestellen</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Vacation Requests Tab */}
      {activeTab === 'vacation' && isAdmin && (
        <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {loadingVacation ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : vacationRequests.length === 0 ? (
            <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="h-12 w-12 mx-auto mb-3 text-blue-500" />
              <p className="font-medium">Geen verlofaanvragen</p>
              <p className="text-sm mt-1">Er zijn momenteel geen verlofaanvragen.</p>
            </div>
          ) : (
            <ul className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {vacationRequests.map(request => {
                const statusBadge = getStatusBadge(request.status);
                const isSelected = selectedVacation?.id === request.id;

                return (
                  <li key={request.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <div
                      className={`p-4 cursor-pointer ${isSelected ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                      onClick={() => setSelectedVacation(isSelected ? null : request)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                            <Calendar className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {request.user_naam}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                {statusBadge.label}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {getVacationTypeLabel(request.type)}: {new Date(request.start_date).toLocaleDateString('nl-NL')} - {new Date(request.end_date).toLocaleDateString('nl-NL')}
                            </p>
                            {request.reason && (
                              <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Reden: {request.reason}
                              </p>
                            )}
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVacationReview(request.id, 'approved');
                              }}
                              disabled={processingId === request.id}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <Check size={16} />
                              <span>Goedkeuren</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVacationReview(request.id, 'rejected');
                              }}
                              disabled={processingId === request.id}
                              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <X size={16} />
                              <span>Afwijzen</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isSelected && request.status === 'pending' && (
                      <div className={`px-4 pb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="ml-16 space-y-3">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Opmerking (optioneel)
                            </label>
                            <textarea
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                              placeholder="Voeg een opmerking toe..."
                              rows={2}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                                isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                              }`}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVacationReview(request.id, 'approved')}
                              disabled={processingId === request.id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <Check size={16} />
                              Goedkeuren met opmerking
                            </button>
                            <button
                              onClick={() => handleVacationReview(request.id, 'rejected')}
                              disabled={processingId === request.id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <X size={16} />
                              Afwijzen met opmerking
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Meldingen;
