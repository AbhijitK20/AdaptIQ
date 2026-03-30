import { createClient } from '@supabase/supabase-js'
import {
  getAvailableProfiles,
  getActiveProgram,
  getAdaptiveRecommendation,
  getProgressStats,
  getSuggestedConcept,
  getWeakConcepts,
} from '../lib/data.ts'
import { readFileSync, existsSync } from 'node:fs'

if (existsSync('.env.local')) {
  const text = readFileSync('.env.local', 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx < 1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1')
    if (!(key in process.env)) process.env[key] = value
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function upsert(table, rows, conflict = 'id') {
  if (!rows.length) return
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict })
  if (error) throw new Error(`${table}: ${error.message}`)
}

async function clearProfileData(profileId) {
  const tables = [
    'catalog_quizzes',
    'catalog_questions',
    'catalog_concept_dependencies',
    'catalog_concepts',
    'catalog_modules',
    'catalog_chapters',
    'catalog_subjects',
  ]
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('profile_id', profileId)
    if (error) throw new Error(`Failed clearing ${table} for ${profileId}: ${error.message}`)
  }
}

async function syncProfile(profile) {
  const program = getActiveProgram(profile.id)

  await upsert('catalog_profiles', [{
    id: profile.id,
    label: profile.label,
    track_type: profile.trackType,
    class_level: profile.classLevel ?? null,
    branch: profile.branch ?? null,
    semester: profile.semester ?? null,
    preferred_subjects: profile.preferredSubjects ?? [],
  }])

  await clearProfileData(profile.id)

  await upsert('catalog_subjects', program.subjects.map((subject) => ({
    id: subject.id,
    profile_id: profile.id,
    name: subject.name,
  })))

  await upsert('catalog_chapters', program.chapters.map((chapter) => ({
    id: chapter.id,
    profile_id: profile.id,
    subject_id: chapter.subjectId,
    name: chapter.name,
  })))

  await upsert('catalog_modules', program.modules.map((module) => ({
    id: module.id,
    profile_id: profile.id,
    chapter_id: module.chapterId,
    name: module.name,
  })))

  await upsert('catalog_concepts', program.concepts.map((concept) => ({
    id: concept.id,
    profile_id: profile.id,
    subject: concept.subject,
    chapter: concept.chapter,
    module: concept.module ?? null,
    name: concept.name,
    description: concept.description ?? '',
    status: concept.status ?? 'missing',
    accuracy: concept.accuracy ?? 0,
  })))

  await upsert('catalog_concept_dependencies', program.conceptDependencies.map((dep) => ({
    id: dep.id,
    profile_id: profile.id,
    parent_concept_id: dep.parentConceptId,
    child_concept_id: dep.childConceptId,
  })))

  await upsert('catalog_questions', program.questions.map((question) => ({
    id: question.id,
    profile_id: profile.id,
    question_text: question.questionText,
    options: question.options,
    correct_answer: question.correctAnswer,
    difficulty: question.difficulty,
    explanation: question.explanation,
    concept_ids: question.conceptIds,
    scope_type: question.scopeType ?? null,
    scope_id: question.scopeId ?? null,
    misconception_tag: question.misconceptionTag ?? null,
    question_type: question.questionType ?? 'mcq',
  })))

  await upsert('catalog_quizzes', program.quizzes.map((quiz) => ({
    id: quiz.id,
    profile_id: profile.id,
    scope_type: quiz.scopeType,
    scope_id: quiz.scopeId,
    question_ids: quiz.questionIds,
  })))

  const stats = getProgressStats(profile.id)
  const weak = getWeakConcepts(profile.id).length
  const suggested = getSuggestedConcept(profile.id)?.name ?? 'None'
  const adaptive = getAdaptiveRecommendation(profile.id)?.concept.name ?? 'None'
  console.log(
    `Synced ${profile.id}: subjects=${program.subjects.length}, chapters=${program.chapters.length}, modules=${program.modules.length}, concepts=${program.concepts.length}, questions=${program.questions.length}, quizzes=${program.quizzes.length}, avg=${Math.round(stats.avgAccuracy * 100)}%, weak=${weak}, suggested=${suggested}, adaptive=${adaptive}`,
  )
}

async function run() {
  const profiles = getAvailableProfiles()
  for (const profile of profiles) {
    await syncProfile(profile)
  }
  console.log(`Done. Synced ${profiles.length} profiles.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

