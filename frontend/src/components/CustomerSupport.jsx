import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  MessageSquare, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

export default function CustomerSupport({ user }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  
  // New ticket state
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('TRADING');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getTickets();
      const list = res.data?.results || res.data || [];
      setTickets(list);
      if (list.length > 0 && !selectedTicket) {
        setSelectedTicket(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createTicket({
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        initial_message: newInitialMsg
      });
      setNewSubject('');
      setNewInitialMsg('');
      setNewTicketModal(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      await api.addTicketMessage(selectedTicket.ticket_number, {
        message: replyMessage
      });
      setReplyMessage('');
      // Reload ticket detail
      const res = await api.getTicketDetail(selectedTicket.ticket_number);
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      await api.updateTicketStatus(selectedTicket.ticket_number, { status: newStatus });
      const res = await api.getTicketDetail(selectedTicket.ticket_number);
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Customer Support & Issue Resolution</span>
            <span className="badge-neutral text-[11px]">24/7 Desk</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Submit inquiries, track resolution tickets, and communicate directly with staff</p>
        </div>

        <button
          onClick={() => setNewTicketModal(true)}
          className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* 2-Column Split: Ticket List (4 Cols) & Active Thread (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* Ticket List Pane */}
        <div className="lg:col-span-5 card-base p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Tickets ({tickets.length})</span>
            <span className="text-[10px] text-slate-500">Click to inspect</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[550px] pr-1">
            {tickets.length > 0 ? (
              tickets.map((t) => {
                const isSelected = selectedTicket?.ticket_number === t.ticket_number;
                return (
                  <div
                    key={t.ticket_number}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-md'
                        : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white line-clamp-1">{t.subject}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : (
                          t.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                        )
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mono">
                      <span>{t.ticket_number}</span>
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No tickets found.</p>
            )}
          </div>
        </div>

        {/* Active Conversation Thread Pane */}
        <div className="lg:col-span-7 card-base p-6 flex flex-col justify-between">
          {selectedTicket ? (
            <div className="space-y-4 flex flex-col h-full justify-between">
              
              {/* Ticket Top Meta */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-400 font-semibold">{selectedTicket.ticket_number}</span>
                  <div className="flex items-center gap-2">
                    <span className="badge-neutral text-[10px]">{selectedTicket.category}</span>
                    <span className="badge-neutral text-[10px]">Priority: {selectedTicket.priority}</span>
                    
                    {/* Status updater dropdown */}
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-semibold rounded px-2 py-0.5 outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>
                <h2 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h2>
              </div>

              {/* Messages Thread Container */}
              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-2 my-2 flex-1">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`p-3.5 rounded-xl border max-w-[85%] text-xs space-y-1 ${
                        m.is_staff_reply 
                          ? 'ml-auto bg-blue-950/40 border-blue-800/60 text-blue-100' 
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          {m.is_staff_reply ? <ShieldCheck size={12} className="text-blue-400" /> : <User size={12} />}
                          {m.sender_name} {m.is_staff_reply ? '(Official Support)' : ''}
                        </span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">{m.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No message history recorded yet.</p>
                )}
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the support desk..."
                  className="form-input text-xs flex-1"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs my-auto">
              Select a ticket from the left pane to view the conversation.
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {newTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <LifeBuoy className="text-blue-500" size={20} />
              <span>Open New Customer Support Ticket</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Our financial desk resolves trading queries and system issues promptly.</p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                  placeholder="Brief summary of your query"
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="form-input text-xs"
                  >
                    <option value="TRADING">Trading Engine & Orders</option>
                    <option value="ACCOUNT">Account & Balances</option>
                    <option value="TECHNICAL">Technical & Charts</option>
                    <option value="BILLING">Billing & Transfers</option>
                    <option value="OTHER">General Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="form-input text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Detail *</label>
                <textarea
                  rows="4"
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  required
                  placeholder="Provide full details and error messages if applicable..."
                  className="form-input text-xs resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewTicketModal(false)}
                  className="flex-1 btn-secondary justify-center py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center py-2 text-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
