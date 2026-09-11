import React from 'react';
import { Navigate } from 'react-router-dom';

// The Expert Workspace now lives inside the main dashboard (sidebar → Expert Workspace).
export default function ExpertWorkspace() {
  return <Navigate to="/?nav=expert-workspace" replace />;
}