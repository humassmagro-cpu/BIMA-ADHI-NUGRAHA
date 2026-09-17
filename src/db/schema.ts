import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  namaBarang: text('nama_barang').notNull(),
  kodeBarang: text('kode_barang').notNull().unique(),
  kondisiBarang: text('kondisi_barang').notNull(),
  lokasiPenggunaan: text('lokasi_penggunaan').notNull(),
  tahunPenerimaan: text('tahun_penerimaan').notNull(),
  asalPenerimaan: text('asal_penerimaan').notNull(),
  catatanTambahan: text('catatan_tambahan'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
  }),
}));
