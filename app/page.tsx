import HeroSection, { type HeroSectionComponentData } from "@/components/ui/hero-section";

const heroSectionData: HeroSectionComponentData = {
  navbar: {
    logoText: "PrepPilot",
    navLinks: [
      { text: "Dashboard", href: "/dashboard" },
      { text: "Create Paper", href: "/papers/new" },
      { text: "Practice Flow", href: "#practice" },
      { text: "Results", href: "#results" },
    ],
    authLinks: [
      { type: "link", text: "Sign In", href: "/login" },
      { type: "button-primary", text: "Start Preparing", href: "/login" },
    ],
  },
  heroContent: {
    subheadline: "Self-evaluation tests for focused exam preparation",
    headline: "Build MCQ papers, attend them, and learn from every result.",
    description:
      "Create sectioned question papers with custom marks, negative marking, and flexible option counts. Take tests in the browser, review scores instantly, and reattempt whenever you want.",
    secondaryCtaText: "View Dashboard",
    secondaryCtaLink: "/dashboard",
    primaryCtaText: "Create Question Paper",
    primaryCtaLink: "/papers/new",
  },
  appPreview: {
    headerControls: {
      filters: [
        { label: "Topic", icon: "folder", dropdown: true },
        { label: "Marks", icon: "info", dropdown: true },
        { label: "Time", icon: "calendar", dropdown: true },
      ],
      actions: [
        { type: "button-outline", text: "Reattempt", icon: "upload" },
        { type: "button-primary", text: "New Paper", icon: "plus" },
      ],
    },
    appDataTable: {
      headers: [
        { id: "name", label: "Question Paper", icon: "document" },
        { id: "assignee", label: "Sections", icon: "folder" },
        { id: "status", label: "Status", icon: "info" },
        { id: "dueDate", label: "Last Attempt", icon: "calendar" },
        { id: "project", label: "Score", icon: "user" },
      ],
      data: [
        {
          id: 1,
          name: "Physics: Motion and Forces",
          assignee: ["Kinematics", "Newton Laws"],
          status: "Ready",
          dueDate: "Today, 8:30 AM",
          project: "42 / 50",
        },
        {
          id: 2,
          name: "Chemistry: Organic Basics",
          assignee: ["Reactions", "Nomenclature"],
          status: "Reviewed",
          dueDate: "Yesterday",
          project: "31 / 40",
        },
        {
          id: 3,
          name: "Math: Algebra Speed Drill",
          assignee: ["Quadratics"],
          status: "Retake",
          dueDate: "2 days ago",
          project: "18 / 30",
        },
        {
          id: 4,
          name: "Biology: Cell Structure",
          assignee: ["Cells", "Organelles"],
          status: "Draft",
          dueDate: "Not attended",
          project: "12 questions",
        },
      ],
    },
  },
};

export default function HomePage() {
  return <HeroSection data={heroSectionData} />;
}
