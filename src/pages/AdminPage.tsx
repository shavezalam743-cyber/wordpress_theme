import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Users, Tag, FolderOpen,
  Megaphone, Palette, Plus, Pencil, Trash2, X,
  Eye, Image, Video,
  Check, BarChart3, Settings, Save,
  AlertTriangle, Loader2, Search, ExternalLink, Coins, Crown, Link as LinkIcon // Naye icons
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, slugify, type Post, type Model, type Category, type Tag as TagType, type FooterAd, type UserProfile, type UserRole, type SubscriptionTier } from '@/lib/supabase'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'
import type { ExtendedPost } from '@/lib/types'

type AdminTab = 'overview' | 'posts' | 'models' | 'categories' | 'tags' | 'ads' | 'users' | 'coins' | 'engagement' | 'theme'

// ── Shared helpers ──────────────────────────────────────────────

const panelStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
}

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'green' | 'red' | 'orange' | 'blue' | 'gray' }) {
  const colors = {
    green: 'rgba(34,197,94,0.15) text-green-400 border-green-500/20',
    red: 'rgba(239,68,68,0.15) text-red-400 border-red-500/20',
    orange: 'rgba(255,90,60,0.15) text-orange-400 border-orange-500/20',
    blue: 'rgba(59,130,246,0.15) text-blue-400 border-blue-500/20',
    gray: 'rgba(255,255,255,0.08) text-white/50 border-white/10',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', colors[color])}>
      {children}
    </span>
  )
}

function ActionBtn({ onClick, variant, disabled, children }: { onClick: () => void; variant: 'edit' | 'delete'; disabled?: boolean; children?: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40',
        variant === 'edit' ? 'text-white/40 hover:text-white hover:bg-white/08' : 'text-red-400/60 hover:text-red-400 hover:bg-red-400/10'
      )}
    >
      {variant === 'edit' ? <Pencil className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
      {children}
    </motion.button>
  )
}

// ── Confirm Dialog ──────────────────────────────────────────────

function ConfirmDialog({ open, onClose, onConfirm, message }: { open: boolean; onClose: () => void; onConfirm: () => void; message: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 rounded-2xl p-6 max-w-sm w-full"
        style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-white font-semibold">Confirm Delete</p>
        </div>
        <p className="text-sm text-white/60 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Delete</button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Modal wrapper ───────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'rgba(16,16,16,0.99)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(16,16,16,0.99)' }}>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  )
}

// ── Form Fields ─────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  )
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:ring-1 focus:ring-brand'
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
      style={inputStyle}
    />
  )
}

function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(inputClass, 'resize-none')}
      style={inputStyle}
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={cn('relative w-11 h-6 rounded-full transition-colors flex-shrink-0')}
        style={{ background: checked ? 'linear-gradient(135deg, #ff5a3c, #ff784e)' : 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </div>
      {label && <span className="text-sm text-white/70">{label}</span>}
    </label>
  )
}

// ── Posts Panel ─────────────────────────────────────────────────

type PostForm = {
  title: string
  slug: string
  description: string
  cover_image: string
  preview_video: string
  file_size: string
  image_count: string
  video_count: string
  open_link: string
  is_trending: boolean
  is_featured: boolean
  is_upcoming: boolean
  category_id: string
  tags: string
  is_pro: boolean      // 🟢 NAYA FIELD
  pro_link: string     // 🟢 NAYA FIELD
}

const emptyPost = (): PostForm => ({
  title: '', slug: '', description: '', cover_image: '', preview_video: '',
  file_size: '', image_count: '0', video_count: '0', open_link: '',
  is_trending: false, is_featured: false, is_upcoming: false,
  category_id: '', tags: '',
  is_pro: false, pro_link: '' // 🟢 NAYA FIELD
})

function PostsPanel({ categories }: { categories: Category[] }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editPost, setEditPost] = useState<Post | null>(null)
  const [form, setForm] = useState<PostForm>(emptyPost())
  const [saving, setSaving] = useState(false)
  const [delConfirm, setDelConfirm] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('posts').select('*').order('published_at', { ascending: false }).limit(100)
    if (data) setPosts(data as Post[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditPost(null)
    setForm(emptyPost())
    setModalOpen(true)
  }

  function openEdit(post: Post) {
    setEditPost(post)
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description ?? '',
      cover_image: post.cover_image ?? '',
      preview_video: post.preview_video ?? '',
      file_size: post.file_size ?? '',
      image_count: String(post.image_count),
      video_count: String(post.video_count),
      open_link: post.open_link ?? '',
      is_trending: post.is_trending,
      is_featured: post.is_featured,
      is_upcoming: post.is_upcoming,
      category_id: post.category_id ?? '',
      tags: (post.tags ?? []).join(', '),
      is_pro: (post as any).is_pro ?? false,      // 🟢 NAYA FIELD (any type casting to avoid TS error until DB schema updates)
      pro_link: (post as any).pro_link ?? ''      // 🟢 NAYA FIELD
    })
    setModalOpen(true)
  }

  async function save() {
    setSaving(true)
    const slug = form.slug || slugify(form.title)
    const payload = {
      title: form.title,
      slug,
      description: form.description || null,
      cover_image: form.cover_image || null,
      preview_video: form.preview_video || null,
      file_size: form.file_size || null,
      image_count: parseInt(form.image_count) || 0,
      video_count: parseInt(form.video_count) || 0,
      open_link: form.open_link || null,
      is_trending: form.is_trending,
      is_featured: form.is_featured,
      is_upcoming: form.is_upcoming,
      category_id: form.category_id || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_pro: form.is_pro,      // 🟢 NAYA FIELD
      pro_link: form.pro_link || null // 🟢 NAYA FIELD
    }
    if (editPost) {
      await supabase.from('posts').update(payload).eq('id', editPost.id)
    } else {
      await supabase.from('posts').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  async function deletePost(id: string) {
    await supabase.from('posts').delete().eq('id', id)
    setDelConfirm(null)
    load()
  }

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            />
          </div>
          <span className="text-sm text-white/40">{posts.length} posts</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }}
        >
          <Plus className="w-4 h-4" /> New Post
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={panelStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Title', 'Category', 'Stats', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.cover_image ? (
                        <img src={post.cover_image} alt="" className="w-10 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-12 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate max-w-[150px]">{post.title}</p>
                            {/* 🟢 Table list mein pro content ka tag */}
                            {(post as any).is_pro && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                        <p className="text-xs text-white/35 truncate max-w-[180px]">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/45">
                      {categories.find(c => c.id === post.category_id)?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      {post.image_count > 0 && <span className="flex items-center gap-1"><Image className="w-3 h-3" />{post.image_count}</span>}
                      {post.video_count > 0 && <span className="flex items-center gap-1"><Video className="w-3 h-3" />{post.video_count}</span>}
                      {post.view_count > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.view_count}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.is_trending && <Badge color="orange">Trending</Badge>}
                      {post.is_featured && <Badge color="blue">Featured</Badge>}
                      {post.is_upcoming && <Badge color="gray">Upcoming</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/35 whitespace-nowrap">
                    {new Date(post.published_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <a href={`/post/${post.slug}`} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <ActionBtn variant="edit" onClick={() => openEdit(post)} />
                      <ActionBtn variant="delete" onClick={() => setDelConfirm(post.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-white/30 text-sm">No posts found</div>
          )}
        </div>
      )}

      <AnimatePresence>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editPost ? 'Edit Post' : 'New Post'}>
          <div className="space-y-4">
            <Field label="Title">
              <TextInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v, slug: f.slug || slugify(v) }))} placeholder="Post title..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug">
                <TextInput value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} placeholder="url-slug" />
              </Field>
              <Field label="Category">
                <select
                  value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="">— No category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <TextArea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Brief description..." rows={3} />
            </Field>
            <Field label="Cover Image URL">
              <TextInput value={form.cover_image} onChange={v => setForm(f => ({ ...f, cover_image: v }))} placeholder="https://..." />
            </Field>
            <Field label="Preview Video URL" hint="Video plays on hover in cards">
              <TextInput value={form.preview_video} onChange={v => setForm(f => ({ ...f, preview_video: v }))} placeholder="https://..." />
            </Field>
            
            {/* 🟢 PRO CONTENT TOGGLE & LINK */}
            <div className="mt-6 mb-2">
              <div 
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors" 
                style={{ 
                  background: form.is_pro ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)', 
                  border: `1px solid ${form.is_pro ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}` 
                }}
                onClick={() => setForm(f => ({ ...f, is_pro: !f.is_pro }))}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" 
                    style={{ background: form.is_pro ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)' }}
                  >
                    <Crown className={`w-5 h-5 ${form.is_pro ? 'text-amber-500' : 'text-white/30'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${form.is_pro ? 'text-amber-500' : 'text-white/70'}`}>
                      Pro Content (Premium)
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Enable to lock this content for Pro users only
                    </p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <div 
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${form.is_pro ? 'bg-amber-500' : 'bg-white/10'}`}
                >
                  <motion.div
                    layout
                    className="w-4 h-4 rounded-full bg-white absolute top-1"
                    initial={false}
                    animate={{ left: form.is_pro ? '28px' : '4px' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>

              {/* 🔗 PRO DIRECT LINK INPUT */}
              <AnimatePresence>
                {form.is_pro && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                        Pro Direct Link / Secret Content
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
                        <input
                          type="text"
                          value={form.pro_link}
                          onChange={(e) => setForm(f => ({ ...f, pro_link: e.target.value }))}
                          placeholder="https://mega.nz/secret-link..."
                          className="w-full bg-white/5 border text-white placeholder:text-white/20 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-500/50 transition-colors"
                          style={{ borderColor: 'rgba(245,158,11,0.2)' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NORMAL OPEN LINK - Hidden if Pro is active */}
            <AnimatePresence>
              {!form.is_pro && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Field label="Open/Download Link (Free Users)">
                    <TextInput value={form.open_link} onChange={v => setForm(f => ({ ...f, open_link: v }))} placeholder="https://mega.nz/..." />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <Field label="Images">
                <TextInput value={form.image_count} onChange={v => setForm(f => ({ ...f, image_count: v }))} type="number" placeholder="0" />
              </Field>
              <Field label="Videos">
                <TextInput value={form.video_count} onChange={v => setForm(f => ({ ...f, video_count: v }))} type="number" placeholder="0" />
              </Field>
              <Field label="File Size">
                <TextInput value={form.file_size} onChange={v => setForm(f => ({ ...f, file_size: v }))} placeholder="2.5 GB" />
              </Field>
            </div>
            <Field label="Tags" hint="Comma separated">
              <TextInput value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="lifestyle, fashion, model" />
            </Field>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <Toggle checked={form.is_trending} onChange={v => setForm(f => ({ ...f, is_trending: v }))} label="Trending" />
              <Toggle checked={form.is_featured} onChange={v => setForm(f => ({ ...f, is_featured: v }))} label="Featured" />
              <Toggle checked={form.is_upcoming} onChange={v => setForm(f => ({ ...f, is_upcoming: v }))} label="Upcoming" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>Cancel</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={save}
                disabled={saving || !form.title}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editPost ? 'Save Changes' : 'Create Post'}
              </motion.button>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      <ConfirmDialog
        open={!!delConfirm}
        onClose={() => setDelConfirm(null)}
        onConfirm={() => delConfirm && deletePost(delConfirm)}
        message="This will permanently delete the post and all its data. This cannot be undone."
      />
    </div>
  )
}

// ── Models Panel ────────────────────────────────────────────────

type ModelForm = {
  name: string
  slug: string
  stage_name: string
  bio: string
  cover_image: string
  profile_image: string
  country: string
  nationality: string
  age: string
  height: string
  weight: string
  figure_size: string
  hair_color: string
  eye_color: string
  website: string
  tags: string
  is_trending: boolean
  is_popular: boolean
}

const emptyModel = (): ModelForm => ({
  name: '', slug: '', stage_name: '', bio: '', cover_image: '', profile_image: '',
  country: '', nationality: '', age: '', height: '', weight: '',
  figure_size: '', hair_color: '', eye_color: '', website: '', tags: '',
  is_trending: false, is_popular: false
})

function ModelsPanel() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editModel, setEditModel] = useState<Model | null>(null)
  const [form, setForm] = useState<ModelForm>(emptyModel())
  const [saving, setSaving] = useState(false)
  const [delConfirm, setDelConfirm] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('models').select('*').order('created_at', { ascending: false })
    if (data) setModels(data as Model[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditModel(null)
    setForm(emptyModel())
    setModalOpen(true)
  }

  function openEdit(m: Model) {
    setEditModel(m)
    setForm({
      name: m.name, slug: m.slug, stage_name: m.stage_name ?? '', bio: m.bio ?? '',
      cover_image: m.cover_image ?? '', profile_image: m.profile_image ?? '',
      country: m.country ?? '', nationality: m.nationality ?? '', age: m.age ? String(m.age) : '',
      height: m.height ?? '', weight: m.weight ?? '', figure_size: m.figure_size ?? '',
      hair_color: m.hair_color ?? '', eye_color: m.eye_color ?? '', website: m.website ?? '',
      tags: (m.tags ?? []).join(', '),
      is_trending: m.is_trending, is_popular: m.is_popular
    })
    setModalOpen(true)
  }

  async function save() {
    setSaving(true)
    const slug = form.slug || slugify(form.name)
    const payload = {
      name: form.name, slug,
      stage_name: form.stage_name || null,
      bio: form.bio || null,
      cover_image: form.cover_image || null,
      profile_image: form.profile_image || null,
      country: form.country || null,
      nationality: form.nationality || null,
      age: form.age ? parseInt(form.age) : null,
      height: form.height || null,
      weight: form.weight || null,
      figure_size: form.figure_size || null,
      hair_color: form.hair_color || null,
      eye_color: form.eye_color || null,
      website: form.website || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_trending: form.is_trending,
      is_popular: form.is_popular
    }
    if (editModel) {
      await supabase.from('models').update(payload).eq('id', editModel.id)
    } else {
      await supabase.from('models').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    load()
  }

  async function deleteModel(id: string) {
    await supabase.from('models').delete().eq('id', id)
    setDelConfirm(null)
    load()
  }

  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.stage_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..." className="pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-white/30 outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
          </div>
          <span className="text-sm text-white/40">{models.length} models</span>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }}>
          <Plus className="w-4 h-4" /> New Model
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={panelStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Model', 'Location', 'Details', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(model => (
                <tr key={model.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,90,60,0.2)' }}>
                        {model.cover_image ? (
                          <img src={model.cover_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{(model.stage_name || model.name)[0]}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{model.stage_name || model.name}</p>
                        {model.stage_name && <p className="text-xs text-white/35">{model.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/45">{model.country || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 text-xs text-white/35">
                      {model.age && <span>{model.age}y</span>}
                      {model.hair_color && <span>{model.hair_color}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {model.is_trending && <Badge color="orange">Trending</Badge>}
                      {model.is_popular && <Badge color="blue">Popular</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <a href={`/model/${model.slug}`} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <ActionBtn variant="edit" onClick={() => openEdit(model)} />
                      <ActionBtn variant="delete" onClick={() => setDelConfirm(model.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-16 text-center text-white/30 text-sm">No models found</div>}
        </div>
      )}

      <AnimatePresence>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editModel ? 'Edit Model' : 'New Model'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name"><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v, slug: f.slug || slugify(v) }))} placeholder="Full name" /></Field>
              <Field label="Stage Name"><TextInput value={form.stage_name} onChange={v => setForm(f => ({ ...f, stage_name: v }))} placeholder="Display name" /></Field>
            </div>
            <Field label="Slug"><TextInput value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} placeholder="url-slug" /></Field>
            <Field label="Bio"><TextArea value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} placeholder="Biography..." /></Field>
            <Field label="Cover Image URL"><TextInput value={form.cover_image} onChange={v => setForm(f => ({ ...f, cover_image: v }))} placeholder="https://..." /></Field>
            <Field label="Profile Image URL"><TextInput value={form.profile_image} onChange={v => setForm(f => ({ ...f, profile_image: v }))} placeholder="https://..." /></Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Country"><TextInput value={form.country} onChange={v => setForm(f => ({ ...f, country: v }))} placeholder="USA" /></Field>
              <Field label="Nationality"><TextInput value={form.nationality} onChange={v => setForm(f => ({ ...f, nationality: v }))} placeholder="American" /></Field>
              <Field label="Age"><TextInput value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} type="number" placeholder="25" /></Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Height"><TextInput value={form.height} onChange={v => setForm(f => ({ ...f, height: v }))} placeholder="5'6&quot;" /></Field>
              <Field label="Weight"><TextInput value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} placeholder="120 lbs" /></Field>
              <Field label="Figure Size"><TextInput value={form.figure_size} onChange={v => setForm(f => ({ ...f, figure_size: v }))} placeholder="36-24-36" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hair Color"><TextInput value={form.hair_color} onChange={v => setForm(f => ({ ...f, hair_color: v }))} placeholder="Brown" /></Field>
              <Field label="Eye Color"><TextInput value={form.eye_color} onChange={v => setForm(f => ({ ...f, eye_color: v }))} placeholder="Blue" /></Field>
            </div>
            <Field label="Website"><TextInput value={form.website} onChange={v => setForm(f => ({ ...f, website: v }))} placeholder="https://..." /></Field>
            <Field label="Tags" hint="Comma separated"><TextInput value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="model, brunette, fitness" /></Field>
            <div className="flex gap-6 pt-2">
              <Toggle checked={form.is_trending} onChange={v => setForm(f => ({ ...f, is_trending: v }))} label="Trending" />
              <Toggle checked={form.is_popular} onChange={v => setForm(f => ({ ...f, is_popular: v }))} label="Popular" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save} disabled={saving || !form.name} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editModel ? 'Save Changes' : 'Create Model'}
              </motion.button>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      <ConfirmDialog open={!!delConfirm} onClose={() => setDelConfirm(null)} onConfirm={() => delConfirm && deleteModel(delConfirm)} message="This will permanently delete the model and unlink all associated posts." />
    </div>
  )
}

// ── Categories Panel ────────────────────────────────────────────

function CategoriesPanel({ categories, onReload }: { categories: Category[]; onReload: () => void }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [delConfirm, setDelConfirm] = useState<string | null>(null)

  function openCreate() { setEditCat(null); setName(''); setSlug(''); setDescription(''); setModalOpen(true) }
  function openEdit(c: Category) { setEditCat(c); setName(c.name); setSlug(c.slug); setDescription(c.description ?? ''); setModalOpen(true) }

  async function save() {
    setSaving(true)
    const payload = { name, slug: slug || slugify(name), description: description || null }
    if (editCat) await supabase.from('categories').update(payload).eq('id', editCat.id)
    else await supabase.from('categories').insert(payload)
    setSaving(false); setModalOpen(false); onReload()
  }

  async function deleteCat(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    setDelConfirm(null); onReload()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-white/40">{categories.length} categories</span>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }}>
          <Plus className="w-4 h-4" /> New Category
        </motion.button>
      </div>
      <div className="rounded-2xl overflow-hidden" style={panelStyle}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Name', 'Slug', 'Description', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-4 py-3 text-sm font-medium text-white">{cat.name}</td>
                <td className="px-4 py-3 text-xs text-white/45 font-mono">{cat.slug}</td>
                <td className="px-4 py-3 text-xs text-white/35 max-w-[200px] truncate">{cat.description || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <ActionBtn variant="edit" onClick={() => openEdit(cat)} />
                    <ActionBtn variant="delete" onClick={() => setDelConfirm(cat.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <div className="py-16 text-center text-white/30 text-sm">No categories yet</div>}
      </div>

      <AnimatePresence>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Category' : 'New Category'}>
          <div className="space-y-4">
            <Field label="Name"><TextInput value={name} onChange={v => setName(v)} placeholder="Category name" /></Field>
            <Field label="Slug"><TextInput value={slug} onChange={v => setSlug(v)} placeholder="url-slug" /></Field>
            <Field label="Description"><TextArea value={description} onChange={v => setDescription(v)} placeholder="Description..." rows={3} /></Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save} disabled={saving || !name} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editCat ? 'Save' : 'Create'}
              </motion.button>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      <ConfirmDialog open={!!delConfirm} onClose={() => setDelConfirm(null)} onConfirm={() => delConfirm && deleteCat(delConfirm)} message="This will delete the category and unlink all posts from it." />
    </div>
  )
}

// ── Tags Panel ──────────────────────────────────────────────────

function TagsPanel() {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTag, setEditTag] = useState<TagType | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [delConfirm, setDelConfirm] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('tags').select('*').order('name')
    if (data) setTags(data as TagType[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditTag(null); setName(''); setSlug(''); setModalOpen(true) }
  function openEdit(t: TagType) { setEditTag(t); setName(t.name); setSlug(t.slug); setModalOpen(true) }

  async function save() {
    setSaving(true)
    const payload = { name, slug: slug || slugify(name) }
    if (editTag) await supabase.from('tags').update(payload).eq('id', editTag.id)
    else await supabase.from('tags').insert(payload)
    setSaving(false); setModalOpen(false); load()
  }

  async function deleteTag(id: string) {
    await supabase.from('tags').delete().eq('id', id)
    setDelConfirm(null); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-white/40">{tags.length} tags</span>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }}>
          <Plus className="w-4 h-4" /> New Tag
        </motion.button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <Tag className="w-3 h-3 text-white/35" />
              <span className="text-sm text-white/70">{tag.name}</span>
              <div className="flex gap-0.5">
                <ActionBtn variant="edit" onClick={() => openEdit(tag)} />
                <ActionBtn variant="delete" onClick={() => setDelConfirm(tag.id)} />
              </div>
            </div>
          ))}
          {tags.length === 0 && <p className="text-white/30 text-sm">No tags yet</p>}
        </div>
      )}

      <AnimatePresence>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTag ? 'Edit Tag' : 'New Tag'}>
          <div className="space-y-4">
            <Field label="Name"><TextInput value={name} onChange={v => setName(v)} placeholder="Tag name" /></Field>
            <Field label="Slug"><TextInput value={slug} onChange={v => setSlug(v)} placeholder="url-slug" /></Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save} disabled={saving || !name} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editTag ? 'Save' : 'Create'}
              </motion.button>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      <ConfirmDialog open={!!delConfirm} onClose={() => setDelConfirm(null)} onConfirm={() => delConfirm && deleteTag(delConfirm)} message="This will permanently delete the tag." />
    </div>
  )
}

// ── Footer Ads Panel ────────────────────────────────────────────

type AdForm = {
  title: string
  type: FooterAd['type']
  content: string
  image_url: string
  destination_url: string
  open_new_tab: boolean
  is_active: boolean
}

const emptyAd = (): AdForm => ({
  title: '', type: 'banner', content: '', image_url: '',
  destination_url: '', open_new_tab: true, is_active: true
})

function AdsPanel() {
  const [ads, setAds] = useState<FooterAd[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editAd, setEditAd] = useState<FooterAd | null>(null)
  const [form, setForm] = useState<AdForm>(emptyAd())
  const [saving, setSaving] = useState(false)
  const [delConfirm, setDelConfirm] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('footer_ads').select('*').order('position')
    if (data) setAds(data as FooterAd[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditAd(null); setForm(emptyAd()); setModalOpen(true) }
  function openEdit(a: FooterAd) {
    setEditAd(a)
    setForm({ title: a.title, type: a.type, content: a.content ?? '', image_url: a.image_url ?? '', destination_url: a.destination_url ?? '', open_new_tab: a.open_new_tab, is_active: a.is_active })
    setModalOpen(true)
  }

  async function save() {
    setSaving(true)
    const payload = { title: form.title, type: form.type, content: form.content || null, image_url: form.image_url || null, destination_url: form.destination_url || null, open_new_tab: form.open_new_tab, is_active: form.is_active }
    if (editAd) await supabase.from('footer_ads').update(payload).eq('id', editAd.id)
    else await supabase.from('footer_ads').insert(payload)
    setSaving(false); setModalOpen(false); load()
  }

  async function deleteAd(id: string) {
    await supabase.from('footer_ads').delete().eq('id', id)
    setDelConfirm(null); load()
  }

  const adTypes: FooterAd['type'][] = ['banner', 'text', 'html', 'button', 'image', 'video']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-white/40">{ads.length} ad blocks</span>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)', boxShadow: '0 4px 16px rgba(255,90,60,0.35)' }}>
          <Plus className="w-4 h-4" /> New Ad Block
        </motion.button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={panelStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Title', 'Type', 'Status', 'Clicks', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3 text-sm font-medium text-white">{ad.title}</td>
                  <td className="px-4 py-3"><Badge>{ad.type}</Badge></td>
                  <td className="px-4 py-3"><Badge color={ad.is_active ? 'green' : 'gray'}>{ad.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-sm text-white/45">{ad.click_count}</td>
                  <td className="px-4 py-3"><div className="flex gap-1"><ActionBtn variant="edit" onClick={() => openEdit(ad)} /><ActionBtn variant="delete" onClick={() => setDelConfirm(ad.id)} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {ads.length === 0 && <div className="py-16 text-center text-white/30 text-sm">No ad blocks yet</div>}
        </div>
      )}

      <AnimatePresence>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAd ? 'Edit Ad Block' : 'New Ad Block'}>
          <div className="space-y-4">
            <Field label="Title"><TextInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Ad block name" /></Field>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as FooterAd['type'] }))} className={inputClass} style={inputStyle}>
                {adTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            {(form.type === 'text' || form.type === 'html') && (
              <Field label="Content"><TextArea value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} placeholder={form.type === 'html' ? '<div>...</div>' : 'Your text...'} /></Field>
            )}
            {(form.type === 'banner' || form.type === 'image') && (
              <Field label="Image URL"><TextInput value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} placeholder="https://..." /></Field>
            )}
            <Field label="Destination URL"><TextInput value={form.destination_url} onChange={v => setForm(f => ({ ...f, destination_url: v }))} placeholder="https://..." /></Field>
            <div className="flex gap-6">
              <Toggle checked={form.open_new_tab} onChange={v => setForm(f => ({ ...f, open_new_tab: v }))} label="Open in new tab" />
              <Toggle checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Active" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save} disabled={saving || !form.title} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editAd ? 'Save' : 'Create'}
              </motion.button>
            </div>
          </div>
        </Modal>
      </AnimatePresence>

      <ConfirmDialog open={!!delConfirm} onClose={() => setDelConfirm(null)} onConfirm={() => delConfirm && deleteAd(delConfirm)} message="This will permanently delete the ad block." />
    </div>
  )
}

// ── Users Management Panel ────────────────────────────────────────

function UsersPanel() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
    if (roleFilter !== 'all') query = query.eq('role', roleFilter)
    query.then(({ data }) => {
      if (data) setUsers(data as UserProfile[])
      setLoading(false)
    })
  }, [roleFilter])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  async function updateUser(updates: Partial<UserProfile>) {
    if (!editUser) return
    setSaving(true)
    await supabase.from('user_profiles').update(updates).eq('id', editUser.id)
    setSaving(false)
    setModalOpen(false)
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...updates } : u))
  }

  async function addCoins(amount: number) {
    if (!editUser) return
    setSaving(true)
    const newBalance = editUser.coins + amount
    await supabase.from('user_profiles').update({ coins: newBalance }).eq('id', editUser.id)
    await supabase.from('coin_transactions').insert({
      user_id: editUser.user_id,
      amount,
      balance_after: newBalance,
      type: amount > 0 ? 'bonus' : 'spend',
      description: amount > 0 ? 'Admin bonus' : 'Admin deduction'
    })
    setSaving(false)
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, coins: newBalance } : u))
    setEditUser(prev => prev ? { ...prev, coins: newBalance } : null)
  }

  const roleColors: Record<UserRole, 'red' | 'blue' | 'orange' | 'gray'> = {
    admin: 'red',
    moderator: 'blue',
    subscriber: 'orange',
    guest: 'gray'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-3 py-2 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="subscriber">Subscriber</option>
            <option value="guest">Guest</option>
          </select>
          <span className="text-sm text-white/40">{users.length} users</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={panelStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['User', 'Role', 'Subscription', 'Coins', 'Joined', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
                          <span className="text-white text-xs font-bold">{(user.name ?? user.email)[0].toUpperCase()}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name ?? 'No name'}</p>
                        <p className="text-xs text-white/35 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge color={roleColors[user.role]}>{user.role}</Badge></td>
                  <td className="px-4 py-3">
                    {user.subscription_tier ? (
                      <span className="text-xs text-white/55">
                        {user.subscription_tier === 'pro_plus' ? 'Pro+' : 'Pro'}
                        {user.subscription_expires_at && ` (${new Date(user.subscription_expires_at).toLocaleDateString()})`}
                      </span>
                    ) : <span className="text-xs text-white/30">Free</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white/70">{user.coins.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/35">{new Date(user.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionBtn variant="edit" onClick={() => { setEditUser(user); setModalOpen(true) }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && editUser && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit User">
            <div className="space-y-5">
              <Field label="Role">
                <select
                  value={editUser.role}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="guest">Guest</option>
                  <option value="subscriber">Subscriber</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>

              <Field label="Subscription Tier">
                <select
                  value={editUser.subscription_tier ?? 'free'}
                  onChange={e => setEditUser({ ...editUser, subscription_tier: e.target.value === 'free' ? null : e.target.value as SubscriptionTier })}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="pro_plus">Pro+</option>
                </select>
              </Field>

              <Field label="Coins">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">{editUser.coins}</span>
                  <button onClick={() => addCoins(100)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}>+100</button>
                  <button onClick={() => addCoins(500)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}>+500</button>
                  <button onClick={() => addCoins(-100)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>-100</button>
                </div>
              </Field>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60" style={{ background: 'rgba(255,255,255,0.07)' }}>Cancel</button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateUser({ role: editUser.role, subscription_tier: editUser.subscription_tier })}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Coins & Subscription Settings Panel ───────────────────────────

function CoinsPanel() {
  const [settings, setSettings] = useState({
    coin_rate_usd: '0.01',
    pro_monthly_price: '9.99',
    pro_plus_monthly_price: '19.99',
    telegram_link: '',
    bonus_signup: '50',
    bonus_referral: '100'
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('settings').select('*').in('key', ['coin_rate_usd', 'pro_monthly_price', 'pro_plus_monthly_price', 'telegram_link', 'bonus_signup', 'bonus_referral'])
    .then(({ data }) => {
      if (data) {
        const map = Object.fromEntries(data.map((d: { key: string; value: unknown }) => [d.key, String(d.value)]))
        setSettings(prev => ({ ...prev, ...map }))
      }
    })
  }, [])

  async function save() {
    setSaving(true)
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={panelStyle}>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5" style={{ color: '#f59e0b' }} />
            Coin Settings
          </h3>
          <div className="space-y-4">
            <Field label="Coin Rate (USD)">
              <TextInput value={settings.coin_rate_usd} onChange={v => setSettings({ ...settings, coin_rate_usd: v })} placeholder="0.01" />
            </Field>
            <Field label="Signup Bonus Coins">
              <TextInput value={settings.bonus_signup} onChange={v => setSettings({ ...settings, bonus_signup: v })} placeholder="50" />
            </Field>
            <Field label="Referral Bonus Coins">
              <TextInput value={settings.bonus_referral} onChange={v => setSettings({ ...settings, bonus_referral: v })} placeholder="100" />
            </Field>
          </div>
        </div>

        <div className="p-6 rounded-2xl" style={panelStyle}>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" style={{ color: '#f59e0b' }} />
            Subscription Pricing
          </h3>
          <div className="space-y-4">
            <Field label="Pro Monthly Price (USD)">
              <TextInput value={settings.pro_monthly_price} onChange={v => setSettings({ ...settings, pro_monthly_price: v })} placeholder="9.99" />
            </Field>
            <Field label="Pro+ Monthly Price (USD)">
              <TextInput value={settings.pro_plus_monthly_price} onChange={v => setSettings({ ...settings, pro_plus_monthly_price: v })} placeholder="19.99" />
            </Field>
          </div>
        </div>

        <div className="p-6 rounded-2xl md:col-span-2" style={panelStyle}>
          <h3 className="text-base font-bold text-white mb-4">Telegram Integration</h3>
          <div className="space-y-4">
            <Field label="Telegram Channel/Group Link" hint="Users will be redirected here after Pro+ purchase">
              <TextInput value={settings.telegram_link} onChange={v => setSettings({ ...settings, telegram_link: v })} placeholder="https://t.me/yourchannel" />
            </Field>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ background: saved ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #ff5a3c, #ff784e)', border: saved ? '1px solid rgba(34,197,94,0.4)' : 'none' }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </motion.button>
    </div>
  )
}

// ── Engagement Panel (Views, Likes, Comments) ─────────────────────────────────

function EngagementPanel() {
  const [posts, setPosts] = useState<ExtendedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, view_count, cover_image')
      .order('view_count', { ascending: false })
      .limit(100)
    if (data) setPosts(data as ExtendedPost[])
    setLoading(false)
  }

  async function updatePostStat(postId: string, field: string, value: number) {
    setSaving(true)
    await supabase.from('posts').update({ [field]: value }).eq('id', postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, [field]: value } : p))
    setSaving(false)
  }

  async function resetAllStats(postId: string) {
    setSaving(true)
    await supabase.from('posts').update({
      view_count: 0
    }).eq('id', postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, view_count: 0 } : p))
    setSaving(false)
  }

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  const totalViews = posts.reduce((sum, p) => sum + (p.view_count ?? 0), 0)

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p className="text-xs text-white/50 mb-1">Total Views</p>
          <p className="text-2xl font-bold text-green-400">{totalViews.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <p className="text-xs text-white/50 mb-1">Total Posts</p>
          <p className="text-2xl font-bold text-blue-400">{posts.length.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <p className="text-xs text-white/50 mb-1">Avg Views</p>
          <p className="text-2xl font-bold text-purple-400">{posts.length > 0 ? Math.round(totalViews / posts.length).toLocaleString() : 0}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,90,60,0.1)', border: '1px solid rgba(255,90,60,0.2)' }}>
          <p className="text-xs text-white/50 mb-1">Trending</p>
          <p className="text-2xl font-bold text-orange-400">{posts.filter(p => p.is_trending).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          />
        </div>
        <span className="text-sm text-white/40">{filtered.length} posts</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={panelStyle}>
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Post', 'Views', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.cover_image ? (
                        <img src={post.cover_image} alt="" className="w-10 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-12 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate max-w-[180px]">{post.title}</p>
                        <p className="text-xs text-white/35 truncate max-w-[180px]">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={post.view_count ?? 0}
                      onChange={e => updatePostStat(post.id, 'view_count', parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 rounded-lg text-sm text-white text-center"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => resetAllStats(post.id)}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        Reset
                      </motion.button>
                      <a
                        href={`/post/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-white/30 text-sm">No posts found</div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Theme Settings Panel ────────────────────────────────────────

function ThemePanel() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'LeaksHaven',
    site_description: 'Premium content directory. Browse exclusive creator collections.',
    primary_color: '#ff5a3c',
    secondary_color: '#ff784e',
    posts_per_page: '12',
    font_family: 'Inter',
    card_style: 'default',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const keys = ['site_name', 'site_description', 'primary_color', 'secondary_color', 'posts_per_page', 'font_family', 'card_style', 'show_featured', 'show_trending', 'show_popular']
      const { data } = await supabase.from('settings').select('key, value').in('key', keys)
      if (data) {
        const map: Record<string, string> = {}
        for (const row of data) map[row.key] = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : String(row.value)
        setSettings(prev => ({ ...prev, ...map }))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveAll() {
    setSaving(true)
    const entries = Object.entries(settings).map(([key, value]) => ({
      key,
      value: isNaN(Number(value)) ? JSON.stringify(value) : Number(value),
      updated_at: new Date().toISOString()
    }))
    await supabase.from('settings').upsert(entries)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>

  const upd = (k: string) => (v: string) => setSettings(s => ({ ...s, [k]: v }))

  const fonts = ['Inter', 'Geist', 'Space Grotesk', 'Plus Jakarta Sans', 'DM Sans', 'Syne']

  return (
    <div className="max-w-2xl space-y-8">
      {/* General */}
      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">General</h3>
        <div className="rounded-2xl p-5 space-y-4" style={panelStyle}>
          <Field label="Site Name"><TextInput value={settings.site_name ?? ''} onChange={upd('site_name')} placeholder="Site name" /></Field>
          <Field label="Site Description"><TextArea value={settings.site_description ?? ''} onChange={upd('site_description')} placeholder="Site description..." rows={2} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Posts Per Page">
              <select value={settings.posts_per_page ?? '12'} onChange={e => upd('posts_per_page')(e.target.value)} className={inputClass} style={inputStyle}>
                {['6', '12', '24', '36', '48'].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Font Family">
              <select value={settings.font_family ?? 'Inter'} onChange={e => upd('font_family')(e.target.value)} className={inputClass} style={inputStyle}>
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Colors</h3>
        <div className="rounded-2xl p-5 space-y-4" style={panelStyle}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Color">
              <div className="flex items-center gap-3">
                <input type="color" value={settings.primary_color ?? '#ff5a3c'} onChange={e => upd('primary_color')(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                <TextInput value={settings.primary_color ?? ''} onChange={upd('primary_color')} placeholder="#ff5a3c" />
              </div>
            </Field>
            <Field label="Secondary Color">
              <div className="flex items-center gap-3">
                <input type="color" value={settings.secondary_color ?? '#ff784e'} onChange={e => upd('secondary_color')(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                <TextInput value={settings.secondary_color ?? ''} onChange={upd('secondary_color')} placeholder="#ff784e" />
              </div>
            </Field>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white/40 mb-2">Preview</p>
            <div className="flex gap-3">
              <div className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` }}>Button Preview</div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` }}>TRENDING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Homepage Sections */}
      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Homepage Sections</h3>
        <div className="rounded-2xl p-5 space-y-4" style={panelStyle}>
          <Toggle checked={settings.show_featured === 'true'} onChange={v => upd('show_featured')(String(v))} label="Show Featured Section" />
          <Toggle checked={settings.show_trending !== 'false'} onChange={v => upd('show_trending')(String(v))} label="Show Trending Section" />
          <Toggle checked={settings.show_popular !== 'false'} onChange={v => upd('show_popular')(String(v))} label="Show Popular Section" />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={saveAll}
        disabled={saving}
        className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
        style={{ background: saved ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #ff5a3c, #ff784e)', border: saved ? '1px solid rgba(34,197,94,0.4)' : 'none' }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </motion.button>
    </div>
  )
}

// ── Overview Panel ──────────────────────────────────────────────

function OverviewPanel({ onTab }: { onTab: (t: AdminTab) => void }) {
  const [stats, setStats] = useState({ posts: 0, models: 0, categories: 0, tags: 0, views: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('posts').select('view_count'),
      supabase.from('models').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('tags').select('id', { count: 'exact', head: true }),
    ]).then(([postsRes, modelsRes, catsRes, tagsRes]) => {
      const views = (postsRes.data ?? []).reduce((sum: number, p: { view_count: number }) => sum + (p.view_count ?? 0), 0)
      setStats({
        posts: postsRes.data?.length ?? 0,
        models: modelsRes.count ?? 0,
        categories: catsRes.count ?? 0,
        tags: tagsRes.count ?? 0,
        views
      })
    })
  }, [])

  const cards = [
    { label: 'Total Posts', value: stats.posts, icon: FileText, color: '#ff5a3c', tab: 'posts' as AdminTab },
    { label: 'Total Models', value: stats.models, icon: Users, color: '#8b5cf6', tab: 'models' as AdminTab },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: '#06b6d4', tab: 'categories' as AdminTab },
    { label: 'Tags', value: stats.tags, icon: Tag, color: '#10b981', tab: 'tags' as AdminTab },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, tab }) => (
          <motion.button
            key={label}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTab(tab)}
            className="text-left p-5 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}22` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl font-extrabold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </motion.button>
        ))}
      </div>

      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,90,60,0.06)', border: '1px solid rgba(255,90,60,0.2)' }}>
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-5 h-5" style={{ color: '#ff5a3c' }} />
          <span className="text-sm font-semibold text-white">Total Views</span>
        </div>
        <p className="text-4xl font-extrabold text-white">{stats.views.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Manage Posts', desc: 'Create, edit and delete posts', icon: FileText, tab: 'posts' as AdminTab },
          { label: 'Manage Models', desc: 'Add and configure model profiles', icon: Users, tab: 'models' as AdminTab },
          { label: 'Footer Ads', desc: 'Manage ad blocks and banners', icon: Megaphone, tab: 'ads' as AdminTab },
          { label: 'Theme Settings', desc: 'Colors, fonts, and layout', icon: Palette, tab: 'theme' as AdminTab },
        ].map(({ label, desc, icon: Icon, tab }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTab(tab)}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,90,60,0.12)' }}>
              <Icon className="w-5 h-5" style={{ color: '#ff5a3c' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-white/40 mt-0.5">{desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Main Admin Page ─────────────────────────────────────────────

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [categories, setCategories] = useState<Category[]>([])

  useSEO({ title: 'Admin Dashboard', noIndex: true })

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data as Category[])
  }, [])

  useEffect(() => { loadCategories() }, [loadCategories])

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'models', label: 'Models', icon: Users },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'ads', label: 'Footer Ads', icon: Megaphone },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'coins', label: 'Coins & Subs', icon: Coins },
    { id: 'engagement', label: 'Engagement', icon: BarChart3 },
    { id: 'theme', label: 'Theme', icon: Palette },
  ]

  const tabTitles: Record<AdminTab, string> = {
    overview: 'Dashboard Overview',
    posts: 'Posts Management',
    models: 'Models Management',
    categories: 'Categories',
    tags: 'Tags',
    ads: 'Footer Ads Manager',
    users: 'Users Management',
    coins: 'Coins & Subscriptions',
    engagement: 'Views, Likes & Comments',
    theme: 'Theme Settings',
  }

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      {/* Admin header */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-5 py-4"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff5a3c, #ff784e)' }}>
            <Settings className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Admin Dashboard</span>
        </div>
        <Link to="/" className="ml-auto text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3" /> View Site
        </Link>
      </div>

      <div className="pt-16 flex min-h-screen">
        {/* Sidebar nav */}
        <aside
          className="w-52 fixed top-16 left-0 bottom-0 overflow-y-auto flex flex-col py-4 px-3"
          style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <nav className="space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  activeTab === id ? 'text-white' : 'text-white/50 hover:text-white'
                )}
                style={activeTab === id ? { background: 'rgba(255,255,255,0.08)' } : undefined}
              >
                {activeTab === id && (
                  <span className="absolute left-0 w-0.5 h-5 rounded-r-full" style={{ background: 'linear-gradient(180deg, #ff5a3c, #ff784e)' }} />
                )}
                <Icon className={cn('w-4 h-4 flex-shrink-0', activeTab === id ? 'text-brand' : 'text-white/35')} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-52 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">{tabTitles[activeTab]}</h1>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && <OverviewPanel onTab={setActiveTab} />}
                {activeTab === 'posts' && <PostsPanel categories={categories} />}
                {activeTab === 'models' && <ModelsPanel />}
                {activeTab === 'categories' && <CategoriesPanel categories={categories} onReload={loadCategories} />}
                {activeTab === 'tags' && <TagsPanel />}
                {activeTab === 'ads' && <AdsPanel />}
                {activeTab === 'users' && <UsersPanel />}
                {activeTab === 'coins' && <CoinsPanel />}
                {activeTab === 'engagement' && <EngagementPanel />}
                {activeTab === 'theme' && <ThemePanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}