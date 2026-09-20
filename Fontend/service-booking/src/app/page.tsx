"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { LoginModal } from "@/components/auth/LoginModal";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { StylistsSection } from "@/components/home/StylistsSection";
import { BookingModal } from "@/components/home/BookingModal";
import { ServiceDetailModal } from "@/components/home/ServiceDetailModal";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [viewDetailId, setViewDetailId] = useState<number | null>(null);

  const handleOpenBooking = (serviceName?: string) => {
    if (serviceName) {
      setSelectedService(serviceName);
    }
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedService(undefined);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative">
      {/* Header Bar */}
      <Header onOpenBooking={() => handleOpenBooking()} />

      {/* Auth Login Modal */}
      <LoginModal />

      {/* Hero Section Banner */}
      <HeroSection onOpenBooking={() => handleOpenBooking()} />

      {/* Haircut Services & Pricing Section (Fetched from live API) */}
      <ServicesSection
        onSelectService={(sName) => handleOpenBooking(sName)}
        onViewDetail={(sId) => setViewDetailId(sId)}
      />

      {/* Master Barbers Team Section */}
      <StylistsSection />

      {/* Service Detail Popup Modal */}
      <ServiceDetailModal
        serviceId={viewDetailId}
        onClose={() => setViewDetailId(null)}
        onBookService={(sName) => handleOpenBooking(sName)}
      />

      {/* Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        preSelectedService={selectedService}
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}
