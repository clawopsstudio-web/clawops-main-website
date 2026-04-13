'use client';

import { useEffect, useRef } from 'react';
import { useDashboardStatsStore } from './store-gateway';
import { getGatewayClient, connectGateway } from './openclaw-gateway-client';
import { startSystemHealthRefresh } from './store-system-health';

export function useGatewayConnection() {
  const connect = useDashboardStatsStore((state) => state.connect);
  const isConnecting = useRef(false);

  useEffect(() => {
    if (isConnecting.current) return;

    const initializeGateway = async () => {
      isConnecting.current = true;

      try {
        // Connect to Contabo VPS Gateway
        const gatewayUrl = 'wss://app.clawops.studio:18789';
        console.log('Connecting to gateway:', gatewayUrl);
        await connectGateway(gatewayUrl);

        // Get client to attach listeners
        const client = getGatewayClient(gatewayUrl);

        console.log('Gateway connected successfully');

        // Start system health refresh (5-second intervals)
        startSystemHealthRefresh(5000);

        // Listen for agent events
        client.on('agent_started', (data) => {
          console.log('Agent started:', data);
          const stats = useDashboardStatsStore.getState().stats;
          useDashboardStatsStore.setState({
            stats: { ...stats, activeAgents: stats.activeAgents + 1 },
          });
        });

        client.on('agent_stopped', (data) => {
          console.log('Agent stopped:', data);
          const stats = useDashboardStatsStore.getState().stats;
          useDashboardStatsStore.setState({
            stats: { ...stats, activeAgents: Math.max(0, stats.activeAgents - 1) },
          });
        });

      } catch (error) {
        console.error('Failed to connect to gateway:', error);
      } finally {
        isConnecting.current = false;
      }
    };

    initializeGateway();

    return () => {
      console.log('Cleaning up gateway connection');
      isConnecting.current = false;
    };
  }, []);
}