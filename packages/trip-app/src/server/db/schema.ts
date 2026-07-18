import { relations, sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ============================================================================
// User (Better Auth managed)
// ============================================================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified").notNull().default(0),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Trips Table
// ============================================================================
export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  destination: text("destination"),
  startDate: text("startDate").notNull(), // YYYY-MM-DD
  endDate: text("endDate").notNull(), // YYYY-MM-DD
  coverImageUrl: text("coverImageUrl"), // R2 object key
  ownerId: text("ownerId").notNull(),
  inviteToken: text("inviteToken").notNull().unique(),
  createdAt: integer("createdAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Trip Members Table (composite primary key)
// ============================================================================
export const tripMembers = sqliteTable(
  "trip_members",
  {
    tripId: text("tripId").notNull(),
    userId: text("userId").notNull(),
    role: text("role", { enum: ["owner", "member"] })
      .notNull()
      .default("member"),
    joinedAt: integer("joinedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tripId, table.userId] }),
  })
);

// ============================================================================
// Schedule Items Table
// ============================================================================
export const scheduleItems = sqliteTable("schedule_items", {
  id: text("id").primaryKey(),
  tripId: text("tripId").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  startTime: text("startTime"), // HH:MM format, nullable
  endTime: text("endTime"), // HH:MM format, nullable
  title: text("title").notNull(),
  placeName: text("placeName"),
  placeUrl: text("placeUrl"),
  memo: text("memo"),
  eventType: text("eventType"), // EventType key, nullable
  imageUrl: text("imageUrl"), // R2 object key
  orderIndex: integer("orderIndex").notNull().default(0),
  updatedBy: text("updatedBy"), // User ID, nullable
  createdAt: integer("createdAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Todos Table
// ============================================================================
export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  tripId: text("tripId").notNull(),
  title: text("title").notNull(),
  isDone: integer("isDone").notNull().default(0), // 0 | 1
  assigneeId: text("assigneeId"), // User ID, nullable (assignment is optional)
  priority: text("priority", { enum: ["high", "medium", "low"] })
    .notNull()
    .default("medium"),
  createdAt: integer("createdAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Todo Tags Table (composite primary key - free-form many-to-many)
// ============================================================================
export const todoTags = sqliteTable(
  "todo_tags",
  {
    todoId: text("todoId").notNull(),
    tag: text("tag").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.todoId, table.tag] }),
  })
);

// ============================================================================
// Trip Memos Table (tripId as primary key - 1 memo per trip)
// ============================================================================
export const tripMemos = sqliteTable("trip_memos", {
  tripId: text("tripId").primaryKey(),
  content: text("content").notNull().default(""),
  updatedBy: text("updatedBy"), // User ID, nullable
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Scraps Table (standalone memo, NOT tied to a trip)
// ============================================================================
export const scraps = sqliteTable("scraps", {
  id: text("id").primaryKey(),
  content: text("content"), // nullable - image-only scraps are allowed
  imageData: text("imageData"), // nullable - base64 data URL
  authorId: text("authorId").notNull(), // User ID
  createdAt: integer("createdAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
  updatedAt: integer("updatedAt").notNull().default(sql`(cast(unixepoch() * 1000 as integer))`),
});

// ============================================================================
// Scrap Tags Table (composite primary key - free-form many-to-many)
// ============================================================================
export const scrapTags = sqliteTable(
  "scrap_tags",
  {
    scrapId: text("scrapId").notNull(),
    tag: text("tag").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.scrapId, table.tag] }),
  })
);

// ============================================================================
// Relations
// ============================================================================

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(users, {
    fields: [trips.ownerId],
    references: [users.id],
  }),
  members: many(tripMembers),
  scheduleItems: many(scheduleItems),
  todos: many(todos),
  memo: one(tripMemos, {
    fields: [trips.id],
    references: [tripMemos.tripId],
  }),
}));

export const tripMembersRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, {
    fields: [tripMembers.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripMembers.userId],
    references: [users.id],
  }),
}));

export const scheduleItemsRelations = relations(scheduleItems, ({ one }) => ({
  trip: one(trips, {
    fields: [scheduleItems.tripId],
    references: [trips.id],
  }),
  updater: one(users, {
    fields: [scheduleItems.updatedBy],
    references: [users.id],
  }),
}));

export const todosRelations = relations(todos, ({ one, many }) => ({
  trip: one(trips, {
    fields: [todos.tripId],
    references: [trips.id],
  }),
  assignee: one(users, {
    fields: [todos.assigneeId],
    references: [users.id],
  }),
  tags: many(todoTags),
}));

export const todoTagsRelations = relations(todoTags, ({ one }) => ({
  todo: one(todos, {
    fields: [todoTags.todoId],
    references: [todos.id],
  }),
}));

export const tripMemosRelations = relations(tripMemos, ({ one }) => ({
  trip: one(trips, {
    fields: [tripMemos.tripId],
    references: [trips.id],
  }),
  updater: one(users, {
    fields: [tripMemos.updatedBy],
    references: [users.id],
  }),
}));

export const scrapsRelations = relations(scraps, ({ one, many }) => ({
  author: one(users, {
    fields: [scraps.authorId],
    references: [users.id],
  }),
  tags: many(scrapTags),
}));

export const scrapTagsRelations = relations(scrapTags, ({ one }) => ({
  scrap: one(scraps, {
    fields: [scrapTags.scrapId],
    references: [scraps.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  tripsOwned: many(trips),
  tripMemberships: many(tripMembers),
  schedulesUpdated: many(scheduleItems),
  todosAssigned: many(todos),
  memosUpdated: many(tripMemos),
  scrapsAuthored: many(scraps),
}));

// ============================================================================
// Export type helpers for query results
// ============================================================================
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type TripMember = typeof tripMembers.$inferSelect;
export type NewTripMember = typeof tripMembers.$inferInsert;
export type ScheduleItem = typeof scheduleItems.$inferSelect;
export type NewScheduleItem = typeof scheduleItems.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type TodoTag = typeof todoTags.$inferSelect;
export type NewTodoTag = typeof todoTags.$inferInsert;
export type TripMemo = typeof tripMemos.$inferSelect;
export type NewTripMemo = typeof tripMemos.$inferInsert;
export type Scrap = typeof scraps.$inferSelect;
export type NewScrap = typeof scraps.$inferInsert;
export type ScrapTag = typeof scrapTags.$inferSelect;
export type NewScrapTag = typeof scrapTags.$inferInsert;
export type User = typeof users.$inferSelect;
