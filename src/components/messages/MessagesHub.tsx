import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Phone,
  Building2,
  Mail,
  ShieldCheck,
  Paperclip,
  Smile,
  X,
  FileText,
  File,
  Download,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Info,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { MessageAttachment } from '../../types/crm';

interface ChatThreadItem {
  id: string;
  name: string;
  roleLabel: string;
  avatar: string;
  badge: string;
  badgeColor: string;
  phone?: string;
  email?: string;
  info: string;
  isBranch?: boolean;
  refNo?: string;
  status?: string;
}

const QUICK_EMOJIS = ['👍', '👋', '✅', '📄', '🏢', '✈️', '🇦🇪', '🙏', '💼', '📌', '🎉', '⭐', '🤝', '🕒', '💡', '📞'];

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys & Reactions',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '🤪', '😎',
      '🤩', '🥳', '🤔', '🤫', '🫡', '🤗', '🤝', '🙏', '❤️', '✨'
    ],
  },
  {
    name: 'Gestures & Status',
    emojis: [
      '👍', '👎', '👏', '🙌', '✌️', '🤞', '💪', '👌', '✅', '❌',
      '⚠️', '⏳', '🕒', '📌', '🎯', '💡', '🔥', '⭐', '💯', '🚀'
    ],
  },
  {
    name: 'Corporate & Business',
    emojis: [
      '💼', '🏢', '🏛️', '🤝', '💰', '💳', '🏦', '📊', '📈', '🖋️',
      '✍️', '💻', '📱', '📞', '📧', '✉️', '📦', '🏷️', '🔑', '🏷️'
    ],
  },
  {
    name: 'UAE, Legal & Visas',
    emojis: [
      '🇦🇪', '📄', '📑', '📋', '📁', '📂', '🗂️', '✈️', '🛂', '🛃',
      '🌍', '🗺️', '🛡️', '🔒', '🔏', '⚖️', '🏆', '🎯', '📍', '🌐'
    ],
  },
];

export const MessagesHub: React.FC = () => {
  const {
    messages,
    sendMessage,
    clients,
    users,
    companies,
    currentUser,
    selectedClientId,
  } = useCRM();

  // Pick client profile if logged in as client
  const clientProfile = useMemo(() => {
    if (currentUser.role !== 'client') return null;
    return (
      clients.find(
        (c) =>
          c.email &&
          currentUser.email &&
          c.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
      ) ||
      (selectedClientId ? clients.find((c) => c.id === selectedClientId) : null) ||
      clients.find((c) => c.id === currentUser.id) ||
      clients[0]
    );
  }, [clients, currentUser, selectedClientId]);

  // Assigned employee for client
  const clientAssignedEmp = useMemo(() => {
    if (!clientProfile) return null;
    return (
      users.find(
        (u) =>
          u.id === clientProfile.assignedEmployeeId ||
          u.name === clientProfile.assignedEmployeeName
      ) ||
      users.find((u) => u.role === 'employee' || u.role === 'admin') ||
      users[0]
    );
  }, [clientProfile, users]);

  // Assigned company/branch for client
  const clientAssignedComp = useMemo(() => {
    if (!clientProfile) return null;
    return (
      companies.find((c) => c.id === clientProfile.companyId) ||
      companies[0]
    );
  }, [clientProfile, companies]);

  // Generate role-isolated chat threads
  const chatThreads: ChatThreadItem[] = useMemo(() => {
    // 1. CLIENT ROLE: Strictly only Assigned Employee & Assigned Branch Desk
    if (currentUser.role === 'client') {
      if (!clientProfile) return [];
      const threads: ChatThreadItem[] = [
        {
          id: clientProfile.id,
          name: clientAssignedEmp?.name || clientProfile.assignedEmployeeName || 'Assigned PRO Consultant',
          roleLabel: 'Assigned PRO Consultant',
          avatar:
            clientAssignedEmp?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          badge: 'Assigned Officer',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          phone: clientAssignedEmp?.phone || '+971 4 228 7000',
          email: clientAssignedEmp?.email || 'operations@adcs.ae',
          info: `${clientAssignedEmp?.title || 'Immigration & PRO Specialist'} • ${clientAssignedEmp?.department || 'Operations Team'}`,
          isBranch: false,
          status: 'Online',
        },
        {
          id: `${clientProfile.id}-branch`,
          name: `${clientAssignedComp?.name || 'ADCS Group'} - Branch Desk`,
          roleLabel: `${clientAssignedComp?.city || 'Dubai'} Branch Office`,
          avatar:
            clientAssignedComp?.logo ||
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
          badge: 'Branch Office',
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          phone: clientAssignedComp?.phone || '+971 4 228 7000',
          email: clientAssignedComp?.email || 'info@theadcs.com',
          info: `${clientAssignedComp?.address || 'Corporate Tower'} • Customer Service & Escalations`,
          isBranch: true,
          status: 'Branch Active',
        },
      ];
      return threads;
    }

    // 2. EMPLOYEE ROLE: Strictly assigned clients + branch desk
    if (currentUser.role === 'employee') {
      const assignedClients = (clients || []).filter(
        (c) =>
          c &&
          (c.assignedEmployeeId === currentUser.id ||
            c.assignedEmployeeName === currentUser.name ||
            (c.assignedEmployeeIds && c.assignedEmployeeIds.includes(currentUser.id)))
      );

      const branchComp = companies.find((c) => c.id === currentUser.companyId) || companies[0];
      const branchThread: ChatThreadItem = {
        id: `branch-desk-${branchComp?.id || 'comp-1'}`,
        name: `${branchComp?.name || 'ADCS Group'} - Branch Desk`,
        roleLabel: `${branchComp?.city || 'Dubai'} Branch HQ`,
        avatar:
          branchComp?.logo ||
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
        badge: 'Branch Desk',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        phone: branchComp?.phone || '+971 4 228 7000',
        email: branchComp?.email || 'operations@adcs.ae',
        info: `${branchComp?.address || 'Corporate Tower'} • Internal Staff & Branch Communications`,
        isBranch: true,
        status: 'Branch Active',
      };

      const clientThreads: ChatThreadItem[] = assignedClients.map((client) => ({
        id: client.id,
        name: client.fullName,
        roleLabel: client.currentStageName || 'Assigned Client Dossier',
        avatar: client.avatar,
        badge: client.refNo,
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        phone: client.mobile || client.phone,
        email: client.email,
        info: `Ref: ${client.refNo} • Nationality: ${client.nationality} • Stage: ${client.currentStageName}`,
        refNo: client.refNo,
        status: client.status,
      }));

      return [branchThread, ...clientThreads];
    }

    // 3. MASTER / ADMIN ROLE: All client threads across the firm
    return (clients || []).map((client) => ({
      id: client.id,
      name: client.fullName,
      roleLabel: client.currentStageName || 'Client Dossier',
      avatar: client.avatar,
      badge: client.refNo,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      phone: client.mobile,
      email: client.email,
      info: `Ref: ${client.refNo} • Assigned: ${client.assignedEmployeeName} • Stage: ${client.currentStageName}`,
      refNo: client.refNo,
      status: client.status,
    }));
  }, [currentUser, clientProfile, clientAssignedEmp, clientAssignedComp, clients, companies]);

  const [activeConvId, setActiveConvId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize active conversation with available threads
  useEffect(() => {
    if (chatThreads.length > 0) {
      if (!activeConvId || !chatThreads.some((t) => t.id === activeConvId)) {
        setActiveConvId(chatThreads[0].id);
      }
    }
  }, [chatThreads, activeConvId]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Find active thread
  const activeThreadInfo = useMemo(() => {
    return chatThreads.find((t) => t.id === activeConvId) || chatThreads[0];
  }, [chatThreads, activeConvId]);

  // Group messages by conversation ID
  const activeMessages = useMemo(() => {
    if (!activeConvId) return [];
    return (messages || []).filter((m) => m && m.conversationId === activeConvId);
  }, [messages, activeConvId]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // Filtered threads by search input
  const filteredThreads = useMemo(() => {
    if (!searchFilter.trim()) return chatThreads;
    const query = searchFilter.toLowerCase().trim();
    return chatThreads.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.roleLabel.toLowerCase().includes(query) ||
        t.info.toLowerCase().includes(query) ||
        (t.refNo && t.refNo.toLowerCase().includes(query))
    );
  }, [chatThreads, searchFilter]);

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result as string;
        let fileType = 'document';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.includes('pdf')) fileType = 'pdf';
        else if (file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) fileType = 'sheet';
        else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) fileType = 'doc';

        const sizeKb = file.size / 1024;
        const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;

        const newAttachment: MessageAttachment = {
          name: file.name,
          url: resultUrl,
          size: sizeFormatted,
          type: fileType,
        };

        setPendingAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setPendingAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && pendingAttachments.length === 0) || !activeConvId) return;

    sendMessage(
      activeConvId,
      inputText.trim(),
      undefined,
      pendingAttachments.length > 0 ? pendingAttachments : undefined
    );

    setInputText('');
    setPendingAttachments([]);
    setShowEmojiPicker(false);
  };

  const filteredEmojiCategories = useMemo(() => {
    if (!emojiSearch.trim()) return EMOJI_CATEGORIES;
    const q = emojiSearch.toLowerCase().trim();
    return EMOJI_CATEGORIES.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter((emoji) => emoji.includes(q)),
    })).filter((cat) => cat.emojis.length > 0);
  }, [emojiSearch]);

  const renderFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    if (type === 'pdf') return <FileText className="w-4 h-4 text-rose-500" />;
    if (type === 'sheet') return <FileText className="w-4 h-4 text-green-500" />;
    return <File className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentUser.role === 'client' ? 'Assigned Team & Branch Support Line' : 'Communication & Message Hub'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {currentUser.role === 'client' ? 'Direct PRO Channel' : 'Secure Messages'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role === 'client'
              ? 'Direct encrypted messaging with your designated immigration officer and branch operations desk'
              : 'Real-time client conversations, PRO follow-up inquiries, file exchange, and case updates'}
          </p>
        </div>

        {currentUser.role === 'client' && clientProfile && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">
              Case Ref: <strong className="text-slate-900 dark:text-white font-mono">{clientProfile.refNo}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Chat Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 h-[680px]">
        {/* Left Col: Channels / Thread List */}
        <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/40 dark:bg-slate-900/40">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={currentUser.role === 'client' ? 'Search officer or branch...' : 'Search conversations...'}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {currentUser.role === 'client' && (
              <div className="text-[10px] text-slate-400 mt-2 px-1 flex items-center gap-1 font-medium">
                <Info className="w-3 h-3 text-blue-500 shrink-0" />
                <span>Showing only your designated consultant & branch desk</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredThreads.map((thread) => {
              const threadMsgs = (messages || []).filter((m) => m && m.conversationId === thread.id);
              const lastMsg = threadMsgs[threadMsgs.length - 1];
              const isSelected = activeConvId === thread.id;

              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveConvId(thread.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border-l-4 border-blue-600'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={thread.avatar}
                      alt={thread.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                    />
                    {thread.isBranch ? (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">
                        <Building2 className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {thread.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${thread.badgeColor}`}>
                        {thread.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">{thread.roleLabel}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                      {lastMsg ? (
                        lastMsg.attachments && lastMsg.attachments.length > 0 && !lastMsg.text ? (
                          <span className="italic text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Paperclip className="w-3 h-3 inline" /> Attachment ({lastMsg.attachments.length})
                          </span>
                        ) : (
                          lastMsg.text
                        )
                      ) : (
                        'Start conversation...'
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredThreads.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No matching contacts or branch lines found.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Active Chat Screen */}
        <div className="md:col-span-2 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/30 relative">
          {activeThreadInfo ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={activeThreadInfo.avatar}
                    alt={activeThreadInfo.name}
                    className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {activeThreadInfo.name}
                      </h3>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${activeThreadInfo.badgeColor}`}>
                        {activeThreadInfo.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {activeThreadInfo.info}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeThreadInfo.phone && (
                    <a
                      href={`tel:${activeThreadInfo.phone}`}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                      title="Direct Phone Line"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {activeThreadInfo.email && (
                    <a
                      href={`mailto:${activeThreadInfo.email}`}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                      title="Email Contact"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
                {activeMessages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Direct Channel Connected
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      {currentUser.role === 'client'
                        ? 'Send your questions regarding visa applications, required attestations, biometric schedules, or payments.'
                        : 'Send a direct message, attach official documents, or reply to this client dossier.'}
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe =
                      msg.senderId === currentUser.id ||
                      (currentUser.role === 'client' && msg.senderRole === 'client');
                    const hasAttachments = msg.attachments && msg.attachments.length > 0;

                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs space-y-2 ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-[10px] opacity-80">
                              {msg.senderName || (isMe ? 'You' : activeThreadInfo.name)}
                            </span>
                            <span className="text-[9px] opacity-70 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                          {/* Render Attached Files */}
                          {hasAttachments && (
                            <div className="space-y-1.5 pt-1">
                              {msg.attachments!.map((att, idx) => {
                                const isImage = att.type === 'image';
                                return isImage ? (
                                  <div
                                    key={idx}
                                    className="group relative rounded-xl overflow-hidden border border-white/20 dark:border-slate-700/60 bg-black/10 max-w-[280px]"
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      onClick={() => setSelectedImagePreview(att.url)}
                                      className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                    />
                                    <div className="p-1.5 bg-slate-900/80 backdrop-blur-xs flex items-center justify-between text-[10px] text-white">
                                      <span className="truncate max-w-[170px]">{att.name}</span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedImagePreview(att.url)}
                                          className="p-1 hover:text-blue-300 cursor-pointer"
                                          title="View Image"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                        <a
                                          href={att.url}
                                          download={att.name}
                                          className="p-1 hover:text-blue-300 cursor-pointer"
                                          title="Download File"
                                        >
                                          <Download className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    key={idx}
                                    className={`flex items-center justify-between gap-2 p-2 rounded-xl border ${
                                      isMe
                                        ? 'bg-blue-700/60 border-blue-500/50 text-white'
                                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="p-1.5 rounded-lg bg-white/20 dark:bg-slate-800 shrink-0">
                                        {renderFileIcon(att.type)}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-[11px] font-bold truncate max-w-[180px]">
                                          {att.name}
                                        </div>
                                        <div className="text-[9px] opacity-75 font-mono">{att.size}</div>
                                      </div>
                                    </div>
                                    <a
                                      href={att.url}
                                      download={att.name}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                                        isMe
                                          ? 'hover:bg-blue-800 text-white'
                                          : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                      }`}
                                      title="Download Attachment"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="text-[9px] opacity-60 text-right mt-1 flex items-center justify-end gap-1">
                            {isMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Emojis Bar */}
              <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Smile className="w-3 h-3 text-amber-500" /> Quick:
                </span>
                {QUICK_EMOJIS.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="p-1 text-sm hover:scale-125 transition-transform cursor-pointer rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Pending Attachments Preview Shelf */}
              {pendingAttachments.length > 0 && (
                <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/30 border-t border-blue-100 dark:border-blue-900/40 flex flex-wrap gap-2">
                  {pendingAttachments.map((att, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-800 shadow-2xs text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {renderFileIcon(att.type)}
                      <span className="max-w-[140px] truncate text-[11px]">{att.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono font-normal">({att.size})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Full Categorized Emoji Picker Popover */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-20 right-4 sm:right-6 w-80 max-w-[calc(100%-2rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-30 p-3 flex flex-col space-y-2.5 animate-in fade-in zoom-in-95"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Smile className="w-4 h-4 text-amber-500" />
                      <span>Insert Emoji</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={emojiSearch}
                      onChange={(e) => setEmojiSearch(e.target.value)}
                      placeholder="Search emojis..."
                      className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                    {filteredEmojiCategories.map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {cat.name}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {cat.emojis.map((emoji, eIdx) => (
                            <button
                              key={eIdx}
                              type="button"
                              onClick={() => handleInsertEmoji(emoji)}
                              className="p-1.5 text-base hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:scale-125 transition-transform cursor-pointer flex items-center justify-center"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form with Paperclip, Emoji, and Send */}
              <form
                onSubmit={handleSend}
                className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                />

                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer shrink-0"
                  title="Attach File or Document"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Emoji Popover Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    showEmojiPicker
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
                  title="Select Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Send message to ${activeThreadInfo.name}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() && pendingAttachments.length === 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation channel from the left to start messaging.
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 max-w-3xl w-full shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Image Preview
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImagePreview}
                  download="attachment-image"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImagePreview(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/5 dark:bg-black/40 p-2">
              <img
                src={selectedImagePreview}
                alt="Enlarged attachment"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
