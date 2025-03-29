import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  
  // Initialize WebSocket connection
  useEffect(() => {
    if (!socketRef.current) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      setStatus('connecting');
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setStatus('open');
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          // Add message to state
          setMessages((prev) => [...prev, message]);
          
          // Handle different message types
          if (message.type === 'welcome') {
            toast({
              title: 'Connected',
              description: message.message,
              duration: 3000,
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to realtime updates',
          variant: 'destructive',
        });
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setStatus('closed');
      };
    }
    
    // Clean up on unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [toast]);
  
  // Send message function
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);
  
  // Ping function to keep connection alive
  const ping = useCallback(() => {
    return sendMessage({ type: 'ping', timestamp: Date.now() });
  }, [sendMessage]);
  
  return { status, messages, sendMessage, ping };
}