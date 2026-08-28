import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  User,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const MessagesHub: React.FC = () => {
  const { messages, sendMessage, clients, users, currentUser } = useCRM();

  const [activeConvId, setActiveConvId] = useState<string>(clients[0]?.id || 'client-1');
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Find active client or user thread
  const activeClient = clients.find((c) => c.id === activeConvId);

  // Group messages by conversation ID
  const activeThread = messages.filter((m) => m.conversationId === activeConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeConvId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Communication & Chat Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time client conversations, PRO inquiries, and customer support channels
        </p>
      </div>

      {/* Main Chat Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 h-[600px]">
        {/* Left Col: Threads List */}
        <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {clients.map((client) => {
              const threadMsgs = messages.filter((m) => m.conversationId === client.id);
              const lastMsg = threadMsgs[threadMsgs.length - 1];
              const isSelected = activeConvId === client.id;

              return (
                <div
                  key={client.id}
                  onClick={() => setActiveConvId(client.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <img src={client.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {client.fullName}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lastMsg ? lastMsg.text : 'Start conversation...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Chat Screen */}
        <div className="md:col-span-2 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/30">
          {activeClient ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeClient.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{activeClient.fullName}</h3>
                    <p className="text-[10px] text-slate-500">
                      Ref: {activeClient.refNo} • {activeClient.currentStageName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <a
                    href={`tel:${activeClient.mobile}`}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeThread.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No messages yet. Send a message to initiate the discussion.
                  </div>
                ) : (
                  activeThread.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md p-3 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs'
                          }`}
                        >
                          <p className="font-semibold text-[10px] opacity-75 mb-0.5">{msg.senderName}</p>
                          <p>{msg.text}</p>
                          <div className="text-[9px] opacity-60 text-right mt-1 flex items-center justify-end gap-1">
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Reply to ${activeClient.fullName}...`}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation from the left to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
