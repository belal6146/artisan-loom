import { sql } from "drizzle-orm";
import { 
  text, 
  integer, 
  boolean, 
  timestamp, 
  jsonb,
  pgTable,
  uuid,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { 
  text as sqliteText, 
  integer as sqliteInteger, 
  blob as sqliteBlob,
  sqliteTable
} from "drizzle-orm/sqlite-core";

// Common fields for both PostgreSQL and SQLite
const createTimestamp = () => ({
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// PostgreSQL Schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  birthday: timestamp("birthday"),
  location: text("location"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  restrictProcessing: boolean("restrict_processing").default(false),
  ...createTimestamp(),
}, (table) => ({
  usernameIdx: index("users_username_idx").on(table.username),
  emailIdx: index("users_email_idx").on(table.email),
}));

export const artworks = pgTable("artworks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // enum: painting|sculpture|handicraft|other
  forSale: boolean("for_sale").default(false),
  priceAmount: integer("price_amount"),
  priceCurrency: text("price_currency").default("USD"),
  privacy: text("privacy").default("public"), // enum: public|private
  location: text("location"),
  meta: jsonb("meta"), // AI tags, colors, caption
  ...createTimestamp(),
}, (table) => ({
  userIdIdx: index("artworks_user_id_idx").on(table.userId),
  categoryIdx: index("artworks_category_idx").on(table.category),
  forSaleIdx: index("artworks_for_sale_idx").on(table.forSale),
}));

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // enum: text|image|video|gif
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  likes: integer("likes").default(0),
  ...createTimestamp(),
}, (table) => ({
  authorIdIdx: index("posts_author_id_idx").on(table.authorId),
  typeIdx: index("posts_type_idx").on(table.type),
}));

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  likes: integer("likes").default(0),
  ...createTimestamp(),
}, (table) => ({
  postIdIdx: index("comments_post_id_idx").on(table.postId),
  authorIdIdx: index("comments_author_id_idx").on(table.authorId),
}));

export const follows = pgTable("follows", {
  followerId: uuid("follower_id").references(() => users.id).notNull(),
  followeeId: uuid("followee_id").references(() => users.id).notNull(),
  ...createTimestamp(),
}, (table) => ({
  pk: uniqueIndex("follows_pk").on(table.followerId, table.followeeId),
  followerIdx: index("follows_follower_idx").on(table.followerId),
  followeeIdx: index("follows_followee_idx").on(table.followeeId),
}));

export const collaborations = pgTable("collaborations", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  deadline: timestamp("deadline"),
  skills: jsonb("skills"), // string[]
  compensationType: text("compensation_type").notNull(), // enum: paid|revenue-share|voluntary
  compensation: text("compensation"),
  location: text("location"),
  contactInfo: text("contact_info"),
  participants: integer("participants").default(0),
  ...createTimestamp(),
}, (table) => ({
  creatorIdIdx: index("collaborations_creator_id_idx").on(table.creatorId),
  compensationTypeIdx: index("collaborations_compensation_type_idx").on(table.compensationType),
}));

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  type: text("type").notNull(), // enum: exhibition|workshop|fair|auction|other
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  location: text("location"),
  url: text("url"),
  ...createTimestamp(),
}, (table) => ({
  typeIdx: index("events_type_idx").on(table.type),
  startsAtIdx: index("events_starts_at_idx").on(table.startsAt),
}));

export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  artworkId: uuid("artwork_id").references(() => artworks.id).notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("USD"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  ...createTimestamp(),
}, (table) => ({
  buyerIdIdx: index("purchases_buyer_id_idx").on(table.buyerId),
  artworkIdIdx: index("purchases_artwork_id_idx").on(table.artworkId),
}));

// Privacy & GDPR Tables
export const consentRecords = pgTable("consent_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  essential: boolean("essential").default(true),
  analytics: boolean("analytics").default(false),
  marketing: boolean("marketing").default(false),
  aiFeatures: boolean("ai_features").default(false),
  gpcDetected: boolean("gpc_detected").default(false),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  consentHash: text("consent_hash"),
  ...createTimestamp(),
}, (table) => ({
  userIdIdx: index("consent_records_user_id_idx").on(table.userId),
  consentHashIdx: index("consent_records_hash_idx").on(table.consentHash),
}));

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  requestId: text("request_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  timestampIdx: index("audit_logs_timestamp_idx").on(table.timestamp),
}));

export const dsarRequests = pgTable("dsar_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // enum: access|export|rectify|delete|restrict
  status: text("status").default("pending"), // enum: pending|processing|completed|failed
  reason: text("reason"),
  metadata: jsonb("metadata"),
  downloadUrl: text("download_url"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  ...createTimestamp(),
}, (table) => ({
  userIdIdx: index("dsar_requests_user_id_idx").on(table.userId),
  typeIdx: index("dsar_requests_type_idx").on(table.type),
  statusIdx: index("dsar_requests_status_idx").on(table.status),
}));

export const breachIncidents = pgTable("breach_incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // enum: low|medium|high|critical
  affectedUsers: integer("affected_users").default(0),
  dataTypes: jsonb("data_types"), // string[]
  containmentActions: text("containment_actions"),
  notificationsSent: boolean("notifications_sent").default(false),
  regulatorNotified: boolean("regulator_notified").default(false),
  status: text("status").default("open"), // enum: open|investigating|contained|resolved
  ...createTimestamp(),
}, (table) => ({
  severityIdx: index("breach_incidents_severity_idx").on(table.severity),
  statusIdx: index("breach_incidents_status_idx").on(table.status),
}));