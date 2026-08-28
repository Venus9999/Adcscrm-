import { getAccessToken } from './googleAuth';

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  historyId?: string;
  internalDate: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  isUnread?: boolean;
  hasAttachment?: boolean;
  labelIds?: string[];
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText: string;
  bodyHtml?: string;
  headers: Record<string, string>;
  labels: string[];
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
  threadId?: string;
}

// Utility to decode Base64 / Base64URL safely in browser
function decodeBase64Url(str: string): string {
  try {
    let clean = str.replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4) {
      clean += '=';
    }
    return decodeURIComponent(
      atob(clean)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return str;
    }
  }
}

// Utility to encode utf-8 string to Base64URL
function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const gmailService = {
  // Fetch user Gmail Profile
  async getProfile(): Promise<GmailProfile> {
    const token = await getAccessToken();
    if (!token) throw new Error('Gmail is not connected. Please sign in with Google.');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch Gmail profile');
    }

    return await res.json();
  },

  // List messages with optional search query (e.g. `q: "label:INBOX"`, `q: "to:client@domain.com"`)
  async listMessages(options?: {
    query?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate: number }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Gmail is not connected. Please sign in with Google.');

    const params = new URLSearchParams();
    if (options?.query) params.append('q', options.query);
    if (options?.maxResults) params.append('maxResults', options.maxResults.toString());
    else params.append('maxResults', '25');
    if (options?.pageToken) params.append('pageToken', options.pageToken);
    if (options?.labelIds) {
      options.labelIds.forEach((id) => params.append('labelIds', id));
    }

    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to list Gmail messages');
    }

    const data = await res.json();
    const rawMessages: { id: string; threadId: string }[] = data.messages || [];

    if (rawMessages.length === 0) {
      return { messages: [], resultSizeEstimate: 0 };
    }

    // Fetch message summaries in batches (first 15 for fast loading)
    const detailedList: GmailMessageSummary[] = await Promise.all(
      rawMessages.slice(0, 15).map(async (item) => {
        try {
          const detail = await gmailService.getMessageSummary(item.id);
          return detail;
        } catch {
          return {
            id: item.id,
            threadId: item.threadId,
            snippet: '',
            internalDate: Date.now().toString(),
          };
        }
      })
    );

    return {
      messages: detailedList,
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate || detailedList.length,
    };
  },

  // Get fast summary (headers only) for a message
  async getMessageSummary(messageId: string): Promise<GmailMessageSummary> {
    const token = await getAccessToken();
    if (!token) throw new Error('Gmail is not connected.');

    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error('Failed to fetch message summary');
    const data = await res.json();

    const headersMap: Record<string, string> = {};
    (data.payload?.headers || []).forEach((h: { name: string; value: string }) => {
      headersMap[h.name.toLowerCase()] = h.value;
    });

    const isUnread = (data.labelIds || []).includes('UNREAD');

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || '',
      internalDate: data.internalDate || Date.now().toString(),
      subject: headersMap['subject'] || '(No Subject)',
      from: headersMap['from'] || '',
      to: headersMap['to'] || '',
      date: headersMap['date'] || '',
      isUnread,
      labelIds: data.labelIds || [],
    };
  },

  // Get full message body and parsed content
  async getFullMessage(messageId: string): Promise<GmailMessageDetail> {
    const token = await getAccessToken();
    if (!token) throw new Error('Gmail is not connected.');

    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch message content');
    }

    const data = await res.json();
    const headersMap: Record<string, string> = {};
    (data.payload?.headers || []).forEach((h: { name: string; value: string }) => {
      headersMap[h.name.toLowerCase()] = h.value;
    });

    let bodyText = '';
    let bodyHtml = '';

    const extractParts = (part: any) => {
      if (!part) return;
      if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyText = decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        bodyHtml = decodeBase64Url(part.body.data);
      }

      if (part.parts && Array.isArray(part.parts)) {
        part.parts.forEach(extractParts);
      }
    };

    if (data.payload?.body?.data) {
      if (data.payload.mimeType === 'text/html') {
        bodyHtml = decodeBase64Url(data.payload.body.data);
      } else {
        bodyText = decodeBase64Url(data.payload.body.data);
      }
    }

    if (data.payload?.parts) {
      data.payload.parts.forEach(extractParts);
    }

    if (!bodyText && data.snippet) {
      bodyText = data.snippet;
    }

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || '',
      internalDate: data.internalDate || Date.now().toString(),
      subject: headersMap['subject'] || '(No Subject)',
      from: headersMap['from'] || '',
      to: headersMap['to'] || '',
      date: headersMap['date'] || '',
      isUnread: (data.labelIds || []).includes('UNREAD'),
      labelIds: data.labelIds || [],
      labels: data.labelIds || [],
      headers: headersMap,
      bodyText: bodyText || (bodyHtml ? bodyHtml.replace(/<[^>]*>?/gm, '') : ''),
      bodyHtml,
    };
  },

  // Send an email directly via user's Gmail account (MANDATORY: UI must confirm with user first)
  async sendEmail(payload: SendEmailPayload): Promise<{ id: string; threadId: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Gmail is not connected. Please authenticate with Google.');

    // Construct valid RFC 2822 email format
    const lines: string[] = [];
    lines.push(`To: ${payload.to}`);
    if (payload.cc) lines.push(`Cc: ${payload.cc}`);
    if (payload.bcc) lines.push(`Bcc: ${payload.bcc}`);
    lines.push(`Subject: ${payload.subject}`);
    lines.push('MIME-Version: 1.0');
    if (payload.isHtml) {
      lines.push('Content-Type: text/html; charset=UTF-8');
    } else {
      lines.push('Content-Type: text/plain; charset=UTF-8');
    }
    if (payload.inReplyTo) {
      lines.push(`In-Reply-To: ${payload.inReplyTo}`);
      lines.push(`References: ${payload.inReplyTo}`);
    }
    lines.push('');
    lines.push(payload.body);

    const emailRaw = lines.join('\r\n');
    const encodedEmail = encodeBase64Url(emailRaw);

    const requestBody: { raw: string; threadId?: string } = {
      raw: encodedEmail,
    };
    if (payload.threadId) {
      requestBody.threadId = payload.threadId;
    }

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to send email via Gmail API');
    }

    return await res.json();
  },

  // Mark message as read/unread
  async modifyLabels(messageId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<void> {
    const token = await getAccessToken();
    if (!token) return;

    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds,
        removeLabelIds,
      }),
    });
  },

  // Move email to Trash (MANDATORY: Confirmation dialog required before calling)
  async trashMessage(messageId: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Gmail is not connected.');

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to move email to trash');
    }
  },
};
