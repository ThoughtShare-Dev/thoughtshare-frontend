/**
 * MSW request handlers — mock ThoughtShare backend.
 *
 * Source of truth: THOUGHTSHARE_MOCK_DATA.md v1.0 (15 Aug 2026), a
 * companion to the API contract sent by the backend team. Where that doc
 * flags a "backend gap" (the live API not matching the contract yet),
 * these handlers implement the *target* contract shape, not the live
 * bug — per the doc's own instruction in §12: "build against the
 * contract shape, not against what the API returns today."
 *
 * This means: once the real backend catches up to its own contract,
 * you should be able to flip VITE_USE_MOCKS to false and nothing else
 * in the app needs to change.
 */
import { http, HttpResponse } from "msw";
import {
  members,
  membersByEmail,
  skills,
  requests,
  reviews,
  notifications,
  reports,
  nextId,
  findAcceptedConnection,
  memberPublicView,
  memberMeView,
} from "./db.js";
import { createMockToken } from "./token.js";

const BASE = import.meta.env.VITE_API_BASE_URL;
const ORIGIN = new URL(BASE).origin;

// --- helpers --------------------------------------------------------------
function ok(data, status = 200) {
  return HttpResponse.json({ success: true, data }, { status });
}

function fail(status, code, message, field) {
  return HttpResponse.json(
    { success: false, error: { code, message, ...(field ? { field } : {}) } },
    { status }
  );
}

function noContent() {
  return new HttpResponse(null, { status: 204 });
}

function getAuthedMember(request) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return members.get(payload.sub) ?? null;
  } catch {
    return null;
  }
}

function paginate(list, page = 1, pageSize = 20) {
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const start = (p - 1) * ps;
  return {
    items: list.slice(start, start + ps),
    page: p,
    pageSize: ps,
    total: list.length,
    totalPages: Math.max(1, Math.ceil(list.length / ps)),
  };
}

const failedLoginAttempts = new Map(); // email -> count, mock-only rate limiting

// --- 1. Authentication ------------------------------------------------------
const authHandlers = [
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = await request.json();
    const name = (body?.name ?? "").trim();
    const email = (body?.email ?? "").trim().toLowerCase();
    const password = body?.password ?? "";

    if (!name) return fail(400, "VALIDATION_ERROR", "Name is required", "name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, "VALIDATION_ERROR", "Enter a valid email address", "email");
    }
    if (password.length < 8) {
      return fail(400, "VALIDATION_ERROR", "Password must be at least 8 characters", "password");
    }
    if (membersByEmail.has(email)) {
      return fail(409, "EMAIL_TAKEN", "Email already exists");
    }

    const id = nextId();
    const member = {
      id,
      name,
      email,
      password,
      role: "MEMBER",
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
    };
    members.set(id, member);
    membersByEmail.set(email, id);

    return ok(
      {
        member: { id, name, email, bio: null, avgRating: 0, ratingCount: 0 },
        accessToken: createMockToken(member),
      },
      201
    );
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json();
    const email = (body?.email ?? "").trim().toLowerCase();
    const password = body?.password ?? "";

    const attempts = failedLoginAttempts.get(email) ?? 0;
    if (attempts >= 5) {
      return fail(429, "TOO_MANY_ATTEMPTS", "Too many login attempts. Try again in 15 minutes.");
    }

    const memberId = membersByEmail.get(email);
    const member = memberId ? members.get(memberId) : null;

    if (!member || member.password !== password) {
      failedLoginAttempts.set(email, attempts + 1);
      // Same response whether the email exists or not — see doc §3.
      return fail(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    if (!member.isActive) {
      return fail(401, "ACCOUNT_DEACTIVATED", "This account has been deactivated");
    }

    failedLoginAttempts.delete(email);
    return ok({
      accessToken: createMockToken(member),
      member: { id: member.id, name: member.name, email: member.email },
    });
  }),

  http.post(`${BASE}/auth/logout`, () => ok({ message: "Logged out" })),

  http.get(`${BASE}/auth/me`, ({ request }) => {
    const member = getAuthedMember(request);
    if (!member) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");
    return ok(memberMeView(member));
  }),
];

// --- 4. Skill library -------------------------------------------------------
const skillHandlers = [
  http.get(`${BASE}/skills`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const page = url.searchParams.get("page");
    const pageSize = url.searchParams.get("pageSize");

    let list = [...skills].sort((a, b) => a.name.localeCompare(b.name));
    if (category) list = list.filter((s) => s.category === category);

    return ok(paginate(list, page, pageSize));
  }),

  http.get(`${BASE}/skills/:id`, ({ params }) => {
    const skill = skills.find((s) => s.id === params.id);
    if (!skill) return fail(404, "NOT_FOUND", "Skill not found");
    return ok(skill);
  }),

  http.post(`${BASE}/admin/skills`, async ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");
    if (caller.role !== "ADMIN") return fail(403, "FORBIDDEN", "Admin access required");

    const body = await request.json();
    const name = (body?.name ?? "").trim();
    const category = (body?.category ?? "").trim();
    if (!name) return fail(400, "VALIDATION_ERROR", "Skill name cannot be empty", "name");

    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      return fail(409, "SKILL_NAME_TAKEN", "A skill with this name already exists", "name");
    }

    const skill = { id: nextId(), name, category };
    skills.push(skill);
    return ok(skill, 201);
  }),

  http.put(`${BASE}/admin/skills/:id`, async ({ request, params }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");
    if (caller.role !== "ADMIN") return fail(403, "FORBIDDEN", "Admin access required");

    const skill = skills.find((s) => s.id === params.id);
    if (!skill) return fail(404, "NOT_FOUND", "Skill not found");

    const body = await request.json();
    if (body.name) skill.name = body.name;
    if (body.category) skill.category = body.category;
    return ok(skill);
  }),

  http.delete(`${BASE}/admin/skills/:id`, ({ request, params }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");
    if (caller.role !== "ADMIN") return fail(403, "FORBIDDEN", "Admin access required");

    const skill = skills.find((s) => s.id === params.id);
    if (!skill) return fail(404, "NOT_FOUND", "Skill not found");

    const inUse = [...members.values()].some(
      (m) =>
        m.teachingSkills.some((s) => s.skillId === skill.id) ||
        m.learningSkills.some((s) => s.skillId === skill.id)
    );
    if (inUse) return fail(409, "SKILL_IN_USE", "Skill is in use and cannot be deleted");

    const idx = skills.findIndex((s) => s.id === params.id);
    skills.splice(idx, 1);
    return noContent();
  }),
];

// --- 5. Members and search ---------------------------------------------------
const memberHandlers = [
  http.get(`${BASE}/members/:id`, ({ request, params }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const member = members.get(params.id);
    if (!member) return fail(404, "NOT_FOUND", "Member not found");

    return ok(memberPublicView(member, caller.id));
  }),

  http.put(`${BASE}/members/me`, async ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const body = await request.json();
    if (typeof body.bio === "string" && body.bio.length > 500) {
      return fail(400, "VALIDATION_ERROR", "bio cannot exceed 500 characters", "bio");
    }
    const validContactTypes = ["EMAIL", "WHATSAPP", "PHONE", "INSTAGRAM"];
    if (body.preferredContactType && !validContactTypes.includes(body.preferredContactType)) {
      return fail(
        400,
        "VALIDATION_ERROR",
        "preferredContactType must be one of EMAIL, WHATSAPP, PHONE, INSTAGRAM",
        "preferredContactType"
      );
    }

    // Editable fields only — email/avgRating/role/isActive are silently ignored per doc §5.
    if (typeof body.name === "string") caller.name = body.name;
    if (typeof body.bio === "string") caller.bio = body.bio;
    if (typeof body.preferredContactType !== "undefined") {
      caller.preferredContactType = body.preferredContactType;
    }
    if (typeof body.preferredContactValue !== "undefined") {
      caller.preferredContactValue = body.preferredContactValue;
    }

    return ok(memberMeView(caller));
  }),

  http.get(`${BASE}/search`, ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const url = new URL(request.url);
    const skillName = url.searchParams.get("skill");
    const mode = url.searchParams.get("mode") || "teach";
    const page = url.searchParams.get("page");
    const pageSize = url.searchParams.get("pageSize");

    if (!skillName || !skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      return fail(400, "SKILL_NOT_FOUND", "Search skill is not in the library", "skill");
    }
    if (!["teach", "learn"].includes(mode)) {
      return fail(400, "INVALID_SEARCH_MODE", "Search mode must be teach or learn", "mode");
    }

    const matches = [...members.values()].filter((m) => {
      if (m.id === caller.id || m.hiddenFromSearch || !m.isActive) return false;
      const list = mode === "teach" ? m.teachingSkills : m.learningSkills;
      return list.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
    });

    matches.sort((a, b) => b.avgRating - a.avgRating || a.name.localeCompare(b.name));

    const paged = paginate(matches, page, pageSize);
    return ok({
      results: paged.items.map((m) => ({
        id: m.id,
        name: m.name,
        bio: m.bio,
        profilePictureUrl: m.profilePictureUrl,
        avgRating: m.avgRating,
        ratingCount: m.ratingCount,
        teachingSkills: m.teachingSkills.map((s) => s.name),
      })),
      page: paged.page,
      pageSize: paged.pageSize,
      total: paged.total,
      totalPages: paged.totalPages,
    });
  }),
];

// --- 6. Learning requests -----------------------------------------------------
function requestListItem(r) {
  const sender = members.get(r.senderId);
  const recipient = members.get(r.recipientId);
  return {
    id: r.id,
    status: r.status,
    createdAt: r.createdAt,
    sender: { id: sender.id, name: sender.name, profilePictureUrl: sender.profilePictureUrl },
    recipient: { id: recipient.id, name: recipient.name, profilePictureUrl: recipient.profilePictureUrl },
  };
}

const requestHandlers = [
  http.post(`${BASE}/requests`, async ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const body = await request.json();
    const recipientId = body?.recipientId;

    if (recipientId === caller.id) {
      return fail(400, "SELF_REQUEST", "You cannot send a learning request to yourself");
    }
    const recipient = members.get(recipientId);
    if (!recipient) return fail(404, "RECIPIENT_NOT_FOUND", "Recipient does not exist");

    const alreadyPending = requests.some(
      (r) => r.senderId === caller.id && r.recipientId === recipientId && r.status === "PENDING"
    );
    if (alreadyPending) {
      return fail(409, "REQUEST_ALREADY_PENDING", "You already have a pending request to this member");
    }

    const req = {
      id: nextId(),
      senderId: caller.id,
      recipientId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    requests.push(req);
    notifications.push({
      id: nextId(),
      memberId: recipientId,
      type: "NEW_REQUEST",
      learningRequestId: req.id,
      isRead: false,
      createdAt: req.createdAt,
    });

    return ok(
      {
        id: req.id,
        senderId: req.senderId,
        recipientId: req.recipientId,
        status: req.status,
        createdAt: req.createdAt,
      },
      201
    );
  }),

  http.get(`${BASE}/requests`, ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const mine = requests.filter((r) => r.senderId === caller.id || r.recipientId === caller.id);
    return ok(mine.map(requestListItem));
  }),

  http.patch(`${BASE}/requests/:id/accept`, ({ request, params }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const req = requests.find((r) => r.id === params.id);
    if (!req) return fail(404, "NOT_FOUND", "Request not found");
    if (req.recipientId !== caller.id) {
      return fail(403, "NOT_RECIPIENT", "Only the recipient can respond to this request");
    }
    if (req.status !== "PENDING") {
      return fail(409, "INVALID_STATE", "This request has already been responded to");
    }

    req.status = "ACCEPTED";
    req.updatedAt = new Date().toISOString();
    notifications.push({
      id: nextId(),
      memberId: req.senderId,
      type: "REQUEST_ACCEPTED",
      learningRequestId: req.id,
      isRead: false,
      createdAt: req.updatedAt,
    });

    return ok({
      id: req.id,
      senderId: req.senderId,
      recipientId: req.recipientId,
      status: req.status,
      updatedAt: req.updatedAt,
    });
  }),

  http.patch(`${BASE}/requests/:id/decline`, ({ request, params }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const req = requests.find((r) => r.id === params.id);
    if (!req) return fail(404, "NOT_FOUND", "Request not found");
    if (req.recipientId !== caller.id) {
      return fail(403, "NOT_RECIPIENT", "Only the recipient can respond to this request");
    }
    if (req.status !== "PENDING") {
      return fail(409, "INVALID_STATE", "This request has already been responded to");
    }

    req.status = "DECLINED";
    req.updatedAt = new Date().toISOString();
    notifications.push({
      id: nextId(),
      memberId: req.senderId,
      type: "REQUEST_DECLINED",
      learningRequestId: req.id,
      isRead: false,
      createdAt: req.updatedAt,
    });

    return ok({
      id: req.id,
      senderId: req.senderId,
      recipientId: req.recipientId,
      status: req.status,
      updatedAt: req.updatedAt,
    });
  }),
];

// --- 7. Reviews ----------------------------------------------------------------
function recalcRating(memberId) {
  const theirs = reviews.filter((r) => r.revieweeId === memberId);
  const member = members.get(memberId);
  if (!member) return;
  member.ratingCount = theirs.length;
  member.avgRating = theirs.length
    ? Math.round((theirs.reduce((sum, r) => sum + r.rating, 0) / theirs.length) * 10) / 10
    : 0;
}

const reviewHandlers = [
  http.post(`${BASE}/reviews`, async ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const body = await request.json();
    const { requestId, rating, reviewText } = body ?? {};

    const req = requests.find((r) => r.id === requestId);
    const involved = req && (req.senderId === caller.id || req.recipientId === caller.id);
    if (!req || req.status !== "ACCEPTED" || !involved) {
      return fail(403, "NO_ACCEPTED_CONNECTION", "You can only review an accepted connection");
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return fail(400, "VALIDATION_ERROR", "Rating must be an integer between 1 and 5", "rating");
    }

    const revieweeId = req.senderId === caller.id ? req.recipientId : req.senderId;
    const existing = reviews.find((r) => r.reviewerId === caller.id && r.requestId === requestId);
    if (existing) {
      return fail(409, "REVIEW_ALREADY_EXISTS", "You have already reviewed this connection");
    }

    const review = {
      id: nextId(),
      requestId,
      reviewerId: caller.id,
      revieweeId,
      rating,
      reviewText,
      editCount: 0,
      createdAt: new Date().toISOString(),
    };
    reviews.push(review);
    recalcRating(revieweeId);

    return ok(review, 201);
  }),

  http.put(`${BASE}/reviews/:id`, async ({ request, params }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const review = reviews.find((r) => r.id === params.id);
    if (!review) return fail(404, "NOT_FOUND", "Review not found");
    if (review.reviewerId !== caller.id) {
      return fail(403, "FORBIDDEN", "You can only edit your own review");
    }
    if (review.editCount >= 2) {
      return fail(403, "EDIT_LIMIT_REACHED", "This review has reached the maximum number of edits");
    }

    const body = await request.json();
    if (typeof body.rating !== "undefined") {
      if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
        return fail(400, "VALIDATION_ERROR", "Rating must be an integer between 1 and 5", "rating");
      }
      review.rating = body.rating;
    }
    if (typeof body.reviewText !== "undefined") review.reviewText = body.reviewText;
    review.editCount += 1;
    recalcRating(review.revieweeId);

    return ok(review);
  }),

  http.get(`${BASE}/members/:id/reviews`, ({ request, params }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const theirs = reviews.filter((r) => r.revieweeId === params.id);
    return ok(
      theirs.map((r) => {
        const reviewer = members.get(r.reviewerId);
        return {
          id: r.id,
          rating: r.rating,
          reviewText: r.reviewText,
          createdAt: r.createdAt,
          reviewer: { id: reviewer.id, name: reviewer.name, profilePictureUrl: reviewer.profilePictureUrl },
        };
      })
    );
  }),
];

// --- 8. Notifications (not built on the live backend — stubbed here) -----------
const notificationHandlers = [
  http.get(`${BASE}/notifications`, ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const url = new URL(request.url);
    const mine = notifications
      .filter((n) => n.memberId === caller.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return ok(paginate(mine, url.searchParams.get("page"), url.searchParams.get("pageSize")));
  }),
];

// --- 9. Reports (not built on the live backend — stubbed here) -----------------
const reportHandlers = [
  http.post(`${BASE}/reports`, async ({ request }) => {
    const caller = getAuthedMember(request);
    if (!caller) return fail(401, "UNAUTHENTICATED", "Invalid or expired token");

    const body = await request.json();
    const { reportedMemberId, reason } = body ?? {};

    if (reportedMemberId === caller.id) {
      return fail(400, "SELF_REPORT", "You cannot report yourself");
    }
    const alreadyPending = reports.some(
      (r) => r.reporterId === caller.id && r.reportedMemberId === reportedMemberId && r.status === "PENDING"
    );
    if (alreadyPending) {
      return fail(409, "REPORT_ALREADY_PENDING", "You already have a pending report against this member");
    }

    const report = {
      id: nextId(),
      reporterId: caller.id,
      reportedMemberId,
      reason,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    reports.push(report);

    const reportedMember = members.get(reportedMemberId);
    if (reportedMember) reportedMember.hiddenFromSearch = true;

    return ok(report, 201);
  }),
];

// --- 10. Health ------------------------------------------------------------
const healthHandlers = [
  http.get(`${ORIGIN}/health`, () =>
    ok({ status: "ok", db: "connected (mock)", uptime: Math.floor(performance.now() / 1000) })
  ),
];

export const handlers = [
  ...authHandlers,
  ...skillHandlers,
  ...memberHandlers,
  ...requestHandlers,
  ...reviewHandlers,
  ...notificationHandlers,
  ...reportHandlers,
  ...healthHandlers,
];
