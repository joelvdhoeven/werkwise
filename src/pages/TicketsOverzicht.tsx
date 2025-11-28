import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, XCircle, UserCircle, Trash2, Paperclip, Download, MessageSquare, Send, Archive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Ticket, TicketComment } from '../types';

interface TicketWithCreator extends Ticket {
  creator_name?: string;
  creator_email?: string;
}

const TicketsOverzicht: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tickets, setTickets] = useState<TicketWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketWithCreator | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (profile?.role === 'superuser' || profile?.role === 'admin' || profile?.role === 'kantoorpersoneel') {
      loadTickets();
    }
  }, [profile]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      const ticketsWithCreators = await Promise.all(
        (ticketsData || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('naam, email')
            .eq('id', ticket.created_by)
            .maybeSingle();

          return {
            ...ticket,
            creator_name: profile?.naam || 'Onbekend',
            creator_email: profile?.email || ''
          };
        })
      );

      setTickets(ticketsWithCreators);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (ticketId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithUsers = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('naam, email')
            .eq('id', comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            user_name: profile?.naam || 'Onbekend',
            user_email: profile?.email || ''
          };
        })
      );

      setComments(commentsWithUsers);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const sendComment = async () => {
    if (!selectedTicket || !profile || !newComment.trim()) return;

    try {
      setSendingComment(true);
      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: profile.id,
          comment: newComment.trim()
        });

      if (error) throw error;
      setNewComment('');
      await loadComments(selectedTicket.id);
    } catch (error) {
      console.error('Error sending comment:', error);
      alert('Fout bij versturen reactie');
    } finally {
      setSendingComment(false);
    }
  };

  const selectTicket = async (ticket: TicketWithCreator) => {
    setSelectedTicket(ticket);
    await loadComments(ticket.id);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };

      if (newStatus === 'resolved' || newStatus === 'closed' || newStatus === 'archived') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Fout bij bijwerken ticket status');
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm('Weet je zeker dat je dit ticket wilt verwijderen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;
      loadTickets();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Fout bij verwijderen ticket');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'in_progress':
        return <Clock className="text-yellow-500" size={20} />;
      case 'resolved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'closed':
        return <XCircle className="text-gray-500" size={20} />;
      case 'archived':
        return <CheckCircle className="text-blue-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Behandeling';
      case 'resolved':
        return 'Opgelost';
      case 'closed':
        return 'Gesloten';
      case 'archived':
        return 'Gearchiveerd';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800';
      case 'high':
        return isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800';
      case 'medium':
        return isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'low':
        return isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'Hoog';
      case 'medium':
        return 'Gemiddeld';
      case 'low':
        return 'Laag';
      default:
        return priority;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    // Filter archived tickets based on showArchived toggle
    const matchesArchiveFilter = showArchived ? ticket.status === 'archived' : ticket.status !== 'archived';

    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.creator_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesArchiveFilter && matchesSearch && matchesStatus && matchesPriority;
  });

  const activeTickets = tickets.filter(t => t.status !== 'archived');
  const archivedTickets = tickets.filter(t => t.status === 'archived');

  const statusCounts = {
    open: activeTickets.filter(t => t.status === 'open').length,
    in_progress: activeTickets.filter(t => t.status === 'in_progress').length,
    resolved: activeTickets.filter(t => t.status === 'resolved').length,
    closed: activeTickets.filter(t => t.status === 'closed').length,
    archived: archivedTickets.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>Laden...</div>
      </div>
    );
  }

  if (profile?.role !== 'superuser' && profile?.role !== 'admin' && profile?.role !== 'kantoorpersoneel') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>Je hebt geen toegang tot deze pagina</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tickets Overzicht</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {profile?.role === 'superuser'
              ? 'Beantwoord tickets en wijzig status (SuperUser)'
              : 'Bekijk alle tickets (Admin/Kantoorpersoneel)'}
          </p>
        </div>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            showArchived
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Archive size={20} />
          {showArchived ? 'Toon Actieve Tickets' : 'Toon Archief'}
        </button>
      </div>

      {!showArchived ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className={`${isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={24} />
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{statusCounts.open}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Open</div>
              </div>
            </div>
          </div>
          <div className={`${isDark ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-500" size={24} />
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{statusCounts.in_progress}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Behandeling</div>
              </div>
            </div>
          </div>
          <div className={`${isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{statusCounts.resolved}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Opgelost</div>
              </div>
            </div>
          </div>
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <XCircle className="text-gray-500" size={24} />
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{statusCounts.closed}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gesloten</div>
              </div>
            </div>
          </div>
          <div className={`${isDark ? 'bg-blue-900/30 border-blue-800 hover:bg-blue-900/50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'} border rounded-lg p-4 cursor-pointer transition-colors`} onClick={() => setShowArchived(true)}>
            <div className="flex items-center gap-3">
              <Archive className="text-blue-500" size={24} />
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{statusCounts.archived}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gearchiveerd</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="text-blue-600" size={28} />
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{statusCounts.archived}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Gearchiveerde Tickets</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                placeholder="Zoek tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">Alle Statussen</option>
              <option value="open">Open</option>
              <option value="in_progress">In Behandeling</option>
              <option value="resolved">Opgelost</option>
              <option value="closed">Gesloten</option>
              <option value="archived">Gearchiveerd</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">Alle Prioriteiten</option>
              <option value="urgent">Urgent</option>
              <option value="high">Hoog</option>
              <option value="medium">Gemiddeld</option>
              <option value="low">Laag</option>
            </select>
          </div>
        </div>

        <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {filteredTickets.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Geen tickets gevonden
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                onClick={() => selectTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{ticket.description}</p>
                    <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        <UserCircle size={16} />
                        {ticket.creator_name}
                      </span>
                      <span>Categorie: {ticket.category}</span>
                      <span>Status: {getStatusLabel(ticket.status)}</span>
                      <span>Aangemaakt: {new Date(ticket.created_at).toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(selectedTicket.status)}
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedTicket.title}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {getPriorityLabel(selectedTicket.priority)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <UserCircle size={16} />
                      {selectedTicket.creator_name} ({selectedTicket.creator_email})
                    </span>
                    <span>Categorie: {selectedTicket.category}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Beschrijving</h3>
                <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedTicket.description}</p>
              </div>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Bijlagen ({selectedTicket.attachments.length})</h3>
                  <div className="space-y-2">
                    {selectedTicket.attachments.map((attachment, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Paperclip size={16} className={isDark ? 'text-gray-500 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />
                          <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{attachment.name}</span>
                          <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${isDark ? 'text-violet-400 hover:bg-violet-900/30' : 'text-violet-600 hover:bg-violet-50'}`}
                        >
                          <Download size={14} />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                  <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getStatusLabel(selectedTicket.status)}</div>
                </div>
                <div>
                  <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Prioriteit</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getPriorityLabel(selectedTicket.priority)}</div>
                </div>
                <div>
                  <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aangemaakt</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedTicket.created_at).toLocaleString('nl-NL')}
                  </div>
                </div>
                <div>
                  <div className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Laatst bijgewerkt</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedTicket.updated_at).toLocaleString('nl-NL')}
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <MessageSquare size={20} />
                  Reacties
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {comments.length === 0 ? (
                    <p className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nog geen reacties</p>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.id} className={`rounded-lg p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{comment.user_name}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(comment.created_at).toLocaleString('nl-NL')}
                          </div>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>
                {profile?.role === 'superuser' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendComment()}
                      placeholder="Typ je reactie..."
                      className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                      disabled={sendingComment}
                    />
                    <button
                      onClick={sendComment}
                      disabled={sendingComment || !newComment.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-md hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={18} />
                      Verstuur
                    </button>
                  </div>
                )}
              </div>

              {profile?.role === 'superuser' && (
                <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Status Bijwerken (Alleen SuperUser)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'open')}
                      disabled={selectedTicket.status === 'open'}
                      className={`px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-red-700 text-red-400 hover:bg-red-900/30' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                      disabled={selectedTicket.status === 'in_progress'}
                      className={`px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-yellow-700 text-yellow-400 hover:bg-yellow-900/30' : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'}`}
                    >
                      In Behandeling
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      disabled={selectedTicket.status === 'resolved'}
                      className={`px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-green-700 text-green-400 hover:bg-green-900/30' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                    >
                      Opgelost
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                      disabled={selectedTicket.status === 'closed'}
                      className={`px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Gesloten
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Weet je zeker dat je dit ticket wilt archiveren?')) {
                          updateTicketStatus(selectedTicket.id, 'archived');
                        }
                      }}
                      disabled={selectedTicket.status === 'archived'}
                      className={`px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed col-span-3 ${isDark ? 'border-blue-700 text-blue-400 hover:bg-blue-900/30' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
                    >
                      Archiveren (Verwerkt)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-6 border-t flex gap-3 justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {profile?.role === 'superuser' && (
                <button
                  onClick={() => deleteTicket(selectedTicket.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${isDark ? 'text-red-400 bg-red-900/30 hover:bg-red-900/50' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                >
                  <Trash2 size={18} />
                  Verwijderen
                </button>
              )}
              <button
                onClick={() => setSelectedTicket(null)}
                className={`px-4 py-2 rounded-md ml-auto ${isDark ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsOverzicht;
