import React, { useEffect, useState } from 'react';
import { useAgentAuth, SalesAgent } from '../contexts/AgentAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  Send,
  MessageSquare,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle,
  DollarSign
} from 'lucide-react';

interface Lead {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  status: string;
  source: string;
  assigned_to: string | null;
  monthly_amount: number | null;
  commission_percentage: number | null;
  created_at: string;
  updated_at: string;
}

interface LeadNote {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
  created_by: string;
  agent?: { naam: string } | null;
}

interface AgentLeadDetailProps {
  leadId: string;
  onBack: () => void;
}

const AgentLeadDetail: React.FC<AgentLeadDetailProps> = ({ leadId, onBack }) => {
  const { agent, isAdmin } = useAgentAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [salesAgents, setSalesAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    assigned_to: '',
    monthly_amount: '',
    commission_percentage: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLead();
    fetchNotes();
    if (isAdmin()) {
      fetchSalesAgents();
    }
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      setLead(data);
      setEditData({
        status: data.status,
        assigned_to: data.assigned_to || '',
        monthly_amount: data.monthly_amount?.toString() || '',
        commission_percentage: data.commission_percentage?.toString() || ''
      });
    } catch (err) {
      console.error('Error fetching lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select(`
          *,
          agent:sales_agents!lead_notes_created_by_fkey(naam)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const fetchSalesAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_agents')
        .select('*')
        .eq('is_active', true)
        .order('naam');

      if (error) throw error;
      setSalesAgents(data || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !newNote.trim()) return;

    setSubmittingNote(true);

    try {
      const { error } = await supabase.from('lead_notes').insert({
        lead_id: leadId,
        content: newNote.trim(),
        created_by: agent.id
      });

      if (error) throw error;

      setNewNote('');
      fetchNotes();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSave = async () => {
    if (!lead) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: editData.status,
          assigned_to: editData.assigned_to || null,
          monthly_amount: editData.monthly_amount ? parseFloat(editData.monthly_amount) : null,
          commission_percentage: editData.commission_percentage ? parseFloat(editData.commission_percentage) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      setEditing(false);
      fetchLead();
    } catch (err) {
      console.error('Error saving lead:', err);
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'new', label: 'Nieuw' },
    { value: 'contacted', label: 'Gecontacteerd' },
    { value: 'in_progress', label: 'In Behandeling' },
    { value: 'converted', label: 'Geconverteerd' },
    { value: 'paid', label: 'Betaald' },
    { value: 'lost', label: 'Verloren' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
      new: { label: 'Nieuw', className: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200' },
      contacted: { label: 'Gecontacteerd', className: isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200' },
      in_progress: { label: 'In Behandeling', className: isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200' },
      converted: { label: 'Geconverteerd', className: isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle className="h-4 w-4" /> },
      paid: { label: 'Betaald', className: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200', icon: <DollarSign className="h-4 w-4" /> },
      lost: { label: 'Verloren', className: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200' }
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className={`text-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Lead niet gevonden</p>
        <button onClick={onBack} className="mt-4 text-violet-600 hover:underline">
          Terug naar overzicht
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
          isDark ? 'text-gray-400 hover:text-violet-400' : 'text-gray-600 hover:text-violet-600'
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar leads
      </button>

      {/* Lead Header */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-violet-500/20' : 'bg-violet-100'
            }`}>
              <Building2 className={isDark ? 'h-8 w-8 text-violet-400' : 'h-8 w-8 text-violet-600'} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {lead.company_name}
              </h1>
              <div className="flex items-center gap-2">
                {getStatusBadge(lead.status)}
              </div>
            </div>
          </div>

          {(isAdmin() || lead.assigned_to === agent?.id) && (
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                editing
                  ? isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
              }`}
            >
              {editing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
              {editing ? 'Annuleren' : 'Bewerken'}
            </button>
          )}
        </div>

        {/* Edit Mode */}
        {editing && (
          <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {isAdmin() && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Toegewezen aan
                  </label>
                  <select
                    value={editData.assigned_to}
                    onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="">Niet toegewezen</option>
                    {salesAgents.map(a => (
                      <option key={a.id} value={a.id}>{a.naam}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Maandelijks bedrag (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editData.monthly_amount}
                  onChange={(e) => setEditData({ ...editData, monthly_amount: e.target.value })}
                  placeholder="bijv. 300"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Commissie percentage (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={editData.commission_percentage}
                  onChange={(e) => setEditData({ ...editData, commission_percentage: e.target.value })}
                  placeholder="bijv. 10"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Commission Preview */}
            {editData.monthly_amount && editData.commission_percentage && (
              <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-violet-500/10 border border-violet-500/30' : 'bg-violet-50 border border-violet-200'}`}>
                <p className={`text-sm ${isDark ? 'text-violet-300' : 'text-violet-700'}`}>
                  <span className="font-medium">Commissie per maand:</span>{' '}
                  €{((parseFloat(editData.monthly_amount) * parseFloat(editData.commission_percentage)) / 100).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Opslaan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Contactgegevens
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Mail className={isDark ? 'h-5 w-5 text-violet-400' : 'h-5 w-5 text-violet-600'} />
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>E-mail</p>
              <a href={`mailto:${lead.contact_email}`} className={`font-medium ${isDark ? 'text-white hover:text-violet-400' : 'text-gray-900 hover:text-violet-600'}`}>
                {lead.contact_email}
              </a>
            </div>
          </div>

          {lead.contact_phone && (
            <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <Phone className={isDark ? 'h-5 w-5 text-violet-400' : 'h-5 w-5 text-violet-600'} />
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Telefoon</p>
                <a href={`tel:${lead.contact_phone}`} className={`font-medium ${isDark ? 'text-white hover:text-violet-400' : 'text-gray-900 hover:text-violet-600'}`}>
                  {lead.contact_phone}
                </a>
              </div>
            </div>
          )}

          {lead.website && (
            <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <Globe className={isDark ? 'h-5 w-5 text-violet-400' : 'h-5 w-5 text-violet-600'} />
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Website</p>
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className={`font-medium ${isDark ? 'text-white hover:text-violet-400' : 'text-gray-900 hover:text-violet-600'}`}>
                  {lead.website}
                </a>
              </div>
            </div>
          )}

          <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Calendar className={isDark ? 'h-5 w-5 text-violet-400' : 'h-5 w-5 text-violet-600'} />
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Aangemaakt op</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(lead.created_at).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <MessageSquare className="h-5 w-5" />
          Notities
        </h2>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Voeg een notitie toe..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={submittingNote || !newNote.trim()}
              className="self-end px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/25"
            >
              {submittingNote ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nog geen notities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-100'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                    <User className={`h-4 w-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {note.agent?.naam || 'Onbekend'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(note.created_at).toLocaleString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentLeadDetail;
