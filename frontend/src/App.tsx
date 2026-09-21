import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { DeviceFrame } from './components/DeviceFrame';
import { BottomNav } from './components/BottomNav';
import { Welcome } from './pages/Welcome';
import { Home } from './pages/Home';
import { Inbox } from './pages/Inbox';
import { ShipmentCompare } from './pages/ShipmentCompare';
import { ReviewQueue } from './pages/ReviewQueue';
import { HumanReview } from './pages/HumanReview';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { EmailDetail } from './pages/EmailDetail';

function AppShell() {
  return (
    <DeviceFrame>
      <div className="relative h-full w-full overflow-hidden bg-canvas">
        <Outlet />
        <BottomNav />
      </div>
    </DeviceFrame>);

}

function WelcomeShell() {
  return (
    <DeviceFrame dark>
      <Welcome />
    </DeviceFrame>);

}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeShell />} />
        <Route element={<AppShell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/shipment/:id" element={<ShipmentCompare />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/review/:id" element={<HumanReview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/email/:id" element={<EmailDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>);

}