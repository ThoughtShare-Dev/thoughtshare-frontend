/**
 * In-memory fake database for mock mode, seeded from
 * THOUGHTSHARE_MOCK_DATA.md v1.0 (15 Aug 2026) so the app has a coherent,
 * reproducible state to develop and demo against. Resets on page reload —
 * that's intentional for a dev mock, not a bug.
 */
import { v4ish } from "./id.js";

// --- seeded members (IDs match the doc exactly) -----------------------
export const members = new Map([
  [
    "a1d40e2f-8c31-4b7a-9f52-1e6c8d3a0b41",
    {
      id: "a1d40e2f-8c31-4b7a-9f52-1e6c8d3a0b41",
      name: "Ada Okafor",
      email: "ada@example.com",
      password: "SecurePass1",
      role: "MEMBER",
      bio: "Final-year student looking to improve my employability.",
      profilePictureUrl: null,
      preferredContactType: "WHATSAPP",
      preferredContactValue: "+2348012345678",
      avgRating: 0,
      ratingCount: 0,
      hiddenFromSearch: false,
      isActive: true,
      teachingSkills: [],
      learningSkills: [
        {
          skillId: "e5b84c63-ca75-4fbe-d396-5cabcb7e4f85",
          name: "Excel",
          reasonNote: "I want to improve my employability.",
        },
      ],
    },
  ],
  [
    "b2e51f30-9d42-4c8b-a063-2f7d9e4b1c52",
    {
      id: "b2e51f30-9d42-4c8b-a063-2f7d9e4b1c52",
      name: "Aisha Bello",
      email: "aisha@example.com",
      password: "SecurePass1",
      role: "MEMBER",
      bio: "Data analyst. Five years building financial models.",
      profilePictureUrl: null,
      preferredContactType: "WHATSAPP",
      preferredContactValue: "+2348087654321",
      avgRating: 4.8,
      ratingCount: 12,
      hiddenFromSearch: false,
      isActive: true,
      teachingSkills: [
        {
          skillId: "e5b84c63-ca75-4fbe-d396-5cabcb7e4f85",
          name: "Excel",
          contextNote: "Five years building financial models.",
        },
      ],
      learningSkills: [
        {
          skillId: "b8eb7f96-fda8-42eb-a6c9-8fdefeab7c18",
          name: "Video Editing",
          reasonNote: "I want to create educational content.",
        },
      ],
    },
  ],
  [
    "c3f62a41-ae53-4d9c-b174-3a8eaf5c2d63",
    {
      id: "c3f62a41-ae53-4d9c-b174-3a8eaf5c2d63",
      name: "Chidi Nwosu",
      email: "chidi@example.com",
      password: "SecurePass1",
      role: "MEMBER",
      bio: "Accountant. Happy to walk through spreadsheets.",
      profilePictureUrl: null,
      preferredContactType: "EMAIL",
      preferredContactValue: "chidi@example.com",
      avgRating: 4.5,
      ratingCount: 8,
      hiddenFromSearch: false,
      isActive: true,
      teachingSkills: [
        {
          skillId: "e5b84c63-ca75-4fbe-d396-5cabcb7e4f85",
          name: "Excel",
          contextNote: "Happy to walk through spreadsheets.",
        },
      ],
      learningSkills: [],
    },
  ],
  [
    "d4a73b52-bf64-4ead-c285-4b9fba6d3e74",
    {
      id: "d4a73b52-bf64-4ead-c285-4b9fba6d3e74",
      name: "ThoughtShare Admin",
      email: "admin@thoughtshare.app",
      password: "AdminPass1",
      role: "ADMIN",
      bio: null,
      profilePictureUrl: null,
      preferredContactType: null,
      preferredContactValue: null,
      avgRating: 0,
      ratingCount: 0,
      hiddenFromSearch: false,
      isActive: true,
      teachingSkills: [],
      learningSkills: [],
    },
  ],
]);

export const membersByEmail = new Map(
  [...members.values()].map((m) => [m.email.toLowerCase(), m.id])
);

// --- skill library (illustrative subset of the seeded 18 across 7 categories) --
export const skills = [
  { id: "e5b84c63-ca75-4fbe-d396-5cabcb7e4f85", name: "Excel", category: "Productivity" },
  { id: "c9fc8a07-0eb9-43fc-b7da-90efafbc8d29", name: "Microsoft Word", category: "Productivity" },
  { id: "da0d9b18-1fca-440d-c8eb-a1fabacd9e3a", name: "Notion", category: "Productivity" },
  { id: "eb1eac29-20db-451e-d9fc-b20bcbde0f4b", name: "PowerPoint", category: "Productivity" },
  { id: "f6c95d74-db86-40cf-e4a7-6dbcdc8f5a96", name: "JavaScript", category: "Programming" },
  { id: "07da6a85-1c97-41da-a5b8-1ecded9a6b07", name: "Python", category: "Programming" },
  { id: "18eb7b96-2d08-42eb-b6c9-2fdefeab7c18", name: "SQL", category: "Data" },
  { id: "29fc8c07-3e19-43fc-c7da-30efafbc8d29", name: "Data Analysis", category: "Data" },
  { id: "a7da6e85-ec97-41da-f5b8-7ecded9a6b07", name: "Figma", category: "Design" },
  { id: "3a0d9d18-4f2a-440d-d8eb-41fabacd9e3a", name: "Canva", category: "Design" },
  { id: "b8eb7f96-fda8-42eb-a6c9-8fdefeab7c18", name: "Video Editing", category: "Media" },
  { id: "4b1eae29-502b-451e-e9fc-52bcbde0f4b0", name: "Photography", category: "Media" },
  { id: "5c2fbf3a-613c-462f-fabd-63cdcef1a5c1", name: "Public Speaking", category: "Communication" },
  { id: "6d30c04b-724d-473f-0bce-74dedf02b6d2", name: "Copywriting", category: "Communication" },
  { id: "7e41d15c-835e-4840-1cdf-85efe013c7e3", name: "Bookkeeping", category: "Finance" },
  { id: "8f52e26d-946f-4951-2def-96f0f124d8f4", name: "Financial Modelling", category: "Finance" },
];

// --- requests / reviews / notifications / reports (start empty, mutate at runtime) --
export const requests = [];
export const reviews = [];
export const notifications = [
  {
    id: "2f51ea6d-74ba-4a63-cefb-a751ba234daa",
    memberId: "b2e51f30-9d42-4c8b-a063-2f7d9e4b1c52",
    type: "NEW_REQUEST",
    learningRequestId: null,
    isRead: false,
    createdAt: "2026-08-15T10:00:00.000Z",
  },
];
export const reports = [];

export function nextId() {
  return v4ish();
}

export function findAcceptedConnection(memberIdA, memberIdB) {
  return requests.some(
    (r) =>
      r.status === "ACCEPTED" &&
      ((r.senderId === memberIdA && r.recipientId === memberIdB) ||
        (r.senderId === memberIdB && r.recipientId === memberIdA))
  );
}

export function memberPublicView(member, viewerId) {
  const isSelf = member.id === viewerId;
  const connected = isSelf || findAcceptedConnection(member.id, viewerId);
  return {
    id: member.id,
    name: member.name,
    bio: member.bio,
    profilePictureUrl: member.profilePictureUrl,
    avgRating: member.avgRating,
    ratingCount: member.ratingCount,
    preferredContactType: connected ? member.preferredContactType : null,
    preferredContactValue: connected ? member.preferredContactValue : null,
    teachingSkills: member.teachingSkills,
    learningSkills: member.learningSkills,
  };
}

export function memberMeView(member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    bio: member.bio,
    profilePictureUrl: member.profilePictureUrl,
    preferredContactType: member.preferredContactType,
    preferredContactValue: member.preferredContactValue,
    avgRating: member.avgRating,
    ratingCount: member.ratingCount,
    hiddenFromSearch: member.hiddenFromSearch,
    teachingSkills: member.teachingSkills,
    learningSkills: member.learningSkills,
  };
}
