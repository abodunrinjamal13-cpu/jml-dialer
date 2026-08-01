"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Phone, Star, MessageSquare, X, Edit2, Trash2, Clock, Loader2 } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isFavorite?: boolean;
}

interface CallHistoryItem {
  id: string;
  contactId: string;
  type: "incoming" | "outgoing" | "missed";
  timestamp: string;
}

const mockRecentCalls: CallHistoryItem[] = [
  { id: "c1", contactId: "1", type: "outgoing", timestamp: "Today, 10:15 AM" },
  { id: "c2", contactId: "1", type: "incoming", timestamp: "Yesterday, 4:30 PM" },
  { id: "c3", contactId: "2", type: "missed", timestamp: "Yesterday, 1:00 PM" },
  { id: "c4", contactId: "3", type: "outgoing", timestamp: "Jul 28, 6:45 PM" },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch contacts from database on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !numberInput.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput, phone: numberInput }),
      });

      if (res.ok) {
        const newContact = await res.json();
        setContacts((prev) => [...prev, newContact]);
        setNameInput("");
        setNumberInput("");
        setShowAddModal(false);
      } else {
        alert("Failed to create contact");
      }
    } catch (error) {
      console.error("Error adding contact", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !nameInput.trim() || !numberInput.trim()) return;

    // Optional: Add backend PUT route later, updating UI state seamlessly for now
    const updated = { ...selectedContact, name: nameInput, phone: numberInput };
    setContacts((prev) => prev.map((c) => (c.id === selectedContact.id ? updated : c)));
    setSelectedContact(updated);
    setIsEditing(false);
  };

  const handleDeleteContact = (id: string) => {
    // Optional: Add backend DELETE route later, updating UI state seamlessly for now
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContact(null);
  };

  const startEdit = (contact: Contact) => {
    setNameInput(contact.name);
    setNumberInput(contact.phone);
    setIsEditing(true);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const favorites = filteredContacts.filter((c) => c.isFavorite);

  const groupedContacts = filteredContacts
    .filter((c) => !c.isFavorite)
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce<{ [key: string]: Contact[] }>((acc, contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(contact);
      return acc;
    }, {});

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 pb-28 sm:px-6">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-xl font-bold text-slate-900">Contacts</h1>
          <button
            onClick={() => {
              setNameInput("");
              setNumberInput("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {favorites.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1 px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Favorites</span>
                </div>
                <div className="flex flex-col gap-2">
                  {favorites.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onPreview={() => setSelectedContact(contact)} />
                  ))}
                </div>
              </div>
            )}

            {Object.keys(groupedContacts).length === 0 && favorites.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No contacts found</div>
            ) : (
              Object.entries(groupedContacts).map(([letter, items]) => (
                <div key={letter} className="flex flex-col gap-2">
                  <span className="px-1 text-xs font-bold text-slate-400">{letter}</span>
                  <div className="flex flex-col gap-2">
                    {items.map((contact) => (
                      <ContactCard key={contact.id} contact={contact} onPreview={() => setSelectedContact(contact)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Full Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setSelectedContact(null);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {!isEditing ? (
              <>
                <div className="flex flex-col items-center gap-2 mt-2">
                  <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-inner">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedContact.name}</h2>
                  <p className="text-xs font-medium text-slate-500">{selectedContact.phone}</p>
                </div>

                <div className="flex items-center justify-around w-full py-2 border-y border-slate-100">
                  <button
                    onClick={() => alert(`Calling ${selectedContact.phone}...`)}
                    className="flex flex-col items-center gap-1 text-[11px] font-semibold text-blue-600"
                  >
                    <div className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span>Call</span>
                  </button>

                  <button
                    onClick={() => alert(`Opening messages for ${selectedContact.phone}...`)}
                    className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600"
                  >
                    <div className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() => startEdit(selectedContact)}
                    className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600"
                  >
                    <div className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200">
                      <Edit2 className="w-5 h-5" />
                    </div>
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteContact(selectedContact.id)}
                    className="flex flex-col items-center gap-1 text-[11px] font-semibold text-rose-600"
                  >
                    <div className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100">
                      <Trash2 className="w-5 h-5 text-rose-600" />
                    </div>
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent Calls</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                    {mockRecentCalls.filter((c) => c.contactId === selectedContact.id).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No recent call history</p>
                    ) : (
                      mockRecentCalls
                        .filter((c) => c.contactId === selectedContact.id)
                        .map((call) => (
                          <div key={call.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl">
                            <span className="capitalize font-medium text-slate-700">{call.type} call</span>
                            <span className="text-[11px] text-slate-400">{call.timestamp}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 mt-4">
                <h3 className="text-sm font-bold text-slate-900">Edit Contact</h3>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-slate-900">Add New Contact</h2>
            <form onSubmit={handleAddContact} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Omowunmi"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +2348012345678"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact, onPreview }: { contact: Contact; onPreview: () => void }) {
  return (
    <div
      onClick={onPreview}
      className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm hover:border-slate-300 cursor-pointer transition-all active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
          {contact.name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800">{contact.name}</span>
          <span className="text-[11px] text-slate-400 font-medium">{contact.phone}</span>
        </div>
      </div>
      <div className="p-2 rounded-full bg-blue-50 text-blue-600">
        <Phone className="w-4 h-4" />
      </div>
    </div>
  );
}