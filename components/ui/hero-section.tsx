"use client";

import React, { useState } from "react";

interface NavLink {
  text: string;
  href: string;
}

interface AuthLinkBase {
  text: string;
  href: string;
  className?: string;
}

interface AuthLinkTypeLink extends AuthLinkBase {
  type: "link";
}

interface AuthLinkTypeButtonOutline extends AuthLinkBase {
  type: "button-outline";
}

interface AuthLinkTypeButtonPrimary extends AuthLinkBase {
  type: "button-primary";
}

type AuthLink = AuthLinkTypeLink | AuthLinkTypeButtonOutline | AuthLinkTypeButtonPrimary;

interface NavbarData {
  logoText: string;
  navLinks: NavLink[];
  authLinks: AuthLink[];
}

interface HeroContentData {
  subheadline: string;
  headline: string;
  description: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  primaryCtaText: string;
  primaryCtaLink: string;
}

interface AppPreviewFilter {
  label: string;
  icon?: string;
  dropdown?: boolean;
}

interface AppPreviewAction {
  type: "button-outline" | "button-primary";
  text: string;
  icon?: string;
}

interface AppPreviewHeaderControlsData {
  filters: AppPreviewFilter[];
  actions: AppPreviewAction[];
}

interface AppDataTableHeader {
  id: string;
  label: string;
  icon?: string;
}

interface AppDataTableRow {
  id?: number;
  name: string;
  assignee: string[];
  status: "Ready" | "Draft" | "Reviewed" | "Retake";
  dueDate: string;
  project: string;
}

interface AppDataTableData {
  headers: AppDataTableHeader[];
  data: AppDataTableRow[];
}

interface AppPreviewData {
  headerControls: AppPreviewHeaderControlsData;
  appDataTable: AppDataTableData;
}

export interface HeroSectionComponentData {
  navbar: NavbarData;
  heroContent: HeroContentData;
  appPreview: AppPreviewData;
}

const statusStyles: Record<AppDataTableRow["status"], { dot: string; pill: string }> = {
  Ready: { dot: "bg-emerald-500", pill: "bg-emerald-100 text-emerald-800" },
  Draft: { dot: "bg-slate-500", pill: "bg-slate-100 text-slate-800" },
  Reviewed: { dot: "bg-sky-500", pill: "bg-sky-100 text-sky-800" },
  Retake: { dot: "bg-amber-500", pill: "bg-amber-100 text-amber-800" },
};

const AbstractBackground = () => (
  <div aria-hidden="true">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-sky-700 opacity-50 z-0" />
    <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-sky-600 origin-bottom-right rotate-12 translate-y-1/3 -translate-x-1/4 opacity-90 z-0" />
    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-700 opacity-80 z-0" />
    <div className="absolute top-0 left-0 w-1/2 h-full bg-cyan-400 -skew-y-6 origin-top-left -translate-y-1/4 opacity-30 z-0" />
  </div>
);

const iconPath = (iconType?: string) => {
  if (iconType === "user") return "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";
  if (iconType === "calendar") return "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z";
  if (iconType === "plus") return "M12 6v6m0 0v6m0-6h6m-6 0H6";
  if (iconType === "upload") return "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12";
  if (iconType === "document") return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
  if (iconType === "folder") return "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z";
  return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
};

const TinyIcon = ({ icon, className = "text-gray-400" }: { icon?: string; className?: string }) => (
  <svg className={`w-3 h-3 mr-1 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath(icon)} />
  </svg>
);

const Navbar = ({ logoText, navLinks, authLinks, onMenuOpen }: NavbarData & { onMenuOpen: () => void }) => (
  <nav className="mb-4 bg-white rounded-xl relative z-10 max-w-6xl mx-auto flex items-center justify-between py-4 px-6 lg:px-12">
    <a href="/" className="flex items-center space-x-2">
      <span className="grid h-7 w-7 place-items-center rounded bg-orange-500 text-sm font-bold text-white">P</span>
      <span className="text-xl font-bold text-gray-800">{logoText}</span>
    </a>
    <div className="hidden lg:flex items-center gap-6 text-sm text-gray-600">
      {navLinks.map((link) => (
        <a key={link.text} href={link.href} className="hover:text-orange-600">
          {link.text}
        </a>
      ))}
      {authLinks.map((link) =>
        link.type === "button-primary" ? (
          <a key={link.text} href={link.href} className="rounded-md bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600">
            {link.text}
          </a>
        ) : (
          <a key={link.text} href={link.href} className="hover:text-orange-600">
            {link.text}
          </a>
        ),
      )}
    </div>
    <button className="lg:hidden text-gray-600" onClick={onMenuOpen} aria-label="Open mobile menu">
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>
  </nav>
);

const MobileMenu = ({ navLinks, authLinks, logoText, isOpen, onClose }: NavbarData & { isOpen: boolean; onClose: () => void }) => (
  <div className={`fixed inset-0 z-40 bg-white p-8 transition-transform duration-300 lg:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
    <div className="mb-8 flex items-center justify-between">
      <span className="text-xl font-bold text-gray-800">{logoText}</span>
      <button className="text-gray-600" onClick={onClose} aria-label="Close mobile menu">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div className="flex flex-col gap-5">
      {[...navLinks, ...authLinks].map((link) => (
        <a key={link.text} href={link.href} className="text-lg font-medium text-gray-800 hover:text-orange-600" onClick={onClose}>
          {link.text}
        </a>
      ))}
    </div>
  </div>
);

const HeroContent = ({ subheadline, headline, description, primaryCtaText, primaryCtaLink, secondaryCtaText, secondaryCtaLink }: HeroContentData) => (
  <div className="flex flex-col items-start p-8 text-left lg:px-12 lg:pb-14 lg:pt-10">
    <p className="mb-4 text-sm font-medium text-sky-700">{subheadline}</p>
    <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-normal text-gray-950 md:text-5xl">{headline}</h1>
    <p className="mb-8 max-w-2xl text-lg text-gray-700">{description}</p>
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <a href={secondaryCtaLink} className="rounded-full border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50">
        {secondaryCtaText}
      </a>
      <a href={primaryCtaLink} className="rounded-full bg-orange-500 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600">
        {primaryCtaText}
      </a>
    </div>
  </div>
);

const AppPreviewSection = ({ headerControls, appDataTable }: AppPreviewData) => (
  <div className="relative z-20 rounded-b-xl bg-gray-50 px-4 pb-6 md:px-8 lg:px-12">
    <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-600">Group by:</span>
        {headerControls.filters.map((filter) => (
          <button key={filter.label} className="flex items-center rounded border border-gray-300 px-2 py-1 hover:bg-gray-100">
            <TinyIcon icon={filter.icon} />
            <span className="text-gray-600">{filter.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {headerControls.actions.map((action) => (
          <button
            key={action.text}
            className={`flex items-center rounded px-2 py-1 text-xs font-semibold ${
              action.type === "button-primary" ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TinyIcon icon={action.icon} className={action.type === "button-primary" ? "text-white" : "text-gray-400"} />
            {action.text}
          </button>
        ))}
      </div>
    </div>
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-inner">
      <div className="hidden grid-cols-[1.8fr_1.2fr_0.9fr_1fr_1.1fr] gap-4 border-b border-gray-200 bg-gray-100 px-4 py-2 text-xs text-gray-500 md:grid">
        {appDataTable.headers.map((header) => (
          <div key={header.id} className="flex items-center">
            <TinyIcon icon={header.icon} />
            {header.label}
          </div>
        ))}
      </div>
      {appDataTable.data.map((row, index) => (
        <div key={row.id ?? row.name} className={`grid gap-2 px-4 py-3 text-sm text-gray-700 md:grid-cols-[1.8fr_1.2fr_0.9fr_1fr_1.1fr] md:gap-4 ${index < appDataTable.data.length - 1 ? "border-b border-gray-200" : ""}`}>
          <div className="flex items-center font-medium">
            <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${statusStyles[row.status].dot}`} />
            {row.name}
          </div>
          <div>{row.assignee.join(", ")}</div>
          <div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[row.status].pill}`}>{row.status}</span>
          </div>
          <div>{row.dueDate}</div>
          <div className="truncate">{row.project}</div>
        </div>
      ))}
    </div>
  </div>
);

export const HeroSection = ({ data }: { data: HeroSectionComponentData }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { navbar, heroContent, appPreview } = data;

  return (
    <div className="relative min-h-screen overflow-hidden bg-blue-50 px-4 py-4 font-sans sm:px-6">
      <AbstractBackground />
      <Navbar {...navbar} onMenuOpen={() => setIsMobileMenuOpen(true)} />
      <main className="relative z-10 mx-auto max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <HeroContent {...heroContent} />
        <AppPreviewSection {...appPreview} />
      </main>
      <MobileMenu {...navbar} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
};

export default HeroSection;
